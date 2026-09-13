import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../../services/api';
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    bookingApi.getMy()
      .then((res) => setBookings(res.data.data || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-900">My Bookings</h1>
          <p className="text-sm text-dark-500 mt-1">Track and manage your event bookings</p>
        </div>
        <Link to="/customer/book" className="btn-primary">New Booking</Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['ALL', 'PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              filter === s ? 'bg-brand-600 text-white' : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      {filtered.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description="Create a new booking to get started."
          action={<Link to="/customer/book" className="btn-primary">Create Booking</Link>}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-100 text-left text-dark-500">
                <th className="pb-3 font-medium">Reference</th>
                <th className="pb-3 font-medium">Package</th>
                <th className="pb-3 font-medium">Event Date</th>
                <th className="pb-3 font-medium">Venue</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-dark-50/50">
                  <td className="py-3 font-medium text-dark-900">{b.bookingRef}</td>
                  <td className="py-3">{b.packageName}</td>
                  <td className="py-3">{formatDate(b.eventDate)}</td>
                  <td className="py-3 text-dark-500">{b.venue || '—'}</td>
                  <td className="py-3"><StatusBadge status={b.status} /></td>
                  <td className="py-3">{formatCurrency(b.totalAmount)}</td>
                  <td className="py-3">
                    <Link to={`/customer/bookings/${b.id}`} className="text-brand-600 hover:text-brand-700 font-medium">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
