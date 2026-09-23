import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCroDashboard } from '../../services/dashboards';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatLKR, formatDate } from '../../utils/formatters';
import { Users, Calendar, Clock, MessageSquare, ArrowRight, PlusCircle } from 'lucide-react';

export default function CRODashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    pendingInquiriesCount: 0,
    activeCustomersCount: 0,
    pendingChangeRequestsCount: 0,
    recentInquiries: []
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const metrics = await fetchCroDashboard();
      setData(metrics);
    } catch (err) {
      console.error('Failed to load CRO dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton count={4} className="h-32" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900">Customer Relations Dashboard</h1>
          <p className="text-navy-600 text-sm">Oversee client onboarding, incoming inquiries, and booking follow-ups.</p>
        </div>
        <Link to="/cro/new-booking">
          <Button variant="gold" icon={PlusCircle}>New Booking for Client</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Pending Inquiries</p>
            <p className="text-2xl font-bold text-navy-900">{data.pendingInquiriesCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Registered Clients</p>
            <p className="text-2xl font-bold text-navy-900">{data.activeCustomersCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Change Requests</p>
            <p className="text-2xl font-bold text-navy-900">{data.pendingChangeRequestsCount}</p>
          </div>
        </Card>
      </div>

      <Card
        title="Recent Inquiries & Pending Bookings"
        subtitle="Bookings awaiting client deposit or initial consultation"
        headerAction={
          <Link to="/cro/bookings" className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
            View All Inquiries <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {(!data.recentInquiries || data.recentInquiries.length === 0) ? (
          <p className="text-xs text-navy-500 py-6 text-center">No pending inquiries at this moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-navy-500 uppercase text-xs">
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Event Date</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {data.recentInquiries.map(b => (
                  <tr key={b.id} className="hover:bg-navy-50/50">
                    <td className="py-3 px-4 font-mono font-semibold text-navy-900">{b.bookingRef}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-navy-900">{b.customerName}</p>
                      <p className="text-xs text-navy-400">{b.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4 text-navy-700">{formatDate(b.eventDate)}</td>
                    <td className="py-3 px-4 text-navy-800">{b.packageName}</td>
                    <td className="py-3 px-4 font-semibold text-navy-900">{formatLKR(b.totalAmount)}</td>
                    <td className="py-3 px-4"><Badge status={b.status} /></td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/cro/bookings?id=${b.id}`}>
                        <Button variant="outline" size="xs">Manage</Button>
                      </Link>
                    </td>
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
