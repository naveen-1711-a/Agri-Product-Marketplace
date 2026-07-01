import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiAward, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { MdLocalGroceryStore } from 'react-icons/md';
import api from '../../services/api';
import ProductCard from '../../components/common/ProductCard';

const SLIDES = [
  {
    badge: '🌱 100% Organic & Natural',
    title: 'Fresh From Village',
    highlight: 'Farms To Your Door',
    desc: 'Handpicked organic vegetables, homemade foods, and traditional products straight from village artisans.',
    cta: { label: 'Shop Now', to: '/products' },
    ctaSecondary: { label: 'Explore Categories', to: '/categories' },
    gradient: 'linear-gradient(135deg, #1a3a2a 0%, #2d5a3d 50%, #4a8c5c 100%)',
    image: '/images/village-banner.jpg',
    emoji: ['🌿', '🥦', '🥕'],
    accent: '#a3e635',
  },
  {
    badge: '🍯 Pure & Authentic',
    title: "Nature's Finest",
    highlight: 'Honey & Millets',
    desc: 'Experience the raw taste of Nilgiri honey, native millets, and age-old traditional snacks from village markets.',
    cta: { label: 'Shop Honey', to: '/products?category=Honey' },
    ctaSecondary: { label: 'Shop Millets', to: '/products?category=Millets' },
    gradient: 'linear-gradient(135deg, #3b2200 0%, #7c4a00 50%, #c47a00 100%)',
    image: '/images/honey-bee.jpg',
    emoji: ['🍯', '🌾', '🫙'],
    accent: '#fbbf24',
  },
  {
    badge: '🪆 Handmade With Love',
    title: 'Traditional Crafts &',
    highlight: 'Village Specials',
    desc: 'Discover unique handicrafts, handmade pickles, and village special products crafted by skilled artisans.',
    cta: { label: 'Shop Handicrafts', to: '/products?category=Handicrafts' },
    ctaSecondary: { label: 'View All Products', to: '/products' },
    gradient: 'linear-gradient(135deg, #1e0a3c 0%, #3b1278 50%, #6b21a8 100%)',
    emoji: ['🪆', '🏺', '🍱'],
    accent: '#c084fc',
  },
  {
    badge: '🤝 Direct From Sellers',
    title: 'Support Local Farmers',
    highlight: '& Artisans',
    desc: 'Every purchase directly supports a village seller. No middlemen — genuine products, fair prices, real impact.',
    cta: { label: 'Browse Products', to: '/products' },
    ctaSecondary: { label: 'Learn More', to: '/about' },
    gradient: 'linear-gradient(135deg, #0c2340 0%, #1a4a7a 50%, #1d6fa4 100%)',
    emoji: ['🌾', '🚜', '🧑‍🌾'],
    accent: '#38bdf8',
  },
];

const CATEGORIES = [
  { name: 'Organic Vegetables', icon: '🥦', color: 'bg-green-50 border-green-200' },
  { name: 'Fruits', icon: '🍎', color: 'bg-red-50 border-red-200' },
  { name: 'Homemade Foods', icon: '🍱', color: 'bg-yellow-50 border-yellow-200' },
  { name: 'Traditional Snacks', icon: '🍘', color: 'bg-orange-50 border-orange-200' },
  { name: 'Pickles', icon: '🫙', color: 'bg-amber-50 border-amber-200' },
  { name: 'Honey', icon: '🍯', color: 'bg-yellow-50 border-yellow-200' },
  { name: 'Millets', icon: '🌾', color: 'bg-lime-50 border-lime-200' },
  { name: 'Handicrafts', icon: '🪆', color: 'bg-purple-50 border-purple-200' },
  { name: 'Village Special Products', icon: '🏺', color: 'bg-rose-50 border-rose-200' },
  { name: 'Seeds', icon: '🌱', color: 'bg-emerald-50 border-emerald-200' },
  { name: 'Medicine', icon: '🌿', color: 'bg-teal-50 border-teal-200' },
  { name: 'Fertilizer', icon: '🧪', color: 'bg-blue-50 border-blue-200' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', location: 'Chennai', text: 'The organic vegetables taste so fresh! Much better than supermarket stuff.', rating: 5 },
  { name: 'Rajan Kumar', location: 'Bangalore', text: 'I love the homemade pickles. Authentic village taste delivered to my doorstep!', rating: 5 },
  { name: 'Meena Devi', location: 'Coimbatore', text: 'Amazing honey from Nilgiris. Pure and natural. Highly recommended!', rating: 5 },
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);

  const goTo = (idx) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 500);
  };

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((current + 1) % SLIDES.length);

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000);
  };

  const handlePrev = () => { prev(); resetTimer(); };
  const handleNext = () => { next(); resetTimer(); };
  const handleDot = (i) => { goTo(i); resetTimer(); };

  const slide = SLIDES[current];

  const bgStyle = slide.image
    ? {
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.15) 100%), url(${slide.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '480px',
        transition: 'background 0.7s ease',
      }
    : { background: slide.gradient, minHeight: '480px', transition: 'background 0.7s ease' };

  return (
    <section className="relative text-white overflow-hidden" style={bgStyle}>
      {/* Animated background emojis (non-image slides only) */}
      {!slide.image && (
        <div className="absolute inset-0 pointer-events-none select-none">
          <span className="absolute top-8 left-8 text-8xl opacity-10 animate-pulse">{slide.emoji[0]}</span>
          <span className="absolute top-16 right-16 text-7xl opacity-10 animate-bounce" style={{ animationDuration: '3s' }}>{slide.emoji[1]}</span>
          <span className="absolute bottom-12 left-1/3 text-9xl opacity-10 animate-pulse" style={{ animationDuration: '4s' }}>{slide.emoji[2]}</span>
          <div className="absolute inset-0 bg-black/10" />
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-10">
        {/* Content */}
        <div key={current} className="flex-1 max-w-2xl" style={{ animation: 'slideInLeft 0.5s ease forwards' }}>
          <span
            className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm border border-white/20"
            style={{ background: `${slide.accent}22`, color: slide.accent }}
          >
            {slide.badge}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 tracking-tight">
            {slide.title}{' '}
            <span style={{ color: slide.accent }}>{slide.highlight}</span>
          </h1>
          <p className="text-base sm:text-lg text-white/75 mb-8 max-w-xl leading-relaxed">{slide.desc}</p>
          <div className="flex flex-wrap gap-4 mb-10">
            <Link to={slide.cta.to} className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95" style={{ background: slide.accent, color: '#111' }}>
              {slide.cta.label} <FiArrowRight />
            </Link>
            <Link to={slide.ctaSecondary.to} className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-xl border-2 border-white/40 hover:bg-white/10 transition-colors">
              {slide.ctaSecondary.label}
            </Link>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <span className="flex items-center gap-1.5"><FiShield style={{ color: slide.accent }} /> Verified Sellers</span>
            <span className="flex items-center gap-1.5"><FiTruck style={{ color: slide.accent }} /> Fast Delivery</span>
            <span className="flex items-center gap-1.5"><FiAward style={{ color: slide.accent }} /> Quality Assured</span>
          </div>
        </div>

        {/* Big emoji display (non-image slides only) */}
        {!slide.image && (
          <div key={`emoji-${current}`} className="hidden lg:flex flex-shrink-0 items-center justify-center w-64 h-64 rounded-3xl"
            style={{ background: `${slide.accent}18`, border: `2px solid ${slide.accent}33`, animation: 'slideInRight 0.5s ease forwards', fontSize: '9rem' }}>
            {slide.emoji[0]}
          </div>
        )}
      </div>

      {/* Prev / Next */}
      <button onClick={handlePrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-full p-2.5 transition-all z-10" aria-label="Previous slide">
        <FiChevronLeft size={22} />
      </button>
      <button onClick={handleNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-full p-2.5 transition-all z-10" aria-label="Next slide">
        <FiChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => handleDot(i)} className="rounded-full transition-all duration-300"
            style={{ width: i === current ? '28px' : '8px', height: '8px', background: i === current ? slide.accent : 'rgba(255,255,255,0.35)' }}
            aria-label={`Slide ${i + 1}`} />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute top-4 right-14 text-xs font-semibold text-white/40 tracking-widest">
        {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>

      <style>{`
        @keyframes slideInLeft  { from { opacity:0; transform:translateX(-32px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(32px);  } to { opacity:1; transform:translateX(0); } }
      `}</style>
    </section>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    api.get('/products/featured').then(({ data }) => setFeatured(data.products || []))
      .catch(() => {}).finally(() => setLoadingFeatured(false));
  }, []);

  return (
    <div>
      <HeroCarousel />

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Popular Categories</h2>
            <p className="text-gray-500 mt-2">Explore what village markets have to offer</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 gap-3">
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/products?category=${encodeURIComponent(cat.name)}`}
                className={`${cat.color} border-2 rounded-2xl p-3 text-center hover:scale-105 transition-transform cursor-pointer`}>
                <div className="text-3xl mb-1">{cat.icon}</div>
                <p className="text-xs font-medium text-gray-700 leading-tight">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Featured Products</h2>
              <p className="text-gray-500 mt-1">Top picks from our village sellers</p>
            </div>
            <Link to="/products" className="btn-outline text-sm">View All <FiArrowRight /></Link>
          </div>
          {loadingFeatured ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-2xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <MdLocalGroceryStore size={48} className="mx-auto mb-3 opacity-50" />
              <p>Products coming soon! Check back shortly.</p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose EPM?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🌿', title: 'Farm Fresh', desc: 'Products harvested fresh from village farms and delivered directly.' },
              { icon: '✅', title: 'Verified Sellers', desc: 'Every seller is verified by our admin team before listing products.' },
              { icon: '🤝', title: 'Direct Trade', desc: 'Buy directly from farmers and artisans, cutting out middlemen.' },
              { icon: '🚚', title: 'Fast Delivery', desc: 'Quick and safe delivery to your doorstep across India.' },
            ].map(b => (
              <div key={b.title} className="text-center">
                <div className="text-4xl mb-3">{b.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-primary-light">{b.title}</h3>
                <p className="text-green-200 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">What Our Customers Say</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card p-6">
                <div className="flex gap-1 mb-3">
                  {Array(t.rating).fill(0).map((_, j) => <FiStar key={j} className="text-yellow-400 fill-yellow-400" size={16} />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-dark">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-primary-50">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-primary-dark mb-4">Are You a Village Seller?</h2>
          <p className="text-gray-600 mb-8">Join EPM and reach thousands of customers across India. Contact our admin to get started as a seller.</p>
          <Link to="/contact" className="btn-primary px-8 py-3 text-base">
            Get In Touch <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
