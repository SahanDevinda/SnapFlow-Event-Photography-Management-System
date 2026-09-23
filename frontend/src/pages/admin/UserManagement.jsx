import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import { UserPlus, Edit2, Search } from 'lucide-react';

const ROLES = [
  { value: 'CUSTOMER_RELATIONS_OFFICER', label: 'Customer Relations Officer (CRO)' },
  { value: 'OPERATIONS_MANAGER', label: 'Operations Manager' },
  { value: 'PHOTOGRAPHER', label: 'Photographer' },
  { value: 'FINANCE_EXECUTIVE', label: 'Finance Executive' },
  { value: 'COMPANY_DIRECTOR', label: 'Company Director / Admin' }
];

export default function UserManagement() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create modal
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '', email: '', phone: '', password: '', role: 'PHOTOGRAPHER'
  });
  const [creating, setCreating] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '', phone: '', role: '', active: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users?page=0&size=200');
      setUsers(listOf(res));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await api.post('/users', createForm);
      toast.success('Staff user created successfully!');
      setCreateModal(false);
      setCreateForm({ fullName: '', email: '', phone: '', password: '', role: 'PHOTOGRAPHER' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (u) => {
    setEditTarget(u);
    setEditForm({
      fullName: u.fullName,
      phone: u.phone || '',
      role: u.role,
      active: u.active
    });
    setEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.fullName.trim()) {
      toast.error('Full name is required.');
      return;
    }
    try {
      setSaving(true);
      await api.put(`/users/${editTarget.id}`, editForm);
      toast.success('User updated successfully!');
      setEditModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const toggleUserStatus = async (id, currentActive) => {
    try {
      await api.patch(`/users/${id}/${currentActive ? 'deactivate' : 'reactivate'}`);
      toast.success(`User ${currentActive ? 'deactivated' : 'activated'} successfully.`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to change user status.');
    }
  };

  const filtered = users.filter(u =>
    (u.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900">User Account Management</h1>
          <p className="text-navy-600 text-sm">Create staff profiles, configure system permissions, and audit access.</p>
        </div>
        <Button variant="gold" icon={UserPlus} onClick={() => setCreateModal(true)}>
          Create Staff Account
        </Button>
      </div>

      <Card padding="p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-navy-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <LoadingSkeleton count={5} className="h-14" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-navy-500 uppercase text-xs">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-navy-50/50">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-navy-900">{u.fullName}</p>
                      <p className="text-xs text-navy-400">{u.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-navy-100 text-navy-800 rounded">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-navy-600">{u.phone || 'N/A'}</td>
                    <td className="py-3 px-4 text-xs text-navy-500">{formatDate(u.createdAt)}</td>
                    <td className="py-3 px-4">
                      <Badge status={u.active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5 justify-end flex-wrap">
                        <Button
                          variant="secondary"
                          size="xs"
                          icon={Edit2}
                          onClick={() => openEdit(u)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant={u.active ? 'danger' : 'gold'}
                          size="xs"
                          onClick={() => toggleUserStatus(u.id, u.active)}
                        >
                          {u.active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-navy-400 text-sm">
                      No users match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Staff Account Modal */}
      {createModal && (
        <Modal
          isOpen={true}
          onClose={() => setCreateModal(false)}
          title="Create Staff Account"
          footer={
            <>
              <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
              <Button variant="gold" onClick={handleCreateStaff} loading={creating}>Create Account</Button>
            </>
          }
        >
          <form className="space-y-4 text-sm">
            <Input
              label="Full Name"
              required
              value={createForm.fullName}
              onChange={e => setCreateForm({ ...createForm, fullName: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={createForm.email}
              onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
            />
            <Input
              label="Temporary Password"
              type="password"
              required
              value={createForm.password}
              onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
            />
            <Input
              label="Phone Number"
              value={createForm.phone}
              onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Role & Privileges
              </label>
              <select
                value={createForm.role}
                onChange={e => setCreateForm({ ...createForm, role: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit User Modal */}
      {editModal && editTarget && (
        <Modal
          isOpen={true}
          onClose={() => setEditModal(false)}
          title={`Edit User — ${editTarget.fullName}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditModal(false)}>Cancel</Button>
              <Button variant="gold" onClick={handleSaveEdit} loading={saving}>Save Changes</Button>
            </>
          }
        >
          <form className="space-y-4 text-sm">
            <Input
              label="Full Name"
              required
              value={editForm.fullName}
              onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
            />
            <Input
              label="Phone Number"
              value={editForm.phone}
              onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Role & Privileges
              </label>
              <select
                value={editForm.role}
                onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="editActive"
                checked={editForm.active}
                onChange={e => setEditForm({ ...editForm, active: e.target.checked })}
                className="w-4 h-4 rounded border-navy-300 accent-amber-500"
              />
              <label htmlFor="editActive" className="text-xs font-semibold text-navy-700 uppercase tracking-wider">
                Account Active
              </label>
            </div>
            <p className="text-xs text-navy-400">Email: <span className="font-mono">{editTarget.email}</span> (cannot be changed)</p>
          </form>
        </Modal>
      )}
    </div>
  );
}
