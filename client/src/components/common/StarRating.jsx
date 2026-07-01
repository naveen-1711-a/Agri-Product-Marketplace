import { FiStar } from 'react-icons/fi';

export default function StarRating({ rating = 0, size = 14, showCount, count }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <FiStar key={i} size={size}
          className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
      ))}
      {showCount && <span className="text-sm text-gray-500 ml-1">({count ?? 0})</span>}
    </div>
  );
}
