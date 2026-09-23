import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import { Users, UserPlus, CheckCircle, Trash2 } from 'lucide-react';

const ROLE_LABELS = {
  PRIMARY_PHOTOGRAPHER: 'Lead / Primary Photographer',
  SECONDARY_PHOTOGRAPHER: 'Secondary Photographer',
  DRONE_OPERATOR: 'Drone Operator',
  ASSISTANT: 'Lighting / Shoot Assistant'
};

export default function OpsAssignments() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    photographerId: '',
    role: 'PRIMARY_PHOTOGRAPHER',
    notes: ''
  });
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bRes, pRes] = await Promise.all([
        api.get('/bookings?page=0&size=100'),
        api.get('/users/photographers')
      ]);
      setBookings(listOf(bRes));
      setPhotographers(listOf(pRes));
      const photographerList = listOf(pRes);
      if (photographerList.length > 0) {
        setAssignForm(prev => ({ ...prev, photographerId: photographerList[0].id }));
      }
    } catch (err) {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      setAssigning(true);
      // AssignmentCreateRequest = { bookingId, photographerId, notes } - there is
      // no role column, so the chosen role is recorded in the notes text instead
      // of being silently dropped.
      const roleLabel = ROLE_LABELS[assignForm.role] || assignForm.role;
      const notes = [roleLabel, assignForm.notes].filter(Boolean).join(' — ');

      await api.post('/assignments', {
        bookingId: selectedBooking.id,
        photographerId: parseInt(assignForm.photographerId, 10),
        notes
      });
      toast.success('Photographer assigned successfully!');
      setAssignModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed. Check for photographer scheduling conflicts.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Crew Deployment & Assignments</h1>
        <p className="text-navy-600 text-sm">Assign lead and secondary photographers to confirmed events.</p>
      </div>

      <Card>
        {loading ? (
          <LoadingSkeleton count={4} className="h-16" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-navy-500 uppercase text-xs">
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Crew Allocated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-navy-50/50">
                    <td className="py-3 px-4 font-mono font-semibold text-navy-900">{b.bookingRef}</td>
                    <td className="py-3 px-4">{formatDate(b.eventDate)} ({b.startTime} - {b.endTime})</td>
                    <td className="py-3 px-4">{b.packageName}</td>
                    <td className="py-3 px-4"><Badge status={b.status} /></td>
                    <td className="py-3 px-4">
                      {b.assignments && b.assignments.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {b.assignments.map(a => (
                            <span key={a.id} className="px-2 py-0.5 bg-navy-100 text-navy-800 rounded text-xs font-semibold">
                              {a.photographerName} <Badge status={a.status} className="ml-1" />
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-rose-600 font-semibold">No crew assigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="gold"
                        size="xs"
                        icon={UserPlus}
                        onClick={() => {
                          setSelectedBooking(b);
                          setAssignModalOpen(true);
                        }}
                      >
                        Assign
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Assign Modal */}
      {assignModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setAssignModalOpen(false)}
          title={`Assign Photographer to ${selectedBooking?.bookingRef}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
              <Button variant="gold" onClick={handleAssignSubmit} loading={assigning}>Confirm Assignment</Button>
            </>
          }
        >
          <form className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Select Photographer *
              </label>
              <select
                value={assignForm.photographerId}
                onChange={e => setAssignForm({ ...assignForm, photographerId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                {photographers.map(p => (
                  <option key={p.id} value={p.id}>{p.fullName} ({p.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Assignment Role
              </label>
              <select
                value={assignForm.role}
                onChange={e => setAssignForm({ ...assignForm, role: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="PRIMARY_PHOTOGRAPHER">Lead / Primary Photographer</option>
                <option value="SECONDARY_PHOTOGRAPHER">Secondary Photographer</option>
                <option value="DRONE_OPERATOR">Drone Operator</option>
                <option value="ASSISTANT">Lighting / Shoot Assistant</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Notes for Photographer
              </label>
              <textarea
                rows="2"
                value={assignForm.notes}
                onChange={e => setAssignForm({ ...assignForm, notes: e.target.value })}
                placeholder="Specific brief or gear instructions..."
                className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
