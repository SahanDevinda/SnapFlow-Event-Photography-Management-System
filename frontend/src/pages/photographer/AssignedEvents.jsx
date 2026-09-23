import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatDate } from '../../utils/formatters';
import { Calendar, Eye } from 'lucide-react';

export default function AssignedEvents() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assignments/my?page=0&size=100');
      setAssignments(listOf(res));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">My Assigned Events</h1>
        <p className="text-navy-600 text-sm">Full schedule of events and photography sessions assigned to you.</p>
      </div>

      <Card>
        {loading ? (
          <LoadingSkeleton count={4} className="h-16" />
        ) : assignments.length === 0 ? (
          <p className="text-xs text-navy-500 py-6 text-center">No assignments found.</p>
        ) : (
          <div className="divide-y divide-navy-100">
            {assignments.map(a => (
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
                  <Button variant="gold" size="xs" icon={Eye}>View Brief</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
