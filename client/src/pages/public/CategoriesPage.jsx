import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const CATEGORIES = [
  { name: 'Organic Vegetables', icon: '🥦', desc: 'Fresh farm-to-table vegetables grown without pesticides', color: 'from-green-400 to-green-600' },
  { name: 'Fruits', icon: '🍎', desc: 'Seasonal fruits picked fresh from village orchards', color: 'from-red-400 to-red-600' },
  { name: 'Homemade Foods', icon: '🍱', desc: 'Traditional recipes made with love in village kitchens', color: 'from-yellow-400 to-orange-500' },
  { name: 'Traditional Snacks', icon: '🍘', desc: 'Authentic regional snacks with time-honored flavors', color: 'from-orange-400 to-orange-600' },
  { name: 'Pickles', icon: '🫙', desc: 'Hand-crafted pickles and preserves using old family recipes', color: 'from-amber-400 to-amber-600' },
  { name: 'Honey', icon: '🍯', desc: 'Pure, raw, unprocessed honey from forest beekeepers', color: 'from-yellow-300 to-yellow-500' },
  { name: 'Millets', icon: '🌾', desc: 'Nutritious ancient grains — ragi, bajra, jowar and more', color: 'from-lime-400 to-lime-600' },
  { name: 'Handicrafts', icon: '🪆', desc: 'Handmade crafts, pottery and art from village artisans', color: 'from-purple-400 to-purple-600' },
  { name: 'Village Special Products', icon: '🏺', desc: 'Unique products you can only find in Indian villages', color: 'from-rose-400 to-rose-600' },
  { name: 'Seeds', icon: '🌱', desc: 'High-quality seeds for your farming and gardening needs', color: 'from-emerald-400 to-emerald-600' },
  { name: 'Medicine', icon: '🌿', desc: 'Natural and ayurvedic medicinal products', color: 'from-teal-400 to-teal-600' },
  { name: 'Fertilizer', icon: '🧪', desc: 'Organic and chemical-free fertilizers for healthy crops', color: 'from-blue-400 to-blue-600' },
];

export default function CategoriesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Browse Categories</h1>
        <p className="text-gray-500">Explore authentic products from Indian villages</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.name}
            to={`/products?category=${encodeURIComponent(cat.name)}`}
            className="group card overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className={`bg-gradient-to-br ${cat.color} p-8 text-center`}>
              <span className="text-6xl group-hover:scale-110 inline-block transition-transform duration-300">
                {cat.icon}
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800 text-lg">{cat.name}</h3>
                <FiArrowRight className="text-gray-400 group-hover:text-primary-700 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{cat.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
