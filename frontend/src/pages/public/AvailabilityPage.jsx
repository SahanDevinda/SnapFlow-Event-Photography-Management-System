import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import api, { listOf } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useToast } from '../../context/ToastContext';

export const AvailabilityPage = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [formData, setFormData] = useState({
    eventDate: '',
    startTime: '10:00',
    durationHours: 6,
    preferredPhotographerId: ''
  });
  const [photographers, setPhotographers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPhotographers = async () => {
      try {
        const res = await api.get('/users/public/photographers');
        setPhotographers(listOf(res));
      } catch (e) {}
    };
    loadPhotographers();
  }, []);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!formData.eventDate) {
      showError('Please select a date');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/bookings/check-availability', {
        eventDate: formData.eventDate,
        startTime: formData.startTime + ':00',
        durationHours: parseInt(formData.durationHours, 10),
        preferredPhotographerId: formData.preferredPhotographerId ? parseInt(formData.preferredPhotographerId, 10) : null
      });
      if (res.success) {
        setResult(res.data);
      }
    } catch (err) {
      showError(err.message || 'Availability check failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Live Availability' }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Check Date & Photographer Availability</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your intended event date and duration to verify real-time scheduling capacity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card title="Event Details">
            <form onSubmit={handleCheck} className="space-y-4">
              <Input
                label="Event Date"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Start Time"
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Estimated Duration
                  </label>
                  <select
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                  >
                    <option value={2}>2 Hours (Portrait)</option>
                    <option value={3}>3 Hours (Birthday / Party)</option>
                    <option value={4}>4 Hours (Corporate / Half-Day)</option>
                    <option value={6}>6 Hours (Essential Wedding)</option>
                    <option value={10}>10 Hours (Premium Wedding)</option>
                    <option value={12}>12 Hours (Luxury Wedding)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Preferred Lead Photographer (Optional)
                </label>
                <select
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  value={formData.preferredPhotographerId}
                  onChange={(e) => setFormData({ ...formData, preferredPhotographerId: e.target.value })}
                >
                  <option value="">No preference / Any available photographer</option>
                  {photographers.map((p) => (
                    <option key={p.id} value={p.id}>{p.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" loading={loading} className="w-full">
                  Check Live Availability
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div>
          <Card title="Status & Booking">
            {result ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl flex items-start gap-3 ${
                  result.generalAvailable ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}>
                  {result.generalAvailable ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold">
                      {result.generalAvailable ? 'Slot is Available!' : 'Fully Booked'}
                    </h4>
                    <p className="text-xs mt-1 leading-relaxed">{result.message}</p>
                  </div>
                </div>

                {result.preferredPhotographerAvailable !== null && (
                  <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-200">
                    <span className="font-semibold">Preferred Photographer: </span>
                    {result.preferredPhotographerAvailable ? (
                      <span className="text-emerald-600 font-bold">Available</span>
                    ) : (
                      <span className="text-rose-600 font-bold">Unavailable (Already Assigned)</span>
                    )}
                  </div>
                )}

                {result.generalAvailable && (
                  <Button
                    variant="primary"
                    className="w-full"
                    icon={ArrowRight}
                    onClick={() => navigate(`/customer/book?date=${formData.eventDate}&time=${formData.startTime}&pref=${formData.preferredPhotographerId}`)}
                  >
                    Proceed to Booking
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-gray-500">
                Submit the form on the left to verify real-time scheduling.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;
