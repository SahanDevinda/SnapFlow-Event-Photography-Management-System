import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi, assignmentApi } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Calendar, Users, Camera } from 'lucide-react';

export default function OpsDashboard() {
  const [bookings, setBookings] = useState([]);
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bookingApi.getAll().catch(() => ({ data: { data: [] } })),
      assignmentApi.getPhotographers().catch(() => ({ data: { data: [] } })),
    ])
      .then(([bRes, pRes]) => {
        setBookings(bRes.data.data || []);
        setPhotographers(pRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const upcoming = bookings
    .filter((b) => !['COMPLETED', 'CANCELLED'].includes(b.status))
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
    .slice(0, 8);

  const needsAssignment = bookings.filter((b) =>
    ['PENDING', 'CONFIRMED'].includes(b.status) && (!b.assignments || b.assignments.length === 0)
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-dark-900">Operations Dashboard</h1>
        <p className="text-sm text-dark-500 mt-1">Scheduling, assignments & resource management</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-dark-500">Upcoming Events</p>
            <p className="text-2xl font-bold">{upcoming.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center">
            <Users className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-dark-500">Need Assignment</p>
            <p className="text-2xl font-bold">{needsAssignment.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
            <Camera className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-dark-500">Active Photographers</p>
            <p className="text-2xl font-bold">{photographers.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Upcoming Events</h2>
            <Link to="/ops/calendar" className="text-sm text-brand-600 hover:text-brand-700">View calendar</Link>
          </div>
          <div className="space-y-3">
            {upcoming.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-dark-50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{b.bookingRef} · {b.packageName}</p>
                  <p className="text-xs text-dark-500">{formatDate(b.eventDate)} · {b.venue || 'TBD'}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
            {upcoming.length === 0 && <p className="text-sm text-dark-500">No upcoming events</p>}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Needs Photographer Assignment</h2>
            <Link to="/ops/assignments" className="text-sm text-brand-600 hover:text-brand-700">Manage</Link>
          </div>
          <div className="space-y-3">
            {needsAssignment.slice(0, 6).map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-dark-50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{b.bookingRef}</p>
                  <p className="text-xs text-dark-500">{formatDate(b.eventDate)} · {b.customerName}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
            {needsAssignment.length === 0 && <p className="text-sm text-dark-500">All events have assignments</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
