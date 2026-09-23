import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { Image, UploadCloud } from 'lucide-react';

export default function PhotographerGalleries() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      // GET /galleries is restricted to Operations/Director, so a photographer's
      // galleries are resolved through their own assignments instead.
      const assignments = listOf(await api.get('/assignments/my?page=0&size=100'));
      const bookingIds = [...new Set(assignments.map(a => a.bookingId).filter(Boolean))];

      const results = await Promise.allSettled(
        bookingIds.map(bookingId => api.get(`/galleries/booking/${bookingId}`))
      );
      setGalleries(
        results
          .filter(r => r.status === 'fulfilled' && r.value?.data)
          .map(r => r.value.data)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Upload & Edit Galleries</h1>
        <p className="text-navy-600 text-sm">Select an event gallery to upload photos, set covers, and watermark.</p>
      </div>

      <Card>
        {loading ? (
          <LoadingSkeleton count={4} className="h-16" />
        ) : galleries.length === 0 ? (
          <p className="text-xs text-navy-500 py-6 text-center">No galleries assigned.</p>
        ) : (
          <div className="divide-y divide-navy-100">
            {galleries.map(g => (
              <div key={g.id} className="py-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-navy-900 text-sm">{g.title}</h4>
                    <Badge status={g.status} />
                  </div>
                  <p className="text-xs text-navy-500 mt-1">
                    {g.photoCount || 0} Photos uploaded • Access Code: {g.accessCode}
                  </p>
                </div>
                <Link to={`/photographer/galleries/${g.id}/edit`}>
                  <Button variant="gold" size="xs" icon={UploadCloud}>Edit & Upload Photos</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
