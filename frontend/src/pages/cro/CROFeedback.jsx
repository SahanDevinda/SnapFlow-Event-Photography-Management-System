import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { Star } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function CROFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.get('/feedback?page=0&size=100');
      setFeedback(listOf(res));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Client Feedback & Ratings</h1>
        <p className="text-navy-600 text-sm">Monitor customer satisfaction and survey submissions.</p>
      </div>

      <Card>
        {loading ? (
          <LoadingSkeleton count={4} className="h-16" />
        ) : feedback.length === 0 ? (
          <p className="text-xs text-navy-500 py-6 text-center">No feedback recorded yet.</p>
        ) : (
          <div className="divide-y divide-navy-100">
            {feedback.map(f => (
              <div key={f.id} className="py-4 space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < f.rating ? 'fill-amber-400 text-amber-500' : 'text-navy-200'}`}
                      />
                    ))}
                    <span className="text-xs font-bold text-navy-800 ml-2">{f.category}</span>
                  </div>
                  <span className="text-xs text-navy-400">{formatDate(f.createdAt)}</span>
                </div>
                <p className="text-sm text-navy-800 italic font-serif">"{f.message}"</p>
                {f.subject && (
                  <p className="text-xs text-navy-500">Subject: {f.subject}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
