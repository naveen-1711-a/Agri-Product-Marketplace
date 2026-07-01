const express = require('express');
const router = express.Router();
const {
  getEquipmentList, getEquipment, getCategories,
  getMyEquipment, createEquipment, updateEquipment, deleteEquipment,
  toggleAvailability, getSellerStats,
  addReview,
  adminGetAll, adminUpdateStatus, adminDeleteEquipment, adminStats,
} = require('../controllers/equipmentController');
const { protect, adminOnly, sellerOnly, sellerOrAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ── Named routes FIRST (before /:id wildcard) ──────────────────────────────

// Public static
router.get('/', getEquipmentList);
router.get('/categories', getCategories);

// Seller named routes (seller sees own listings; admin uses admin/all)
router.get('/seller/my', protect, sellerOnly, getMyEquipment);
router.get('/seller/stats', protect, sellerOnly, getSellerStats);

// Create: both seller and admin can create equipment
router.post('/', protect, sellerOrAdmin, upload.array('images', 8), createEquipment);

// Admin named routes
router.get('/admin/all', protect, adminOnly, adminGetAll);
router.get('/admin/stats', protect, adminOnly, adminStats);
router.patch('/admin/:id/status', protect, adminOnly, adminUpdateStatus);
router.delete('/admin/:id', protect, adminOnly, adminDeleteEquipment);

// ── Wildcard /:id routes LAST ───────────────────────────────────────────────
router.get('/:id', getEquipment);
router.post('/:id/reviews', protect, addReview);
// Edit/delete/toggle: seller (own only) or admin (any)
router.put('/:id', protect, sellerOrAdmin, upload.array('images', 8), updateEquipment);
router.delete('/:id', protect, sellerOrAdmin, deleteEquipment);
router.patch('/:id/availability', protect, sellerOrAdmin, toggleAvailability);

module.exports = router;

