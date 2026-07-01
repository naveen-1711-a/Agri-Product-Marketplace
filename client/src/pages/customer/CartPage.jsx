import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import Spinner from '../../components/common/Spinner';

export default function CartPage() {
  const { cart, cartTotal, cartLoading, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (cartLoading) return <Spinner size="lg" text="Loading cart..." />;

  const items = cart.items || [];

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="text-7xl mb-6">🛒</div>
      <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
      <p className="text-gray-400 mb-8">Discover authentic village products and add them here.</p>
      <Link to="/products" className="btn-primary">Browse Products</Link>
    </div>
  );

  const shipping = cartTotal > 500 ? 0 : 60;
  const total = cartTotal + shipping;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
        <span className="bg-primary-100 text-primary-dark text-sm font-medium px-2.5 py-0.5 rounded-full">{items.length} items</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.productId} className="card p-4 flex gap-4">
              <img src={item.image || `https://placehold.co/80x80/A5D6A7/1B5E20?text=${encodeURIComponent(item.name[0])}`}
                alt={item.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 line-clamp-1">{item.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{item.sellerName} · {item.villageName}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button onClick={() => { if (item.quantity > 1) updateQuantity(item.productId, item.quantity - 1); }}
                      className="px-3 py-1.5 hover:bg-gray-50 font-bold">−</button>
                    <span className="px-3 py-1.5 font-semibold text-sm border-x border-gray-300">{item.quantity}</span>
                    <button onClick={() => { if (item.quantity < item.stock) updateQuantity(item.productId, item.quantity + 1); }}
                      className="px-3 py-1.5 hover:bg-gray-50 font-bold">+</button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-dark">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500">₹{item.price} each</p>
                  </div>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-20">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              {shipping > 0 && <p className="text-xs text-gray-400">Free shipping on orders above ₹500</p>}
              <div className="border-t pt-3 flex justify-between font-bold text-gray-800 text-base">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-primary w-full justify-center mt-5 py-3 text-base">
              <FiShoppingBag /> Proceed to Checkout
            </button>
            <Link to="/products" className="block text-center text-sm text-primary-700 hover:underline mt-3">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
