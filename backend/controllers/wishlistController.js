const db = require('../config/db');

// ─── GET WISHLIST ────────────────────────────────────────────────
const getWishlist = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT w.id, w.created_at,
              p.id as product_id, p.title, p.price, p.original_price,
              p.image_url, p.rating, p.review_count, p.category, p.brand, p.stock
       FROM wishlist w JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1 ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    res.json({ wishlist: rows });
  } catch (err) { next(err); }
};

// ─── TOGGLE WISHLIST ─────────────────────────────────────────────
const toggleWishlist = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ message: 'product_id required' });

    const existing = await db.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    if (existing.rows.length) {
      await db.query('DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2', [req.user.id, product_id]);
      return res.json({ wishlisted: false, message: 'Removed from wishlist' });
    }

    await db.query('INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)', [req.user.id, product_id]);
    res.json({ wishlisted: true, message: 'Added to wishlist' });
  } catch (err) { next(err); }
};

// ─── REMOVE FROM WISHLIST ────────────────────────────────────────
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    await db.query('DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2', [req.user.id, productId]);
    res.json({ message: 'Removed from wishlist' });
  } catch (err) { next(err); }
};

module.exports = { getWishlist, toggleWishlist, removeFromWishlist };
