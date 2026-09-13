import { useEffect, useState } from 'react';
import { userApi } from '../../services/api';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    userApi.getCustomers()
      .then((res) => setCustomers(res.data.data || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.firstName?.toLowerCase().includes(q) ||
      c.lastName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-900">Customers</h1>
          <p className="text-sm text-dark-500 mt-1">{customers.length} registered customers</p>
        </div>
        <input
          className="input-field max-w-xs"
          placeholder="Search name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      {filtered.length === 0 ? (
        <EmptyState title="No customers found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-100 text-left text-dark-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-dark-50/50">
                  <td className="py-3 font-medium">{c.firstName} {c.lastName}</td>
                  <td className="py-3 text-dark-600">{c.email}</td>
                  <td className="py-3 text-dark-500">{c.phone || '—'}</td>
                  <td className="py-3 text-dark-500">{formatDateTime(c.createdAt)}</td>
                  <td className="py-3">
                    <span className={c.isActive ? 'badge-completed' : 'badge-cancelled'}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
