import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export default function CROChangeRequests() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/change-requests/pending?page=0&size=100');
      setRequests(listOf(res));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reviewRequest = async (id, status) => {
    try {
      setReviewing(id);
      await api.post(`/change-requests/${id}/review`, {
        status,
        reviewNotes: `Reviewed by CRO: ${status}`
      });
      toast.success(`Change request ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully.`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update change request.');
    } finally {
      setReviewing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Client Change Requests</h1>
        <p className="text-navy-600 text-sm">Review reschedule and venue adjustment requests submitted by clients.</p>
      </div>

      <Card>
        {loading ? (
          <LoadingSkeleton count={4} className="h-16" />
        ) : requests.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-navy-400 text-sm">No pending change requests at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-navy-100">
            {requests.map(r => (
              <div key={r.id} className="py-4 flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-navy-700">{r.bookingRef}</span>
                    <Badge status={r.status} />
                  </div>
                  <p className="font-semibold text-navy-900 text-sm mt-1 truncate">
                    {r.proposedPackageName || r.bookingRef}
                  </p>
                  <p className="text-xs text-navy-600 mt-0.5">
                    <span className="font-semibold">Reason:</span> {r.description}
                  </p>
                  {r.proposedDate && (
                    <p className="text-xs text-amber-700 font-semibold mt-1">
                      Proposed Date: {formatDate(r.proposedDate)}
                    </p>
                  )}
                  {r.proposedVenue && (
                    <p className="text-xs text-navy-500 mt-0.5">
                      Proposed Venue: {r.proposedVenue}
                    </p>
                  )}
                  <p className="text-[10px] text-navy-400 mt-1">Submitted: {formatDate(r.createdAt)}</p>
                </div>

                {r.status === 'PENDING' && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="gold"
                      size="xs"
                      loading={reviewing === r.id}
                      onClick={() => reviewRequest(r.id, 'APPROVED')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="xs"
                      loading={reviewing === r.id}
                      onClick={() => reviewRequest(r.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {r.status !== 'PENDING' && (
                  <div className="shrink-0 text-right">
                    <span className="text-[10px] text-navy-400">
                      {formatDate(r.reviewedAt || r.updatedAt)}
                    </span>
                    {r.reviewNotes && (
                      <p className="text-xs text-navy-500 mt-0.5 max-w-[150px] truncate" title={r.reviewNotes}>
                        {r.reviewNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
