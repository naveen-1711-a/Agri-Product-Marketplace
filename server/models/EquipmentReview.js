const mongoose = require('mongoose');

const equipmentReviewSchema = new mongoose.Schema({
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true },
}, { timestamps: true });

equipmentReviewSchema.index({ equipment: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('EquipmentReview', equipmentReviewSchema);
