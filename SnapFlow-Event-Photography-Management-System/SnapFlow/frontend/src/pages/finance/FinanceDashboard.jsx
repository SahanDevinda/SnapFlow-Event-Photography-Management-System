import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { paymentApi, dashboardApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';
import { DollarSign, Clock, CreditCard, ArrowRight } from 'lucide-react';

export default function FinanceDashboard() {
  const [pending, setPending] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      paymentApi.getPending().catch(() => ({ data: { data: [] } })),
      dashboardApi.summary().catch(() => ({ data: { data: null } })),
    ])
      .then(([pRes, dRes]) => {
        setPending(pRes.data.data || []);
        setSummary(dRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-dark-900">Financial Command Center</h1>
        <p className="text-sm text-dark-500 mt-1">Audit verified revenues, pending receipts, and outstanding booking balances</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Verified Revenue"
          value={formatCurrency(summary?.totalRevenue ?? 0)}
          subtitle="Net verified income"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Outstanding Balances"
          value={formatCurrency(summary?.outstandingPayments ?? 0)}
          subtitle="Pending customer final payments"
          icon={CreditCard}
          color="red"
        />
        <StatCard
          title="Pending Verifications"
          value={pending.length}
          subtitle="Bank deposit receipts queue"
          icon={Clock}
          color="amber"
        />
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-dark-900">Receipts Awaiting Verification</h2>
            <p className="text-xs text-dark-500">Bank transfers and deposit confirmations</p>
          </div>
          <Link to="/finance/pending" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
            Verification Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pending.length === 0 ? (
          <p className="text-sm text-dark-400 py-6 text-center">No payment receipts currently awaiting verification.</p>
        ) : (
          <div className="divide-y divide-dark-100">
            {pending.slice(0, 5).map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-dark-900">{p.bookingReference || p.bookingRef} · {formatCurrency(p.amount)}</p>
                  <p className="text-xs text-dark-500">{p.paymentType} · Submitted {formatDate(p.createdAt)}</p>
                </div>
                <StatusBadge status={p.verificationStatus || p.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
