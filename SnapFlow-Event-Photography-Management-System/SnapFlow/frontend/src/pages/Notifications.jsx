import { useState, useEffect } from 'react';
import { notificationApi } from '../services/api';
import { formatDateTime, getErrorMessage } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Bell, CheckCheck, Check, Clock, Info } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await notificationApi.getAll();
      setNotifications(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-600" /> System Notifications
          </h1>
          <p className="text-dark-500 text-sm mt-1">Updates on bookings, photographer assignments, change requests & payments</p>
        </div>

        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary text-xs">
            <CheckCheck className="w-4 h-4 text-brand-600" /> Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <EmptyState title="No Notifications" description="You have no notifications in your inbox." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                n.read
                  ? 'bg-white border-dark-100 text-dark-700'
                  : 'bg-brand-50/40 border-brand-200 text-dark-900 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${n.read ? 'bg-dark-100 text-dark-500' : 'bg-brand-600 text-white'}`}>
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-sm ${!n.read ? 'font-bold text-dark-900' : 'font-medium text-dark-800'}`}>
                    {n.title || n.type || 'Notification'}
                  </p>
                  <p className="text-xs text-dark-600 mt-0.5 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-dark-400 mt-2 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{formatDateTime(n.createdAt)}</span>
                  </div>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="p-1.5 rounded-lg text-dark-400 hover:text-brand-600 hover:bg-brand-100/50 transition shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
