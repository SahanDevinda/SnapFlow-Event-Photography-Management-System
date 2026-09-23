import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { listOf } from '../../services/api';
import ProtectedImage from '../../components/common/ProtectedImage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Image, ArrowRight } from 'lucide-react';

export default function CustomerGalleriesList() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/galleries/my?page=0&size=100');
      setGalleries(listOf(res));
    } catch (err) {
      console.error('Failed to load galleries', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} className="h-44" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">My Photo Galleries</h1>
        <p className="text-navy-600 text-sm">Browse your delivered collections, select proof favorites, and download high-resolution photos.</p>
      </div>

      {galleries.length === 0 ? (
        <EmptyState
          title="No Photo Galleries Ready"
          description="Your event galleries will be published here once your event photography is curated and color-graded by our editing team."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map(g => (
            <Card key={g.id} padding="p-0" className="overflow-hidden group hover:shadow-lg transition">
              <div className="h-48 bg-navy-100 relative overflow-hidden">
                {g.coverPhotoId ? (
                  <ProtectedImage
                    photoId={g.coverPhotoId}
                    alt={g.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-navy-400">
                    <Image className="w-12 h-12" />
                  </div>
                )}
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-navy-900/80 backdrop-blur-sm text-white text-xs font-semibold rounded-lg">
                  {g.photoCount || 0} Photos
                </span>
              </div>
              <div className="p-5">
                <span className="text-[11px] font-mono text-amber-600 uppercase tracking-wider block mb-1">
                  Access Code: {g.accessCode}
                </span>
                <h3 className="font-serif font-bold text-navy-900 text-lg mb-2">{g.title}</h3>
                <p className="text-xs text-navy-500 line-clamp-2 mb-4">{g.description || 'Lanka Moments private event collection.'}</p>
                <Link to={`/customer/galleries/${g.id}`}>
                  <Button variant="gold" size="sm" className="w-full" icon={ArrowRight}>
                    Open Collection
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
