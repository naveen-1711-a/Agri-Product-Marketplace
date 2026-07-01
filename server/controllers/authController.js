const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, villageName } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email, password required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, phone, villageName, role: 'customer' });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, message: 'Registration successful', token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated' });
    const token = generateToken(user._id);
    res.json({ success: true, message: 'Login successful', token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, villageName, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, villageName, address },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, wishlist: user.wishlist || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user.wishlist) user.wishlist = [];
    
    const index = user.wishlist.findIndex(id => id.toString() === productId.toString());
    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }
    
    await user.save();
    await user.populate('wishlist');
    res.json({ success: true, message: index === -1 ? 'Added to wishlist' : 'Removed from wishlist', wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
