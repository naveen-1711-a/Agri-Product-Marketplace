const express = require('express');
const router = express.Router();
const {
  getDashboardStats, createSeller, getSellers, updateSeller, deleteSeller,
  getCustomers, toggleUserStatus
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/stats', getDashboardStats);
router.post('/sellers', createSeller);
router.get('/sellers', getSellers);
router.put('/sellers/:id', updateSeller);
router.delete('/sellers/:id', deleteSeller);
router.get('/customers', getCustomers);
router.put('/users/:id/toggle-status', toggleUserStatus);

module.exports = router;
