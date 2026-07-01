import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/admin/AdminLayout';
import SellerLayout from './components/seller/SellerLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import ProductsPage from './pages/public/ProductsPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import { AboutPage, ContactPage } from './pages/public/AboutContactPages';
import CategoriesPage from './pages/public/CategoriesPage';
import NotFoundPage from './pages/public/NotFoundPage';
import EquipmentPage from './pages/public/EquipmentPage';
import EquipmentDetailPage from './pages/public/EquipmentDetailPage';

// Customer Pages
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminSellersPage from './pages/admin/AdminSellersPage';
import { AdminOrdersPage, AdminCustomersPage } from './pages/admin/AdminOrdersCustomers';
import AdminEquipmentPage from './pages/admin/AdminEquipmentPage';
import AdminEquipmentFormPage from './pages/admin/AdminEquipmentFormPage';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProductsPage from './pages/seller/SellerProductsPage';
import SellerProductFormPage from './pages/seller/SellerProductFormPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import SellerProfilePage from './pages/seller/SellerProfilePage';
import SellerEquipmentPage from './pages/seller/SellerEquipmentPage';
import SellerEquipmentFormPage from './pages/seller/SellerEquipmentFormPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '12px', fontSize: '14px' },
              success: { iconTheme: { primary: '#2E7D32', secondary: '#fff' } },
            }}
          />
          <Routes>
            <Route element={<MainLayout />}>
              {/* Protected Main Routes (forced login) */}
              <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
              <Route path="/products/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
              <Route path="/about" element={<ProtectedRoute><AboutPage /></ProtectedRoute>} />
              <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />

              {/* Equipment Routes (public) */}
              <Route path="/equipment" element={<ProtectedRoute><EquipmentPage /></ProtectedRoute>} />
              <Route path="/equipment/:id" element={<ProtectedRoute><EquipmentDetailPage /></ProtectedRoute>} />

              {/* Auth Routes (redirect if logged in) */}
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

              {/* Customer Protected Routes */}
              <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/customer/orders" element={<ProtectedRoute><CustomerOrdersPage /></ProtectedRoute>} />
              <Route path="/customer/dashboard" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductFormPage />} />
              <Route path="products/edit/:id" element={<AdminProductFormPage />} />
              <Route path="sellers" element={<AdminSellersPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="equipment" element={<AdminEquipmentPage />} />
              <Route path="equipment/new" element={<AdminEquipmentFormPage />} />
              <Route path="equipment/edit/:id" element={<AdminEquipmentFormPage />} />
            </Route>

            {/* Seller Routes */}
            <Route path="/seller" element={<ProtectedRoute roles={['seller']}><SellerLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<SellerDashboard />} />
              <Route path="products" element={<SellerProductsPage />} />
              <Route path="products/new" element={<SellerProductFormPage />} />
              <Route path="products/edit/:id" element={<SellerProductFormPage />} />
              <Route path="orders" element={<SellerOrdersPage />} />
              <Route path="profile" element={<SellerProfilePage />} />
              <Route path="equipment" element={<SellerEquipmentPage />} />
              <Route path="equipment/new" element={<SellerEquipmentFormPage />} />
              <Route path="equipment/edit/:id" element={<SellerEquipmentFormPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<MainLayout />}>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
