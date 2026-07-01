import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl mb-6">🌿</div>
      <h1 className="text-6xl font-bold text-primary-dark mb-3">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-3">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved. Let's get you back to the marketplace.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link to="/" className="btn-primary">Back to Home</Link>
        <Link to="/products" className="btn-outline">Browse Products</Link>
      </div>
    </div>
  );
}
