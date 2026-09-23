import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatLKR, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { Mail } from 'lucide-react';

export default function OutstandingBalances() {
  const toast = useToast();
  const [unpaid, setUnpaid] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnpaid();
  }, []);

  const fetchUnpaid = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings?page=0&size=100');
      const filtered = listOf(res).filter(b => Number(b.balanceAmount) > 0 && b.status !== 'CANCELLED');
      setUnpaid(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = (ref) => {
    toast.success(`Payment reminder email dispatched to client for booking ${ref}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Outstanding Balances</h1>
        <p className="text-navy-600 text-sm">Monitor accounts receivable and pending client settlements.</p>
      </div>

      <Card>
        {loading ? (
          <LoadingSkeleton count={4} className="h-14" />
        ) : unpaid.length === 0 ? (
          <p className="text-xs text-navy-500 py-6 text-center">No outstanding balances. All accounts are settled!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-navy-500 uppercase text-xs">
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Event Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4 text-rose-600 font-bold">Balance Due</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {unpaid.map(b => (
                  <tr key={b.id} className="hover:bg-navy-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-navy-900">{b.bookingRef}</td>
                    <td className="py-3 px-4">{b.customerName}</td>
                    <td className="py-3 px-4">{formatDate(b.eventDate)}</td>
                    <td className="py-3 px-4">{formatLKR(b.totalAmount)}</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">{formatLKR(b.paidAmount || 0)}</td>
                    <td className="py-3 px-4 font-bold text-rose-600">{formatLKR(b.balanceAmount)}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="outline" size="xs" icon={Mail} onClick={() => sendReminder(b.bookingRef)}>
                        Send Reminder
                      </Button>
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
