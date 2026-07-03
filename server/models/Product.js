const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: [
      'Organic Vegetables', 'Fruits', 'Homemade Foods',
      'Traditional Snacks', 'Pickles', 'Honey',
      'Millets', 'Handicrafts', 'Village Special Products',
      'Seeds', 'Medicine', 'Fertilizer'
    ]
  },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: [{ type: String }],
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerName: { type: String, required: true },
  villageName: { type: String, default: 'Not specified' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  unit: { type: String, default: 'kg' },
  tags: [{ type: String }],
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', category: 'text' });
productSchema.index({ status: 1, category: 1 });
productSchema.index({ sellerId: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

module.exports = mongoose.model('Product', productSchema);
