const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  getMyProducts, getAllProducts, updateProductStatus, getFeaturedProducts
} = require('../controllers/productController');
const { protect, adminOnly, sellerOnly, sellerOrAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);

// Seller & Admin
router.post('/', protect, sellerOrAdmin, upload.array('images', 5), createProduct);
router.put('/:id', protect, sellerOrAdmin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, sellerOrAdmin, deleteProduct);
router.get('/seller/my-products', protect, sellerOnly, getMyProducts);

// Admin
router.get('/admin/all', protect, adminOnly, getAllProducts);
router.put('/admin/:id/status', protect, adminOnly, updateProductStatus);

module.exports = router;
