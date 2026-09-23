import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { formatLKR } from '../../utils/formatters';
import { Calendar, Clock, MapPin, CheckCircle, Info } from 'lucide-react';

export default function BookPackage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const preselectedPackageId = searchParams.get('packageId');
  const preselectedDate = searchParams.get('date');

  const [packages, setPackages] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    packageId: preselectedPackageId ? parseInt(preselectedPackageId) : '',
    eventDate: preselectedDate || '',
    startTime: '09:00',
    endTime: '17:00',
    venue: '',
    eventType: 'WEDDING',
    guestCount: 150,
    specialRequests: '',
    selectedAddOnIds: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pkgRes, addRes] = await Promise.all([
        api.get('/packages'),
        api.get('/add-ons')
      ]);
      setPackages(listOf(pkgRes));
      setAddOns(listOf(addRes));
      if (!formData.packageId && pkgRes.data.length > 0) {
        setFormData(prev => ({ ...prev, packageId: pkgRes.data[0].id }));
      }
    } catch (err) {
      toast.error('Failed to load packages or add-ons.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPackage = packages.find(p => p.id === parseInt(formData.packageId));
  const selectedAddOnObjects = addOns.filter(a => formData.selectedAddOnIds.includes(a.id));

  const packagePrice = selectedPackage ? Number(selectedPackage.price) : 0;
  const addOnsTotal = selectedAddOnObjects.reduce((sum, a) => sum + Number(a.price), 0);
  const totalPrice = packagePrice + addOnsTotal;
  const advanceDeposit = totalPrice * 0.30;
  const remainingBalance = totalPrice * 0.70;

  const handleAddOnToggle = (id) => {
    setFormData(prev => {
      const exists = prev.selectedAddOnIds.includes(id);
      return {
        ...prev,
        selectedAddOnIds: exists
          ? prev.selectedAddOnIds.filter(x => x !== id)
          : [...prev.selectedAddOnIds, id]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.packageId || !formData.eventDate || !formData.venue) {
      toast.error('Please fill in all mandatory fields.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        packageId: parseInt(formData.packageId),
        eventDate: formData.eventDate,
        startTime: formData.startTime,
        venue: formData.venue,
        eventType: formData.eventType,
        // BookingCreateRequest has no endTime (derived from the package duration)
        // and no guestCount column, so the guest count goes into the notes.
        specialRequests: [`Expected guests: ${parseInt(formData.guestCount) || 1}`, formData.specialRequests]
          .filter(Boolean)
          .join(' | '),
        addOnIds: formData.selectedAddOnIds
      };

      const res = await api.post('/bookings', payload);
      toast.success(`Booking created successfully! Reference: ${res.data.bookingRef}`);
      navigate(`/customer/bookings/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit booking reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-navy-500">Loading booking form...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Book Event Photography</h1>
        <p className="text-navy-600 text-sm">Configure your event details and reserve Lanka Moments for your special day.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="1. Select Package">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {packages.map(pkg => {
                const isSelected = parseInt(formData.packageId) === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setFormData({ ...formData, packageId: pkg.id })}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500'
                        : 'border-navy-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-navy-900 text-sm">{pkg.name}</h4>
                      <span className="text-xs font-semibold text-amber-700">{formatLKR(pkg.price)}</span>
                    </div>
                    <p className="text-xs text-navy-500 mt-1 line-clamp-2">{pkg.description}</p>
                    <div className="mt-2 text-[11px] text-navy-600 flex items-center gap-2">
                      <span>🕒 {pkg.durationHours} hrs</span>
                      <span>🏷️ {pkg.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="2. Event Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Event Date"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.eventDate}
                onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
              />

              <div>
                <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                  Event Type
                </label>
                <select
                  value={formData.eventType}
                  onChange={e => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="WEDDING">Wedding & Homecoming</option>
                  <option value="BIRTHDAY">Birthday Party</option>
                  <option value="CORPORATE">Corporate Event</option>
                  <option value="GRADUATION">Graduation / Convocation</option>
                  <option value="MATERNITY">Maternity & Family</option>
                  <option value="FASHION">Fashion & Commercial</option>
                  <option value="OTHER">Other Special Occasion</option>
                </select>
              </div>

              <Input
                label="Start Time"
                type="time"
                required
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
              />

              <Input
                label="End Time"
                type="time"
                required
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
              />

              <div className="sm:col-span-2">
                <Input
                  label="Venue / Location"
                  placeholder="e.g. Shangri-La Ballroom, Colombo or Temple Trees"
                  required
                  value={formData.venue}
                  onChange={e => setFormData({ ...formData, venue: e.target.value })}
                />
              </div>

              <Input
                label="Approximate Guest Count"
                type="number"
                min="1"
                value={formData.guestCount}
                onChange={e => setFormData({ ...formData, guestCount: e.target.value })}
              />

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                  Special Requests / Notes
                </label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Specify key moments to capture, drone preferences, lighting needs..."
                  value={formData.specialRequests}
                  onChange={e => setFormData({ ...formData, specialRequests: e.target.value })}
                />
              </div>
            </div>
          </Card>

          <Card title="3. Optional Add-Ons">
            {addOns.length === 0 ? (
              <p className="text-xs text-navy-500">No add-ons currently available.</p>
            ) : (
              <div className="space-y-2">
                {addOns.map(add => {
                  const checked = formData.selectedAddOnIds.includes(add.id);
                  return (
                    <label
                      key={add.id}
                      className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition ${
                        checked ? 'border-amber-500 bg-amber-50/30' : 'border-navy-200 hover:border-navy-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleAddOnToggle(add.id)}
                          className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                        />
                        <div>
                          <p className="text-sm font-semibold text-navy-900">{add.name}</p>
                          <p className="text-xs text-navy-500">{add.description}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-navy-800">+{formatLKR(add.price)}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Col: Summary Card */}
        <div className="space-y-6">
          <Card title="Pricing Summary" className="sticky top-20">
            <div className="space-y-3 text-sm pb-4 border-b border-navy-100">
              <div className="flex justify-between">
                <span className="text-navy-600">Base Package:</span>
                <span className="font-semibold text-navy-900">{formatLKR(packagePrice)}</span>
              </div>
              {selectedAddOnObjects.map(a => (
                <div key={a.id} className="flex justify-between text-xs text-navy-500">
                  <span>+ {a.name}</span>
                  <span>{formatLKR(a.price)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-navy-100 flex justify-between font-bold text-navy-900 text-base">
                <span>Estimated Total:</span>
                <span className="text-amber-600">{formatLKR(totalPrice)}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl space-y-2 text-xs text-navy-800 my-4 border border-amber-200/60">
              <div className="flex justify-between font-semibold">
                <span>30% Advance Deposit:</span>
                <span className="text-amber-800">{formatLKR(advanceDeposit)}</span>
              </div>
              <div className="flex justify-between text-navy-600">
                <span>70% Balance on Delivery:</span>
                <span>{formatLKR(remainingBalance)}</span>
              </div>
              <p className="text-[11px] text-navy-500 pt-1 border-t border-amber-200/40">
                * Booking inquiry is created immediately. Your date is confirmed upon verification of the 30% advance deposit.
              </p>
            </div>

            <Button
              type="submit"
              variant="gold"
              className="w-full"
              loading={submitting}
            >
              Confirm & Book Event
            </Button>
          </Card>
        </div>
      </form>
    </div>
  );
}
