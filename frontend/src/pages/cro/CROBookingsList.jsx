import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { formatLKR, formatDate } from '../../utils/formatters';
import { Search, CheckCircle, XCircle, Info } from 'lucide-react';

export default function CROBookingsList() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings?page=0&size=100');
      setBookings(listOf(res));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      // BookingStatusTransitionRequest = { newStatus, remarks }
      await api.patch(`/bookings/${id}/status`, { newStatus: status });
      toast.success(`Booking status updated to ${status}`);
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  const filtered = bookings.filter(b =>
    (b.bookingRef || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.packageName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Manage Bookings & Inquiries</h1>
        <p className="text-navy-600 text-sm">Review client requests, approve consultations, or cancel reservations.</p>
      </div>

      <Card padding="p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-navy-400" />
          <input
            type="text"
            placeholder="Search by ref, client name, package..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <LoadingSkeleton count={5} className="h-12" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-navy-500 uppercase text-xs">
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-navy-50/50">
                    <td className="py-3 px-4 font-mono font-semibold text-navy-900">{b.bookingRef}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-navy-900">{b.customerName}</p>
                      <p className="text-xs text-navy-400">{b.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4">{formatDate(b.eventDate)}</td>
                    <td className="py-3 px-4">{b.packageName}</td>
                    <td className="py-3 px-4 font-semibold">{formatLKR(b.totalAmount)}</td>
                    <td className="py-3 px-4"><Badge status={b.status} /></td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="secondary" size="xs" onClick={() => setSelectedBooking(b)}>
                        Actions
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Booking Details / Actions Modal */}
      {selectedBooking && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedBooking(null)}
          title={`Booking ${selectedBooking.bookingRef}`}
          footer={
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-2">
                {selectedBooking.status === 'PENDING' && (
                  <Button variant="primary" size="sm" onClick={() => updateStatus(selectedBooking.id, 'CONFIRMED')}>
                    Confirm Booking
                  </Button>
                )}
                {selectedBooking.status !== 'CANCELLED' && selectedBooking.status !== 'COMPLETED' && (
                  <Button variant="danger" size="sm" onClick={() => updateStatus(selectedBooking.id, 'CANCELLED')}>
                    Cancel Booking
                  </Button>
                )}
              </div>
              <Button variant="secondary" size="sm" onClick={() => setSelectedBooking(null)}>Close</Button>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-navy-400 uppercase">Client</p>
                <p className="font-semibold text-navy-900">{selectedBooking.customerName}</p>
                <p className="text-xs text-navy-500">{selectedBooking.customerEmail}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400 uppercase">Current Status</p>
                <Badge status={selectedBooking.status} />
              </div>
              <div>
                <p className="text-xs text-navy-400 uppercase">Event Date & Time</p>
                <p className="font-semibold text-navy-900">{formatDate(selectedBooking.eventDate)} ({selectedBooking.startTime} - {selectedBooking.endTime})</p>
              </div>
              <div>
                <p className="text-xs text-navy-400 uppercase">Venue</p>
                <p className="font-semibold text-navy-900">{selectedBooking.venue}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-navy-100 flex justify-between font-bold">
              <span>Total Cost:</span>
              <span className="text-amber-600">{formatLKR(selectedBooking.totalAmount)}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
