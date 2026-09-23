import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchOperationsDashboard } from '../../services/dashboards';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatDate } from '../../utils/formatters';
import { Calendar, Users, Camera, AlertTriangle, ArrowRight } from 'lucide-react';

export default function OpsDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    upcomingShootsCount: 0,
    unassignedShootsCount: 0,
    activePhotographersCount: 0,
    equipmentAlertsCount: 0,
    upcomingEvents: []
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const metrics = await fetchOperationsDashboard();
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
          <h1 className="text-2xl font-serif font-bold text-navy-900">Operations Command Center</h1>
          <p className="text-navy-600 text-sm">Coordinate photography logistics, crew scheduling, and gear readiness.</p>
        </div>
        <Link to="/operations/calendar">
          <Button variant="gold" icon={Calendar}>Master Calendar</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Unassigned Shoots</p>
            <p className="text-2xl font-bold text-navy-900">{data.unassignedShootsCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Crew Members</p>
            <p className="text-2xl font-bold text-navy-900">{data.activePhotographersCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Gear Status</p>
            <p className="text-2xl font-bold text-navy-900">Ready</p>
          </div>
        </Card>
      </div>

      <Card
        title="Upcoming Scheduled Shoots"
        subtitle="Events occurring over the next 14 days"
        headerAction={
          <Link to="/operations/assignments" className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
            Manage Crew Assignments <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {(!data.upcomingEvents || data.upcomingEvents.length === 0) ? (
          <p className="text-xs text-navy-500 py-6 text-center">No upcoming events scheduled.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-navy-500 uppercase text-xs">
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Event Date</th>
                  <th className="py-3 px-4">Venue</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Assigned Crew</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {data.upcomingEvents.map(e => (
                  <tr key={e.id} className="hover:bg-navy-50/50">
                    <td className="py-3 px-4 font-mono font-semibold text-navy-900">{e.bookingRef}</td>
                    <td className="py-3 px-4">{formatDate(e.eventDate)} ({e.startTime} - {e.endTime})</td>
                    <td className="py-3 px-4 text-navy-600 truncate max-w-xs">{e.venue}</td>
                    <td className="py-3 px-4 text-navy-800">{e.packageName}</td>
                    <td className="py-3 px-4">
                      {e.assignments && e.assignments.length > 0 ? (
                        <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                          {e.assignments.length} Assigned
                        </span>
                      ) : (
                        <span className="text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-semibold">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link to="/operations/assignments">
                        <Button variant="secondary" size="xs">Assign Crew</Button>
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
