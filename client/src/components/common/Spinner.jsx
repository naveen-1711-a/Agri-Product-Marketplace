export default function Spinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${sizes[size]} border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin`} />
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  );
}
