const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findOne({ _id: productId, status: 'approved' });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) cart = new Cart({ userId: req.user._id, items: [] });

    const existingIdx = cart.items.findIndex(i => i.productId.toString() === productId);
    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += Number(quantity);
    } else {
      cart.items.push({
        productId, name: product.name, image: product.images[0] || '',
        price: product.price, stock: product.stock,
        sellerName: product.sellerName, villageName: product.villageName,
        quantity: Number(quantity),
      });
    }
    await cart.save();
    res.json({ success: true, message: 'Added to cart', cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    const item = cart.items.find(i => i.productId.toString() === req.params.productId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });
    item.quantity = Number(quantity);
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items = cart.items.filter(i => i.productId.toString() !== req.params.productId);
    await cart.save();
    res.json({ success: true, message: 'Item removed', cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
