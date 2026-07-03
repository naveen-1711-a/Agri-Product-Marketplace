import { Link } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiMapPin, FiHeart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user, toggleWishlist } = useAuth();

  const stars = Array.from({ length: 5 }, (_, i) => (
    <FiStar key={i} size={12}
      className={i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
  ));

  const isWishlisted = user?.wishlist?.some(w => w === product._id || w._id === product._id);

  return (
    <div className="card group relative overflow-hidden flex flex-col">
      <Link to={`/products/${product._id}`} className="relative overflow-hidden">
        <img
          src={product.images?.[0] ? getImageUrl(product.images[0]) : `https://placehold.co/300x200/A5D6A7/1B5E20?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-primary-700 text-white text-xs px-2 py-0.5 rounded-full font-medium">{product.category}</span>
        </div>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white font-bold px-3 py-1 rounded-lg text-sm">Out of Stock</span>
          </div>
        )}
      </Link>
      {user && user.role === 'customer' && (
        <button 
          onClick={(e) => { e.preventDefault(); toggleWishlist(product._id); }}
          className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full text-red-500 transition-colors shadow-sm z-10"
        >
          <FiHeart className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"} size={18} />
        </button>
      )}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-800 hover:text-primary-700 transition-colors line-clamp-1 mb-1">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">{stars}
          <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 0})</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <FiMapPin size={11} /><span className="truncate">{product.villageName} · {product.sellerName}</span>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-lg font-bold text-primary-dark">₹{product.price}</span>
            <span className="text-xs text-gray-500 ml-1">/{product.unit || 'kg'}</span>
          </div>
          <button
            onClick={() => addToCart(product._id)}
            disabled={product.stock === 0}
            className="btn-primary text-xs px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiShoppingCart size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
