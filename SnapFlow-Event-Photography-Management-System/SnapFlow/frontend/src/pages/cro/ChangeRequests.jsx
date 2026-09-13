import { useEffect, useState } from 'react';
import { changeRequestApi } from '../../services/api';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function ChangeRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () => {
    changeRequestApi.getPending()
      .then((res) => setRequests(res.data.data || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const review = async (id, approved) => {
    setProcessing(id);
    setError('');
    setMessage('');
    try {
      await changeRequestApi.review(id, {
        approved,
        reviewNotes: approved ? 'Approved' : 'Rejected after review',
      });
      setMessage(approved ? 'Request approved' : 'Request rejected');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-dark-900 mb-6">Change Requests</h1>
      {message && <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      {requests.length === 0 ? (
        <EmptyState title="No pending change requests" />
      ) : (
        <div className="space-y-4">
          {requests.map((cr) => (
            <div key={cr.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold">{cr.bookingRef}</span>
                    <StatusBadge status={cr.status} />
                    <span className="text-xs bg-dark-100 text-dark-600 rounded-full px-2 py-0.5">
                      {cr.requestType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-dark-600 mt-2">{cr.description}</p>
                  <p className="text-xs text-dark-400 mt-2">
                    Requested by {cr.requestedByName} · {formatDateTime(cr.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button disabled={processing === cr.id} onClick={() => review(cr.id, true)} className="btn-primary text-sm">
                    Approve
                  </button>
                  <button disabled={processing === cr.id} onClick={() => review(cr.id, false)} className="btn-danger text-sm">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
