import { useState, useEffect } from 'react';
import { addOnApi } from '../../services/api';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Plus, Edit2, Power, Tag } from 'lucide-react';

export default function ManageAddOns() {
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', isActive: true });
  const [submitting, setSubmitting] = useState(false);

  // Deactivate state
  const [confirmAddOn, setConfirmAddOn] = useState(null);

  const fetchAddOns = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await addOnApi.getAll();
      setAddOns(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddOns();
  }, []);

  const handleOpenCreate = () => {
    setEditingAddOn(null);
    setForm({ name: '', description: '', price: '', isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addon) => {
    setEditingAddOn(addon);
    setForm({
      name: addon.name,
      description: addon.description || '',
      price: addon.price,
      isActive: addon.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (editingAddOn) {
        await addOnApi.update(editingAddOn.id, form);
        setSuccess('Add-on updated successfully');
      } else {
        await addOnApi.create(form);
        setSuccess('Add-on created successfully');
      }
      setIsModalOpen(false);
      fetchAddOns();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleDeactivate = async () => {
    if (!confirmAddOn) return;
    setSubmitting(true);
    try {
      if (confirmAddOn.isActive) {
        await addOnApi.deactivate(confirmAddOn.id);
        setSuccess('Add-on deactivated successfully');
      } else {
        await addOnApi.update(confirmAddOn.id, { isActive: true });
        setSuccess('Add-on activated successfully');
      }
      setConfirmAddOn(null);
      fetchAddOns();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-dark-900">{row.name}</p>
            <p className="text-xs text-dark-400 max-w-xs truncate">{row.description}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      sortable: true,
      cell: (row) => <span className="font-semibold text-dark-900">{formatCurrency(row.price)}</span>,
    },
    {
      header: 'Status',
      accessor: 'isActive',
      cell: (row) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          row.isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
        }`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-dark-500 hover:text-brand-600 hover:bg-dark-50 transition"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmAddOn(row)}
            className={`p-1.5 rounded-lg transition ${
              row.isActive ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
            }`}
            title={row.isActive ? 'Deactivate' : 'Activate'}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-900">Add-on Management</h1>
          <p className="text-dark-500 text-sm mt-1">Create and manage optional photography add-on services</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Add-on
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
        data={addOns}
        loading={loading}
        emptyMessage="No add-ons created yet"
        searchPlaceholder="Search add-ons by name..."
      />

      {/* Modal for Create / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddOn ? 'Edit Add-on' : 'Create New Add-on'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Add-on Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="e.g., Drone Videography"
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field"
              placeholder="Detailed description of what is included in this add-on..."
            />
          </div>

          <div>
            <label className="label">Price (LKR) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="input-field"
              placeholder="e.g., 25000"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
            />
            <label htmlFor="isActive" className="text-sm text-dark-700 font-medium cursor-pointer">
              Active and available for bookings
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : editingAddOn ? 'Update Add-on' : 'Create Add-on'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Deactivation */}
      <ConfirmDialog
        isOpen={!!confirmAddOn}
        onClose={() => setConfirmAddOn(null)}
        onConfirm={handleToggleDeactivate}
        title={confirmAddOn?.isActive ? 'Deactivate Add-on?' : 'Activate Add-on?'}
        message={`Are you sure you want to ${confirmAddOn?.isActive ? 'deactivate' : 'activate'} "${confirmAddOn?.name}"?`}
        confirmText={confirmAddOn?.isActive ? 'Deactivate' : 'Activate'}
        type={confirmAddOn?.isActive ? 'danger' : 'primary'}
        loading={submitting}
      />
    </div>
  );
}
