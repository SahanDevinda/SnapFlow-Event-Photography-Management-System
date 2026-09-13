import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi, changeRequestApi, userApi } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';
import { Users, ClipboardList, Settings, ArrowRight } from 'lucide-react';

export default function CroDashboard() {
  const [bookings, setBookings] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bookingApi.getAll().catch(() => ({ data: { data: [] } })),
      changeRequestApi.getPending().catch(() => ({ data: { data: [] } })),
      userApi.getCustomers().catch(() => ({ data: { data: [] } })),
    ])
      .then(([bRes, cRes, uRes]) => {
        setBookings(bRes.data.data || []);
        setPendingChanges(cRes.data.data || []);
        setCustomers(uRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-dark-900">Customer Relations Dashboard</h1>
        <p className="text-sm text-dark-500 mt-1">CRO command center for client onboarding, booking confirmations & change requests</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Registered Customers"
          value={customers.length}
          subtitle="Client accounts database"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Pending Booking Approvals"
          value={pendingBookings.length}
          subtitle="Awaiting CRO review"
          icon={ClipboardList}
          color="amber"
        />
        <StatCard
          title="Pending Change Requests"
          value={pendingChanges.length}
          subtitle="Modifications requested"
          icon={Settings}
          color="purple"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Bookings Card */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-dark-900">Bookings Pending Review</h2>
            <Link to="/cro/bookings" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-dark-100">
            {pendingBookings.slice(0, 5).map((b) => (
              <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-dark-900">{b.bookingReference || b.bookingRef} · {b.customerName || b.customer?.firstName}</p>
                  <p className="text-xs text-dark-500">{formatDate(b.eventDate)} · {b.packageName}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
            {pendingBookings.length === 0 && <p className="text-sm text-dark-400 py-4 text-center">No pending booking requests</p>}
          </div>
        </div>

        {/* Change Requests Card */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-dark-900">Change Requests Queue</h2>
            <Link to="/cro/change-requests" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
              Review Requests <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-dark-100">
            {pendingChanges.slice(0, 5).map((cr) => (
              <div key={cr.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-dark-900">{cr.bookingReference || cr.bookingRef}</p>
                  <StatusBadge status={cr.status} />
                </div>
                <p className="text-xs text-dark-600">{cr.requestType?.replace(/_/g, ' ')} — {cr.requestedByName || 'Customer'}</p>
              </div>
            ))}
            {pendingChanges.length === 0 && <p className="text-sm text-dark-400 py-4 text-center">No pending change requests</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
