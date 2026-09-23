import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { Star, MessageSquare } from 'lucide-react';

export default function CustomerReviews() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    bookingId: '',
    rating: 5,
    title: '',
    reviewText: '',
    wouldRecommend: true
  });

  useEffect(() => {
    loadReviewableBookings();
  }, []);

  const loadReviewableBookings = async () => {
    try {
      const res = await api.get('/bookings/my?page=0&size=100');
      // A review must reference one of the customer's own completed events.
      const items = listOf(res).filter(b => b.status === 'COMPLETED');
      setBookings(items);
      if (items.length > 0) {
        setForm(prev => ({ ...prev, bookingId: items[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bookingId) {
      toast.error('You can only review a completed event booking.');
      return;
    }
    if (!form.title || !form.reviewText) {
      toast.error('Please provide a title and review text.');
      return;
    }

    try {
      setSubmitting(true);
      // ReviewCreateRequest = { bookingId, rating, comment }
      const comment = [
        form.title.trim(),
        form.reviewText.trim(),
        form.wouldRecommend ? 'Would recommend Lanka Moments.' : ''
      ].filter(Boolean).join('\n\n');

      await api.post('/reviews', {
        bookingId: parseInt(form.bookingId, 10),
        rating: parseInt(form.rating, 10),
        comment
      });
      toast.success('Your review has been submitted and will appear after moderation!');
      setForm(prev => ({ ...prev, title: '', reviewText: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Public Testimonial & Review</h1>
        <p className="text-navy-600 text-sm">Share your experience to help future clients discover Lanka Moments.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
              Select Completed Event
            </label>
            <select
              value={form.bookingId}
              onChange={e => setForm({ ...form, bookingId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              {bookings.length === 0 && <option value="">No completed events yet</option>}
              {bookings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.bookingRef} — {b.packageName} ({b.eventDate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm({ ...form, rating: star })}
                  className="p-1 text-amber-500 hover:scale-110 transition"
                >
                  <Star className={`w-8 h-8 ${star <= form.rating ? 'fill-amber-400 text-amber-500' : 'text-navy-200'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
              Review Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Breathtaking wedding photos, absolute perfection!"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
              Full Testimonial *
            </label>
            <textarea
              rows="4"
              required
              placeholder="Share details of your experience..."
              value={form.reviewText}
              onChange={e => setForm({ ...form, reviewText: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-navy-700">
            <input
              type="checkbox"
              checked={form.wouldRecommend}
              onChange={e => setForm({ ...form, wouldRecommend: e.target.checked })}
              className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
            />
            <span>I would happily recommend Lanka Moments to friends and family</span>
          </label>

          <Button type="submit" variant="gold" className="w-full" loading={submitting} icon={MessageSquare}>
            Post Testimonial
          </Button>
        </form>
      </Card>
    </div>
  );
}
