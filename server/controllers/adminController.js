const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalSellers, totalCustomers, totalProducts, pendingProducts, approvedProducts, totalOrders, revenue, topProducts] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments(),
      Product.countDocuments({ status: 'pending' }),
      Product.countDocuments({ status: 'approved' }),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([
        { $unwind: '$products' },
        { $group: { _id: '$products.productId', name: { $first: '$products.name' }, totalSold: { $sum: '$products.quantity' }, revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } } } },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
      ])
    ]);
    res.json({
      success: true, stats: {
        totalUsers, totalSellers, totalCustomers, totalProducts,
        pendingProducts, approvedProducts, totalOrders,
        revenue: revenue[0]?.total || 0,
        topProducts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Seller Management
exports.createSeller = async (req, res) => {
  try {
    const { name, email, password, phone, villageName } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email, password required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const seller = await User.create({ name, email, password, phone, villageName, role: 'seller' });
    res.status(201).json({ success: true, message: 'Seller account created', seller });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' }).sort('-createdAt');
    res.json({ success: true, sellers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSeller = async (req, res) => {
  try {
    const { name, phone, villageName, isActive } = req.body;
    const seller = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'seller' },
      { name, phone, villageName, isActive },
      { new: true }
    );
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
    res.json({ success: true, message: 'Seller updated', seller });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteSeller = async (req, res) => {
  try {
    const seller = await User.findOneAndDelete({ _id: req.params.id, role: 'seller' });
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
    res.json({ success: true, message: 'Seller deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).sort('-createdAt');
    res.json({ success: true, customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
