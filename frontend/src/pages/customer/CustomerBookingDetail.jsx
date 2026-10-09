import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { listOf } from '../../services/api';
import { ProtectedFileLink } from '../../components/common/ProtectedImage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import BookingCancellationModal from '../../components/bookings/BookingCancellationModal';
import BookingCancellationDetails from '../../components/bookings/BookingCancellationDetails';
import { useToast } from '../../context/ToastContext';
import { formatLKR, formatDate } from '../../utils/formatters';
import { canCustomerCancelBooking, getCancellationErrorMessage } from '../../utils/bookingCancellation';
import { Upload, ChevronLeft, XCircle } from 'lucide-react';

export default function CustomerBookingDetail() {
  const { id } = useParams();
  const toast = useToast();

  const [booking, setBooking] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancellationError, setCancellationError] = useState('');
  const cancellationInFlight = useRef(false);

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
    proposedVenue: '',
    reason: ''
  });
  const [requestingChange, setRequestingChange] = useState(false);

  // Customer Change Request CRUD
  const [changeRequests, setChangeRequests] = useState([]);
  const [editingChangeRequest, setEditingChangeRequest] = useState(null);
  const [deletingChangeRequest, setDeletingChangeRequest] = useState(false);

  const fetchChangeRequests = async () => {
    try {
      const res = await api.get(`/change-requests/booking/${id}`);
      setChangeRequests(listOf(res));
    } catch (err) {
      console.error('Failed to load change requests:', err);
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchChangeRequests();
  }, [id]);

  const fetchDetails = async ({ background = false, afterCancellation = false } = {}) => {
    try {
      if (!background) setLoading(true);
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
      if (afterCancellation) {
        toast.warning('Your booking was cancelled, but the latest details could not be refreshed. Please reload this page.');
      } else {
        toast.error('Failed to load booking details.');
      }
    } finally {
      if (!background) setLoading(false);
    }
  };

  const handleCancellation = async (request) => {
    if (cancellationInFlight.current) return;
    if (!canCustomerCancelBooking(booking)) {
      setCancellationError('This booking can no longer be cancelled. Please refresh its details.');
      return;
    }
    cancellationInFlight.current = true;
    setCancelling(true);
    setCancellationError('');
    try {
      const result = await api.post(`/bookings/${id}/cancel`, request);
      // Keep the confirmed server outcome visible even if the subsequent refresh fails.
      setBooking((previous) => ({ ...previous, ...result.data, status: 'CANCELLED', customerCanCancel: false }));
      setIsCancelModalOpen(false);
      setIsChangeModalOpen(false);
      setIsPayModalOpen(false);
      toast.success('Booking cancelled successfully.');
      await fetchDetails({ background: true, afterCancellation: true });
    } catch (err) {
      const message = getCancellationErrorMessage(err);
      setCancellationError(message);
      toast.error(message);
      if (['BOOKING_ALREADY_CANCELLED', 'BOOKING_CANCELLATION_NOT_ALLOWED', 'EVENT_ALREADY_STARTED'].includes(err.response?.data?.code)) {
        await fetchDetails({ background: true });
      }
    } finally {
      cancellationInFlight.current = false;
      setCancelling(false);
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
      await fetchChangeRequests();
      setEditingChangeRequest(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit payment receipt.');
    } finally {
      setPaying(false);
    }
  };

  const handleChangeRequestSubmit = async (e) => {
    e.preventDefault();
    const reasonText = changeForm.reason?.trim();
    if (!reasonText) {
      toast.error('Please describe the reason for your change request.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (changeForm.proposedDate && changeForm.proposedDate < todayStr) {
      toast.error('Proposed date cannot be in the past.');
      return;
    }

    if (changeForm.proposedDate === todayStr && changeForm.proposedStartTime) {
      const [h, m] = changeForm.proposedStartTime.split(':');
      const now = new Date();
      const st = new Date();
      st.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
      if (st < now) {
        toast.error('Proposed start time cannot be in the past for today.');
        return;
      }
    }

    const venue = changeForm.proposedVenue?.trim() || null;
    if (venue && venue.length > 255) {
      toast.error('Proposed venue cannot exceed 255 characters.');
      return;
    }

    try {
      setRequestingChange(true);
      const description = `[${changeForm.requestType}] ${reasonText}`.slice(0, 2000);
      const payload = {
        proposedDate: changeForm.proposedDate || null,
        proposedStartTime: changeForm.proposedStartTime || null,
        proposedVenue: venue,
        description
      };

      if (editingChangeRequest) {
        await api.put(`/change-requests/${editingChangeRequest.id}`, payload);
      } else {
        await api.post(`/change-requests/booking/${id}`, payload);
      }
      toast.success('Change request sent to operations team for review.');
      setIsChangeModalOpen(false);
      setChangeForm({
        requestType: 'DATE_CHANGE',
        proposedDate: '',
        proposedStartTime: '',
        proposedEndTime: '',
        proposedVenue: '',
        reason: ''
      });
      fetchDetails();
      await fetchChangeRequests();
      setEditingChangeRequest(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit change request.');
    } finally {
      setRequestingChange(false);
    }
  };

  const handleEditChangeRequest = (request) => {
    const description = request.description || '';
    const match = description.match(/^\[([A-Z_]+)\]\s*(.*)$/);

    setEditingChangeRequest(request);
    setChangeForm({
      requestType: match?.[1] || 'OTHER',
      proposedDate: request.proposedDate || '',
      proposedStartTime: request.proposedStartTime || '',
      proposedEndTime: '',
      proposedVenue: request.proposedVenue || '',
      reason: match?.[2] || description
    });
    setIsChangeModalOpen(true);
  };

  const handleDeleteChangeRequest = async (requestId) => {
    if (!window.confirm('Delete this pending change request?')) return;

    try {
      setDeletingChangeRequest(true);
      await api.delete(`/change-requests/${requestId}`);
      toast.success('Change request deleted successfully.');
      await fetchChangeRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete change request.');
    } finally {
      setDeletingChangeRequest(false);
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
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-navy-900 break-words">{booking.packageName}</h1>
            <Badge status={booking.status} />
          </div>
          <p className="text-xs text-navy-500 font-mono mt-1">Ref ID: {booking.bookingRef}</p>
        </div>

        <div className="flex flex-wrap gap-2 min-w-0 w-full sm:w-auto sm:justify-end">
          {canCustomerCancelBooking(booking) && (
            <Button type="button" variant="dangerOutline" size="sm" icon={XCircle} onClick={() => { setCancellationError(''); setIsCancelModalOpen(true); }}>
              Cancel Booking
            </Button>
          )}
          {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
            <Button variant="secondary" size="sm" onClick={() => setIsChangeModalOpen(true)}>
              Request Change
            </Button>
          )}
          {booking.status !== 'CANCELLED' && booking.balanceAmount > 0 && (
            <Button className="!bg-red-600 !text-black" size="sm" icon={Upload} onClick={() => setIsPayModalOpen(true)}>
              Upload Payment Receipt
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Details */}
        <div className="lg:col-span-2 space-y-6">
          <BookingCancellationDetails booking={booking} showActor={false} showPayments={false} />
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
              <div className="sm:col-span-2">
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
                        {p.paymentType} â€¢ Ref: {p.transactionReference || 'N/A'} â€¢ {formatDate(p.createdAt)}
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
          {/* My Change Requests - CRUD */}
        <Card title="My Change Requests">
          {changeRequests.length === 0 ? (
            <p className="text-sm text-gray-500">
              No change requests submitted for this booking.
            </p>
          ) : (
            <div className="space-y-4">
              {changeRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-navy-900">
                          Request #{request.id}
                        </span>

                        <span className="rounded-full border px-2 py-1 text-xs font-semibold">
                          {request.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700">
                        {request.description}
                      </p>

                      {request.proposedDate && (
                        <p className="text-sm text-gray-600">
                          Proposed Date: {request.proposedDate}
                        </p>
                      )}

                      {request.proposedStartTime && (
                        <p className="text-sm text-gray-600">
                          Proposed Time: {request.proposedStartTime}
                        </p>
                      )}

                      {request.proposedVenue && (
                        <p className="text-sm text-gray-600">
                          Proposed Venue: {request.proposedVenue}
                        </p>
                      )}
                    </div>

                    {request.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleEditChangeRequest(request)}
                        >
                          Edit
                        </Button>

                        <Button
                          type="button"
                          variant="danger"
                          disabled={deletingChangeRequest}
                          onClick={() => handleDeleteChangeRequest(request.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
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

            {booking.status !== 'CANCELLED' && booking.balanceAmount > 0 && (
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

      <BookingCancellationModal
        isOpen={isCancelModalOpen}
        onClose={() => { if (!cancellationInFlight.current) setIsCancelModalOpen(false); }}
        onConfirm={handleCancellation}
        booking={booking}
        payments={payments}
        submitting={cancelling}
        error={cancellationError}
      />

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

          {(changeForm.requestType === 'DATE_CHANGE' || changeForm.requestType === 'OTHER') && (
            <Input
              label="Proposed New Date"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={changeForm.proposedDate}
              onChange={e => setChangeForm({ ...changeForm, proposedDate: e.target.value })}
            />
          )}

          {(changeForm.requestType === 'DATE_CHANGE' || changeForm.requestType === 'TIME_CHANGE' || changeForm.requestType === 'OTHER') && (
            <Input
              label="Proposed Start Time"
              type="time"
              value={changeForm.proposedStartTime}
              onChange={e => setChangeForm({ ...changeForm, proposedStartTime: e.target.value })}
            />
          )}

          {(changeForm.requestType === 'VENUE_CHANGE' || changeForm.requestType === 'OTHER') && (
            <Input
              label="Proposed New Venue"
              placeholder="e.g. Hilton Colombo Ballroom"
              maxLength={255}
              value={changeForm.proposedVenue}
              onChange={e => setChangeForm({ ...changeForm, proposedVenue: e.target.value })}
            />
          )}

          <div>
            <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">Reason for Request *</label>
            <textarea
              rows="3"
              required
              maxLength={2000}
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







