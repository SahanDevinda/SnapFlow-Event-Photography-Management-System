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

export default function AddOnCrud() {
  const toast = useToast();
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    active: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAddOns();
  }, []);

  const fetchAddOns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/add-ons/all');
      setAddOns(listOf(res));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ name: '', price: '', description: '', active: true });
    setModalOpen(true);
  };

  const handleOpenEdit = (add) => {
    setEditingId(add.id);
    setForm({
      name: add.name,
      price: add.price,
      description: add.description || '',
      active: add.active !== false
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...form, price: parseFloat(form.price) };
      if (editingId) {
        await api.put(`/add-ons/${editingId}`, payload);
        toast.success('Add-on updated successfully!');
      } else {
        await api.post('/add-ons', payload);
        toast.success('Add-on created successfully!');
      }
      setModalOpen(false);
      fetchAddOns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save add-on.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (add) => {
    const action = add.active ? 'deactivate' : 'reactivate';
    if (!window.confirm(`${add.active ? 'Deactivate' : 'Reactivate'} "${add.name}"?`)) return;
    try {
      // No hard DELETE on the backend - add-ons are retired so historical
      // bookings keep resolving their line items.
      await api.patch(`/add-ons/${add.id}/${action}`);
      toast.success(`Add-on ${add.active ? 'deactivated' : 'reactivated'}.`);
      fetchAddOns();
    } catch (err) {
      toast.error(err.message || 'Failed to update add-on status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900">Add-On Options</h1>
          <p className="text-navy-600 text-sm">Manage optional extras (Drone, Pre-shoot, Leather Albums, Extra Hours).</p>
        </div>
        <Button variant="gold" icon={Plus} onClick={handleOpenCreate}>
          Create Add-On
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
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {addOns.map(a => (
                  <tr key={a.id} className="hover:bg-navy-50/50">
                    <td className="py-3 px-4 font-bold text-navy-900">{a.name}</td>
                    <td className="py-3 px-4 text-navy-600 text-xs">{a.description}</td>
                    <td className="py-3 px-4 font-semibold text-navy-900">{formatLKR(a.price)}</td>
                    <td className="py-3 px-4"><Badge status={a.active ? 'ACTIVE' : 'INACTIVE'} /></td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="xs" icon={Edit} onClick={() => handleOpenEdit(a)}>
                          Edit
                        </Button>
                        <Button
                          variant={a.active ? 'danger' : 'secondary'}
                          size="xs"
                          icon={a.active ? Trash2 : undefined}
                          onClick={() => handleToggleActive(a)}
                        >
                          {a.active ? 'Deactivate' : 'Reactivate'}
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

      {modalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit Add-On' : 'Create Add-On'}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="gold" onClick={handleSave} loading={saving}>Save Add-On</Button>
            </>
          }
        >
          <form className="space-y-4 text-sm">
            <Input
              label="Add-On Name"
              required
              placeholder="e.g. Drone Aerial 4K Coverage"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Price (LKR)"
              type="number"
              required
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows="3"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-navy-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={e => setForm({ ...form, active: e.target.checked })}
                className="rounded text-amber-500"
              />
              Active & Available in Booking Flow
            </label>
          </form>
        </Modal>
      )}
    </div>
  );
}
