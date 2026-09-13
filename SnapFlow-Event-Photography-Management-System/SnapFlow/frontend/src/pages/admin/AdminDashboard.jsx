import { useEffect, useState } from 'react';
import { dashboardApi, activityLogApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import {
  Calendar, CreditCard, Package, Users, Camera, Activity, CheckCircle, Clock, Plus, ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const [res, logRes] = await Promise.all([
        dashboardApi.summary(),
        activityLogApi.getRecent().catch(() => ({ data: { data: [] } })),
      ]);
      const dashboardData = res.data?.data ?? res.data;
      setData(dashboardData);
      setRecentLogs(logRes.data?.data?.slice(0, 5) || []);
    } catch (err) {
      console.error('Dashboard API error:', err);
      setError(err.response?.data?.message || 'Unable to load executive dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-900">Executive Control Center</h1>
          <p className="text-sm text-dark-500 mt-1">Lanka Moments Event Management System</p>
        </div>
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-sm font-semibold text-red-700">{error || 'Unable to load dashboard data.'}</p>
          <button onClick={loadDashboard} className="mt-4 btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  const bookingsByStatus = data.bookingsByStatus || {};
  const statusChart = Object.entries(bookingsByStatus).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value: Number(value) || 0,
  }));

  const COLORS = ['#f59e0b', '#3b82f6', '#6366f1', '#8b5cf6', '#10b981', '#ef4444'];
  const recentBookings = data.recentBookings || [];

  return (
    <div className="space-y-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-dark-900 via-dark-800 to-brand-900 text-white p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Executive Command Center</span>
          <h1 className="font-display text-2xl lg:text-3xl font-bold mt-1">Lanka Moments Overview</h1>
          <p className="text-xs text-dark-300 mt-1">Real-time revenue, booking pipeline, photographer allocation & operational metrics.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/packages" className="btn-primary bg-brand-500 hover:bg-brand-600 text-xs">
            <Plus className="w-3.5 h-3.5" /> Add Package
          </Link>
          <Link to="/admin/bookings" className="btn-secondary bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs">
            Manage Bookings
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data.totalRevenue ?? 0)}
          subtitle="Net verified revenue"
          icon={CreditCard}
          color="brand"
        />
        <StatCard
          title="Total Bookings"
          value={data.totalBookings ?? 0}
          subtitle={`${data.pendingBookings ?? 0} pending review`}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Completed Events"
          value={data.completedEvents ?? 0}
          subtitle="Successfully delivered"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Pending Payments"
          value={formatCurrency(data.outstandingPayments ?? 0)}
          subtitle="Requires financial verification"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Second Row Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-dark-500 uppercase">Available Photographers</p>
            <p className="font-display text-xl font-bold text-dark-900">{data.activePhotographers ?? data.totalPhotographers ?? 0}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-dark-500 uppercase">Active Packages</p>
            <p className="font-display text-xl font-bold text-dark-900">{data.activePackages ?? 0}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-dark-500 uppercase">Registered Customers</p>
            <p className="font-display text-xl font-bold text-dark-900">{data.totalCustomers ?? 0}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-dark-500 uppercase">Upcoming Events</p>
            <p className="font-display text-xl font-bold text-dark-900">{data.upcomingEvents ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Live Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Booking Pipeline Chart */}
        <div className="card lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-dark-900">Booking Pipeline Distribution</h2>
              <p className="text-xs text-dark-500">Breakdown of bookings by operational status</p>
            </div>
            <Link to="/admin/bookings" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {statusChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statusChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#747484' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#747484' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1f', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(166, 124, 61, 0.05)' }}
                />
                <Bar dataKey="value" fill="#8b6532" radius={[6, 6, 0, 0]}>
                  {statusChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-dark-400">
              No booking distribution records found
            </div>
          )}
        </div>

        {/* Quick Actions & Recent Activity Stream */}
        <div className="card space-y-4">
          <h2 className="font-display text-lg font-bold text-dark-900">Management Shortcuts</h2>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link to="/admin/bookings" className="p-3 rounded-xl border border-dark-100 bg-dark-50/50 hover:bg-brand-50 hover:border-brand-200 transition text-dark-800 flex flex-col items-center justify-center gap-1.5 text-center">
              <Calendar className="w-5 h-5 text-brand-600" />
              <span>Bookings</span>
            </Link>
            <Link to="/admin/packages" className="p-3 rounded-xl border border-dark-100 bg-dark-50/50 hover:bg-brand-50 hover:border-brand-200 transition text-dark-800 flex flex-col items-center justify-center gap-1.5 text-center">
              <Package className="w-5 h-5 text-brand-600" />
              <span>Packages</span>
            </Link>
            <Link to="/admin/users" className="p-3 rounded-xl border border-dark-100 bg-dark-50/50 hover:bg-brand-50 hover:border-brand-200 transition text-dark-800 flex flex-col items-center justify-center gap-1.5 text-center">
              <Users className="w-5 h-5 text-brand-600" />
              <span>User Directory</span>
            </Link>
            <Link to="/admin/payments" className="p-3 rounded-xl border border-dark-100 bg-dark-50/50 hover:bg-brand-50 hover:border-brand-200 transition text-dark-800 flex flex-col items-center justify-center gap-1.5 text-center">
              <CreditCard className="w-5 h-5 text-brand-600" />
              <span>Financials</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-dark-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-dark-500">Recent System Audit Logs</h3>
              <Link to="/admin/activity-logs" className="text-[11px] text-brand-600 hover:underline">Full Log</Link>
            </div>
            <div className="space-y-2 text-xs">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-lg border border-dark-100 bg-dark-50/30 flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-dark-900">{log.action}</p>
                      <p className="text-[11px] text-dark-400 truncate max-w-[180px]">{log.details || log.entityType}</p>
                    </div>
                    <span className="text-[10px] text-dark-400 font-mono">{formatDate(log.createdAt)}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-dark-400 italic">No recent system logs.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings List */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-dark-900">Recent Booking Requests</h2>
          <Link to="/admin/bookings" className="btn-secondary text-xs">View All Bookings</Link>
        </div>

        <div className="divide-y divide-dark-100">
          {recentBookings.length > 0 ? (
            recentBookings.map((booking) => (
              <div key={booking.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-dark-50/50 rounded-lg px-2 transition">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700 font-mono text-xs font-bold">
                    {booking.bookingRef || `#${booking.id}`}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-dark-900">{booking.customerName || 'Customer'}</p>
                    <p className="text-xs text-dark-500">{booking.eventType || 'Event'} · {formatDate(booking.eventDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-sm text-dark-900">{formatCurrency(booking.totalAmount)}</span>
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-dark-400 text-center py-6">No recent bookings recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}