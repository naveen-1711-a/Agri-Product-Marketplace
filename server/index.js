const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
connectDB();

// Seed admin
const seedAdmin = async () => {
  const User = require('./models/User');
  const exists = await User.findOne({ role: 'admin' });
  if (!exists) {
    await User.create({
      name: 'EPM Admin',
      email: process.env.ADMIN_EMAIL || 'admin@epm.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
    });
    console.log('✅ Admin seeded: admin@epm.com / Admin@123');
  }
};
setTimeout(seedAdmin, 2000);

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'EPM API running ✅' }));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 EPM Server running on port ${PORT}`));
