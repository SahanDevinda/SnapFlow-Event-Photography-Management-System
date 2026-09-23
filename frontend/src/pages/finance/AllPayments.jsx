import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import { ProtectedFileLink } from '../../components/common/ProtectedImage';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatLKR, formatDate } from '../../utils/formatters';
import { Search } from 'lucide-react';

export default function AllPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments?page=0&size=100');
      setPayments(listOf(res));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter(p =>
    (p.bookingRef || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.receiptOriginalName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.transactionReference || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Payment Ledger</h1>
        <p className="text-navy-600 text-sm">Full transaction audit log across bank transfers and online settlements.</p>
      </div>

      <Card padding="p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-navy-400" />
          <input
            type="text"
            placeholder="Search by receipt #, booking ref, transaction ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <LoadingSkeleton count={5} className="h-12" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-navy-500 uppercase text-xs">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-navy-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-xs">{p.receiptOriginalName || 'N/A'}</td>
                    <td className="py-3 px-4 font-mono text-xs">{p.bookingRef}</td>
                    <td className="py-3 px-4 font-bold text-navy-900">{formatLKR(p.amount)}</td>
                    <td className="py-3 px-4 text-navy-600">{p.paymentType}</td>
                    <td className="py-3 px-4 font-mono text-xs text-navy-500">{p.transactionReference || 'N/A'}</td>
                    <td className="py-3 px-4 text-navy-500">{formatDate(p.createdAt)}</td>
                    <td className="py-3 px-4"><Badge status={p.status} /></td>
                    <td className="py-3 px-4 text-right">
                      {p.receiptOriginalName ? (
                        <ProtectedFileLink url={`/payments/${p.id}/receipt`} className="text-xs text-amber-600 font-semibold hover:underline">
                          View Slip
                        </ProtectedFileLink>
                      ) : (
                        <span className="text-xs text-navy-400">None</span>
                      )}
                    </td>
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
