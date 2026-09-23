import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import { Calendar, MapPin, Clock, User, ChevronLeft } from 'lucide-react';

export default function AssignmentDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/assignments/${id}`);
      setAssignment(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // The backend supports PATCH /assignments/{id}/status, but the screen had no
  // way to trigger it, so photographers could never confirm or close a shoot.
  const NEXT_STATUS = {
    ASSIGNED: { next: 'CONFIRMED', label: 'Confirm Attendance' },
    CONFIRMED: { next: 'IN_PROGRESS', label: 'Start Shoot' },
    IN_PROGRESS: { next: 'COMPLETED', label: 'Mark as Completed' }
  };

  const updateStatus = async (newStatus, label) => {
    try {
      setUpdating(newStatus);
      await api.patch(`/assignments/${id}/status`, { newStatus });
      toast.success(`${label} - status updated to ${newStatus.replace('_', ' ').toLowerCase()}.`);
      fetchDetail();
    } catch (err) {
      toast.error(err.message || 'Failed to update assignment status.');
    } finally {
      setUpdating('');
    }
  };

  if (loading) return <LoadingSkeleton count={3} className="h-32" />;
  if (!assignment) return <div className="p-8 text-center text-navy-500">Assignment not found.</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link to="/photographer/assignments" className="flex items-center gap-1 text-xs text-navy-500 hover:text-navy-800">
        <ChevronLeft className="w-4 h-4" /> Back to Assigned Events
      </Link>

      <Card title="Shoot Brief & Logistics">
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-navy-400 uppercase">Booking Reference</p>
              <p className="font-mono font-bold text-navy-900">{assignment.bookingRef}</p>
            </div>
            <div>
              <p className="text-xs text-navy-400 uppercase">Assignment Status</p>
              <Badge status={assignment.status} />
            </div>
            <div>
              <p className="text-xs text-navy-400 uppercase">Event Date</p>
              <p className="font-semibold text-navy-900">{formatDate(assignment.eventDate)}</p>
            </div>
            <div>
              <p className="text-xs text-navy-400 uppercase">Time Window</p>
              <p className="font-semibold text-navy-900">{assignment.startTime} - {assignment.endTime}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-navy-400 uppercase">Location / Venue</p>
              <p className="font-semibold text-navy-900">{assignment.venue}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-navy-400 uppercase">Package</p>
              <p className="font-semibold text-navy-900">{assignment.packageName || '-'}</p>
            </div>
          </div>

          {assignment.notes && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900">
              <p className="font-bold mb-1">Director / Ops Instructions:</p>
              <p>{assignment.notes}</p>
            </div>
          )}
        </div>
      </Card>

      {NEXT_STATUS[assignment.status] && (
        <Card title="Update Shoot Progress">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="gold"
              size="sm"
              loading={updating === NEXT_STATUS[assignment.status].next}
              onClick={() =>
                updateStatus(
                  NEXT_STATUS[assignment.status].next,
                  NEXT_STATUS[assignment.status].label
                )
              }
            >
              {NEXT_STATUS[assignment.status].label}
            </Button>
            <p className="text-xs text-navy-500">
              Operations and the client are notified automatically when the status changes.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
