import React, { useState } from 'react';
import { Camera, KeyRound, Download, Image as ImageIcon } from 'lucide-react';
import api, { API_BASE_URL } from '../../services/api';
import { photoStreamUrl } from '../../components/common/ProtectedImage';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useToast } from '../../context/ToastContext';

export const GalleryAccessPage = () => {
  const { showError, showSuccess } = useToast();
  const [accessCode, setAccessCode] = useState('');
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      showError('Please enter your 8-character access code');
      return;
    }

    setLoading(true);
    setGallery(null);
    try {
      const res = await api.get(`/galleries/public/${accessCode.trim().toUpperCase()}`);
      if (res.success) {
        setGallery(res.data);
        showSuccess('Gallery accessed successfully');
      }
    } catch (err) {
      showError(err.message || 'Invalid or unpublished access code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!gallery) return;
    setDownloadingZip(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/galleries/public/${encodeURIComponent(gallery.accessCode)}/zip`
      );
      if (!response.ok) throw new Error('ZIP download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${gallery.title || 'gallery'}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      showError('Could not download ZIP archive');
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Client Gallery Portal' }]} />

      <div className="max-w-2xl mx-auto text-center mb-10">
        <div className="w-12 h-12 rounded-2xl bg-gold-500/10 text-gold-600 flex items-center justify-center mx-auto mb-4 border border-gold-500/30">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Private Gallery Access</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your unique 8-character client access code provided by Lanka Moments to view and download your final event photos.
        </p>

        <form onSubmit={handleLookup} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="text"
            required
            maxLength={16}
            placeholder="e.g. ASWED261"
            className="flex-1 uppercase font-mono tracking-widest text-center px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
          />
          <Button type="submit" variant="primary" loading={loading} icon={Camera}>
            Access Gallery
          </Button>
        </form>
      </div>

      {gallery && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-gold-400/30">
                Published Gallery
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">{gallery.title}</h2>
              <p className="text-xs text-gray-500">
                Booking: <span className="font-semibold text-gray-700">{gallery.bookingRef}</span> &bull; Client: {gallery.customerName} &bull; {gallery.photos?.length || 0} Photos
              </p>
            </div>

            <Button
              variant="primary"
              icon={Download}
              loading={downloadingZip}
              onClick={handleDownloadZip}
            >
              Download Full Gallery (ZIP)
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.photos && gallery.photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xs hover:shadow-md transition">
                <div className="relative aspect-[4/3] bg-gray-100">
                  <img
                    src={photoStreamUrl(photo.id, gallery.accessCode)}
                    alt={photo.caption || photo.originalFileName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {photo.cover && (
                    <span className="absolute top-2 left-2 bg-gold-500 text-charcoal-900 text-[10px] font-bold px-2 py-0.5 rounded">
                      Cover Photo
                    </span>
                  )}
                </div>
                <div className="p-3 flex items-center justify-between text-xs">
                  <span className="truncate text-gray-700 font-medium">{photo.caption || photo.originalFileName}</span>
                  <a
                    href={photoStreamUrl(photo.id, gallery.accessCode)}
                    download={photo.originalFileName}
                    className="p-1.5 text-gray-400 hover:text-gold-600 hover:bg-gray-100 rounded transition shrink-0"
                    title="Download Photo"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryAccessPage;
