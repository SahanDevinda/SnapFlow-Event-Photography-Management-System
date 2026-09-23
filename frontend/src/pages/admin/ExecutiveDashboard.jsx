import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchExecutiveDashboard } from '../../services/dashboards';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatLKR, formatDate } from '../../utils/formatters';
import { DollarSign, Calendar, Users, Activity, TrendingUp, Settings } from 'lucide-react';

export default function ExecutiveDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalUsers: 0,
    activePhotographersCount: 0,
    recentBookings: [],
    monthlyRevenue: []
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const metrics = await fetchExecutiveDashboard();
      setData(metrics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton count={4} className="h-32" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900">Executive Director Overview</h1>
          <p className="text-navy-600 text-sm">Enterprise performance metrics for Lanka Moments (Pvt) Ltd.</p>
        </div>
        <Link to="/admin/settings">
          <Button variant="secondary" icon={Settings} size="sm">System Settings</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Gross Revenue</p>
            <p className="text-2xl font-bold text-navy-900">{formatLKR(data.totalRevenue)}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Total Bookings</p>
            <p className="text-2xl font-bold text-navy-900">{data.totalBookings}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Platform Accounts</p>
            <p className="text-2xl font-bold text-navy-900">{data.totalUsers}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Field Crew Active</p>
            <p className="text-2xl font-bold text-navy-900">{data.activePhotographersCount}</p>
          </div>
        </Card>
      </div>

      {/* Revenue Performance & Breakdown */}
      <Card title="Revenue Growth & Inflow">
        <div className="h-44 flex items-end justify-between gap-4 pt-6 px-4 border-b border-navy-100">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((m, idx) => {
            const h = 30 + (idx * 15) % 80;
            return (
              <div key={m} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-navy-900 to-amber-500 rounded-t-lg transition hover:opacity-80 cursor-pointer"
                  style={{ height: `${h}%` }}
                  title={`${m}: LKR ${h * 25000}`}
                />
                <span className="text-[11px] font-semibold text-navy-500">{m}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Bookings */}
      <Card title="System-wide Recent Bookings">
        {(!data.recentBookings || data.recentBookings.length === 0) ? (
          <p className="text-xs text-navy-500 py-6 text-center">No recent bookings recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-navy-500 uppercase text-xs">
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {data.recentBookings.map(b => (
                  <tr key={b.id} className="hover:bg-navy-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-navy-900">{b.bookingRef}</td>
                    <td className="py-3 px-4">{b.customerName}</td>
                    <td className="py-3 px-4">{formatDate(b.eventDate)}</td>
                    <td className="py-3 px-4">{b.packageName}</td>
                    <td className="py-3 px-4 font-semibold">{formatLKR(b.totalAmount)}</td>
                    <td className="py-3 px-4"><Badge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
