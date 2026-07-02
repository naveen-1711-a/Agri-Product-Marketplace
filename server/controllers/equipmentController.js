const Equipment = require('../models/Equipment');
const EquipmentReview = require('../models/EquipmentReview');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');



// ─── Helper ─────────────────────────────────────────────────────────────────
const getImageUrl = (req, filename) =>
  `${req.protocol}://${req.get('host')}/uploads/${filename}`;

const deleteFiles = (filenames) => {
  filenames.forEach((f) => {
    const fp = path.join(__dirname, '../uploads', path.basename(f));
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  });
};

// ─── PUBLIC ─────────────────────────────────────────────────────────────────

// GET /api/equipment  – public listing (only approved)
exports.getEquipmentList = async (req, res) => {
  try {
    const {
      search, category, village, district,
      minPrice, maxPrice, available,
      sort = '-createdAt', page = 1, limit = 12,
    } = req.query;

    const filter = { status: 'approved' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (village) filter.village = { $regex: village, $options: 'i' };
    if (district) filter.district = { $regex: district, $options: 'i' };
    if (available === 'true') filter.isAvailable = true;
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }

    let sortObj = {};
    if (sort === 'price_asc') sortObj = { pricePerDay: 1 };
    else if (sort === 'price_desc') sortObj = { pricePerDay: -1 };
    else if (sort === '-views') sortObj = { views: -1 };
    else sortObj = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [equipment, total] = await Promise.all([
      Equipment.find(filter)
        .populate('seller', 'name phone villageName profileImage isActive')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Equipment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: equipment,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/equipment/:id – single equipment (public)
exports.getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('seller', 'name phone villageName profileImage isActive createdAt');
    if (!equipment) return res.status(404).json({ success: false, message: 'Equipment not found' });

    // Increment views
    equipment.views += 1;
    await equipment.save();

    // Reviews
    const reviews = await EquipmentReview.find({ equipment: equipment._id })
      .populate('reviewer', 'name profileImage')
      .sort('-createdAt')
      .lean();

    const avgRating = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ success: true, data: equipment, reviews, avgRating: Number(avgRating) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SELLER ─────────────────────────────────────────────────────────────────

// GET /api/equipment/seller/my
exports.getMyEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({ seller: req.user._id }).sort('-createdAt').lean();
    res.json({ success: true, data: equipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/equipment
exports.createEquipment = async (req, res) => {
  try {
    const {
      name, category, description,
      pricePerHour, pricePerDay,
      village, district, state, mapLink, latitude, longitude, contactPhone,
    } = req.body;

    const images = (req.files || []).map((f) => f.path);

    const equipment = await Equipment.create({
      seller: req.user._id,
      name, category, description,
      pricePerHour: Number(pricePerHour) || 0,
      pricePerDay: Number(pricePerDay) || 0,
      village, district, state, mapLink,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      contactPhone: contactPhone || req.user.phone,
      images,
      // Admin listings are auto-approved and verified
      status: req.user.role === 'admin' ? 'approved' : 'pending',
      isVerified: req.user.role === 'admin',
    });

    res.status(201).json({ success: true, data: equipment, message: 'Equipment submitted for approval' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/equipment/:id
exports.updateEquipment = async (req, res) => {
  try {
    // Admin can update any equipment; seller can only edit their own
    const ownerFilter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, seller: req.user._id };
    const equipment = await Equipment.findOne(ownerFilter);
    if (!equipment) return res.status(404).json({ success: false, message: 'Not found or not yours' });

    const {
      name, category, description,
      pricePerHour, pricePerDay,
      village, district, state, mapLink, latitude, longitude, contactPhone,
      keepImages, // JSON array of existing image filenames to keep
    } = req.body;

    // Handle image management
    const kept = keepImages ? JSON.parse(keepImages) : equipment.images;
    const removed = equipment.images.filter((img) => !kept.includes(img));
    deleteFiles(removed);

    const newImages = (req.files || []).map((f) => f.path);
    const allImages = [...kept, ...newImages];

    Object.assign(equipment, {
      name, category, description,
      pricePerHour: Number(pricePerHour) || 0,
      pricePerDay: Number(pricePerDay) || 0,
      village, district, state, mapLink,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      contactPhone,
      images: allImages,
      // Admin edits stay approved; seller edits go back to pending
      status: req.user.role === 'admin' ? 'approved' : 'pending',
      isVerified: req.user.role === 'admin' ? true : equipment.isVerified,
    });
    await equipment.save();

    res.json({ success: true, data: equipment, message: 'Equipment updated, pending re-approval' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/equipment/:id
exports.deleteEquipment = async (req, res) => {
  try {
    // Admin can delete any; seller only their own
    const ownerFilter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, seller: req.user._id };
    const equipment = await Equipment.findOne(ownerFilter);
    if (!equipment) return res.status(404).json({ success: false, message: 'Not found or not yours' });
    deleteFiles(equipment.images);
    await equipment.deleteOne();
    res.json({ success: true, message: 'Equipment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/equipment/:id/availability
exports.toggleAvailability = async (req, res) => {
  try {
    // Admin can toggle any; seller only their own
    const ownerFilter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, seller: req.user._id };
    const equipment = await Equipment.findOne(ownerFilter);
    if (!equipment) return res.status(404).json({ success: false, message: 'Not found' });
    equipment.isAvailable = !equipment.isAvailable;
    await equipment.save();
    res.json({ success: true, data: { isAvailable: equipment.isAvailable } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/equipment/seller/dashboard-stats
exports.getSellerStats = async (req, res) => {
  try {
    const all = await Equipment.find({ seller: req.user._id });
    const stats = {
      total: all.length,
      available: all.filter((e) => e.isAvailable && e.status === 'approved').length,
      unavailable: all.filter((e) => !e.isAvailable).length,
      pending: all.filter((e) => e.status === 'pending').length,
      approved: all.filter((e) => e.status === 'approved').length,
      rejected: all.filter((e) => e.status === 'rejected').length,
      totalViews: all.reduce((s, e) => s + e.views, 0),
      totalRentals: all.reduce((s, e) => s + e.totalRentals, 0),
    };
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── REVIEWS ─────────────────────────────────────────────────────────────────

// POST /api/equipment/:id/reviews
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const existing = await EquipmentReview.findOne({ equipment: req.params.id, reviewer: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed' });

    const review = await EquipmentReview.create({
      equipment: req.params.id,
      reviewer: req.user._id,
      rating: Number(rating),
      comment,
    });
    await review.populate('reviewer', 'name profileImage');
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── ADMIN ─────────────────────────────────────────────────────────────────

// GET /api/equipment/admin/all
exports.adminGetAll = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Equipment.find(filter)
        .populate('seller', 'name email phone villageName')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Equipment.countDocuments(filter),
    ]);
    res.json({ success: true, data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/equipment/admin/:id/status
exports.adminUpdateStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason: status === 'rejected' ? rejectionReason : undefined, isVerified: status === 'approved' },
      { new: true }
    ).populate('seller', 'name email');
    if (!equipment) return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, data: equipment, message: `Equipment ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/equipment/admin/:id
exports.adminDeleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) return res.status(404).json({ success: false, message: 'Not found' });
    deleteFiles(equipment.images);
    res.json({ success: true, message: 'Equipment deleted by admin' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/equipment/admin/stats
exports.adminStats = async (req, res) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      Equipment.countDocuments(),
      Equipment.countDocuments({ status: 'pending' }),
      Equipment.countDocuments({ status: 'approved' }),
      Equipment.countDocuments({ status: 'rejected' }),
    ]);
    res.json({ success: true, data: { total, pending, approved, rejected } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/equipment/categories
exports.getCategories = async (req, res) => {
  const categories = ['Tractor', 'Rotavator', 'Seed Drill', 'Harvester', 'Water Pump', 'Sprayer', 'Farm Tools', 'Trailer', 'Cultivator', 'Power Tiller', 'Other'];
  res.json({ success: true, data: categories });
};
