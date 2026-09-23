import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import ProtectedImage, { ProtectedFileLink } from '../../components/common/ProtectedImage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { formatLKR, formatDate } from '../../utils/formatters';
import { Check, X, FileText } from 'lucide-react';

export default function PendingPayments() {
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [auditNotes, setAuditNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/pending?page=0&size=100');
      setPayments(listOf(res));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status) => {
    try {
      setProcessing(true);
      await api.patch(`/payments/${selectedPayment.id}/verify`, {
        status,
        verificationNotes: auditNotes || `Verified as ${status} by Finance Executive`
      });
      toast.success(`Payment ${status === 'VERIFIED' ? 'verified & approved' : 'rejected'}`);
      setSelectedPayment(null);
      setAuditNotes('');
      fetchPending();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Receipt Verification Queue</h1>
        <p className="text-navy-600 text-sm">Review uploaded bank deposit slips and approve or dispute payments.</p>
      </div>

      <Card>
        {loading ? (
          <LoadingSkeleton count={4} className="h-16" />
        ) : payments.length === 0 ? (
          <p className="text-xs text-navy-500 py-6 text-center">No pending payments awaiting verification.</p>
        ) : (
          <div className="divide-y divide-navy-100">
            {payments.map(p => (
              <div key={p.id} className="py-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-navy-700">{p.bookingRef}</span>
                    <Badge status={p.status} />
                  </div>
                  <h4 className="font-bold text-navy-900 text-base mt-1">{formatLKR(p.amount)}</h4>
                  <p className="text-xs text-navy-500 mt-0.5">
                    Type: {p.paymentType} • Txn Ref: {p.transactionReference || 'N/A'} • Uploaded: {formatDate(p.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {p.receiptOriginalName && (
                    <ProtectedFileLink
                      url={`/payments/${p.id}/receipt`}
                      className="px-3 py-1.5 border border-navy-200 rounded-lg text-xs font-semibold text-navy-700 hover:bg-navy-50"
                    >
                      Inspect Slip
                    </ProtectedFileLink>
                  )}
                  <Button variant="gold" size="sm" onClick={() => setSelectedPayment(p)}>
                    Verify Receipt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Verification Modal */}
      {selectedPayment && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPayment(null)}
          title={`Verify Payment for ${selectedPayment.bookingRef}`}
          footer={
            <div className="flex justify-between items-center w-full">
              <Button variant="danger" size="sm" icon={X} onClick={() => handleAction('REJECTED')} loading={processing}>
                Reject Payment
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedPayment(null)}>Cancel</Button>
                <Button variant="gold" size="sm" icon={Check} onClick={() => handleAction('VERIFIED')} loading={processing}>
                  Approve & Verify
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-navy-50 rounded-xl space-y-1">
              <p className="text-xs text-navy-500">Amount Claimed: <strong className="text-navy-900">{formatLKR(selectedPayment.amount)}</strong></p>
              <p className="text-xs text-navy-500">Bank Ref: <strong className="text-navy-900">{selectedPayment.transactionReference || 'N/A'}</strong></p>
            </div>

            {selectedPayment.receiptOriginalName && (
              <div>
                <p className="text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">Receipt Attachment</p>
                <div className="border border-navy-200 rounded-xl p-2 bg-white max-h-60 overflow-hidden flex justify-center">
                  <ProtectedImage
                    url={`/payments/${selectedPayment.id}/receipt`}
                    alt="Receipt Slip"
                    className="max-h-56 object-contain"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">Audit Notes</label>
              <textarea
                rows="2"
                placeholder="Confirmation notes (e.g. Bank statement checked on 18/09)..."
                value={auditNotes}
                onChange={e => setAuditNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
