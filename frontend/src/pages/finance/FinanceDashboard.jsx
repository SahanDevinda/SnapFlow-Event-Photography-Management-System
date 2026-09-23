import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchFinanceDashboard } from '../../services/dashboards';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatLKR, formatDate } from '../../utils/formatters';
import { DollarSign, Clock, AlertCircle, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';

export default function FinanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalRevenue: 0,
    pendingVerificationsCount: 0,
    outstandingBalanceTotal: 0,
    recentPayments: []
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const metrics = await fetchFinanceDashboard();
      setData(metrics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton count={3} className="h-32" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900">Financial Management Dashboard</h1>
          <p className="text-navy-600 text-sm">Monitor revenue collection, verify client receipts, and track aging balances.</p>
        </div>
        <Link to="/finance/pending">
          <Button variant="gold" icon={CheckCircle}>Verify Pending Receipts</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Verified Revenue</p>
            <p className="text-2xl font-bold text-navy-900">{formatLKR(data.totalRevenue)}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Pending Slip Verification</p>
            <p className="text-2xl font-bold text-navy-900">{data.pendingVerificationsCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy-500 font-medium">Outstanding Balances</p>
            <p className="text-2xl font-bold text-navy-900">{formatLKR(data.outstandingBalanceTotal)}</p>
          </div>
        </Card>
      </div>

      <Card
        title="Recent Payment Activity"
        subtitle="Last 10 payments received across all channels"
        headerAction={
          <Link to="/finance/payments" className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
            View All Ledger <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {(!data.recentPayments || data.recentPayments.length === 0) ? (
          <p className="text-xs text-navy-500 py-6 text-center">No payment records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-navy-500 uppercase text-xs">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {data.recentPayments.map(p => (
                  <tr key={p.id} className="hover:bg-navy-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-xs text-navy-900">{p.receiptOriginalName || 'N/A'}</td>
                    <td className="py-3 px-4 font-mono text-xs text-navy-700">{p.bookingRef}</td>
                    <td className="py-3 px-4 font-bold text-navy-900">{formatLKR(p.amount)}</td>
                    <td className="py-3 px-4 text-navy-600">{p.paymentType}</td>
                    <td className="py-3 px-4 text-navy-500">{formatDate(p.createdAt)}</td>
                    <td className="py-3 px-4"><Badge status={p.status} /></td>
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
