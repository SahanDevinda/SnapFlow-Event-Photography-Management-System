import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { Search, Mail, Phone, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/customers');
      setCustomers(listOf(res));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(c =>
    (c.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Client Directory</h1>
        <p className="text-navy-600 text-sm">View registered clients and manage contact communications.</p>
      </div>

      <Card padding="p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-navy-400" />
          <input
            type="text"
            placeholder="Search by client name, email, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </Card>

      {loading ? (
        <LoadingSkeleton count={4} className="h-24" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <Card key={c.id} className="hover:border-navy-300 transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-navy-100 text-navy-800 font-bold flex items-center justify-center">
                  {c.fullName?.charAt(0) || 'C'}
                </div>
                <div>
                  <h4 className="font-bold text-navy-900 text-sm">{c.fullName}</h4>
                  <Badge status={c.active ? 'ACTIVE' : 'INACTIVE'} />
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-navy-600">
                <p className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                  <span>{c.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                  <span>{c.phone || 'No phone recorded'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                  <span>Joined {formatDate(c.createdAt)}</span>
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
