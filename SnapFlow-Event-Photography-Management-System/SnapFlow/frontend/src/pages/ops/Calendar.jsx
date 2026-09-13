import { useEffect, useState } from 'react';
import { bookingApi } from '../../services/api';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Calendar() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  useEffect(() => {
    bookingApi.getAll()
      .then((res) => setBookings(res.data.data || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
  const firstDay = new Date(month.year, month.month, 1).getDay();
  const monthName = new Date(month.year, month.month).toLocaleString('en', { month: 'long', year: 'numeric' });

  const bookingsByDate = {};
  bookings.forEach((b) => {
    if (!b.eventDate) return;
    const key = b.eventDate.substring(0, 10);
    if (!bookingsByDate[key]) bookingsByDate[key] = [];
    bookingsByDate[key].push(b);
  });

  const prev = () => {
    setMonth((m) => {
      if (m.month === 0) return { year: m.year - 1, month: 11 };
      return { year: m.year, month: m.month - 1 };
    });
  };
  const next = () => {
    setMonth((m) => {
      if (m.month === 11) return { year: m.year + 1, month: 0 };
      return { year: m.year, month: m.month + 1 };
    });
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-900">Master Calendar</h1>
          <p className="text-sm text-dark-500 mt-1">Event schedule overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prev} className="btn-secondary text-sm py-1.5 px-3">← Prev</button>
          <span className="font-semibold text-dark-900 min-w-[140px] text-center">{monthName}</span>
          <button onClick={next} className="btn-secondary text-sm py-1.5 px-3">Next →</button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="card overflow-x-auto">
        <div className="grid grid-cols-7 gap-px bg-dark-100 rounded-lg overflow-hidden min-w-[640px]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="bg-dark-50 px-2 py-2 text-center text-xs font-semibold text-dark-500">{d}</div>
          ))}
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`e-${idx}`} className="bg-white min-h-[90px]" />;
            }
            const dateKey = `${month.year}-${String(month.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayBookings = bookingsByDate[dateKey] || [];
            const isToday = dateKey === new Date().toISOString().substring(0, 10);

            return (
              <div key={dateKey} className={`bg-white min-h-[90px] p-1.5 ${isToday ? 'ring-2 ring-inset ring-brand-400' : ''}`}>
                <span className={`text-xs font-medium ${isToday ? 'text-brand-600' : 'text-dark-500'}`}>{day}</span>
                <div className="mt-1 space-y-0.5">
                  {dayBookings.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className="text-[10px] leading-tight rounded px-1 py-0.5 bg-brand-50 text-brand-800 truncate"
                      title={`${b.bookingRef} – ${b.packageName}`}
                    >
                      {b.bookingRef}
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-[10px] text-dark-400">+{dayBookings.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="font-semibold mb-4">Events this month</h2>
        <div className="space-y-2">
          {bookings
            .filter((b) => {
              if (!b.eventDate) return false;
              const d = new Date(b.eventDate);
              return d.getFullYear() === month.year && d.getMonth() === month.month;
            })
            .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
            .map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-dark-50 last:border-0 text-sm">
                <div>
                  <span className="font-medium">{b.bookingRef}</span>
                  <span className="text-dark-500 ml-2">{formatDate(b.eventDate)} · {b.venue || 'TBD'}</span>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
