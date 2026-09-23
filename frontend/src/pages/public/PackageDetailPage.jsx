import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { parseFeatures } from '../../utils/features';

export const PackageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await api.get(`/packages/${id}`);
        if (res.success) {
          setPkg(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [id]);

  if (loading) {
    return (
      <div className="py-10 max-w-4xl mx-auto px-4">
        <LoadingSkeleton count={3} height="h-32" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900">Package Not Found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/packages')}>
          Back to Packages
        </Button>
      </div>
    );
  }

  const features = parseFeatures(pkg.features);

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Packages', to: '/packages' }, { label: pkg.name }]} />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mt-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 bg-amber-50 px-3 py-1 rounded-full border border-gold-400/30">
              {pkg.category}
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-2">{pkg.name}</h1>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-charcoal-900">{formatCurrency(pkg.price)}</span>
            <span className="block text-xs text-gray-400 mt-0.5">All-inclusive package</span>
          </div>
        </div>

        <div className="py-6 border-b border-gray-100 flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold-600" />
            <span className="font-semibold">{pkg.durationHours} Hours Dedicated Coverage</span>
          </div>
        </div>

        <div className="py-6 border-b border-gray-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-2">Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{pkg.description}</p>
        </div>

        <div className="py-6 border-b border-gray-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-4">Included in this Collection</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-sm text-gray-700 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 flex flex-wrap gap-4 justify-between items-center">
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/packages')}>
            Back to Catalogue
          </Button>
          <Button
            variant="primary"
            icon={ArrowRight}
            onClick={() => navigate(`/customer/book?packageId=${pkg.id}`)}
          >
            Book This Package Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PackageDetailPage;
