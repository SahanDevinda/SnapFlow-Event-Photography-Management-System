export default function LoadingSpinner({ className = 'h-8 w-8' }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`animate-spin rounded-full border-4 border-brand-600 border-t-transparent ${className}`} />
    </div>
  );
}
