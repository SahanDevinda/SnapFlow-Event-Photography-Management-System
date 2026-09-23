import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import ProtectedImage from '../../components/common/ProtectedImage';
import { Image, Download, Heart, ChevronLeft, Lock } from 'lucide-react';

export default function CustomerGalleryView() {
  const { id } = useParams();
  const toast = useToast();

  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [downloadingZip, setDownloadingZip] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, [id]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/galleries/${id}`);
      setGallery(res.data);
    } catch (err) {
      toast.error('Failed to load gallery details.');
    } finally {
      setLoading(false);
    }
  };

  const toggleProof = async (photoId, currentProofState) => {
    try {
      // Backend signature: PATCH /galleries/{id}/photos/{photoId}/proof?selected=true|false
      await api.patch(`/galleries/${id}/photos/${photoId}/proof?selected=${!currentProofState}`);
      toast.success(currentProofState ? 'Removed from album selections' : 'Selected for final album proof!');
      // Update local state
      setGallery(prev => ({
        ...prev,
        photos: prev.photos.map(p => p.id === photoId ? { ...p, selectedProof: !currentProofState } : p)
      }));
    } catch (err) {
      toast.error('Failed to update photo selection.');
    }
  };

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      const res = await api.get(`/galleries/${id}/zip`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${gallery.title || 'gallery'}-photos.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Gallery download started!');
    } catch (err) {
      toast.error('Failed to download ZIP file.');
    } finally {
      setDownloadingZip(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={6} className="h-48" />;
  }

  if (!gallery) {
    return <div className="p-8 text-center text-navy-500">Gallery not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-navy-500">
        <Link to="/customer/galleries" className="flex items-center gap-1 hover:text-navy-800">
          <ChevronLeft className="w-4 h-4" /> Back to My Galleries
        </Link>
      </div>

      {/* Gallery Header */}
      <div className="bg-white p-6 rounded-2xl border border-navy-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <span className="text-xs font-mono font-bold text-amber-600 uppercase">
            Private Collection • Access Code: {gallery.accessCode}
          </span>
          <h1 className="text-2xl font-serif font-bold text-navy-900 mt-1">{gallery.title}</h1>
          <p className="text-xs text-navy-500 mt-1">{gallery.description || 'Lanka Moments curated high-resolution gallery.'}</p>
        </div>

        <Button
          variant="gold"
          icon={Download}
          loading={downloadingZip}
          onClick={handleDownloadZip}
        >
          Download Collection (.ZIP)
        </Button>
      </div>

      {/* Watermark notice */}
      {gallery.status !== 'PUBLISHED' && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Watermarked proofing mode active. Select your favorite photos for album printing using the heart button. Full high-res delivered upon final payment settlement.</span>
        </div>
      )}

      {/* Photo Grid */}
      {(!gallery.photos || gallery.photos.length === 0) ? (
        <Card className="text-center py-12 text-navy-500">
          <Image className="w-12 h-12 mx-auto mb-3 text-navy-300" />
          <p className="font-semibold text-navy-800">No photos in this gallery yet.</p>
          <p className="text-xs text-navy-400 mt-1">Photos are currently being processed by our studio editors.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {gallery.photos.map(photo => (
            <div
              key={photo.id}
              className={`group relative rounded-xl overflow-hidden bg-navy-100 border transition ${
                photo.selectedProof ? 'border-amber-500 ring-2 ring-amber-500' : 'border-navy-100'
              }`}
            >
              <div className="aspect-square relative cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                <ProtectedImage
                  photoId={photo.id}
                  alt={photo.caption || 'Gallery photo'}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                {(photo.cover || gallery.coverPhotoId === photo.id) && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-navy-900/80 text-amber-400 text-[10px] font-bold rounded">
                    COVER
                  </span>
                )}
              </div>

              {/* Action overlay */}
              <div className="p-2 bg-white flex justify-between items-center text-xs">
                <span className="text-navy-600 truncate max-w-[120px]">{photo.caption || 'Photo'}</span>
                <button
                  onClick={() => toggleProof(photo.id, photo.selectedProof)}
                  title={photo.selectedProof ? 'Selected for album' : 'Select for album'}
                  className={`p-1.5 rounded-full transition ${
                    photo.selectedProof
                      ? 'bg-amber-500 text-white'
                      : 'bg-navy-100 text-navy-500 hover:bg-amber-50 hover:text-amber-600'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${photo.selectedProof ? 'fill-white' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPhoto(null)}
          title={selectedPhoto.caption || 'Gallery Photo Preview'}
          size="xl"
          footer={
            <div className="flex justify-between items-center w-full">
              <button
                onClick={() => toggleProof(selectedPhoto.id, selectedPhoto.selectedProof)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedPhoto.selectedProof
                    ? 'bg-amber-500 text-white'
                    : 'bg-navy-100 text-navy-700 hover:bg-amber-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${selectedPhoto.selectedProof ? 'fill-white' : ''}`} />
                {selectedPhoto.selectedProof ? 'Proof Selected' : 'Mark as Album Favorite'}
              </button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedPhoto(null)}>Close</Button>
            </div>
          }
        >
          <div className="max-h-[70vh] flex items-center justify-center bg-black/5 rounded-xl overflow-hidden">
            <ProtectedImage
              photoId={selectedPhoto.id}
              alt={selectedPhoto.caption || 'Preview'}
              className="max-h-[65vh] w-auto object-contain"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
