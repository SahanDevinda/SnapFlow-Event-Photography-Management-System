import { useEffect, useState } from 'react';
import { paymentApi } from '../../services/api';
import { formatCurrency, formatDateTime, getErrorMessage } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { CreditCard, CheckCircle, XCircle, FileText, AlertCircle } from 'lucide-react';

export default function PendingPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Verification modal state
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionType, setActionType] = useState('APPROVE'); // 'APPROVE' or 'REJECT'
  const [notes, setNotes] = useState('');

  const load = () => {
    setLoading(true);
    paymentApi.getPending()
      .then((res) => setPayments(res.data.data || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleOpenVerifyModal = (payment, type) => {
    setSelectedPayment(payment);
    setActionType(type);
    setNotes(type === 'APPROVE' ? 'Payment receipt verified and approved.' : 'Payment receipt rejected due to illegible image or incorrect reference.');
  };

  const handleConfirmVerify = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;
    setProcessing(true);
    setError('');
    setMessage('');
    const approved = actionType === 'APPROVE';
    try {
      await paymentApi.verify(selectedPayment.id, approved, notes);
      setMessage(approved ? `Payment of ${formatCurrency(selectedPayment.amount)} approved successfully.` : `Payment of ${formatCurrency(selectedPayment.amount)} rejected.`);
      setSelectedPayment(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-dark-900">Verify Payment Receipts</h1>
        <p className="text-sm text-dark-500 mt-1 font-normal">Finance Executive Verification Queue for Bank Transfers & Receipts</p>
      </div>

      {message && <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700 font-medium">{message}</div>}
      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium">{error}</div>}

      {payments.length === 0 ? (
        <EmptyState title="No Pending Receipts" description="All submitted customer payment receipts have been verified and processed." />
      ) : (
        <div className="space-y-4">
          {payments.map((p) => (
            <div key={p.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-dark-100 hover:shadow-md transition">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-brand-700 text-base">{p.bookingReference || p.bookingRef}</span>
                  <StatusBadge status={p.verificationStatus || p.status} />
                </div>
                <p className="text-sm font-bold text-dark-900">
                  Amount: {formatCurrency(p.amount)} <span className="font-normal text-xs text-dark-500">({p.paymentType})</span>
                </p>
                <p className="text-xs text-dark-500">
                  Method: <span className="font-semibold">{p.paymentMethod || 'BANK_TRANSFER'}</span> · Submitted: {formatDateTime(p.createdAt)}
                </p>
                {p.transactionReference && (
                  <p className="text-xs font-mono text-dark-600 bg-dark-50 px-2 py-0.5 rounded border border-dark-100 inline-block">
                    Ref: {p.transactionReference}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-dark-100">
                <button
                  onClick={() => handleOpenVerifyModal(p, 'APPROVE')}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleOpenVerifyModal(p, 'REJECT')}
                  className="btn-danger text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verification Modal */}
      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title={actionType === 'APPROVE' ? 'Approve Payment Receipt' : 'Reject Payment Receipt'}
      >
        <form onSubmit={handleConfirmVerify} className="space-y-4">
          <div className={`p-4 rounded-xl text-sm ${actionType === 'APPROVE' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            <p className="font-bold">
              {actionType === 'APPROVE' ? 'Confirm Verification Approval' : 'Confirm Receipt Rejection'}
            </p>
            <p className="text-xs mt-1">
              Booking Ref: <strong>{selectedPayment?.bookingReference || selectedPayment?.bookingRef}</strong> | Amount: <strong>{formatCurrency(selectedPayment?.amount)}</strong>
            </p>
          </div>

          <div>
            <label className="label">Verification Notes / Remarks</label>
            <textarea
              rows={3}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              placeholder="Add audit notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <button type="button" onClick={() => setSelectedPayment(null)} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className={actionType === 'APPROVE' ? 'btn-primary' : 'btn-danger'}
            >
              {processing ? 'Processing...' : actionType === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
