import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-4">
          <GiWheat className="text-primary-700 text-6xl" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">About EPM</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Empowering Products Marketplace — bridging the gap between village artisans and modern consumers.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="card p-8 border-l-4 border-primary-700">
          <div className="text-3xl mb-3">🎯</div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            To empower rural farmers, artisans, and food makers by giving them direct access to consumers
            across India — eliminating middlemen and ensuring fair prices for authentic village products.
          </p>
        </div>
        <div className="card p-8 border-l-4 border-primary-500">
          <div className="text-3xl mb-3">🌟</div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Our Vision</h2>
          <p className="text-gray-600 leading-relaxed">
            A thriving digital village economy where every artisan's craft and every farmer's produce
            reaches the right customer — fresh, fairly priced, and full of cultural heritage.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="bg-primary-50 rounded-3xl p-8 md:p-12 mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Story</h2>
        <div className="text-gray-600 leading-relaxed space-y-4">
          <p>
            EPM was born from a simple observation: village farmers and artisans produce some of the
            most authentic, high-quality products in India — organic vegetables, hand-crafted pickles,
            pure honey, traditional snacks — yet they struggle to reach customers beyond their village.
          </p>
          <p>
            We built EPM to change that. By connecting trusted village sellers directly with customers
            who appreciate authenticity, we help preserve cultural food traditions while creating
            sustainable livelihoods for rural communities.
          </p>
          <p>
            Every product on EPM is reviewed and approved by our admin team, ensuring quality,
            authenticity, and trust for every purchase you make.
          </p>
        </div>
      </div>

      {/* Values */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Our Values</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '🌿', title: 'Authenticity', desc: 'Only genuine village products' },
            { icon: '🤝', title: 'Trust', desc: 'Verified sellers, honest listings' },
            { icon: '🌾', title: 'Sustainability', desc: 'Supporting rural livelihoods' },
            { icon: '❤️', title: 'Community', desc: 'Building village economies' },
          ].map(v => (
            <div key={v.title} className="text-center card p-6">
              <div className="text-4xl mb-3">{v.icon}</div>
              <h3 className="font-bold text-gray-800 mb-1">{v.title}</h3>
              <p className="text-sm text-gray-500">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    toast.success('Message sent! We\'ll get back to you soon.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Get In Touch</h1>
        <p className="text-gray-500 text-lg">Have questions? We'd love to hear from you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-gray-800 mb-4">Contact Information</h3>
            <div className="space-y-4">
              {[
                { icon: FiMapPin, label: 'Address', value: 'EPM Village Market\nTamil Nadu, India - 638052' },
                { icon: FiPhone, label: 'Phone', value: '+91 98765 43210' },
                { icon: FiMail, label: 'Email', value: 'support@epm.com' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-primary-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 bg-primary-50">
            <h3 className="font-bold text-primary-dark mb-2">Want to Sell?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Are you a village farmer or artisan? Contact us to become a verified seller on EPM.
            </p>
            <p className="text-xs text-gray-500">We'll set up your seller account and get you started!</p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Your Name</label>
                <input className="input" placeholder="John Doe" value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </div>
            </div>
            <div>
              <label className="label">Subject</label>
              <input className="input" placeholder="How can we help?" value={form.subject} onChange={set('subject')} required />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea className="input resize-none" rows={5} placeholder="Your message..."
                value={form.message} onChange={set('message')} required />
            </div>
            <button type="submit" disabled={sending} className="btn-primary py-3 px-8">
              {sending
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><FiSend /> Send Message</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
