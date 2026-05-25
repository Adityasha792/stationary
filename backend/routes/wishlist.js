const router = require('express').Router();
const { getWishlist, toggleWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getWishlist);
router.post('/', toggleWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
