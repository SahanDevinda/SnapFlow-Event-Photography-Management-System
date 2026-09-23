import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { listOf } from '../../services/api';
import { ProtectedFileLink } from '../../components/common/ProtectedImage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { formatLKR, formatDate } from '../../utils/formatters';
import { Calendar, Clock, MapPin, Upload, AlertCircle, CheckCircle, FileText, Image, ChevronLeft } from 'lucide-react';

export default function CustomerBookingDetail() {
  const { id } = useParams();
  const toast = useToast();

  const [booking, setBooking] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);

  // Payment Form
  const [payForm, setPayForm] = useState({
    amount: '',
    paymentType: 'PARTIAL_PAYMENT',
    transactionRef: '',
    receiptFile: null,
    notes: ''
  });
  const [paying, setPaying] = useState(false);

  // Change Request Form
  const [changeForm, setChangeForm] = useState({
    requestType: 'DATE_CHANGE',
    proposedDate: '',
    proposedStartTime: '',
    proposedEndTime: '',
    reason: ''
  });
  const [requestingChange, setRequestingChange] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [bookRes, payRes] = await Promise.all([
        api.get(`/bookings/${id}`),
        api.get(`/payments/booking/${id}`)
      ]);
      setBooking(bookRes.data);
      setPayments(listOf(payRes));
      if (bookRes.data) {
        setPayForm(prev => ({ ...prev, amount: bookRes.data.balanceAmount || '' }));
      }
    } catch (err) {
      toast.error('Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payForm.amount || !payForm.receiptFile) {
      toast.error('Please enter payment amount and attach receipt image.');
      return;
    }

    try {
      setPaying(true);
      const fd = new FormData();
      fd.append('bookingId', id);
      fd.append('amount', payForm.amount);
      fd.append('paymentType', payForm.paymentType);
      fd.append('transactionReference', payForm.transactionRef || 'BANK-REF');
      fd.append('receipt', payForm.receiptFile);

      await api.post('/payments', fd);
      toast.success('Payment receipt submitted successfully! Pending verification by finance.');
      setIsPayModalOpen(false);
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit payment receipt.');
    } finally {
      setPaying(false);
    }
  };

  const handleChangeRequestSubmit = async (e) => {
    e.preventDefault();
    if (!changeForm.reason) {
      toast.error('Please describe the reason for your change request.');
      return;
    }

    try {
      setRequestingChange(true);
      // Backend route: POST /change-requests/booking/{bookingId}
      await api.post(`/change-requests/booking/${id}`, {
        proposedDate: changeForm.proposedDate || null,
        proposedStartTime: changeForm.proposedStartTime || null,
        proposedVenue: changeForm.proposedVenue || null,
        description: `[${changeForm.requestType}] ${changeForm.reason}`
      });
      toast.success('Change request sent to operations team for review.');
      setIsChangeModalOpen(false);
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit change request.');
    } finally {
      setRequestingChange(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={4} className="h-40" />;
  }

  if (!booking) {
    return <div className="p-8 text-center text-navy-500">Booking not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-navy-500">
        <Link to="/customer/bookings" className="flex items-center gap-1 hover:text-navy-800">
          <ChevronLeft className="w-4 h-4" /> Back to My Bookings
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-navy-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-navy-900">{booking.packageName}</h1>
            <Badge status={booking.status} />
          </div>
          <p className="text-xs text-navy-500 font-mono mt-1">Ref ID: {booking.bookingRef}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
            <Button variant="secondary" size="sm" onClick={() => setIsChangeModalOpen(true)}>
              Request Change
            </Button>
          )}
          {booking.balanceAmount > 0 && (
            <Button variant="gold" size="sm" icon={Upload} onClick={() => setIsPayModalOpen(true)}>
              Upload Payment Receipt
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Event Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-navy-400 font-semibold uppercase">Date</p>
                <p className="font-semibold text-navy-900 mt-0.5">{formatDate(booking.eventDate)}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400 font-semibold uppercase">Time Window</p>
                <p className="font-semibold text-navy-900 mt-0.5">{booking.startTime} - {booking.endTime}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-navy-400 font-semibold uppercase">Venue</p>
                <p className="font-semibold text-navy-900 mt-0.5">{booking.venue}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400 font-semibold uppercase">Event Type</p>
                <p className="font-semibold text-navy-900 mt-0.5">{booking.eventType}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400 font-semibold uppercase">Duration</p>
                <p className="font-semibold text-navy-900 mt-0.5">
                  {booking.durationHours ? `${booking.durationHours} hrs` : 'N/A'}
                </p>
              </div>
              {booking.specialRequests && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-navy-400 font-semibold uppercase">Special Requests</p>
                  <p className="text-navy-700 mt-0.5 italic">{booking.specialRequests}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Add-ons */}
          <Card title="Package Inclusions & Add-Ons">
            <div className="space-y-3">
              <div className="p-3 bg-navy-50 rounded-xl flex justify-between items-center text-sm">
                <div>
                  <span className="font-semibold text-navy-900">{booking.packageName}</span>
                  <p className="text-xs text-navy-500">Base photography package</p>
                </div>
                <span className="font-semibold text-navy-900">{formatLKR(booking.totalAmount - (booking.addOns?.reduce((acc, x) => acc + x.price, 0) || 0))}</span>
              </div>

              {booking.addOns && booking.addOns.map(add => (
                <div key={add.id} className="p-3 border border-navy-100 rounded-xl flex justify-between items-center text-sm">
                  <div>
                    <span className="font-semibold text-navy-900">{add.name}</span>
                    <p className="text-xs text-navy-500">{add.description}</p>
                  </div>
                  <span className="font-semibold text-navy-700">{formatLKR(add.price)}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Payments History */}
          <Card title="Payment Records">
            {payments.length === 0 ? (
              <p className="text-xs text-navy-500">No payment receipts uploaded yet.</p>
            ) : (
              <div className="divide-y divide-navy-100">
                {payments.map(p => (
                  <div key={p.id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-900">{formatLKR(p.amount)}</span>
                        <Badge status={p.status} />
                      </div>
                      <p className="text-xs text-navy-500 mt-0.5">
                        {p.paymentType} • Ref: {p.transactionReference || 'N/A'} • {formatDate(p.createdAt)}
                      </p>
                    </div>
                    {p.receiptOriginalName && (
                      <ProtectedFileLink url={`/payments/${p.id}/receipt`} className="text-xs text-amber-600 hover:underline">
                        View Slip
                      </ProtectedFileLink>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Financial Summary & Actions */}
        <div className="space-y-6">
          <Card title="Payment Summary">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-navy-600">
                <span>Total Package Price:</span>
                <span className="font-semibold text-navy-900">{formatLKR(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Verified Payments:</span>
                <span className="font-semibold">{formatLKR(booking.paidAmount || 0)}</span>
              </div>
              <div className="pt-2 border-t border-navy-100 flex justify-between text-base font-bold">
                <span className="text-navy-900">Remaining Balance:</span>
                <span className={booking.balanceAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                  {formatLKR(booking.balanceAmount || 0)}
                </span>
              </div>
            </div>

            {booking.balanceAmount > 0 && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900">
                <p className="font-semibold mb-1">Bank Transfer Details</p>
                <p>Commercial Bank of Ceylon</p>
                <p>A/C: 1000 8923 4819</p>
                <p>Lanka Moments (Pvt) Ltd</p>
                <p className="mt-1 text-[11px] text-amber-700">Please attach transaction slip after transferring.</p>
              </div>
            )}
          </Card>

          {/* Quick Links */}
          {booking.status === 'COMPLETED' && (
            <Card title="Event Completion">
              <p className="text-xs text-navy-600 mb-3">
                Your event is complete! We hope you loved our photography service.
              </p>
              <Link to="/customer/feedback">
                <Button variant="gold" size="sm" className="w-full">Leave Feedback</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Receipt Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Upload Bank Transfer Receipt"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsPayModalOpen(false)}>Cancel</Button>
            <Button variant="gold" onClick={handlePaymentSubmit} loading={paying}>Submit Receipt</Button>
          </>
        }
      >
        <form className="space-y-4 text-sm">
          <Input
            label="Payment Amount (LKR)"
            type="number"
            required
            value={payForm.amount}
            onChange={e => setPayForm({ ...payForm, amount: e.target.value })}
          />
          <Input
            label="Bank Transaction / Reference ID"
            placeholder="e.g. TXN-928381"
            value={payForm.transactionRef}
            onChange={e => setPayForm({ ...payForm, transactionRef: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
              Receipt File (Image or PDF) *
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              required
              onChange={e => setPayForm({ ...payForm, receiptFile: e.target.files[0] })}
              className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows="2"
              value={payForm.notes}
              onChange={e => setPayForm({ ...payForm, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </form>
      </Modal>

      {/* Change Request Modal */}
      <Modal
        isOpen={isChangeModalOpen}
        onClose={() => setIsChangeModalOpen(false)}
        title="Request Booking Reschedule / Change"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsChangeModalOpen(false)}>Cancel</Button>
            <Button variant="gold" onClick={handleChangeRequestSubmit} loading={requestingChange}>Submit Request</Button>
          </>
        }
      >
        <form className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">Change Type</label>
            <select
              value={changeForm.requestType}
              onChange={e => setChangeForm({ ...changeForm, requestType: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="DATE_CHANGE">Reschedule Event Date</option>
              <option value="TIME_CHANGE">Adjust Time Slot</option>
              <option value="VENUE_CHANGE">Change Event Venue</option>
              <option value="OTHER">Other Custom Request</option>
            </select>
          </div>

          {changeForm.requestType === 'DATE_CHANGE' && (
            <Input
              label="Proposed New Date"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={changeForm.proposedDate}
              onChange={e => setChangeForm({ ...changeForm, proposedDate: e.target.value })}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="New Start Time"
              type="time"
              value={changeForm.proposedStartTime}
              onChange={e => setChangeForm({ ...changeForm, proposedStartTime: e.target.value })}
            />
            <Input
              label="New End Time"
              type="time"
              value={changeForm.proposedEndTime}
              onChange={e => setChangeForm({ ...changeForm, proposedEndTime: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">Reason for Request *</label>
            <textarea
              rows="3"
              required
              placeholder="Explain the reason for this change..."
              value={changeForm.reason}
              onChange={e => setChangeForm({ ...changeForm, reason: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
