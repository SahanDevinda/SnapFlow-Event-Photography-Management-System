import { useState } from 'react';
import { galleryApi } from '../services/api';
import { getErrorMessage, formatDate } from '../utils/helpers';
import GalleryLightbox from '../components/GalleryLightbox';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Image as ImageIcon, Lock, ShieldCheck, Download, Share2 } from 'lucide-react';

export default function PublicGallery() {
  const [accessCode, setAccessCode] = useState('');
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!accessCode.trim()) return;
    setLoading(true);
    setError('');
    setGallery(null);
    try {
      const { data } = await galleryApi.getByCode(accessCode.trim());
      if (!data.data) {
        setError('No photo gallery found with this access code.');
      } else {
        setGallery(data.data);
      }
    } catch (err) {
      setError(getErrorMessage(err) || 'Invalid access code or gallery unpublished.');
    } finally {
      setLoading(false);
    }
  };

  const openPhoto = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 bg-dark-50">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Search Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-800">
            <Lock className="w-3.5 h-3.5" /> Client Private Access Portal
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-dark-900">
            Event Photography Collection
          </h1>
          <p className="text-dark-500 text-sm">
            Enter your unique 8-character gallery access code sent to your email to view your high-resolution event photos.
          </p>

          <form onSubmit={handleSearch} className="flex items-center justify-center gap-2 max-w-md mx-auto pt-2">
            <div className="relative flex-1">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="e.g. SF-9X2B7"
                className="input-field pl-10 font-mono tracking-wider font-semibold text-center uppercase text-base"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <LoadingSpinner /> : <Search className="w-4 h-4" />} Access Gallery
            </button>
          </form>

          {error && (
            <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </p>
          )}
        </div>

        {/* Gallery Content Display */}
        {gallery && (
          <div className="space-y-6 animate-fadeIn">
            {/* Gallery Info Header */}
            <div className="card bg-dark-900 text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
                  {gallery.published ? 'Published Collection' : 'Draft Preview'}
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold mt-1">
                  {gallery.title || 'Event Photo Album'}
                </h2>
                <p className="text-xs text-dark-300 mt-1">
                  Booking Reference: <span className="font-mono text-brand-300 font-semibold">{gallery.bookingReference}</span> · Total Photos: <span className="font-bold text-white">{gallery.photos?.length || 0}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Watermark Free High-Res
                </span>
              </div>
            </div>

            {/* Photos Grid */}
            {!gallery.photos || gallery.photos.length === 0 ? (
              <div className="card p-12 text-center text-dark-400">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 text-dark-300" />
                <p className="font-semibold text-dark-800">No photos uploaded yet</p>
                <p className="text-xs text-dark-500 mt-1">Our photographers are currently post-processing your event photos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.photos.map((photo, index) => (
                  <div
                    key={photo.id || index}
                    onClick={() => openPhoto(index)}
                    className="group relative aspect-4/3 rounded-xl overflow-hidden bg-dark-900 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <img
                      src={photo.filePath || photo.url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80'}
                      alt={photo.caption || photo.fileName || `Photo ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                      <p className="text-white text-xs font-medium truncate">
                        {photo.caption || photo.fileName || `Photo ${index + 1}`}
                      </p>
                      <span className="text-[10px] text-brand-300 mt-0.5">Click to view full screen</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Lightbox Component */}
            <GalleryLightbox
              isOpen={lightboxOpen}
              onClose={() => setLightboxOpen(false)}
              photos={gallery.photos || []}
              initialIndex={lightboxIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
}
