import { useEffect, useState } from 'react';
import { bookingApi, assignmentApi } from '../../services/api';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Assignments() {
  const [bookings, setBookings] = useState([]);
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      bookingApi.getAll(),
      assignmentApi.getPhotographers(),
    ])
      .then(([bRes, pRes]) => {
        setBookings(bRes.data.data || []);
        setPhotographers(pRes.data.data || []);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAssign = async () => {
    if (!selectedBooking || !selectedPhoto) return;
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await assignmentApi.assign({
        bookingId: selectedBooking,
        photographerId: Number(selectedPhoto),
      });
      setMessage('Photographer assigned successfully');
      setSelectedBooking(null);
      setSelectedPhoto('');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const assignable = bookings.filter((b) => !['COMPLETED', 'CANCELLED'].includes(b.status));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-dark-900 mb-6">Photographer Assignments</h1>

      {message && <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Assign Photographer</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Booking</label>
            <select className="input-field" value={selectedBooking || ''} onChange={(e) => setSelectedBooking(Number(e.target.value))}>
              <option value="">Select booking</option>
              {assignable.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bookingRef} — {formatDate(b.eventDate)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Photographer</label>
            <select className="input-field" value={selectedPhoto} onChange={(e) => setSelectedPhoto(e.target.value)}>
              <option value="">Select photographer</option>
              {photographers.map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleAssign} disabled={submitting || !selectedBooking || !selectedPhoto} className="btn-primary w-full">
              {submitting ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
        <p className="text-xs text-dark-400 mt-2">System prevents double-booking the same photographer on the same date.</p>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold mb-4">Current Assignments</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-100 text-left text-dark-500">
              <th className="pb-3 font-medium">Booking</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Photographers</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-50">
            {assignable.map((b) => (
              <tr key={b.id}>
                <td className="py-3 font-medium">{b.bookingRef}</td>
                <td className="py-3">{formatDate(b.eventDate)}</td>
                <td className="py-3">{b.customerName}</td>
                <td className="py-3">
                  {b.assignments?.length > 0
                    ? b.assignments.map((a) => a.photographerName).join(', ')
                    : <span className="text-amber-600">Unassigned</span>}
                </td>
                <td className="py-3"><StatusBadge status={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
