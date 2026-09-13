import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GalleryLightbox({ photos = [], initialIndex = 0, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
      if (e.key === 'ArrowRight') setCurrentIndex((i) => (i < photos.length - 1 ? i + 1 : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, photos.length, onClose]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition"
      >
        <X className="w-6 h-6" />
      </button>

      {photos.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((i) => (i > 0 ? i - 1 : photos.length - 1))}
            className="absolute left-4 z-50 p-3 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentIndex((i) => (i < photos.length - 1 ? i + 1 : 0))}
            className="absolute right-4 z-50 p-3 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <div className="max-w-5xl max-h-[85vh] p-4 flex flex-col items-center justify-center">
        <img
          src={currentPhoto.filePath || currentPhoto.url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80'}
          alt={currentPhoto.caption || currentPhoto.fileName || 'Photo'}
          className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
        />
        {currentPhoto.caption && (
          <p className="mt-4 text-center text-white/90 text-sm font-medium max-w-xl">
            {currentPhoto.caption}
          </p>
        )}
        <span className="mt-2 text-xs text-white/50">
          {currentIndex + 1} of {photos.length}
        </span>
      </div>
    </div>
  );
}
