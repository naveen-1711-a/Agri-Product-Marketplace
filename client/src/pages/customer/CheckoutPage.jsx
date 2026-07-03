import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { generateBill } from '../../utils/generateBill';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    addressLine: '', city: '', state: '', pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const items = cart.items || [];
  const shipping = cartTotal > 500 ? 0 : 60;
  const total = cartTotal + shipping;

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));


  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const submitOrder = async () => {
    try {
      const { data } = await api.post('/orders', {
        shippingAddress: form, paymentMethod,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      });
      setOrderId(data.order._id);
      setSuccess(true);
      generateBill({
        ...data.order,
        shippingAddress: form,
        paymentMethod,
      });
      toast.success('Invoice downloaded automatically!');
      clearCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!items.length) { toast.error('Cart is empty'); return; }
    setLoading(true);

    if (paymentMethod === 'UPI') {
      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay failed to load');
        setLoading(false);
        return;
      }

      try {
        const { data: rzpData } = await api.post('/orders/razorpay/create', { amount: total });
        
        const options = {
          key: rzpData.keyId,
          amount: rzpData.order.amount,
          currency: rzpData.order.currency,
          name: 'EPM Marketplace',
          description: 'Order Payment',
          order_id: rzpData.order.id,
          handler: async function (response) {
            try {
              const verifyRes = await api.post('/orders/razorpay/verify', response);
              if (verifyRes.data.success) {
                await submitOrder();
              }
            } catch (err) {
              toast.error('Payment verification failed');
              setLoading(false);
            }
          },
          prefill: {
            name: form.name,
            email: user?.email || '',
            contact: form.phone
          },
          theme: { color: '#1B5E20' },
          modal: {
            ondismiss: function() {
              setLoading(false);
            }
          }
        };
        
        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response) {
          toast.error(response.error.description || 'Payment Failed');
          setLoading(false);
        });
        paymentObject.open();
      } catch (err) {
        console.error("Razorpay initiation error:", err);
        const errorMsg = err.response?.data?.message || err.message || 'Failed to initiate payment';
        toast.error(`Error: ${errorMsg}`);
        setLoading(false);
      }
    } else {
      await submitOrder();
    }
  };

  if (success) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-7xl mb-6">🎉</div>
      <FiCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h2>
      <p className="text-gray-500 mb-2">Your order ID: <span className="font-mono font-semibold text-primary-dark">#{orderId?.slice(-8).toUpperCase()}</span></p>
      <p className="text-gray-500 mb-8 text-sm">We'll send updates as your order progresses.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => navigate('/customer/orders')} className="btn-primary">Track Orders</button>
        <button onClick={() => navigate('/products')} className="btn-outline">Continue Shopping</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>
      <form onSubmit={handleOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Address */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-bold text-gray-800 mb-4">Delivery Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={set('name')} required /></div>
              <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={set('phone')} required /></div>
              <div className="sm:col-span-2"><label className="label">Address</label><input className="input" placeholder="House no., Street, Area" value={form.addressLine} onChange={set('addressLine')} required /></div>
              <div><label className="label">City</label><input className="input" value={form.city} onChange={set('city')} required /></div>
              <div><label className="label">State</label><input className="input" value={form.state} onChange={set('state')} required /></div>
              <div><label className="label">Pincode</label><input className="input" value={form.pincode} onChange={set('pincode')} required /></div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-gray-800 mb-4">Payment Method</h2>
            <div className="space-y-3">
              {[['COD','💵 Cash on Delivery','Pay when your order arrives'],['UPI','💳 Pay Online (Razorpay)','UPI, Credit/Debit Cards, NetBanking']].map(([val, label, desc]) => (
                <label key={val} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === val ? 'border-primary-700 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value={val} checked={paymentMethod === val} onChange={() => setPaymentMethod(val)} className="text-primary-700" />
                  <div><p className="font-medium text-sm">{label}</p><p className="text-xs text-gray-500">{desc}</p></div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-20">
            <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.productId} className="flex gap-3 text-sm">
                  <img src={item.image || `https://placehold.co/48x48/A5D6A7/1B5E20?text=${item.name[0]}`}
                    alt={item.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-1">{item.name}</p>
                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{cartTotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-5 py-3 text-base">
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
