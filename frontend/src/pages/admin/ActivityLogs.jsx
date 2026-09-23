import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatDate } from '../../utils/formatters';
import { Shield, Activity } from 'lucide-react';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/activity-logs?page=0&size=100');
      setLogs(listOf(res));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">System Audit Logs</h1>
        <p className="text-navy-600 text-sm">Security and transaction trail tracking all administrative and financial actions.</p>
      </div>

      <Card>
        {loading ? (
          <LoadingSkeleton count={5} className="h-12" />
        ) : logs.length === 0 ? (
          <p className="text-xs text-navy-500 py-6 text-center">No audit logs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-navy-500 uppercase text-xs">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-navy-50/50">
                    <td className="py-3 px-4 text-xs font-mono text-navy-500">{formatDate(log.createdAt)}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold text-navy-800 bg-navy-100 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">{log.userName || log.userEmail || 'System'}</td>
                    <td className="py-3 px-4 text-xs font-mono">{log.details}</td>
                    <td className="py-3 px-4 text-xs text-navy-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
