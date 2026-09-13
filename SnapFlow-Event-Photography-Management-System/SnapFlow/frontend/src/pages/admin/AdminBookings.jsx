import { useState, useEffect } from 'react';
import { bookingApi, paymentApi, assignmentApi } from '../../services/api';
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/helpers';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Eye, Edit3, Calendar, MapPin, User, DollarSign, Camera, FileText } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected Booking Details
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingPayments, setBookingPayments] = useState([]);
  const [bookingAssignments, setBookingAssignments] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Status Update Modal
  const [statusModalBooking, setStatusModalBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Cancel Dialog
  const [cancelBookingItem, setCancelBookingItem] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await bookingApi.getAll();
      setBookings(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleViewDetails = async (booking) => {
    setSelectedBooking(booking);
    setDetailsLoading(true);
    setBookingPayments([]);
    setBookingAssignments([]);
    try {
      const [payRes, assignRes] = await Promise.all([
        paymentApi.getByBooking(booking.id).catch(() => ({ data: { data: [] } })),
        assignmentApi.getByBooking(booking.id).catch(() => ({ data: { data: [] } })),
      ]);
      setBookingPayments(payRes.data?.data || []);
      setBookingAssignments(assignRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOpenStatusModal = (booking) => {
    setStatusModalBooking(booking);
    setNewStatus(booking.status);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusModalBooking) return;
    setUpdatingStatus(true);
    setError('');
    setSuccess('');
    try {
      await bookingApi.updateStatus(statusModalBooking.id, newStatus);
      setSuccess(`Booking ${statusModalBooking.bookingReference} status updated to ${newStatus}`);
      setStatusModalBooking(null);
      fetchBookings();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelBookingItem) return;
    setCancelling(true);
    try {
      await bookingApi.updateStatus(cancelBookingItem.id, 'CANCELLED');
      setSuccess(`Booking ${cancelBookingItem.bookingReference} has been cancelled.`);
      setCancelBookingItem(null);
      fetchBookings();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  const columns = [
    {
      header: 'Reference',
      accessor: 'bookingReference',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-brand-700">{row.bookingReference}</span>
          <p className="text-xs text-dark-400">{row.eventType || 'Event'}</p>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessor: (row) => row.customerName || `${row.customer?.firstName || ''} ${row.customer?.lastName || ''}`,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-dark-100 flex items-center justify-center text-xs font-bold text-dark-700">
            {(row.customerName || row.customer?.firstName || 'C')[0]}
          </div>
          <div>
            <p className="font-medium text-dark-900">{row.customerName || `${row.customer?.firstName} ${row.customer?.lastName}`}</p>
            <p className="text-xs text-dark-400">{row.customerEmail || row.customer?.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Package',
      accessor: 'packageName',
      cell: (row) => <span className="font-medium text-dark-800">{row.packageName || row.packageItem?.name}</span>,
    },
    {
      header: 'Event Date',
      accessor: 'eventDate',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-dark-700">
          <Calendar className="w-3.5 h-3.5 text-dark-400" />
          <span>{formatDate(row.eventDate)}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Total Amount',
      accessor: 'totalAmount',
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-bold text-dark-900">{formatCurrency(row.totalAmount)}</p>
          <p className="text-xs text-dark-400">Bal: {formatCurrency(row.balanceAmount)}</p>
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1.5 rounded-lg text-dark-500 hover:text-brand-600 hover:bg-dark-50 transition"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenStatusModal(row)}
            className="p-1.5 rounded-lg text-dark-500 hover:text-blue-600 hover:bg-blue-50 transition"
            title="Update Status"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-900">Master Booking Directory</h1>
          <p className="text-dark-500 text-sm mt-1">Review and manage all event bookings across the organization</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {success}
        </div>
      )}

      <DataTable
        columns={columns}
        data={bookings}
        loading={loading}
        emptyMessage="No bookings found"
        searchPlaceholder="Search by reference, customer name, venue..."
        filterOptions={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'PENDING', label: 'Pending' },
              { value: 'CONFIRMED', label: 'Confirmed' },
              { value: 'ASSIGNED', label: 'Assigned' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ],
          },
        ]}
      />

      {/* Booking Detail Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={`Booking ${selectedBooking?.bookingReference}`}
        maxWidth="max-w-3xl"
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-dark-50 border border-dark-100">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-dark-500">Status</p>
                <div className="mt-1">
                  <StatusBadge status={selectedBooking.status} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-dark-500">Total Price</p>
                <p className="font-display text-xl font-bold text-dark-900 mt-0.5">{formatCurrency(selectedBooking.totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-dark-500">Deposit / Balance</p>
                <p className="text-sm font-semibold text-dark-800 mt-0.5">
                  Paid: {formatCurrency(selectedBooking.depositAmount)} | Bal: <span className="text-brand-700">{formatCurrency(selectedBooking.balanceAmount)}</span>
                </p>
              </div>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event details */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-500 border-b pb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-600" /> Event Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-dark-500">Event Type:</span> <span className="font-medium">{selectedBooking.eventType || 'N/A'}</span></div>
                  <div><span className="text-dark-500">Event Date:</span> <span className="font-medium">{formatDate(selectedBooking.eventDate)}</span></div>
                  <div><span className="text-dark-500">Event Time:</span> <span className="font-medium">{selectedBooking.eventTime || 'TBD'}</span></div>
                  <div className="flex items-start gap-1"><MapPin className="w-4 h-4 text-dark-400 mt-0.5 shrink-0" /> <span className="font-medium">{selectedBooking.venue}</span></div>
                  {selectedBooking.specialNotes && (
                    <div className="pt-2 text-xs text-dark-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                      <span className="font-semibold block text-amber-900">Notes:</span> {selectedBooking.specialNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer & Package details */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-500 border-b pb-2 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand-600" /> Customer & Package
                </h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-dark-500">Customer:</span> <span className="font-medium">{selectedBooking.customerName || `${selectedBooking.customer?.firstName} ${selectedBooking.customer?.lastName}`}</span></div>
                  <div><span className="text-dark-500">Email:</span> <span className="font-medium">{selectedBooking.customerEmail || selectedBooking.customer?.email}</span></div>
                  <div><span className="text-dark-500">Phone:</span> <span className="font-medium">{selectedBooking.customerPhone || selectedBooking.customer?.phone || 'N/A'}</span></div>
                  <div className="pt-2 border-t border-dark-100">
                    <span className="text-dark-500">Package:</span> <span className="font-semibold text-brand-700">{selectedBooking.packageName || selectedBooking.packageItem?.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Photographers Assigned */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-500 border-b pb-2 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-brand-600" /> Assigned Photographers
              </h4>
              {bookingAssignments.length === 0 ? (
                <p className="text-xs text-dark-400 italic">No photographer assigned yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bookingAssignments.map((asg) => (
                    <div key={asg.id} className="p-3 rounded-lg border border-dark-100 bg-white flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-dark-900">{asg.photographerName || `${asg.photographer?.firstName} ${asg.photographer?.lastName}`}</p>
                        <p className="text-xs text-dark-400">{asg.assignmentStatus}</p>
                      </div>
                      {asg.attendanceConfirmed && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">Confirmed</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payments History */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-500 border-b pb-2 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-brand-600" /> Payment Audit History
              </h4>
              {bookingPayments.length === 0 ? (
                <p className="text-xs text-dark-400 italic">No payment receipts recorded for this booking.</p>
              ) : (
                <div className="space-y-2">
                  {bookingPayments.map((pmt) => (
                    <div key={pmt.id} className="p-3 rounded-lg border border-dark-100 bg-dark-50/40 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-dark-900">{formatCurrency(pmt.amount)}</span> ({pmt.paymentType})
                        <p className="text-dark-400">{pmt.paymentMethod} · {formatDate(pmt.paymentDate || pmt.createdAt)}</p>
                      </div>
                      <StatusBadge status={pmt.verificationStatus || pmt.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-dark-100">
              {selectedBooking.status !== 'CANCELLED' && selectedBooking.status !== 'COMPLETED' ? (
                <button
                  onClick={() => {
                    setCancelBookingItem(selectedBooking);
                    setSelectedBooking(null);
                  }}
                  className="btn-danger text-xs"
                >
                  Cancel Booking
                </button>
              ) : <div />}

              <button onClick={() => setSelectedBooking(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={!!statusModalBooking}
        onClose={() => setStatusModalBooking(null)}
        title={`Update Booking Status - ${statusModalBooking?.bookingReference}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="label">Select New Booking Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="input-field cursor-pointer"
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 text-xs">
            Updating status will notify relevant team members and customer automatically.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <button type="button" onClick={() => setStatusModalBooking(null)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={updatingStatus} className="btn-primary">
              {updatingStatus ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={!!cancelBookingItem}
        onClose={() => setCancelBookingItem(null)}
        onConfirm={handleCancelBooking}
        title="Cancel Booking?"
        message={`Are you sure you want to cancel booking ${cancelBookingItem?.bookingReference}? This will set status to CANCELLED.`}
        confirmText="Cancel Booking"
        type="danger"
        loading={cancelling}
      />
    </div>
  );
}
