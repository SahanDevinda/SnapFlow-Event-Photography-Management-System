import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900">Notifications</h1>
          <p className="text-navy-600 text-sm">Stay updated on your booking progress, payments, and galleries.</p>
        </div>
        {notifications.length > 0 && (
          <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllAsRead}>
            Mark All Read
          </Button>
        )}
      </div>

      <Card>
        {notifications.length === 0 ? (
          <EmptyState
            title="No Notifications"
            description="You are all caught up! There are no unread system notifications right now."
          />
        ) : (
          <div className="divide-y divide-navy-100">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`py-4 px-2 flex justify-between items-start gap-4 transition cursor-pointer ${
                  !n.read ? 'bg-amber-50/40' : 'hover:bg-navy-50/50'
                }`}
              >
                <div className="flex gap-3 items-start">
                  <div className={`p-2 rounded-xl mt-0.5 ${!n.read ? 'bg-amber-500 text-white' : 'bg-navy-100 text-navy-500'}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-sm ${!n.read ? 'font-bold text-navy-900' : 'text-navy-700'}`}>{n.title}</h4>
                    <p className="text-xs text-navy-600 mt-1">{n.message}</p>
                    <span className="text-[11px] text-navy-400 mt-2 block">{formatDate(n.createdAt)}</span>
                  </div>
                </div>
                {!n.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
