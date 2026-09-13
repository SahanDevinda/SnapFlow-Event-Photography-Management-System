import { useState, useEffect } from 'react';
import { equipmentApi, bookingApi, userApi } from '../../services/api';
import { getErrorMessage } from '../../utils/helpers';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Camera, Plus, CheckCircle, AlertTriangle, Shield, RefreshCw } from 'lucide-react';

export default function EquipmentManagement() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Equipment Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', type: '', serialNumber: '' });
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Allocate Equipment Modal
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [selectedEq, setSelectedEq] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [photographers, setPhotographers] = useState([]);
  const [allocForm, setAllocForm] = useState({ bookingId: '', photographerId: '' });
  const [submittingAlloc, setSubmittingAlloc] = useState(false);

  // Status Change Modal
  const [statusEq, setStatusEq] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchEquipment = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await equipmentApi.getAll();
      setEquipmentList(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleOpenAllocate = async (eq) => {
    setSelectedEq(eq);
    setIsAllocateOpen(true);
    try {
      const [bkRes, photoRes] = await Promise.all([
        bookingApi.getAll(),
        userApi.getPhotographers(),
      ]);
      setBookings(bkRes.data?.data || []);
      setPhotographers(photoRes.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    setSubmittingAdd(true);
    setError('');
    setSuccess('');
    try {
      await equipmentApi.create(addForm);
      setSuccess(`Equipment "${addForm.name}" registered successfully.`);
      setIsAddOpen(false);
      setAddForm({ name: '', type: '', serialNumber: '' });
      fetchEquipment();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleAllocateEquipment = async (e) => {
    e.preventDefault();
    if (!selectedEq || !allocForm.bookingId || !allocForm.photographerId) return;
    setSubmittingAlloc(true);
    setError('');
    setSuccess('');
    try {
      await equipmentApi.allocate({
        equipmentId: selectedEq.id,
        bookingId: Number(allocForm.bookingId),
        photographerId: Number(allocForm.photographerId),
      });
      setSuccess(`Equipment "${selectedEq.name}" allocated successfully.`);
      setIsAllocateOpen(false);
      fetchEquipment();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmittingAlloc(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusEq) return;
    setUpdatingStatus(true);
    setError('');
    setSuccess('');
    try {
      await equipmentApi.updateStatus(statusEq.id, newStatus);
      setSuccess(`Equipment status updated to ${newStatus}`);
      setStatusEq(null);
      fetchEquipment();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      AVAILABLE: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
      IN_USE: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
      MAINTENANCE: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
      RETIRED: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status] || 'bg-dark-100'}`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      header: 'Equipment Name',
      accessor: 'name',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-dark-100 text-dark-700">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-dark-900">{row.name}</p>
            <p className="text-xs text-dark-400 font-mono">SN: {row.serialNumber || 'N/A'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Type / Category',
      accessor: 'type',
      sortable: true,
      cell: (row) => <span className="font-medium text-dark-800">{row.type || 'General Gear'}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'AVAILABLE' && (
            <button
              onClick={() => handleOpenAllocate(row)}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Allocate
            </button>
          )}
          <button
            onClick={() => {
              setStatusEq(row);
              setNewStatus(row.status);
            }}
            className="p-1.5 rounded-lg text-dark-500 hover:text-brand-600 hover:bg-dark-50 transition"
            title="Change Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-900">Equipment Inventory</h1>
          <p className="text-dark-500 text-sm mt-1">Track camera bodies, lenses, lighting, and gear allocations</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Equipment
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {success}
        </div>
      )}

      <DataTable
        columns={columns}
        data={equipmentList}
        loading={loading}
        emptyMessage="No equipment inventory records found"
        searchPlaceholder="Search equipment by name, type, serial number..."
        filterOptions={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'AVAILABLE', label: 'Available' },
              { value: 'IN_USE', label: 'In Use' },
              { value: 'MAINTENANCE', label: 'Maintenance' },
              { value: 'RETIRED', label: 'Retired' },
            ],
          },
        ]}
      />

      {/* Add Equipment Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Equipment">
        <form onSubmit={handleAddEquipment} className="space-y-4">
          <div>
            <label className="label">Equipment Name *</label>
            <input
              type="text"
              required
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              className="input-field"
              placeholder="e.g., Sony Alpha 7 IV"
            />
          </div>
          <div>
            <label className="label">Type / Category *</label>
            <input
              type="text"
              required
              value={addForm.type}
              onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
              className="input-field"
              placeholder="e.g., Camera Body, Lens, Drone, Flash"
            />
          </div>
          <div>
            <label className="label">Serial Number *</label>
            <input
              type="text"
              required
              value={addForm.serialNumber}
              onChange={(e) => setAddForm({ ...addForm, serialNumber: e.target.value })}
              className="input-field"
              placeholder="e.g., SN-8839201"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submittingAdd} className="btn-primary">
              {submittingAdd ? 'Registering...' : 'Register Equipment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Allocate Equipment Modal */}
      <Modal isOpen={isAllocateOpen} onClose={() => setIsAllocateOpen(false)} title={`Allocate "${selectedEq?.name}"`}>
        <form onSubmit={handleAllocateEquipment} className="space-y-4">
          <div>
            <label className="label">Select Booking *</label>
            <select
              required
              value={allocForm.bookingId}
              onChange={(e) => setAllocForm({ ...allocForm, bookingId: e.target.value })}
              className="input-field cursor-pointer"
            >
              <option value="">Select Event Booking...</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bookingReference} — {b.customerName || b.customer?.firstName} ({b.eventType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Assign Photographer *</label>
            <select
              required
              value={allocForm.photographerId}
              onChange={(e) => setAllocForm({ ...allocForm, photographerId: e.target.value })}
              className="input-field cursor-pointer"
            >
              <option value="">Select Photographer...</option>
              {photographers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({p.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <button type="button" onClick={() => setIsAllocateOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submittingAlloc} className="btn-primary">
              {submittingAlloc ? 'Allocating...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Status Modal */}
      <Modal isOpen={!!statusEq} onClose={() => setStatusEq(null)} title={`Update Status: ${statusEq?.name}`}>
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="label">Equipment Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="input-field cursor-pointer"
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="IN_USE">IN_USE</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="RETIRED">RETIRED</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <button type="button" onClick={() => setStatusEq(null)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={updatingStatus} className="btn-primary">
              {updatingStatus ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
