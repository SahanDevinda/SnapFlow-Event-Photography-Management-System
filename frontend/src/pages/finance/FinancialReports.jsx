import React, { useState } from 'react';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { Download } from 'lucide-react';

/**
 * The export buttons previously only fired a success toast and downloaded
 * nothing. They now call GET /payments/export, which streams a real CSV.
 */
export default function FinancialReports() {
  const toast = useToast();
  const [range, setRange] = useState({ startDate: '', endDate: '' });
  const [exporting, setExporting] = useState('');

  const handleExportCSV = async (reportName, status) => {
    try {
      setExporting(reportName);

      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (range.startDate) params.append('startDate', `${range.startDate}T00:00:00`);
      if (range.endDate) params.append('endDate', `${range.endDate}T23:59:59`);

      const query = params.toString();
      const res = await api.get(`/payments/export${query ? `?${query}` : ''}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `snapflow-${reportName.toLowerCase().replace(/\s+/g, '-')}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${reportName} exported successfully.`);
    } catch (err) {
      toast.error(err.message || `Could not export ${reportName}.`);
    } finally {
      setExporting('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Financial Reports &amp; Exports</h1>
        <p className="text-navy-600 text-sm">
          Download revenue statements, booking summaries, and tax sheets as CSV.
        </p>
      </div>

      <Card title="Report Period" subtitle="Leave both dates blank to export all payments on record.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="From"
            type="date"
            value={range.startDate}
            onChange={(e) => setRange({ ...range, startDate: e.target.value })}
          />
          <Input
            label="To"
            type="date"
            value={range.endDate}
            onChange={(e) => setRange({ ...range, endDate: e.target.value })}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card title="Verified Revenue Report">
          <p className="text-xs text-navy-500 mb-4">
            Every verified advance payment and final settlement in the selected period.
          </p>
          <Button
            variant="gold"
            size="sm"
            icon={Download}
            loading={exporting === 'Verified Revenue'}
            onClick={() => handleExportCSV('Verified Revenue', 'VERIFIED')}
          >
            Export Verified Revenue (.CSV)
          </Button>
        </Card>

        <Card title="Full Transaction Ledger">
          <p className="text-xs text-navy-500 mb-4">
            All payment records including pending and rejected submissions, for audit purposes.
          </p>
          <Button
            variant="gold"
            size="sm"
            icon={Download}
            loading={exporting === 'Transaction Ledger'}
            onClick={() => handleExportCSV('Transaction Ledger', null)}
          >
            Export Full Ledger (.CSV)
          </Button>
        </Card>
      </div>
    </div>
  );
}
