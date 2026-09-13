import { useState, useEffect } from 'react';
import { userApi } from '../../services/api';
import { getErrorMessage, formatDate } from '../../utils/helpers';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Users, Power, Shield, Mail, Phone, Calendar } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // View User Modal
  const [selectedUser, setSelectedUser] = useState(null);

  // Toggle Active State
  const [confirmUserToggle, setConfirmUserToggle] = useState(null);
  const [toggling, setToggling] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await userApi.getAll();
      setUsers(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async () => {
    if (!confirmUserToggle) return;
    setToggling(true);
    setError('');
    setSuccess('');
    try {
      await userApi.toggleActive(confirmUserToggle.id);
      setSuccess(`User status for ${confirmUserToggle.firstName} ${confirmUserToggle.lastName} updated successfully.`);
      setConfirmUserToggle(null);
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setToggling(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    const map = {
      COMPANY_DIRECTOR: 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20',
      OPERATIONS_MANAGER: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
      CUSTOMER_RELATIONS_OFFICER: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
      FINANCE_EXECUTIVE: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
      PHOTOGRAPHER: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
      CUSTOMER: 'bg-dark-100 text-dark-700 ring-1 ring-dark-600/20',
    };
    return map[role] || 'bg-dark-100 text-dark-600';
  };

  const columns = [
    {
      header: 'Name',
      accessor: (row) => `${row.firstName || ''} ${row.lastName || ''}`,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center font-bold text-brand-700 text-xs">
            {(row.firstName || 'U')[0]}
          </div>
          <div>
            <p className="font-semibold text-dark-900">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-dark-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      sortable: true,
      cell: (row) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeClass(row.role)}`}>
          <Shield className="w-3 h-3" />
          {row.role?.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
      cell: (row) => <span className="text-xs text-dark-700 font-mono">{row.phone || 'N/A'}</span>,
    },
    {
      header: 'Account Status',
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
            onClick={() => setSelectedUser(row)}
            className="p-1.5 rounded-lg text-dark-500 hover:text-brand-600 hover:bg-dark-50 transition"
            title="View User"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmUserToggle(row)}
            className={`p-1.5 rounded-lg transition ${
              row.isActive ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
            }`}
            title={row.isActive ? 'Deactivate User' : 'Activate User'}
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
          <h1 className="font-display text-2xl font-bold text-dark-900">User Directory</h1>
          <p className="text-dark-500 text-sm mt-1">Manage system accounts, employee roles, and access status</p>
        </div>
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
        data={users}
        loading={loading}
        emptyMessage="No users found"
        searchPlaceholder="Search users by name, email or phone..."
        filterOptions={[
          {
            key: 'role',
            label: 'Role',
            options: [
              { value: 'COMPANY_DIRECTOR', label: 'Company Director' },
              { value: 'OPERATIONS_MANAGER', label: 'Operations Manager' },
              { value: 'CUSTOMER_RELATIONS_OFFICER', label: 'CRO' },
              { value: 'FINANCE_EXECUTIVE', label: 'Finance Executive' },
              { value: 'PHOTOGRAPHER', label: 'Photographer' },
              { value: 'CUSTOMER', label: 'Customer' },
            ],
          },
        ]}
      />

      {/* View User Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Profile Details"
        maxWidth="max-w-md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-50 border border-dark-100">
              <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-bold text-lg flex items-center justify-center shadow">
                {selectedUser.firstName?.[0]}
              </div>
              <div>
                <h3 className="font-bold text-dark-900">{selectedUser.firstName} {selectedUser.lastName}</h3>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${getRoleBadgeClass(selectedUser.role)}`}>
                  {selectedUser.role?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-dark-100">
                <Mail className="w-4 h-4 text-dark-400" />
                <div>
                  <p className="text-xs text-dark-400">Email Address</p>
                  <p className="font-semibold text-dark-900">{selectedUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-dark-100">
                <Phone className="w-4 h-4 text-dark-400" />
                <div>
                  <p className="text-xs text-dark-400">Phone Number</p>
                  <p className="font-semibold text-dark-900">{selectedUser.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-dark-100">
                <Calendar className="w-4 h-4 text-dark-400" />
                <div>
                  <p className="text-xs text-dark-400">Joined Date</p>
                  <p className="font-semibold text-dark-900">{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-dark-100">
              <button onClick={() => setSelectedUser(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Deactivation */}
      <ConfirmDialog
        isOpen={!!confirmUserToggle}
        onClose={() => setConfirmUserToggle(null)}
        onConfirm={handleToggleActive}
        title={confirmUserToggle?.isActive ? 'Deactivate User Account?' : 'Activate User Account?'}
        message={`Are you sure you want to ${confirmUserToggle?.isActive ? 'deactivate' : 'activate'} access for ${confirmUserToggle?.firstName} ${confirmUserToggle?.lastName}?`}
        confirmText={confirmUserToggle?.isActive ? 'Deactivate' : 'Activate'}
        type={confirmUserToggle?.isActive ? 'danger' : 'primary'}
        loading={toggling}
      />
    </div>
  );
}
