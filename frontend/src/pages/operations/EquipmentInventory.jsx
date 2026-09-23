import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Archive, RefreshCw, Wrench } from 'lucide-react';

const CATEGORIES = [
  { value: 'CAMERA_BODY', label: 'Camera Body' },
  { value: 'LENS', label: 'Lens' },
  { value: 'LIGHTING', label: 'Lighting Equipment' },
  { value: 'DRONE', label: 'Drone' },
  { value: 'AUDIO', label: 'Audio Setup' },
  { value: 'ACCESSORY', label: 'Accessory / Gimbal' }
];

const EMPTY_FORM = { name: '', category: 'CAMERA_BODY', serialNumber: '', status: 'AVAILABLE' };

export default function EquipmentInventory() {
  const toast = useToast();
  const { user } = useAuth();
  const isDirector = user?.role === 'COMPANY_DIRECTOR';

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit modal
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = Add mode
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Retire confirmation
  const [retireTarget, setRetireTarget] = useState(null);
  const [retiring, setRetiring] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const res = await api.get('/equipment?page=0&size=200');
      setEquipment(listOf(res));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModal(true);
  };

  const openEdit = (item) => {
    setEditTarget(item);
    setForm({
      name: item.name,
      category: item.category,
      serialNumber: item.serialNumber || '',
      status: item.status
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Equipment name is required.');
      return;
    }
    try {
      setSaving(true);
      if (editTarget) {
        await api.put(`/equipment/${editTarget.id}`, form);
        toast.success('Equipment updated successfully!');
      } else {
        await api.post('/equipment', form);
        toast.success('Equipment item added successfully!');
      }
      setModal(false);
      fetchEquipment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save equipment.');
    } finally {
      setSaving(false);
    }
  };

  const handleRetire = async () => {
    if (!retireTarget) return;
    try {
      setRetiring(true);
      await api.patch(`/equipment/${retireTarget.id}/retire`);
      toast.success(`"${retireTarget.name}" has been retired.`);
      setRetireTarget(null);
      fetchEquipment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to retire equipment.');
    } finally {
      setRetiring(false);
    }
  };

  const handleReactivate = async (item) => {
    try {
      await api.patch(`/equipment/${item.id}/reactivate`);
      toast.success(`"${item.name}" has been reactivated.`);
      fetchEquipment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reactivate equipment.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900">Equipment Inventory</h1>
          <p className="text-navy-600 text-sm">Track camera bodies, prime lenses, drones, and lighting setups.</p>
        </div>
        <Button variant="gold" icon={Plus} onClick={openAdd}>
          Add Gear
        </Button>
      </div>

      <Card>
        {loading ? (
          <LoadingSkeleton count={4} className="h-14" />
        ) : equipment.length === 0 ? (
          <div className="py-12 text-center">
            <Wrench className="w-10 h-10 text-navy-300 mx-auto mb-3" />
            <p className="text-navy-400 text-sm">No equipment recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-navy-500 uppercase text-xs">
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Serial #</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {equipment.map(item => (
                  <tr key={item.id} className="hover:bg-navy-50/50">
                    <td className="py-3 px-4 font-semibold text-navy-900">{item.name}</td>
                    <td className="py-3 px-4 text-navy-600 text-xs">
                      {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-navy-500">{item.serialNumber || '—'}</td>
                    <td className="py-3 px-4"><Badge status={item.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5 justify-end flex-wrap">
                        {item.status !== 'ALLOCATED' && (
                          <Button
                            variant="secondary"
                            size="xs"
                            icon={Edit2}
                            onClick={() => openEdit(item)}
                          >
                            Edit
                          </Button>
                        )}
                        {/* Retire / Reactivate — backend enforces COMPANY_DIRECTOR */}
                        {isDirector && item.status !== 'RETIRED' && item.status !== 'ALLOCATED' && (
                          <Button
                            variant="danger"
                            size="xs"
                            icon={Archive}
                            onClick={() => setRetireTarget(item)}
                          >
                            Retire
                          </Button>
                        )}
                        {isDirector && item.status === 'RETIRED' && (
                          <Button
                            variant="gold"
                            size="xs"
                            icon={RefreshCw}
                            onClick={() => handleReactivate(item)}
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Modal */}
      {modal && (
        <Modal
          isOpen={true}
          onClose={() => setModal(false)}
          title={editTarget ? `Edit — ${editTarget.name}` : 'Add New Equipment'}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
              <Button variant="gold" onClick={handleSave} loading={saving}>
                {editTarget ? 'Save Changes' : 'Add Item'}
              </Button>
            </>
          }
        >
          <form className="space-y-4 text-sm">
            <Input
              label="Equipment Name"
              required
              placeholder="e.g. Sony A7 IV Mirrorless"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="Serial Number"
              placeholder="e.g. SN-89410294"
              value={form.serialNumber}
              onChange={e => setForm({ ...form, serialNumber: e.target.value })}
            />
            {editTarget && (
              <div>
                <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="MAINTENANCE">Under Maintenance</option>
                </select>
              </div>
            )}
          </form>
        </Modal>
      )}

      {/* Retire Confirmation Modal */}
      {retireTarget && (
        <Modal
          isOpen={true}
          onClose={() => setRetireTarget(null)}
          title="Retire Equipment"
          footer={
            <>
              <Button variant="secondary" onClick={() => setRetireTarget(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleRetire} loading={retiring}>Confirm Retire</Button>
            </>
          }
        >
          <div className="space-y-2 text-sm">
            <p className="text-navy-700">
              Are you sure you want to retire{' '}
              <span className="font-bold">"{retireTarget.name}"</span>?
            </p>
            <p className="text-navy-500 text-xs">
              Retired equipment will be removed from allocation availability. It can be reactivated later.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
