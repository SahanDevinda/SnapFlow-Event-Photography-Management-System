import React from 'react';

export const LoadingSkeleton = ({ count = 3, height = 'h-16', className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`w-full bg-gray-200/80 rounded-lg animate-pulse ${height}`} />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
