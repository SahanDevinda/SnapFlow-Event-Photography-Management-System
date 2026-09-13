import { useEffect, useState } from 'react';
import { packageApi } from '../../services/api';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Package, Plus, Edit2, Power } from 'lucide-react';

const emptyForm = { name: '', description: '', price: '', durationHours: '', features: '', eventCategory: 'WEDDING', isActive: true };

export default function ManagePackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Deactivate state
  const [confirmPkg, setConfirmPkg] = useState(null);

  const loadPackages = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await packageApi.getAll();
      setPackages(res.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPackages(); }, []);

  const openCreate = () => {
    setEditingPackage(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (pkg) => {
    setEditingPackage(pkg);
    setForm({
      name: pkg.name || '',
      description: pkg.description || '',
      price: pkg.price ?? '',
      durationHours: pkg.durationHours ?? '',
      features: pkg.features || '',
      eventCategory: pkg.eventCategory || 'WEDDING',
      isActive: pkg.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    const payload = {
      ...form,
      price: Number(form.price),
      durationHours: form.durationHours ? Number(form.durationHours) : null,
    };
    try {
      if (editingPackage) {
        await packageApi.update(editingPackage.id, payload);
        setSuccess('Photography package updated successfully');
      } else {
        await packageApi.create(payload);
        setSuccess('Photography package created successfully');
      }
      setIsModalOpen(false);
      loadPackages();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleDeactivate = async () => {
    if (!confirmPkg) return;
    setSubmitting(true);
    try {
      if (confirmPkg.isActive) {
        await packageApi.deactivate(confirmPkg.id);
        setSuccess('Package deactivated successfully');
      } else {
        await packageApi.update(confirmPkg.id, { isActive: true });
        setSuccess('Package activated successfully');
      }
      setConfirmPkg(null);
      loadPackages();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Package Name',
      accessor: 'name',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-dark-900">{row.name}</p>
            <p className="text-xs text-dark-400 max-w-xs truncate">{row.description}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'eventCategory',
      sortable: true,
      cell: (row) => <span className="font-medium text-xs text-dark-700 bg-dark-50 px-2 py-1 rounded border border-dark-100">{row.eventCategory || 'All Events'}</span>,
    },
    {
      header: 'Duration',
      accessor: 'durationHours',
      sortable: true,
      cell: (row) => <span className="text-dark-700 font-medium">{row.durationHours ? `${row.durationHours} Hours` : 'Custom'}</span>,
    },
    {
      header: 'Price (LKR)',
      accessor: 'price',
      sortable: true,
      cell: (row) => <span className="font-bold text-dark-900">{formatCurrency(row.price)}</span>,
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
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg text-dark-500 hover:text-brand-600 hover:bg-dark-50 transition"
            title="Edit Package"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmPkg(row)}
            className={`p-1.5 rounded-lg transition ${
              row.isActive ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
            }`}
            title={row.isActive ? 'Deactivate Package' : 'Activate Package'}
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
          <h1 className="font-display text-2xl font-bold text-dark-900">Package Management</h1>
          <p className="text-dark-500 text-sm mt-1">Configure event photography pricing, inclusions, and coverage durations</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Package
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
        data={packages}
        loading={loading}
        emptyMessage="No photography packages created yet"
        searchPlaceholder="Search packages by name or category..."
      />

      {/* Modal for Create / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPackage ? 'Edit Package' : 'Create New Package'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Package Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="e.g., Royal Sapphire Wedding Package"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Price (LKR) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-field"
                placeholder="e.g., 185000"
              />
            </div>
            <div>
              <label className="label">Duration (Hours)</label>
              <input
                type="number"
                value={form.durationHours}
                onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
                className="input-field"
                placeholder="e.g., 8"
              />
            </div>
          </div>

          <div>
            <label className="label">Event Category</label>
            <select
              value={form.eventCategory}
              onChange={(e) => setForm({ ...form, eventCategory: e.target.value })}
              className="input-field cursor-pointer"
            >
              <option value="WEDDING">Wedding & Engagement</option>
              <option value="CORPORATE">Corporate & Conference</option>
              <option value="PORTRAIT">Portrait & Fashion</option>
              <option value="BIRTHDAY">Birthday & Party</option>
              <option value="CONCERT">Concert & Stage</option>
            </select>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field"
              placeholder="Summary of what this package offers..."
            />
          </div>

          <div>
            <label className="label">Features Bullet Points (comma-separated)</label>
            <input
              type="text"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              placeholder="2 Photographers, Full Day Coverage, USB Drive, Online Album"
              className="input-field"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActivePkg"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
            />
            <label htmlFor="isActivePkg" className="text-sm text-dark-700 font-medium cursor-pointer">
              Active and visible on public website & booking form
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : editingPackage ? 'Update Package' : 'Create Package'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Deactivation */}
      <ConfirmDialog
        isOpen={!!confirmPkg}
        onClose={() => setConfirmPkg(null)}
        onConfirm={handleToggleDeactivate}
        title={confirmPkg?.isActive ? 'Deactivate Package?' : 'Activate Package?'}
        message={`Are you sure you want to ${confirmPkg?.isActive ? 'deactivate' : 'activate'} "${confirmPkg?.name}"?`}
        confirmText={confirmPkg?.isActive ? 'Deactivate' : 'Activate'}
        type={confirmPkg?.isActive ? 'danger' : 'primary'}
        loading={submitting}
      />
    </div>
  );
}
