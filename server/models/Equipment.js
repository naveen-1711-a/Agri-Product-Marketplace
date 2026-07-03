const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['Tractor', 'Rotavator', 'Seed Drill', 'Harvester', 'Water Pump', 'Sprayer', 'Farm Tools', 'Trailer', 'Cultivator', 'Power Tiller', 'Other'],
  },
  description: { type: String, trim: true },
  images: [{ type: String }],

  // Pricing
  pricePerHour: { type: Number, default: 0 },
  pricePerDay: { type: Number, default: 0 },

  // Location
  village: { type: String, trim: true },
  district: { type: String, trim: true },
  state: { type: String, trim: true, default: 'Tamil Nadu' },
  mapLink: { type: String, trim: true },     // Google Maps URL
  latitude: { type: Number },
  longitude: { type: Number },

  // Status
  isAvailable: { type: Boolean, default: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },

  // Metrics
  views: { type: Number, default: 0 },
  totalRentals: { type: Number, default: 0 },

  // Contact override (uses seller's phone by default, but allow override)
  contactPhone: { type: String, trim: true },

  // Verification
  isVerified: { type: Boolean, default: false },

}, { timestamps: true });

equipmentSchema.index({ category: 1, village: 1, district: 1, status: 1, isAvailable: 1 });
equipmentSchema.index({ name: 'text', description: 'text', village: 'text', district: 'text' });
equipmentSchema.index({ seller: 1 });
equipmentSchema.index({ createdAt: -1 });
equipmentSchema.index({ pricePerDay: 1 });

module.exports = mongoose.model('Equipment', equipmentSchema);
