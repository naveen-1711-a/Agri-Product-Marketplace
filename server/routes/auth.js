const express = require('express');
const router = express.Router();
const { registerCustomer, login, getMe, updateProfile, changePassword, getWishlist, toggleWishlist } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerCustomer);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist', protect, toggleWishlist);

module.exports = router;
