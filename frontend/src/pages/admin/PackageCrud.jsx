import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { formatLKR } from '../../utils/formatters';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function PackageCrud() {
  const toast = useToast();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    category: 'WEDDING',
    price: '',
    description: '',
    durationHours: 8,
    photographersCount: 2,
    editedPhotosCount: 200,
    features: '',
    active: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/packages/all');
      setPackages(listOf(res));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      name: '',
      category: 'WEDDING',
      price: '',
      description: '',
      durationHours: 8,
      photographersCount: 2,
      editedPhotosCount: 200,
      features: '',
      active: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingId(pkg.id);
    setForm({
      name: pkg.name,
      category: pkg.category,
      price: pkg.price,
      description: pkg.description || '',
      durationHours: pkg.durationHours || 8,
      photographersCount: 2,
      editedPhotosCount: 200,
      features: Array.isArray(pkg.features) ? pkg.features.join('\n') : (pkg.features || ''),
      active: pkg.active !== false
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Crew size and edited-photo count are not stored as columns, so they are
      // appended to the features text rather than silently dropped.
      const extraFeatures = [
        `${form.photographersCount} photographer(s)`,
        `${form.editedPhotosCount} edited photos`
      ];
      const featureLines = [
        ...form.features.split('\n').map(l => l.trim()).filter(Boolean),
        ...extraFeatures
      ];

      const payload = {
        name: form.name.trim(),
        description: form.description || '',
        category: form.category,
        price: parseFloat(form.price),
        durationHours: parseInt(form.durationHours, 10),
        features: featureLines.join('\n'),
        active: form.active
      };

      if (editingId) {
        await api.put(`/packages/${editingId}`, payload);
        toast.success('Package updated successfully!');
      } else {
        await api.post('/packages', payload);
        toast.success('Package created successfully!');
      }
      setModalOpen(false);
      fetchPackages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save package.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (pkg) => {
    const action = pkg.active ? 'deactivate' : 'reactivate';
    if (!window.confirm(`${pkg.active ? 'Deactivate' : 'Reactivate'} "${pkg.name}"?`)) return;
    try {
      // The backend has no hard DELETE - packages are retired, not removed,
      // so existing bookings keep referencing them.
      await api.patch(`/packages/${pkg.id}/${action}`);
      toast.success(`Package ${pkg.active ? 'deactivated' : 'reactivated'}.`);
      fetchPackages();
    } catch (err) {
      toast.error(err.message || 'Failed to update package status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900">Package Management</h1>
          <p className="text-navy-600 text-sm">Configure photography tiers, pricing, and inclusions.</p>
        </div>
        <Button variant="gold" icon={Plus} onClick={handleOpenCreate}>
          Create Package
        </Button>
      </div>

      <Card>
        {loading ? (
          <LoadingSkeleton count={4} className="h-16" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-navy-500 uppercase text-xs">
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {packages.map(p => (
                  <tr key={p.id} className="hover:bg-navy-50/50">
                    <td className="py-3 px-4 font-bold text-navy-900">{p.name}</td>
                    <td className="py-3 px-4 text-navy-600">{p.category}</td>
                    <td className="py-3 px-4 font-semibold text-navy-900">{formatLKR(p.price)}</td>
                    <td className="py-3 px-4 text-xs text-navy-500">{p.durationHours} hrs</td>
                    <td className="py-3 px-4">
                      <Badge status={p.active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="xs" icon={Edit} onClick={() => handleOpenEdit(p)}>
                          Edit
                        </Button>
                        <Button
                          variant={p.active ? 'danger' : 'secondary'}
                          size="xs"
                          icon={p.active ? Trash2 : undefined}
                          onClick={() => handleToggleActive(p)}
                        >
                          {p.active ? 'Deactivate' : 'Reactivate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Package Form Modal */}
      {modalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit Package' : 'Create New Package'}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="gold" onClick={handleSave} loading={saving}>Save Package</Button>
            </>
          }
        >
          <form className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Package Name"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="Base Price (LKR)"
                type="number"
                required
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="WEDDING">Wedding & Homecoming</option>
                <option value="BIRTHDAY">Birthday Celebration</option>
                <option value="CORPORATE">Corporate Conference</option>
                <option value="GRADUATION">Graduation & Portrait</option>
                <option value="MATERNITY">Maternity & Newborn</option>
                <option value="COMMERCIAL">Commercial & Fashion</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Hours"
                type="number"
                value={form.durationHours}
                onChange={e => setForm({ ...form, durationHours: e.target.value })}
              />
              <Input
                label="Shooters"
                type="number"
                value={form.photographersCount}
                onChange={e => setForm({ ...form, photographersCount: e.target.value })}
              />
              <Input
                label="Edited Photos"
                type="number"
                value={form.editedPhotosCount}
                onChange={e => setForm({ ...form, editedPhotosCount: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Features List (One per line)
              </label>
              <textarea
                rows="4"
                placeholder="Full ceremony coverage&#10;Drone aerial photography&#10;High-resolution cloud album"
                value={form.features}
                onChange={e => setForm({ ...form, features: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-navy-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm({ ...form, active: e.target.checked })}
                  className="rounded text-amber-500"
                />
                Active & Visible to Clients
              </label>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
