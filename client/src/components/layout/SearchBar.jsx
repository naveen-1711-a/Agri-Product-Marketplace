import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
  };

  return (
    <div className="bg-white/60 backdrop-blur-lg border-b border-primary-100 shadow-sm sticky top-16 z-40 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <form onSubmit={handleSubmit} className="flex items-center gap-0 bg-white/40 backdrop-blur-md rounded-xl overflow-hidden border-2 border-primary-500/60 shadow-[0_2px_10px_rgba(0,0,0,0.04)] focus-within:bg-white/70 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200 transition-all duration-300">
          <FiSearch className="ml-4 text-gray-400 flex-shrink-0" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for vegetables, honey, millets, handicrafts..."
            className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-sm px-3 py-2.5 outline-none"
          />
          <button
            type="submit"
            className="bg-primary-dark text-white text-sm font-semibold px-5 py-2.5 hover:bg-primary-700 transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            <FiSearch size={14} />
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
