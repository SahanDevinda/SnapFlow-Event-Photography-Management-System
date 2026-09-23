import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { formatLKR, formatDate } from '../../utils/formatters';
import { Calendar, PlusCircle, Search, Eye } from 'lucide-react';

export default function CustomerBookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my?page=0&size=100');
      setBookings(listOf(res));
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = bookings.filter(b => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch = (b.bookingRef || '').toLowerCase().includes(search.toLowerCase()) ||
                          (b.packageName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (b.venue || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900">My Bookings</h1>
          <p className="text-navy-600 text-sm">Manage and review all your event photography reservations.</p>
        </div>
        <Link to="/customer/book">
          <Button variant="gold" icon={PlusCircle}>New Booking</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card padding="p-4" className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-navy-400" />
          <input
            type="text"
            placeholder="Search by ref, package, venue..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'INQUIRY', 'PENDING_DEPOSIT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === s
                  ? 'bg-navy-900 text-white'
                  : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </Card>

      {loading ? (
        <LoadingSkeleton count={3} className="h-32" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Bookings Found"
          description="We couldn't find any bookings matching your current filter criteria."
          action={
            <Link to="/customer/book">
              <Button variant="gold" size="sm">Book New Event</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(b => (
            <Card key={b.id} className="hover:border-amber-300 transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-navy-500 uppercase">{b.bookingRef}</span>
                    <h3 className="font-serif font-bold text-navy-900 text-lg">{b.packageName}</h3>
                  </div>
                  <Badge status={b.status} />
                </div>

                <div className="space-y-1.5 text-sm text-navy-600 mb-4">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>{formatDate(b.eventDate)} ({b.startTime} - {b.endTime})</span>
                  </p>
                  <p className="text-xs text-navy-500 truncate">📍 {b.venue}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-navy-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-navy-400 block">Total Cost</span>
                  <span className="text-base font-bold text-navy-900">{formatLKR(b.totalAmount)}</span>
                </div>
                <Link to={`/customer/bookings/${b.id}`}>
                  <Button variant="outline" size="sm" icon={Eye}>View Details</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
