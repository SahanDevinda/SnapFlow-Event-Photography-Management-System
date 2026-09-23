import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPhotographerDashboard } from '../../services/dashboards';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatDate } from '../../utils/formatters';
import { Calendar, Camera, UploadCloud, CheckCircle } from 'lucide-react';

export default function PhotographerDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    upcomingShootsCount: 0,
    completedShootsCount: 0,
    pendingUploadsCount: 0,
    upcomingAssignments: []
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const metrics = await fetchPhotographerDashboard();
      setData(metrics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton count={3} className="h-28" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Photographer Workspace</h1>
        <p className="text-navy-600 text-sm">Review assigned shoots, shoot briefs, and upload event collections.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Upcoming Shoots</p>
            <p className="text-2xl font-bold text-navy-900">{data.upcomingShootsCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Pending Photo Uploads</p>
            <p className="text-2xl font-bold text-navy-900">{data.pendingUploadsCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Completed Shoots</p>
            <p className="text-2xl font-bold text-navy-900">{data.completedShootsCount}</p>
          </div>
        </Card>
      </div>

      <Card title="My Upcoming Assigned Shoots">
        {(!data.upcomingAssignments || data.upcomingAssignments.length === 0) ? (
          <p className="text-xs text-navy-500 py-6 text-center">No upcoming assignments scheduled.</p>
        ) : (
          <div className="divide-y divide-navy-100">
            {data.upcomingAssignments.map(a => (
              <div key={a.id} className="py-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-navy-700">{a.bookingRef}</span>
                    <Badge status={a.status} />
                  </div>
                  <h4 className="font-bold text-navy-900 text-sm mt-1">{a.packageName}</h4>
                  <p className="text-xs text-navy-600 mt-0.5">📅 {formatDate(a.eventDate)} ({a.startTime} - {a.endTime}) • 📍 {a.venue}</p>
                </div>
                <Link to={`/photographer/assignments/${a.id}`}>
                  <Button variant="outline" size="xs">View Shoot Brief</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
