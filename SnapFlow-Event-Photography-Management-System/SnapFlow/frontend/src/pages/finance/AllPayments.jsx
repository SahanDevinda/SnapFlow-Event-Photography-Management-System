import { useEffect, useState } from 'react';
import { paymentApi } from '../../services/api';
import { formatCurrency, formatDateTime, getErrorMessage } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import { CreditCard, DollarSign } from 'lucide-react';

export default function AllPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    paymentApi.getAll()
      .then((res) => setPayments(res.data.data || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      header: 'Booking Ref',
      accessor: (row) => row.bookingReference || row.bookingRef,
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-brand-700">
          {row.bookingReference || row.bookingRef}
        </span>
      ),
    },
    {
      header: 'Amount (LKR)',
      accessor: 'amount',
      sortable: true,
      cell: (row) => <span className="font-bold text-dark-900">{formatCurrency(row.amount)}</span>,
    },
    {
      header: 'Type',
      accessor: 'paymentType',
      sortable: true,
      cell: (row) => <span className="font-medium text-dark-700">{row.paymentType}</span>,
    },
    {
      header: 'Method',
      accessor: 'paymentMethod',
      cell: (row) => <span className="text-dark-600 font-mono text-xs">{row.paymentMethod || 'BANK_TRANSFER'}</span>,
    },
    {
      header: 'Status',
      accessor: (row) => row.verificationStatus || row.status,
      sortable: true,
      cell: (row) => <StatusBadge status={row.verificationStatus || row.status} />,
    },
    {
      header: 'Date & Time',
      accessor: 'createdAt',
      sortable: true,
      cell: (row) => <span className="text-xs text-dark-500 font-mono">{formatDateTime(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-dark-900">Financial Transaction Audit</h1>
        <p className="text-sm text-dark-500 mt-1">Master log of all payments, deposits, and verification status</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        emptyMessage="No payment records found"
        searchPlaceholder="Search by booking ref, method, or type..."
        filterOptions={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'VERIFIED', label: 'Verified' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'REJECTED', label: 'Rejected' },
            ],
          },
        ]}
      />
    </div>
  );
}
