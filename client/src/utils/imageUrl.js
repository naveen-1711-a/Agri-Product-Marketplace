/**
 * Returns the correct image URL whether it's:
 * - A full Cloudinary URL (https://res.cloudinary.com/...)
 * - An old local path (/uploads/filename.jpg)
 */
export const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img; // Cloudinary full URL ✅
  // Legacy local path — point to backend
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${base}${img}`;
};
