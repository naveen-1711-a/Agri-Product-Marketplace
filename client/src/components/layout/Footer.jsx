import { Link } from 'react-router-dom';
import { GiWheat } from 'react-icons/gi';
import { FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const categories = ['Organic Vegetables','Fruits','Homemade Foods','Traditional Snacks','Pickles','Honey','Millets','Handicrafts','Village Special Products','Seeds','Medicine','Fertilizer'];

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GiWheat className="text-primary-light text-3xl" />
              <div>
                <h3 className="text-lg font-bold">EPM</h3>
                <p className="text-primary-light text-xs">Empowering Products Marketplace</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Connecting village artisans and farmers directly with customers. Fresh, authentic, and trusted.
            </p>
            <div className="flex gap-3 mt-4">
              {[FiFacebook, FiInstagram, FiTwitter].map((Icon, i) => (
                <a key={i} href="#" className="bg-primary-700 p-2 rounded-lg hover:bg-primary-500 transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-primary-light mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              {[['Home', '/'], ['Shop', '/products'], ['About', '/about'], ['Contact', '/contact'], ['Register', '/register']].map(([label, href]) => (
                <li key={label}><Link to={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-primary-light mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              {categories.slice(0, 6).map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${encodeURIComponent(cat)}`} className="hover:text-white transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-primary-light mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2"><FiMapPin className="mt-0.5 text-primary-light flex-shrink-0" /><span>EPM Village Market, Tamil Nadu, India</span></li>
              <li className="flex items-center gap-2"><FiPhone className="text-primary-light" /><span>+91 98765 43210</span></li>
              <li className="flex items-center gap-2"><FiMail className="text-primary-light" /><span>support@epm.com</span></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-700 py-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} EPM – Empowering Products Marketplace. All rights reserved.
      </div>
    </footer>
  );
}
