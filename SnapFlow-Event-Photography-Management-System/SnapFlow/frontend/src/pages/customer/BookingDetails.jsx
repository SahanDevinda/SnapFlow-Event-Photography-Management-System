import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingApi, paymentApi, changeRequestApi, galleryApi } from '../../services/api';
import { formatCurrency, formatDate, formatDateTime, getErrorMessage } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { ArrowLeft, Calendar, MapPin, DollarSign, Camera, FileText, Plus, ShieldCheck, Image as ImageIcon } from 'lucide-react';

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [payments, setPayments] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Change Request Modal
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [changeForm, setChangeForm] = useState({ requestType: 'SPECIAL_REQUEST', description: '' });
  const [submittingChange, setSubmittingChange] = useState(false);

  // Record Payment Modal
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentType: 'ADVANCE_DEPOSIT',
    paymentMethod: 'BANK_TRANSFER',
    transactionReference: '',
    notes: '',
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const fetchDetails = () => {
    setLoading(true);
    Promise.all([
      bookingApi.getById(id),
      paymentApi.getByBooking(id).catch(() => ({ data: { data: [] } })),
      changeRequestApi.getByBooking(id).catch(() => ({ data: { data: [] } })),
      galleryApi.getByBooking(id).catch(() => ({ data: { data: null } })),
    ])
      .then(([bRes, pRes, cRes, gRes]) => {
        const bData = bRes.data.data;
        setBooking(bData);
        setPayments(pRes.data.data || []);
        setChangeRequests(cRes.data.data || []);
        setGallery(gRes.data.data);
        if (bData) {
          setPaymentForm((prev) => ({
            ...prev,
            amount: bData.balanceAmount > 0 ? bData.balanceAmount : bData.depositAmount,
          }));
        }
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const submitChangeRequest = async (e) => {
    e.preventDefault();
    setSubmittingChange(true);
    try {
      await changeRequestApi.create({ bookingId: Number(id), ...changeForm });
      setShowChangeForm(false);
      setChangeForm({ requestType: 'SPECIAL_REQUEST', description: '' });
      fetchDetails();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSubmittingChange(false);
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    setSubmittingPayment(true);
    try {
      await paymentApi.record({
        bookingId: Number(id),
        amount: Number(paymentForm.amount),
        paymentType: paymentForm.paymentType,
        paymentMethod: paymentForm.paymentMethod,
        transactionReference: paymentForm.transactionReference,
        notes: paymentForm.notes,
      });
      setShowPaymentForm(false);
      fetchDetails();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !booking) return <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error || 'Booking record not found'}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/customer/bookings" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Bookings
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-dark-900 font-mono">
              {booking.bookingReference || booking.bookingRef}
            </h1>
            <StatusBadge status={booking.status} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {booking.balanceAmount > 0 && (
            <button onClick={() => setShowPaymentForm(true)} className="btn-primary text-xs">
              <DollarSign className="w-3.5 h-3.5" /> Submit Payment
            </button>
          )}
          <button onClick={() => setShowChangeForm(true)} className="btn-secondary text-xs">
            Request Change
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Event Details Card */}
        <div className="card space-y-4">
          <h2 className="font-display text-base font-bold text-dark-900 border-b border-dark-100 pb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600" /> Event Details
          </h2>
          <div className="space-y-2.5 text-sm">
            <Row label="Package" value={booking.packageName} />
            <Row label="Event Date" value={formatDate(booking.eventDate)} />
            <Row label="Event Time" value={booking.eventTime || 'TBD'} />
            <Row label="Venue Location" value={booking.venue || 'TBD'} />
            <Row label="Event Type" value={booking.eventType || 'N/A'} />
            {booking.specialRequests && <Row label="Special Requests" value={booking.specialRequests} />}
          </div>
        </div>

        {/* Financial Summary Card */}
        <div className="card space-y-4">
          <h2 className="font-display text-base font-bold text-dark-900 border-b border-dark-100 pb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-brand-600" /> Financial Summary
          </h2>
          <div className="space-y-2.5 text-sm">
            <Row label="Total Amount" value={formatCurrency(booking.totalAmount)} />
            <Row label="Deposit Amount" value={formatCurrency(booking.depositAmount)} />
            <Row label="Remaining Balance" value={formatCurrency(booking.balanceAmount)} highlight />
          </div>
        </div>
      </div>

      {/* Assigned Team */}
      {booking.assignments?.length > 0 && (
        <div className="card space-y-3">
          <h2 className="font-display text-base font-bold text-dark-900 border-b border-dark-100 pb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-brand-600" /> Photographers Assigned
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {booking.assignments.map((a) => (
              <div key={a.assignmentId || a.id} className="p-3 rounded-lg border border-dark-100 bg-dark-50/50 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-dark-900">{a.photographerName}</p>
                  <p className="text-xs text-dark-400">Assigned Team Member</p>
                </div>
                <StatusBadge status={a.status || a.assignmentStatus} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between border-b border-dark-100 pb-3">
          <h2 className="font-display text-base font-bold text-dark-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" /> Payment Receipts
          </h2>
          {booking.balanceAmount > 0 && (
            <button onClick={() => setShowPaymentForm(true)} className="text-xs text-brand-600 hover:underline font-semibold">
              + Submit Receipt
            </button>
          )}
        </div>

        {payments.length === 0 ? (
          <p className="text-xs text-dark-400 italic">No payment receipts recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="p-3 rounded-lg border border-dark-100 bg-white flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-dark-900 text-sm">{formatCurrency(p.amount)}</p>
                  <p className="text-dark-400">{p.paymentType} · {p.paymentMethod} ({formatDate(p.createdAt)})</p>
                </div>
                <StatusBadge status={p.verificationStatus || p.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change Requests History */}
      {changeRequests.length > 0 && (
        <div className="card space-y-3">
          <h2 className="font-display text-base font-bold text-dark-900 border-b border-dark-100 pb-3">
            Change Request History
          </h2>
          <div className="space-y-3">
            {changeRequests.map((cr) => (
              <div key={cr.id} className="p-3 rounded-lg border border-dark-100 bg-dark-50/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-dark-800">{cr.requestType?.replace(/_/g, ' ')}</span>
                  <StatusBadge status={cr.status} />
                </div>
                <p className="text-xs text-dark-600">{cr.description}</p>
                <p className="text-[10px] text-dark-400">{formatDateTime(cr.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Access */}
      {gallery && (
        <div className="card bg-gradient-to-r from-dark-900 to-dark-800 text-white p-6 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold flex items-center gap-2 text-white">
              <ImageIcon className="w-5 h-5 text-brand-400" /> Event Photography Gallery
            </h2>
            <Link to="/gallery" className="btn-primary text-xs bg-brand-500 hover:bg-brand-600">
              Open Gallery Portal
            </Link>
          </div>
          <p className="text-xs text-dark-300">
            Access Code: <span className="font-mono font-bold text-brand-300 bg-black/40 px-2 py-0.5 rounded">{gallery.accessCode}</span>
          </p>
        </div>
      )}

      {/* Modal Change Request */}
      <Modal isOpen={showChangeForm} onClose={() => setShowChangeForm(false)} title="Submit Event Change Request">
        <form onSubmit={submitChangeRequest} className="space-y-4">
          <div>
            <label className="label">Request Type</label>
            <select
              className="input-field cursor-pointer"
              value={changeForm.requestType}
              onChange={(e) => setChangeForm({ ...changeForm, requestType: e.target.value })}
            >
              <option value="PACKAGE_UPGRADE">Package Upgrade</option>
              <option value="DATE_CHANGE">Date Change</option>
              <option value="VENUE_CHANGE">Venue Change</option>
              <option value="ADD_ON">Add-on Request</option>
              <option value="SPECIAL_REQUEST">Special Request</option>
            </select>
          </div>
          <div>
            <label className="label">Details / Explanation *</label>
            <textarea
              className="input-field"
              rows={4}
              required
              value={changeForm.description}
              onChange={(e) => setChangeForm({ ...changeForm, description: e.target.value })}
              placeholder="Describe the change you would like to request..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <button type="button" onClick={() => setShowChangeForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submittingChange} className="btn-primary">
              {submittingChange ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Record Payment */}
      <Modal isOpen={showPaymentForm} onClose={() => setShowPaymentForm(false)} title="Record Payment Receipt">
        <form onSubmit={submitPayment} className="space-y-4">
          <div>
            <label className="label">Payment Amount (LKR) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              className="input-field font-bold"
            />
          </div>

          <div>
            <label className="label">Payment Purpose *</label>
            <select
              value={paymentForm.paymentType}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })}
              className="input-field cursor-pointer"
            >
              <option value="ADVANCE_DEPOSIT">ADVANCE_DEPOSIT (Advance Payment)</option>
              <option value="FINAL_BALANCE">FINAL_BALANCE (Final Settlement)</option>
              <option value="ADD_ON_CHARGE">ADD_ON_CHARGE (Extra Charge)</option>
            </select>
          </div>

          <div>
            <label className="label">Payment Method *</label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              className="input-field cursor-pointer"
            >
              <option value="BANK_TRANSFER">Bank Transfer / Online Deposit</option>
              <option value="ONLINE">Credit / Debit Card</option>
              <option value="CASH">Cash Payment</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>

          <div>
            <label className="label">Bank Reference / Transaction ID</label>
            <input
              type="text"
              value={paymentForm.transactionReference}
              onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
              placeholder="e.g. TXN-9984029"
              className="input-field font-mono"
            />
          </div>

          <div>
            <label className="label">Notes / Details</label>
            <input
              type="text"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              placeholder="e.g. Deposited into Commercial Bank account"
              className="input-field"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <button type="button" onClick={() => setShowPaymentForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submittingPayment} className="btn-primary">
              {submittingPayment ? 'Submitting Receipt...' : 'Submit Payment Receipt'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Row({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-dark-500">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-brand-700 text-base font-bold' : 'text-dark-900'}`}>{value}</span>
    </div>
  );
}
