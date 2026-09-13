import { useEffect, useState } from 'react';
import { assignmentApi, galleryApi } from '../../services/api';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { Camera, Image as ImageIcon, Upload, CheckCircle } from 'lucide-react';

const STATUS_OPTIONS = ['ASSIGNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

export default function MyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Gallery Modal
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [galleryForm, setGalleryForm] = useState({ title: '', caption: '', photoUrl: '' });
  const [submittingPhoto, setSubmittingPhoto] = useState(false);

  const load = () => {
    assignmentApi.getMy()
      .then((res) => setAssignments(res.data.data || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateProgress = async (id, status) => {
    setUpdating(id);
    setError('');
    setSuccess('');
    try {
      const payload = { status };
      if (status === 'CONFIRMED') payload.attendanceConfirmed = true;
      await assignmentApi.updateProgress(id, payload);
      setSuccess(`Assignment status updated to ${status.replace(/_/g, ' ')}`);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdating(null);
    }
  };

  const handleOpenPhotoUpload = (assignment) => {
    setSelectedAssignment(assignment);
    setGalleryForm({ title: `${assignment.packageName || 'Event'} Album`, caption: '', photoUrl: '' });
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setSubmittingPhoto(true);
    setError('');
    setSuccess('');
    try {
      // First get or create gallery for booking
      let galleryId;
      try {
        const galRes = await galleryApi.getByBooking(selectedAssignment.bookingId);
        galleryId = galRes.data?.data?.id;
      } catch (err) {
        // Create gallery if doesn't exist
        const newGal = await galleryApi.create({ bookingId: selectedAssignment.bookingId, title: galleryForm.title });
        galleryId = newGal.data?.data?.id;
      }

      if (galleryId) {
        await galleryApi.addPhoto(galleryId, {
          filePath: galleryForm.photoUrl,
          caption: galleryForm.caption || 'Event Shot',
          fileName: `photo_${Date.now()}.jpg`,
        });
        setSuccess('Photo added to event gallery successfully!');
        setSelectedAssignment(null);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmittingPhoto(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-dark-900">My Shoot Assignments</h1>
        <p className="text-sm text-dark-500 mt-1">Manage event attendance, shoot progress, and upload finished photos</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {success}
        </div>
      )}

      {assignments.length === 0 ? (
        <EmptyState title="No Shoot Assignments" description="You currently have no events assigned to your schedule." />
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div key={a.id} className="card hover:border-brand-200 transition">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-brand-700 text-lg">{a.bookingReference || a.bookingRef}</span>
                    <StatusBadge status={a.status || a.assignmentStatus} />
                    {a.attendanceConfirmed && (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                        <CheckCircle className="w-3 h-3" /> Attendance Confirmed
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-dark-900">{a.packageName} · Customer: {a.customerName}</p>
                  <p className="text-xs text-dark-500 flex items-center gap-2">
                    <span>Date: <strong>{formatDate(a.eventDate)}</strong></span>
                    <span>·</span>
                    <span>Venue: <strong>{a.venue || 'TBD'}</strong></span>
                  </p>
                  {a.notes && <p className="text-xs text-dark-500 italic bg-dark-50 p-2 rounded border border-dark-100 max-w-lg">Notes: {a.notes}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-dark-100">
                  <button
                    onClick={() => handleOpenPhotoUpload(a)}
                    className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-brand-600" /> Upload Photos
                  </button>

                  {a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && (
                    <div className="flex flex-wrap gap-1.5">
                      {STATUS_OPTIONS.filter((s) => s !== (a.status || a.assignmentStatus)).map((s) => (
                        <button
                          key={s}
                          disabled={updating === a.id}
                          onClick={() => updateProgress(a.id, s)}
                          className="btn-primary text-xs py-2 px-3"
                        >
                          {s.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Photo Modal */}
      <Modal isOpen={!!selectedAssignment} onClose={() => setSelectedAssignment(null)} title="Upload Event Photo">
        <form onSubmit={handleAddPhoto} className="space-y-4">
          <div>
            <label className="label">Album Title</label>
            <input
              type="text"
              required
              value={galleryForm.title}
              onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Photo File URL / Path *</label>
            <input
              type="text"
              required
              value={galleryForm.photoUrl}
              onChange={(e) => setGalleryForm({ ...galleryForm, photoUrl: e.target.value })}
              placeholder="e.g. https://images.unsplash.com/photo-1519741497674-611481863552"
              className="input-field"
            />
            <p className="text-[11px] text-dark-400 mt-1">Provide high-res photo URL or storage path</p>
          </div>

          <div>
            <label className="label">Caption / Description</label>
            <input
              type="text"
              value={galleryForm.caption}
              onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
              placeholder="e.g. Couple Ceremony Shot"
              className="input-field"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <button type="button" onClick={() => setSelectedAssignment(null)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submittingPhoto} className="btn-primary">
              {submittingPhoto ? 'Uploading...' : 'Save & Publish Photo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
