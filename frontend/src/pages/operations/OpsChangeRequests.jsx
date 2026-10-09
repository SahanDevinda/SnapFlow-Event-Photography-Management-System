import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export default function OpsChangeRequests() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null); // { id, status, bookingRef }
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/change-requests/pending');
      setRequests(listOf(res));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (r, status) => {
    setReviewModal({ id: r.id, status, bookingRef: r.bookingRef });
    setReviewNotes('');
  };

  const submitReview = async () => {
    if (!reviewModal) return;
    try {
      setSubmittingReview(true);
      const notes = reviewNotes.trim() || `Reviewed by Operations: ${reviewModal.status}`;
      await api.post(`/change-requests/${reviewModal.id}/review`, {
        status: reviewModal.status,
        reviewNotes: notes.slice(0, 2000)
      });
      toast.success(`Change request ${reviewModal.status.toLowerCase()} successfully.`);
      setReviewModal(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update change request.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Operations Reschedule Approval</h1>
        <p className="text-navy-600 text-sm">Approve or reject client reschedule requests based on crew availability.</p>
      </div>

      <Card>
        {loading ? (
          <LoadingSkeleton count={4} className="h-16" />
        ) : requests.length === 0 ? (
          <p className="text-xs text-navy-500 py-6 text-center">No pending change requests.</p>
        ) : (
          <div className="divide-y divide-navy-100">
            {requests.map(r => (
              <div key={r.id} className="py-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-navy-700">{r.bookingRef}</span>
                    <Badge status={r.status} />
                  </div>
                  <p className="font-semibold text-navy-900 text-sm mt-1">{r.proposedPackageName || r.bookingRef}</p>
                  <p className="text-xs text-navy-600 mt-0.5">Reason: {r.description}</p>
                  {r.proposedDate && (
                    <p className="text-xs text-amber-700 font-semibold mt-1">Proposed Date: {formatDate(r.proposedDate)}</p>
                  )}
                </div>

                {r.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button variant="gold" size="xs" onClick={() => handleOpenReview(r, 'APPROVED')}>
                      Approve...
                    </Button>
                    <Button variant="danger" size="xs" onClick={() => handleOpenReview(r, 'REJECTED')}>
                      Reject...
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Review Modal */}
      {reviewModal && (
        <Modal
          isOpen={true}
          onClose={() => setReviewModal(null)}
          title={`${reviewModal.status === 'APPROVED' ? 'Approve' : 'Reject'} Change Request for ${reviewModal.bookingRef}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setReviewModal(null)} disabled={submittingReview}>
                Cancel
              </Button>
              <Button
                variant={reviewModal.status === 'APPROVED' ? 'gold' : 'danger'}
                onClick={submitReview}
                loading={submittingReview}
              >
                Confirm {reviewModal.status === 'APPROVED' ? 'Approval' : 'Rejection'}
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-sm">
            <p className="text-navy-700">
              {reviewModal.status === 'APPROVED'
                ? 'Approving this request will automatically apply the changes to the booking, verify crew & equipment availability, and recalculate financials.'
                : 'Rejecting this request will mark it as rejected and notify the client.'}
            </p>
            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Review Notes {reviewModal.status === 'REJECTED' && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                rows="3"
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder={reviewModal.status === 'APPROVED' ? 'Optional approval notes...' : 'Reason for rejecting this request...'}
                maxLength={2000}
                className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
