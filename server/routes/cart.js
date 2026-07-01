const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect, customerOnly } = require('../middleware/auth');

router.use(protect);
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:productId', updateCartItem);
router.delete('/item/:productId', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;
