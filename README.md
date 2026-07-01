# 🌿 EPM — Empowering Products Marketplace

A full-stack MERN e-commerce platform connecting village sellers with customers across India.

---

## 🗂️ Project Structure

```
epm/
├── server/                    # Node.js + Express Backend
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Register, Login, Profile
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── cartController.js
│   │   ├── reviewController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT protect, role guards
│   │   └── upload.js          # Multer image upload
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Cart.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── cart.js
│   │   ├── reviews.js
│   │   └── admin.js
│   ├── uploads/               # Uploaded product images
│   ├── .env.example
│   ├── package.json
│   └── index.js               # Server entry point
│
└── client/                    # React + Vite Frontend
    ├── src/
    │   ├── components/
    │   │   ├── admin/
    │   │   │   └── AdminLayout.jsx
    │   │   ├── seller/
    │   │   │   └── SellerLayout.jsx
    │   │   ├── layout/
    │   │   │   ├── MainLayout.jsx
    │   │   │   ├── Navbar.jsx
    │   │   │   └── Footer.jsx
    │   │   └── common/
    │   │       ├── ProductCard.jsx
    │   │       ├── Spinner.jsx
    │   │       └── StarRating.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── CartContext.jsx
    │   ├── pages/
    │   │   ├── public/        # HomePage, Products, Login, Register, About, Contact
    │   │   ├── customer/      # Cart, Checkout, Orders, Profile
    │   │   ├── admin/         # Dashboard, Products, Sellers, Orders, Customers
    │   │   └── seller/        # Dashboard, Products (CRUD), Orders, Profile
    │   ├── routes/
    │   │   └── ProtectedRoute.jsx
    │   ├── services/
    │   │   └── api.js         # Axios instance
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- npm or yarn

---

### 1. Clone / Download the project

```bash
# Navigate to the epm folder
cd epm
```

---

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```


---

## ✅ Features Implemented

### Customer
- [x] Register & Login
- [x] Browse & search products
- [x] Filter by category, price, rating, village
- [x] Product details with gallery
- [x] Add to cart, update quantity, remove
- [x] Checkout with address form
- [x] Cash on Delivery / UPI payment
- [x] Order history with expand/collapse
- [x] Cancel orders
- [x] Write & submit reviews with star rating
- [x] Profile edit & password change

### Seller
- [x] Login (created by Admin only)
- [x] Dashboard with stats
- [x] Add products with image upload (up to 5 images)
- [x] Edit / Delete products
- [x] View product approval status
- [x] View & manage orders
- [x] Update order status
- [x] Profile settings

### Admin
- [x] Full dashboard with stats
- [x] Create / Edit / Delete sellers
- [x] Toggle user active/inactive
- [x] View all products with filter
- [x] Approve / Reject products with reason
- [x] View & update all orders
- [x] Manage customers

### Platform
- [x] JWT authentication
- [x] Role-based protected routes
- [x] Multer image upload
- [x] Product approval workflow
- [x] Responsive mobile-first design
- [x] Toast notifications
- [x] Loading states & skeletons
- [x] 404 page

---

## 🏃 Quick Start Summary

```bash
# Terminal 1 - Backend
cd epm/server
cp .env.example .env   # Edit MONGODB_URI
npm install
npm run dev

# Terminal 2 - Frontend
cd epm/client
npm install
npm run dev

# Open browser
open http://localhost:3000

# Admin login
# Email: admin@epm.com
# Password: Admin@123
```
