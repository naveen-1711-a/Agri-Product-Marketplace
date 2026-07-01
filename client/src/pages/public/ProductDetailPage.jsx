import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiMapPin, FiStar, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import StarRating from '../../components/common/StarRating';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => {
      setProduct(data.product);
      setReviews(data.reviews || []);
    }).catch(() => navigate('/products')).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => addToCart(product._id, quantity);

  const handleBuyNow = () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    addToCart(product._id, quantity);
    navigate('/cart');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/reviews/${id}`, reviewForm);
      setReviews(prev => [data.review, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted!');
      api.get(`/products/${id}`).then(({ data }) => setProduct(data.product));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Spinner size="lg" text="Loading product..." />;
  if (!product) return null;

  const images = product.images?.length ? product.images : [`https://placehold.co/500x400/A5D6A7/1B5E20?text=${encodeURIComponent(product.name)}`];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="rounded-2xl overflow-hidden border border-gray-200 mb-3 aspect-square bg-gray-50">
            <img src={images[selectedImg]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${selectedImg === i ? 'border-primary-700' : 'border-gray-200'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <span className="bg-primary-100 text-primary-dark text-xs font-medium px-3 py-1 rounded-full">{product.category}</span>
          <h1 className="text-3xl font-bold text-gray-800 mt-3 mb-2">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating} showCount count={product.reviewCount} />
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
            <FiMapPin size={14} className="text-primary-700" />
            <span>{product.sellerName} · {product.villageName}</span>
            <FiCheckCircle className="text-green-600 ml-1" title="Verified Seller" />
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-primary-dark">₹{product.price}</span>
              <span className="text-gray-500">/{product.unit || 'kg'}</span>
            </div>
            <div className={`flex items-center gap-1.5 text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? <><FiCheckCircle /> In Stock ({product.stock} available)</> : <><FiAlertCircle /> Out of Stock</>}
            </div>
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <label className="label mb-0 whitespace-nowrap">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-50 text-lg font-bold">−</button>
                <span className="px-4 py-2 font-semibold border-x border-gray-300">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-50 text-lg font-bold">+</button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-outline flex-1 disabled:opacity-50">
              <FiShoppingCart /> Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={product.stock === 0} className="btn-primary flex-1 disabled:opacity-50">
              Buy Now
            </button>
          </div>

          <div className="mt-6 border-t pt-5">
            <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Customer Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <div className="card p-8 text-center text-gray-400">
              <FiStar size={32} className="mx-auto mb-2 opacity-30" />
              <p>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r._id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-dark text-sm flex-shrink-0">
                      {r.userName?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{r.userName}</span>
                        <StarRating rating={r.rating} size={12} />
                      </div>
                      <p className="text-gray-600 text-sm">{r.comment}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Write Review */}
        {user?.role === 'customer' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Write a Review</h2>
            <form onSubmit={handleReview} className="card p-5 space-y-4">
              <div>
                <label className="label">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setReviewForm(f => ({...f, rating: n}))}
                      className={`text-2xl transition-transform hover:scale-110 ${n <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Your Review</label>
                <textarea className="input resize-none" rows={4} placeholder="Share your experience..."
                  value={reviewForm.comment} onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))} required />
              </div>
              <button type="submit" disabled={submittingReview} className="btn-primary w-full justify-center">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
