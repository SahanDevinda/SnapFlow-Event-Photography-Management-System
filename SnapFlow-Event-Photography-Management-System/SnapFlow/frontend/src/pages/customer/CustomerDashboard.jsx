import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Calendar, Plus } from 'lucide-react';

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingApi.getMy()
      .then((res) => setBookings(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-900">My Dashboard</h1>
          <p className="text-sm text-dark-500 mt-1">Overview of your photography bookings</p>
        </div>
        <Link to="/customer/book" className="btn-primary">
          <Plus className="h-4 w-4" /> New Booking
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="card">
          <p className="text-sm text-dark-500">Total Bookings</p>
          <p className="text-3xl font-bold text-dark-900 mt-1">{bookings.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-dark-500">Upcoming</p>
          <p className="text-3xl font-bold text-brand-600 mt-1">
            {bookings.filter((b) => !['COMPLETED', 'CANCELLED'].includes(b.status)).length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-dark-500">Completed</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">
            {bookings.filter((b) => b.status === 'COMPLETED').length}
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-dark-900 mb-4">Recent Bookings</h2>
        {bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="Browse our packages and create your first booking."
            action={<Link to="/packages" className="btn-primary">Browse Packages</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-100 text-left text-dark-500">
                  <th className="pb-3 font-medium">Ref</th>
                  <th className="pb-3 font-medium">Package</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-50">
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="hover:bg-dark-50/50">
                    <td className="py-3 font-medium text-dark-900">{b.bookingRef}</td>
                    <td className="py-3">{b.packageName}</td>
                    <td className="py-3">{formatDate(b.eventDate)}</td>
                    <td className="py-3"><StatusBadge status={b.status} /></td>
                    <td className="py-3">{formatCurrency(b.totalAmount)}</td>
                    <td className="py-3">
                      <Link to={`/customer/bookings/${b.id}`} className="text-brand-600 hover:text-brand-700 font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
