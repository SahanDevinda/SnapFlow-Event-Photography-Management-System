import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import ProtectedImage from '../../components/common/ProtectedImage';
import { UploadCloud, Trash2, ChevronLeft } from 'lucide-react';

export default function GalleryEditor() {
  const { id } = useParams();
  const toast = useToast();

  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState('');

  useEffect(() => {
    fetchGallery();
  }, [id]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/galleries/${id}`);
      setGallery(res.data);
    } catch (err) {
      toast.error('Failed to load gallery.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Please select at least one photo.');
      return;
    }

    try {
      setUploading(true);
      const fd = new FormData();
      files.forEach(file => fd.append('files', file));
      const res = await api.post(`/galleries/${id}/photos`, fd);

      // Captions are a separate endpoint on the backend.
      if (caption.trim()) {
        const uploaded = Array.isArray(res?.data) ? res.data : [];
        await Promise.all(
          uploaded.map(photo =>
            api.patch(
              `/galleries/${id}/photos/${photo.id}/caption?caption=${encodeURIComponent(caption.trim())}`
            )
          )
        );
      }
      toast.success(`${files.length} photo(s) uploaded successfully!`);
      setFiles([]);
      setCaption('');
      fetchGallery();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photos.');
    } finally {
      setUploading(false);
    }
  };

  const handleSetCover = async (photoId) => {
    try {
      // There is no dedicated cover endpoint - cover is a gallery field.
      await api.put(`/galleries/${id}`, { coverPhotoId: photoId });
      toast.success('Cover photo updated!');
      fetchGallery();
    } catch (err) {
      toast.error('Failed to set cover photo.');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Delete this photo from gallery?')) return;
    try {
      await api.delete(`/galleries/${id}/photos/${photoId}`);
      toast.success('Photo removed.');
      fetchGallery();
    } catch (err) {
      toast.error('Failed to delete photo.');
    }
  };

  if (loading) return <LoadingSkeleton count={4} className="h-32" />;
  if (!gallery) return <div className="p-8 text-center text-navy-500">Gallery not found.</div>;

  return (
    <div className="space-y-6">
      <Link to="/photographer/galleries" className="flex items-center gap-1 text-xs text-navy-500 hover:text-navy-800">
        <ChevronLeft className="w-4 h-4" /> Back to Galleries
      </Link>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900">{gallery.title}</h1>
          <p className="text-navy-600 text-sm">Access Code: {gallery.accessCode} • Total: {gallery.photos?.length || 0} photos</p>
        </div>
      </div>

      {/* Upload Zone */}
      <Card title="Upload New Photos">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
              Select Photo Files
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={e => setFiles(Array.from(e.target.files))}
              className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
              Default Caption / Tag
            </label>
            <input
              type="text"
              placeholder="e.g. Ceremony Highlights"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <Button type="submit" variant="gold" size="sm" loading={uploading} icon={UploadCloud}>
            Upload {files.length > 0 ? `(${files.length}) Photos` : ''}
          </Button>
        </form>
      </Card>

      {/* Existing Photos Grid */}
      <Card title="Existing Photos in Gallery">
        {(!gallery.photos || gallery.photos.length === 0) ? (
          <p className="text-xs text-navy-500 py-6 text-center">No photos in this gallery yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.photos.map(p => (
              <div key={p.id} className="border border-navy-100 rounded-xl overflow-hidden group relative">
                <div className="aspect-square bg-navy-100 relative">
                  <ProtectedImage photoId={p.id} alt={p.caption || 'Gallery photo'} className="w-full h-full object-cover" />
                  {(p.cover || gallery.coverPhotoId === p.id) && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white font-bold text-[10px] rounded">
                      COVER
                    </span>
                  )}
                </div>
                <div className="p-2 bg-white flex justify-between items-center text-xs">
                  <button
                    onClick={() => handleSetCover(p.id)}
                    className="text-[11px] text-navy-600 hover:text-amber-600 font-semibold"
                  >
                    Set Cover
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(p.id)}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
