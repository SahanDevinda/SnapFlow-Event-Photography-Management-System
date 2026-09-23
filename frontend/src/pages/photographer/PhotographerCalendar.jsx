import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PhotographerCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assignments/my?page=0&size=200');
      setAssignments(listOf(res));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const statusColors = {
    ASSIGNED: 'bg-amber-600',
    CONFIRMED: 'bg-navy-800',
    IN_PROGRESS: 'bg-blue-700',
    COMPLETED: 'bg-emerald-700',
    CANCELLED: 'bg-red-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900">My Assignment Calendar</h1>
          <p className="text-navy-600 text-sm">Read-only overview of your confirmed shoots and upcoming events.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 border border-navy-200 rounded-lg hover:bg-navy-50 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-navy-900 px-3 min-w-[140px] text-center">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 border border-navy-200 rounded-lg hover:bg-navy-50 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <Card><LoadingSkeleton count={5} className="h-12" /></Card>
      ) : (
        <>
          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5 text-xs text-navy-700">
                <span className={`w-3 h-3 rounded-sm ${color}`} />
                {status.replace('_', ' ')}
              </div>
            ))}
          </div>

          <Card padding="p-4">
            <div className="grid grid-cols-7 gap-px bg-navy-200 rounded-xl overflow-hidden border border-navy-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="bg-navy-50 p-2 text-center text-xs font-bold text-navy-700 uppercase">
                  {d}
                </div>
              ))}

              {[...Array(firstDay)].map((_, i) => (
                <div key={`empty-${i}`} className="bg-white/40 min-h-[100px] p-2" />
              ))}

              {[...Array(daysInMonth)].map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayAssignments = assignments.filter(a => a.eventDate === dateStr);
                const isToday = new Date().toISOString().slice(0, 10) === dateStr;

                return (
                  <div
                    key={dayNum}
                    className={`bg-white min-h-[100px] p-2 border-t border-navy-100 flex flex-col ${
                      isToday ? 'ring-2 ring-inset ring-amber-400' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-bold ${isToday ? 'text-amber-600' : 'text-navy-800'}`}>
                        {dayNum}
                      </span>
                      {dayAssignments.length > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                          {dayAssignments.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-20">
                      {dayAssignments.map(a => (
                        <div
                          key={a.id}
                          className={`p-1 rounded text-[11px] text-white truncate transition ${statusColors[a.status] || 'bg-navy-700'}`}
                          title={`${a.bookingRef} — ${a.packageName} @ ${a.venue} (${a.startTime})`}
                        >
                          {a.startTime} {a.packageName}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {assignments.length === 0 && (
            <p className="text-center text-navy-400 text-sm py-4">No assignments found.</p>
          )}
        </>
      )}
    </div>
  );
}
