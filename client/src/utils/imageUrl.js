/**
 * Returns the correct image URL whether it's:
 * - A full Cloudinary URL (https://res.cloudinary.com/...)
 * - An old local path (/uploads/filename.jpg)
 */
export const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) {
    // If it's a Cloudinary URL, inject automatic format, quality, and width optimizations
    if (img.includes('res.cloudinary.com') && !img.includes('/f_auto,q_auto')) {
      return img.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
    }
    return img;
  }
  // Legacy local path — point to backend
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${base}${img}`;
};
