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

**Edit `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/epm?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRE=7d
NODE_ENV=development
ADMIN_EMAIL=admin@epm.com
ADMIN_PASSWORD=Admin@123
```

> 💡 Get your MongoDB URI from [MongoDB Atlas](https://cloud.mongodb.com) → Connect → Drivers

```bash
# Start server
npm run dev
```

Server starts at: `http://localhost:5000`

✅ Admin account auto-seeded on first start: `admin@epm.com / Admin@123`

---

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend starts at: `http://localhost:3000`

> The Vite proxy forwards `/api` and `/uploads` to `http://localhost:5000`

---

## 🔑 User Roles & Access

| Role | Access | How to Create |
|------|--------|---------------|
| **Admin** | Full access to all dashboards | Auto-seeded on first run |
| **Seller** | Seller dashboard, products, orders | Admin creates via `/admin/sellers` |
| **Customer** | Browse, cart, checkout, reviews | Self-registration at `/register` |

---

## 🌐 API Reference

### Authentication
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Protected |
| PUT | `/api/auth/profile` | Protected |
| PUT | `/api/auth/change-password` | Protected |

### Products
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/products` | Public |
| GET | `/api/products/featured` | Public |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Seller |
| PUT | `/api/products/:id` | Seller |
| DELETE | `/api/products/:id` | Seller |
| GET | `/api/products/seller/my-products` | Seller |
| GET | `/api/products/admin/all` | Admin |
| PUT | `/api/products/admin/:id/status` | Admin |

### Orders
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/orders` | Customer |
| GET | `/api/orders/my` | Customer |
| GET | `/api/orders/my/:id` | Customer |
| PUT | `/api/orders/my/:id/cancel` | Customer |
| GET | `/api/orders/seller` | Seller |
| PUT | `/api/orders/seller/:id/status` | Seller |
| GET | `/api/orders/admin/all` | Admin |
| PUT | `/api/orders/admin/:id/status` | Admin |

### Cart
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/cart` | Customer |
| POST | `/api/cart/add` | Customer |
| PUT | `/api/cart/item/:productId` | Customer |
| DELETE | `/api/cart/item/:productId` | Customer |
| DELETE | `/api/cart/clear` | Customer |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/admin/stats` | Admin |
| POST | `/api/admin/sellers` | Admin |
| GET | `/api/admin/sellers` | Admin |
| PUT | `/api/admin/sellers/:id` | Admin |
| DELETE | `/api/admin/sellers/:id` | Admin |
| GET | `/api/admin/customers` | Admin |
| PUT | `/api/admin/users/:id/toggle-status` | Admin |

---

## 🚀 Deployment

### Backend — Render.com (Free Tier)

1. Push your `server/` folder to a GitHub repo
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo
4. **Build Command:** `npm install`
5. **Start Command:** `node index.js`
6. Add Environment Variables (from `.env`)
7. Deploy!

### Frontend — Vercel (Free Tier)

1. Push your `client/` folder to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import the repo
4. **Framework Preset:** Vite
5. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com`
6. Update `client/src/services/api.js`:
   ```js
   const api = axios.create({ baseURL: import.meta.env.VITE_API_URL + '/api' });
   ```
7. Update `vite.config.js` (remove proxy, not needed in production)

### MongoDB Atlas Setup

1. Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create database user
3. Whitelist IP: `0.0.0.0/0` (allow all, for Render)
4. Get connection string and add to Render env vars

---

## 🎨 Theme Colors

| Color | Hex |
|-------|-----|
| Primary Dark Green | `#1B5E20` |
| Primary Green | `#2E7D32` |
| Light Green | `#A5D6A7` |
| White | `#FFFFFF` |

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
