import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchCustomerDashboard } from '../../services/dashboards';
import ProtectedImage from '../../components/common/ProtectedImage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { formatLKR, formatDate } from '../../utils/formatters';
import { Calendar, Image, CreditCard, Clock, ArrowRight, PlusCircle, CheckCircle } from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    activeBookingsCount: 0,
    galleriesCount: 0,
    pendingPaymentsCount: 0,
    totalSpent: 0,
    recentBookings: [],
    recentGalleries: []
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const metrics = await fetchCustomerDashboard();
      setData(metrics);
    } catch (err) {
      console.error('Failed to load customer dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={4} className="h-28" />
        <LoadingSkeleton count={2} className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-amber-500/20">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 mb-3 border border-amber-500/30">
            Customer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
            Welcome back, {user?.fullName || 'Valued Client'}!
          </h1>
          <p className="text-navy-200 text-sm sm:text-base mb-6">
            Track your upcoming photography sessions, view your curated high-resolution galleries, and manage payments with ease.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/customer/book">
              <Button variant="gold" icon={PlusCircle}>Book New Event</Button>
            </Link>
            <Link to="/customer/packages">
              <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">Browse Packages</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Active Bookings</p>
            <p className="text-2xl font-bold text-navy-900">{data.activeBookingsCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Image className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Ready Galleries</p>
            <p className="text-2xl font-bold text-navy-900">{data.galleriesCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Pending Payments</p>
            <p className="text-2xl font-bold text-navy-900">{data.pendingPaymentsCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Total Invested</p>
            <p className="text-2xl font-bold text-navy-900">{formatLKR(data.totalSpent)}</p>
          </div>
        </Card>
      </div>

      {/* Recent Bookings Section */}
      <Card
        title="My Bookings"
        subtitle="Recent reservations and event progress"
        headerAction={
          <Link to="/customer/bookings" className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        }
      >
        {(!data.recentBookings || data.recentBookings.length === 0) ? (
          <EmptyState
            title="No Bookings Yet"
            description="You haven't made any event photography bookings yet. Check out our bespoke packages to get started!"
            action={
              <Link to="/customer/book">
                <Button variant="gold" size="sm">Book Your First Event</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-navy-500 uppercase text-xs">
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Event Date</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Venue</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {data.recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-navy-50/50 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-navy-900">{b.bookingRef}</td>
                    <td className="py-3 px-4 text-navy-700">{formatDate(b.eventDate)}</td>
                    <td className="py-3 px-4 font-medium text-navy-900">{b.packageName}</td>
                    <td className="py-3 px-4 text-navy-600 truncate max-w-xs">{b.venue}</td>
                    <td className="py-3 px-4"><Badge status={b.status} /></td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/customer/bookings/${b.id}`}>
                        <Button variant="secondary" size="xs">View Details</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Recent Galleries Section */}
      <Card
        title="Recent Galleries"
        subtitle="Access your event photo collections"
        headerAction={
          <Link to="/customer/galleries" className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
            View All Galleries <ArrowRight className="w-4 h-4" />
          </Link>
        }
      >
        {(!data.recentGalleries || data.recentGalleries.length === 0) ? (
          <EmptyState
            title="No Galleries Available"
            description="Your photography galleries will appear here once your shoot is completed and processed by our editors."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.recentGalleries.map((g) => (
              <div key={g.id} className="border border-navy-100 rounded-xl overflow-hidden hover:shadow-md transition">
                <div className="h-40 bg-navy-100 relative">
                  {g.coverPhotoId ? (
                    <ProtectedImage photoId={g.coverPhotoId} alt={g.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-navy-400">
                      <Image className="w-10 h-10" />
                    </div>
                  )}
                  <span className="absolute top-2 right-2 px-2 py-1 bg-navy-900/80 text-white rounded text-xs">
                    {g.photoCount || 0} Photos
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-serif font-bold text-navy-900 truncate">{g.title}</h4>
                  <p className="text-xs text-navy-500 mt-1">Status: {g.status}</p>
                  <Link to={`/customer/galleries/${g.id}`} className="mt-3 block">
                    <Button variant="outline" size="xs" className="w-full">Open Gallery</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
