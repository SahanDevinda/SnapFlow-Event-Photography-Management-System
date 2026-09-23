import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { formatLKR } from '../../utils/formatters';

export default function CRONewBooking() {
  const navigate = useNavigate();
  const toast = useToast();

  const [customers, setCustomers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customerId: '',
    packageId: '',
    eventDate: '',
    startTime: '09:00',
    endTime: '17:00',
    venue: '',
    eventType: 'WEDDING',
    guestCount: 150,
    specialRequests: '',
    addOnIds: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, pRes, aRes] = await Promise.all([
        api.get('/users/customers'),
        api.get('/packages'),
        api.get('/add-ons')
      ]);
      setCustomers(listOf(cRes));
      setPackages(listOf(pRes));
      setAddOns(listOf(aRes));
      if (cRes.data.length > 0) setForm(prev => ({ ...prev, customerId: cRes.data[0].id }));
      if (pRes.data.length > 0) setForm(prev => ({ ...prev, packageId: pRes.data[0].id }));
    } catch (err) {
      toast.error('Failed to load customers or packages');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOnToggle = (id) => {
    setForm(prev => {
      const exists = prev.addOnIds.includes(id);
      return {
        ...prev,
        addOnIds: exists ? prev.addOnIds.filter(x => x !== id) : [...prev.addOnIds, id]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        packageId: parseInt(form.packageId),
        customerId: parseInt(form.customerId),
        eventDate: form.eventDate,
        startTime: form.startTime,
        venue: form.venue,
        eventType: form.eventType,
        // BookingCreateRequest has no endTime (derived from the package duration)
        // and no guestCount column, so the guest count goes into the notes.
        specialRequests: [`Expected guests: ${parseInt(form.guestCount) || 1}`, form.specialRequests]
          .filter(Boolean)
          .join(' | '),
        addOnIds: form.addOnIds
      };
      const res = await api.post('/bookings', payload);
      toast.success(`Booking created! Ref: ${res.data.bookingRef}`);
      navigate('/cro/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-navy-500">Loading form...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Create Booking for Client</h1>
        <p className="text-navy-600 text-sm">Register a booking manually on behalf of a walk-in or telephone client.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
              Select Client *
            </label>
            <select
              value={form.customerId}
              onChange={e => setForm({ ...form, customerId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Select Package *
              </label>
              <select
                value={form.packageId}
                onChange={e => setForm({ ...form, packageId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                {packages.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {formatLKR(p.price)}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Event Date"
              type="date"
              required
              value={form.eventDate}
              onChange={e => setForm({ ...form, eventDate: e.target.value })}
            />

            <Input
              label="Start Time"
              type="time"
              value={form.startTime}
              onChange={e => setForm({ ...form, startTime: e.target.value })}
            />

            <Input
              label="End Time"
              type="time"
              value={form.endTime}
              onChange={e => setForm({ ...form, endTime: e.target.value })}
            />

            <div className="sm:col-span-2">
              <Input
                label="Venue / Location"
                required
                value={form.venue}
                onChange={e => setForm({ ...form, venue: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-2">Add-Ons</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {addOns.map(a => (
                <label key={a.id} className="flex items-center gap-2 p-2 border border-navy-100 rounded-lg text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.addOnIds.includes(a.id)}
                    onChange={() => handleAddOnToggle(a.id)}
                    className="text-amber-500 rounded"
                  />
                  <span>{a.name} (+{formatLKR(a.price)})</span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" variant="gold" className="w-full" loading={submitting}>
            Create Client Reservation
          </Button>
        </form>
      </Card>
    </div>
  );
}
