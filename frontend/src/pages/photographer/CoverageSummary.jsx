import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export default function CoverageSummary() {
  const [stats, setStats] = useState({ totalEvents: 0, totalHours: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assignments/my?page=0&size=100');
      setStats({
        totalEvents: listOf(res).length,
        totalHours: listOf(res).length * 6
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Coverage & Activity Log</h1>
        <p className="text-navy-600 text-sm">Summary of your completed photography engagements.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <p className="text-xs text-navy-500 font-medium">Total Events Covered</p>
          <p className="text-3xl font-bold text-navy-900 mt-1">{stats.totalEvents}</p>
        </Card>
        <Card>
          <p className="text-xs text-navy-500 font-medium">Estimated On-Location Hours</p>
          <p className="text-3xl font-bold text-navy-900 mt-1">{stats.totalHours} hrs</p>
        </Card>
      </div>
    </div>
  );
}
