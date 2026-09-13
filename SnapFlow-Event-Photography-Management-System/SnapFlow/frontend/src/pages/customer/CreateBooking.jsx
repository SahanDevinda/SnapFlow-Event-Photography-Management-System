import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { packageApi, addOnApi, bookingApi } from '../../services/api';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Calendar, MapPin, Tag, Sparkles, CheckCircle } from 'lucide-react';

export default function CreateBooking() {
  const [searchParams] = useSearchParams();
  const preselectedPkgId = searchParams.get('packageId') || '';

  const [packages, setPackages] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [form, setForm] = useState({
    packageId: preselectedPkgId,
    eventDate: '',
    eventTime: '',
    venue: '',
    eventType: 'Wedding',
    specialRequests: '',
    addOnIds: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([packageApi.getActive(), addOnApi.getActive()])
      .then(([pkgRes, addRes]) => {
        setPackages(pkgRes.data.data || []);
        setAddOns(addRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectedPkg = packages.find((p) => p.id === Number(form.packageId));
  const selectedAddOns = addOns.filter((a) => form.addOnIds.includes(a.id));
  const total = (selectedPkg?.price || 0) + selectedAddOns.reduce((s, a) => s + Number(a.price), 0);

  const toggleAddOn = (id) => {
    setForm((f) => ({
      ...f,
      addOnIds: f.addOnIds.includes(id) ? f.addOnIds.filter((x) => x !== id) : [...f.addOnIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        packageId: Number(form.packageId),
        addOnIds: form.addOnIds,
      };
      await bookingApi.create(payload);
      navigate('/customer/bookings');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-dark-900">Request Event Booking</h1>
        <p className="text-dark-500 text-sm mt-1">Select your preferred photography package, event details, and add-ons</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="label">Select Package *</label>
          <select
            className="input-field cursor-pointer font-medium"
            value={form.packageId}
            onChange={(e) => setForm({ ...form, packageId: e.target.value })}
            required
          >
            <option value="">Select a Photography Package...</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {formatCurrency(p.price)} ({p.eventCategory || 'All Events'})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Event Date *</label>
            <input
              type="date"
              className="input-field"
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="label">Event Time</label>
            <input
              type="time"
              className="input-field"
              value={form.eventTime}
              onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label">Venue Location *</label>
          <input
            className="input-field"
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            placeholder="e.g., Shangri-La Hotel, Colombo"
            required
          />
        </div>

        <div>
          <label className="label">Event Type Category</label>
          <select
            className="input-field cursor-pointer"
            value={form.eventType}
            onChange={(e) => setForm({ ...form, eventType: e.target.value })}
          >
            {['Wedding', 'Corporate', 'Birthday', 'Portrait', 'Engagement', 'Concert', 'Other'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {addOns.length > 0 && (
          <div className="space-y-2">
            <label className="label">Optional Add-ons</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addOns.map((a) => {
                const isSelected = form.addOnIds.includes(a.id);
                return (
                  <div
                    key={a.id}
                    onClick={() => toggleAddOn(a.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 text-dark-900 shadow-xs'
                        : 'border-dark-100 bg-white hover:bg-dark-50/60 text-dark-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-dark-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                      />
                      <div>
                        <p className="text-sm font-semibold">{a.name}</p>
                        <p className="text-[11px] text-dark-400 truncate max-w-[150px]">{a.description}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand-700">{formatCurrency(a.price)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="label">Special Requests / Preferences</label>
          <textarea
            className="input-field"
            rows={3}
            value={form.specialRequests}
            onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
            placeholder="Tell us about your theme, preferred shooting style, key moments..."
          />
        </div>

        {selectedPkg && (
          <div className="rounded-xl bg-gradient-to-r from-brand-900 to-dark-900 text-white p-5 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">Estimated Total Investment</span>
              <p className="font-display text-2xl font-bold mt-0.5">{formatCurrency(total)}</p>
              <p className="text-[11px] text-dark-300 mt-0.5">Includes {selectedPkg.name} {selectedAddOns.length > 0 && `+ ${selectedAddOns.length} Add-on(s)`}</p>
            </div>
            <Sparkles className="w-8 h-8 text-brand-400 opacity-80" />
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 text-base font-semibold shadow-md">
          {submitting ? 'Submitting Request...' : 'Submit Booking Request'}
        </button>
      </form>
    </div>
  );
}
