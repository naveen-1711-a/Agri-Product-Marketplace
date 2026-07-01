const Review = require('../models/Review');
const Product = require('../models/Product');

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    const product = await Product.findOne({ _id: productId, status: 'approved' });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const existing = await Review.findOne({ userId: req.user._id, productId });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed this product' });

    const review = await Review.create({
      userId: req.user._id, productId, userName: req.user.name, rating: Number(rating), comment,
    });

    // Update product rating
    const reviews = await Review.find({ productId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, { rating: avgRating, reviewCount: reviews.length });

    res.status(201).json({ success: true, message: 'Review added', review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort('-createdAt');
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    const reviews = await Review.find({ productId: review.productId });
    const avgRating = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
    await Product.findByIdAndUpdate(review.productId, { rating: avgRating, reviewCount: reviews.length });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
