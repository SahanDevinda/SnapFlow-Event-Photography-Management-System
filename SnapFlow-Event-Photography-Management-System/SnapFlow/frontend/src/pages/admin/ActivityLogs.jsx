import { useState, useEffect } from 'react';
import { activityLogApi } from '../../services/api';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';
import DataTable from '../../components/DataTable';
import { Activity, User, Clock, Info } from 'lucide-react';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await activityLogApi.getRecent();
      setLogs(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-dark-500 font-mono">
          <Clock className="w-3.5 h-3.5 text-dark-400" />
          <span>{formatDateTime(row.createdAt)}</span>
        </div>
      ),
    },
    {
      header: 'User',
      accessor: (row) => row.user ? `${row.user.firstName || ''} ${row.user.lastName || ''}` : 'System',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-dark-100 flex items-center justify-center text-[10px] font-bold text-dark-700">
            <User className="w-3 h-3 text-dark-500" />
          </div>
          <div>
            <p className="font-semibold text-dark-900 text-xs">
              {row.user ? `${row.user.firstName} ${row.user.lastName}` : 'System Engine'}
            </p>
            <p className="text-[11px] text-dark-400">{row.user?.email || 'Automated'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      sortable: true,
      cell: (row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 ring-1 ring-brand-600/20">
          {row.action}
        </span>
      ),
    },
    {
      header: 'Target Entity',
      accessor: 'entityType',
      cell: (row) => (
        <span className="text-xs font-mono font-medium text-dark-700">
          {row.entityType} {row.entityId ? `#${row.entityId}` : ''}
        </span>
      ),
    },
    {
      header: 'Details',
      accessor: 'details',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-dark-600 max-w-md">
          <Info className="w-3.5 h-3.5 text-dark-400 shrink-0" />
          <span className="truncate">{row.details || 'N/A'}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-600" /> System Activity Audit Log
          </h1>
          <p className="text-dark-500 text-sm mt-1">Real-time immutable trail of system transactions and staff actions</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        emptyMessage="No activity logs registered yet"
        searchPlaceholder="Search audit trail by user, action, entity..."
      />
    </div>
  );
}
