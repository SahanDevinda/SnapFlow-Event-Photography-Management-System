import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { assignmentApi } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function PhotographerDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assignmentApi.getMy()
      .then((res) => setAssignments(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const upcoming = assignments.filter((a) => !['COMPLETED', 'CANCELLED'].includes(a.status));
  const completed = assignments.filter((a) => a.status === 'COMPLETED');

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-dark-900">Photographer Dashboard</h1>
        <p className="text-sm text-dark-500 mt-1">Your assigned events and progress</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="card">
          <p className="text-sm text-dark-500">Total Assignments</p>
          <p className="text-3xl font-bold mt-1">{assignments.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-dark-500">Upcoming</p>
          <p className="text-3xl font-bold text-brand-600 mt-1">{upcoming.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-dark-500">Completed</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{completed.length}</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">My Assignments</h2>
          <Link to="/photographer/assignments" className="text-sm text-brand-600">View all</Link>
        </div>
        {assignments.length === 0 ? (
          <EmptyState title="No assignments yet" description="You will see assigned events here." />
        ) : (
          <div className="space-y-3">
            {assignments.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center justify-between py-3 border-b border-dark-50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{a.bookingRef} · {a.packageName}</p>
                  <p className="text-xs text-dark-500">
                    {formatDate(a.eventDate)} · {a.venue || 'TBD'} · {a.customerName}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
