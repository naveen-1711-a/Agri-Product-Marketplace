const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const User = require('../models/User');

exports.placeOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, items } = req.body;
    if (!items || !items.length) return res.status(400).json({ success: false, message: 'No items in order' });

    let totalAmount = 0;
    const products = [];
    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, status: 'approved' });
      if (!product) return res.status(400).json({ success: false, message: `Product not available: ${item.productId}` });
      if (product.stock < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      totalAmount += product.price * item.quantity;
      products.push({
        productId: product._id, name: product.name,
        image: product.images[0] || '', price: product.price,
        quantity: item.quantity, sellerId: product.sellerId, sellerName: product.sellerName,
      });
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }

    const order = await Order.create({
      customerId: req.user._id, customerName: req.user.name,
      products, totalAmount, shippingAddress, paymentMethod: paymentMethod || 'COD',
    });
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });
    
    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find({ customerId: req.user._id }).sort('-createdAt').skip(skip).limit(Number(limit)),
      Order.countDocuments({ customerId: req.user._id }),
    ]);
    res.json({ success: true, orders, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (['delivered', 'cancelled'].includes(order.status))
      return res.status(400).json({ success: false, message: 'Cannot cancel this order' });
    order.status = 'cancelled';
    await order.save();
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
    res.json({ success: true, message: 'Order cancelled', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Seller
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'products.sellerId': req.user._id }).sort('-createdAt');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ success: true, orders, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const [totalOrders, revenue, statusCounts] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);
    res.json({
      success: true,
      stats: { totalOrders, revenue: revenue[0]?.total || 0, statusCounts },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
