import React, { useState, useEffect, useCallback } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatLKR, formatDate } from '../../utils/formatters';
import { ChevronLeft, ChevronRight, RefreshCw, Calendar as CalendarIcon, MapPin, Clock, User } from 'lucide-react';

/**
 * Status colour mapping – applied to event cards on the calendar grid.
 * Colours match the SnapFlow brand: navy/amber/gold for active states,
 * emerald for completed, rose for cancelled.
 */
const STATUS_CARD_STYLE = {
  PENDING:     'bg-slate-700 text-white',
  CONFIRMED:   'bg-blue-700 text-white',
  ASSIGNED:    'bg-indigo-700 text-white',
  IN_PROGRESS: 'bg-amber-600 text-white',
  COMPLETED:   'bg-emerald-700 text-white',
  CANCELLED:   'bg-rose-700 text-white',
};

const LEGEND = [
  { label: 'Pending',     style: 'bg-slate-700' },
  { label: 'Confirmed',   style: 'bg-blue-700' },
  { label: 'Assigned',    style: 'bg-indigo-700' },
  { label: 'In Progress', style: 'bg-amber-600' },
  { label: 'Completed',   style: 'bg-emerald-700' },
  { label: 'Cancelled',   style: 'bg-rose-700' },
];

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function MasterCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings?page=0&size=500');
      setEvents(listOf(res));
    } catch (err) {
      console.error('Calendar fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchEvents();
  }, [year, month, fetchEvents]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday   = () => setCurrentDate(new Date());
  const refresh   = () => setRefreshKey(k => k + 1);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();

  const todayStr = new Date().toISOString().slice(0, 10);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900">Master Operations Calendar</h1>
          <p className="text-navy-600 text-sm">Live view of all bookings — shared across Admin, Operations, and Photographers.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-xs font-semibold border border-navy-200 rounded-lg hover:bg-navy-50 transition text-navy-700"
          >
            Today
          </button>
          <button onClick={prevMonth} className="p-2 border border-navy-200 rounded-lg hover:bg-navy-50 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-navy-900 px-3 min-w-[150px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 border border-navy-200 rounded-lg hover:bg-navy-50 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={refresh}
            className="p-2 border border-navy-200 rounded-lg hover:bg-navy-50 transition text-navy-600"
            title="Refresh calendar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {LEGEND.map(({ label, style }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-navy-700">
            <span className={`w-3 h-3 rounded-sm ${style}`} />
            {label}
          </div>
        ))}
      </div>

      {/* Summary counts */}
      {!loading && (
        <div className="flex gap-4 text-xs text-navy-500 flex-wrap">
          {['SCHEDULED','IN_PROGRESS','COMPLETED'].map(s => {
            // Map our display labels to booking statuses
            const count = s === 'SCHEDULED'
              ? events.filter(e => ['PENDING','CONFIRMED','ASSIGNED'].includes(e.status)).length
              : s === 'IN_PROGRESS'
              ? events.filter(e => e.status === 'IN_PROGRESS').length
              : events.filter(e => e.status === 'COMPLETED').length;
            const label = s === 'SCHEDULED' ? 'Upcoming' : s === 'IN_PROGRESS' ? 'In Progress' : 'Completed';
            return (
              <span key={s}>
                <span className="font-bold text-navy-800">{count}</span> {label}
              </span>
            );
          })}
          <span className="ml-auto font-bold text-navy-800">{events.length} total bookings</span>
        </div>
      )}

      {/* Calendar Grid */}
      <Card padding="p-4">
        {loading ? (
          <LoadingSkeleton count={5} className="h-24" />
        ) : (
          <div className="grid grid-cols-7 gap-px bg-navy-200 rounded-xl overflow-hidden border border-navy-200">
            {/* Day headers */}
            {DAY_NAMES.map(d => (
              <div key={d} className="bg-navy-50 p-2 text-center text-xs font-bold text-navy-700 uppercase">
                {d}
              </div>
            ))}

            {/* Empty cells before first day */}
            {[...Array(firstDay)].map((_, i) => (
              <div key={`empty-${i}`} className="bg-white/40 min-h-[110px] p-2" />
            ))}

            {/* Day cells */}
            {[...Array(daysInMonth)].map((_, i) => {
              const dayNum  = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = events.filter(e => e.eventDate === dateStr);
              const isToday   = dateStr === todayStr;

              return (
                <div
                  key={dayNum}
                  className={`bg-white min-h-[110px] p-2 border-t border-navy-100 flex flex-col ${
                    isToday ? 'ring-2 ring-inset ring-amber-400' : ''
                  }`}
                >
                  {/* Day number */}
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center'
                          : 'text-navy-800'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Events */}
                  <div className="space-y-0.5 overflow-y-auto max-h-20">
                    {dayEvents.map(ev => (
                      <button
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`w-full text-left p-1 rounded text-[10px] truncate transition hover:opacity-80 ${
                          STATUS_CARD_STYLE[ev.status] || 'bg-navy-700 text-white'
                        }`}
                        title={`${ev.bookingRef} — ${ev.packageName} @ ${ev.venue}`}
                      >
                        <span className="font-semibold">{ev.startTime}</span> {ev.packageName || ev.eventType}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Empty state */}
      {!loading && events.length === 0 && (
        <div className="text-center py-10 text-navy-400 text-sm">
          <CalendarIcon className="w-10 h-10 mx-auto mb-3 text-navy-300" />
          No bookings found.
        </div>
      )}

      {/* ── Event Detail Modal ──────────────────────────────────────────────── */}
      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}

function EventDetailModal({ event, onClose }) {
  const [fullDetail, setFullDetail] = useState(null);

  useEffect(() => {
    api.get(`/bookings/${event.id}`)
      .then(res => setFullDetail(res.data || res))
      .catch(() => setFullDetail(null));
  }, [event.id]);

  const detail = fullDetail || event;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Event — ${event.bookingRef}`}
      size="md"
      footer={<Button variant="secondary" onClick={onClose}>Close</Button>}
    >
      <div className="space-y-4 text-sm">
        {/* Status pill */}
        <div className="flex items-center justify-between p-3 bg-navy-50 rounded-xl">
          <span className="text-xs font-semibold text-navy-500 uppercase">Event Status</span>
          <Badge status={detail.status} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-navy-400 uppercase mb-0.5 flex items-center gap-1"><User className="w-3 h-3" />Client</p>
            <p className="font-semibold text-navy-900">{detail.customerName}</p>
            {detail.customerEmail && <p className="text-xs text-navy-500">{detail.customerEmail}</p>}
          </div>
          <div>
            <p className="text-xs text-navy-400 uppercase mb-0.5 flex items-center gap-1"><CalendarIcon className="w-3 h-3" />Date</p>
            <p className="font-semibold text-navy-900">{formatDate(detail.eventDate)}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400 uppercase mb-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />Time</p>
            <p className="font-semibold text-navy-900">{detail.startTime} – {detail.endTime}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400 uppercase mb-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />Venue</p>
            <p className="font-semibold text-navy-900">{detail.venue}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-navy-400 uppercase mb-0.5">Package</p>
            <p className="font-semibold text-navy-900">{detail.packageName}</p>
          </div>
        </div>

        {fullDetail?.assignments?.length > 0 && (
          <div>
            <p className="text-xs text-navy-400 uppercase mb-2">Assigned Photographers</p>
            <div className="space-y-1">
              {fullDetail.assignments.map(a => (
                <div key={a.id} className="flex items-center justify-between p-2 bg-navy-50 rounded-lg text-xs">
                  <span className="font-semibold text-navy-900">{a.photographerName}</span>
                  <Badge status={a.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center border-t border-navy-100 pt-3 text-xs">
          <span className="text-navy-500">Total</span>
          <span className="font-bold text-amber-700">{formatLKR(detail.totalAmount)}</span>
        </div>
      </div>
    </Modal>
  );
}
