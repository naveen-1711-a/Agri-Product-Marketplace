const express = require('express');
const router = express.Router();
const {
  placeOrder, getMyOrders, getOrderById, cancelOrder,
  getSellerOrders, updateOrderStatus, getAllOrders, getAdminStats
} = require('../controllers/orderController');
const { protect, adminOnly, sellerOnly, customerOnly } = require('../middleware/auth');

// Customer/All Users
router.post('/', protect, placeOrder);
router.get('/my', protect, getMyOrders);
router.get('/my/:id', protect, getOrderById);
router.put('/my/:id/cancel', protect, cancelOrder);

// Seller
router.get('/seller', protect, sellerOnly, getSellerOrders);
router.put('/seller/:id/status', protect, sellerOnly, updateOrderStatus);

// Admin
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.get('/admin/stats', protect, adminOnly, getAdminStats);
router.put('/admin/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
