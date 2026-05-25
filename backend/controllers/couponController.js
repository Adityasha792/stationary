const db = require('../config/db');

// ─── VALIDATE COUPON ─────────────────────────────────────────────
const validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required' });

    const { rows } = await db.query(
      `SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) AND is_active = TRUE
       AND (expires_at IS NULL OR expires_at > NOW()) AND used_count < max_uses`,
      [code]
    );

    if (!rows.length) {
      return res.status(400).json({ valid: false, message: 'Invalid or expired coupon' });
    }

    const coupon = rows[0];
    const discount = ((cartTotal || 0) * coupon.discount_percent) / 100;

    res.json({
      valid: true,
      code: coupon.code,
      discount_percent: coupon.discount_percent,
      discount_amount: Math.round(discount * 100) / 100,
      message: `Coupon applied! ${coupon.discount_percent}% off`,
    });
  } catch (err) { next(err); }
};

module.exports = { validateCoupon };
