const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');


// Public: Get approved products
exports.getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, rating, search, village, page = 1, limit = 12, sort = '-createdAt' } = req.query;
    const query = { status: 'approved' };
    if (category) query.category = category;
    if (village) query.villageName = { $regex: village, $options: 'i' };
    if (minPrice || maxPrice) query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
    if (rating) query.rating = { $gte: Number(rating) };
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
    ]);
    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Public: Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, status: 'approved' });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const reviews = await Review.find({ productId: product._id }).sort('-createdAt').limit(10);
    res.json({ success: true, product, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Seller & Admin: Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, unit, tags, sellerName, villageName } = req.body;
    const images = req.files ? req.files.map(f => f.path) : [];
    
    const isAdmin = req.user.role === 'admin';
    const finalSellerName = isAdmin ? (sellerName || 'EPM Admin') : req.user.name;
    const finalVillageName = isAdmin ? (villageName || 'Admin Hub') : (req.user.villageName || villageName || 'Not specified');
    const finalStatus = isAdmin ? 'approved' : 'pending';

    const product = await Product.create({
      name, description, category, price: Number(price), stock: Number(stock), unit,
      images, sellerId: req.user._id, sellerName: finalSellerName,
      villageName: finalVillageName,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      status: finalStatus,
    });
    res.status(201).json({ success: true, message: isAdmin ? 'Product added successfully' : 'Product submitted for approval', product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Seller: Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, sellerId: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
    const { name, description, category, price, stock, unit } = req.body;
    const newImages = req.files ? req.files.map(f => f.path) : [];
    const keepImages = product.images;
    Object.assign(product, { name, description, category, price: Number(price), stock: Number(stock), unit, status: 'pending' });
    if (newImages.length) product.images = [...keepImages, ...newImages];
    await product.save();
    res.json({ success: true, message: 'Product updated, pending re-approval', product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Seller: Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, sellerId: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Seller: Get own products
exports.getMyProducts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { sellerId: req.user._id };
    if (status) query.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
    ]);
    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).sort('-createdAt').skip(skip).limit(Number(limit)).populate('sellerId', 'name email'),
      Product.countDocuments(query),
    ]);
    res.json({ success: true, products, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Approve/Reject product
exports.updateProductStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason: status === 'rejected' ? rejectionReason : '' },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, message: `Product ${status}`, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Public: Featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'approved' }).sort('-rating -createdAt').limit(8);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
