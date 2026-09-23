import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { Star, Send } from 'lucide-react';

export default function CustomerFeedback() {
  const toast = useToast();
  const [completedBookings, setCompletedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    bookingId: '',
    rating: 5,
    category: 'SERVICE_QUALITY',
    comments: '',
    suggestions: ''
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my?page=0&size=100');
      const finished = listOf(res).filter(b => b.status === 'COMPLETED' || b.status === 'CONFIRMED');
      setCompletedBookings(finished);
      if (finished.length > 0) {
        setFormData(prev => ({ ...prev, bookingId: finished[0].id }));
      }
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bookingId || !formData.comments) {
      toast.error('Please select an event and provide your feedback comments.');
      return;
    }

    try {
      setSubmitting(true);
      // FeedbackCreateRequest = { type, subject, message }.
      // Booking, rating and category are not columns on Feedback, so they are
      // folded into the subject/message rather than sent as unknown fields.
      const booking = completedBookings.find(b => String(b.id) === String(formData.bookingId));
      const subject = `[${formData.category}] ${booking ? booking.bookingRef : 'General'} — ${formData.rating}/5`;
      const message = [
        formData.comments.trim(),
        formData.suggestions.trim() ? `Suggestions: ${formData.suggestions.trim()}` : ''
      ].filter(Boolean).join('\n\n');

      await api.post('/feedback', {
        type: parseInt(formData.rating, 10) <= 2 ? 'COMPLAINT' : 'SUGGESTION',
        subject,
        message
      });
      toast.success('Thank you! Your feedback has been recorded.');
      setFormData({
        bookingId: completedBookings[0]?.id || '',
        rating: 5,
        category: 'SERVICE_QUALITY',
        comments: '',
        suggestions: ''
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Client Feedback</h1>
        <p className="text-navy-600 text-sm">We value your opinion. Help Lanka Moments continually elevate our service standard.</p>
      </div>

      <Card>
        {completedBookings.length === 0 && !loading ? (
          <p className="text-sm text-navy-500 text-center py-6">
            You don't have any confirmed or completed bookings yet to leave feedback for.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Select Event Booking *
              </label>
              <select
                value={formData.bookingId}
                onChange={e => setFormData({ ...formData, bookingId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                {completedBookings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bookingRef} - {b.packageName} ({b.eventDate})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-2">
                Overall Satisfaction Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1 text-amber-500 hover:scale-110 transition"
                  >
                    <Star className={`w-8 h-8 ${star <= formData.rating ? 'fill-amber-400 text-amber-500' : 'text-navy-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Feedback Category
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="SERVICE_QUALITY">Photography & Service Quality</option>
                <option value="PHOTOGRAPHER_PUNCTUALITY">Photographer Punctuality & Etiquette</option>
                <option value="TURNAROUND_TIME">Turnaround Time & Gallery Delivery</option>
                <option value="COMMUNICATION">Customer Support & Coordination</option>
                <option value="GENERAL">General Experience</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Your Comments & Experience *
              </label>
              <textarea
                rows="4"
                required
                value={formData.comments}
                onChange={e => setFormData({ ...formData, comments: e.target.value })}
                placeholder="How was your experience with our crew and event coverage?"
                className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Suggestions for Improvement
              </label>
              <textarea
                rows="2"
                value={formData.suggestions}
                onChange={e => setFormData({ ...formData, suggestions: e.target.value })}
                placeholder="Anything we could do better next time?"
                className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <Button type="submit" variant="gold" className="w-full" loading={submitting} icon={Send}>
              Submit Client Feedback
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
