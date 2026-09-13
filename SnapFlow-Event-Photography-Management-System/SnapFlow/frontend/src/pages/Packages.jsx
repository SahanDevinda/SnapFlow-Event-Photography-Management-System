import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { packageApi } from '../services/api';
import { formatCurrency, getErrorMessage } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import { Clock, Check } from 'lucide-react';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    packageApi.getActive()
      .then((res) => setPackages(res.data.data || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="font-display text-3xl font-bold text-dark-900 sm:text-4xl">Photography Packages</h1>
        <p className="mt-3 text-dark-500">Choose the perfect package for your special day or event.</p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="card flex flex-col hover:shadow-soft transition-shadow">
            <div className="flex-1">
              <h2 className="font-display text-xl font-semibold text-dark-900">{pkg.name}</h2>
              <p className="mt-2 text-2xl font-bold text-brand-600">{formatCurrency(pkg.price)}</p>
              {pkg.durationHours && (
                <p className="mt-1 flex items-center gap-1 text-sm text-dark-500">
                  <Clock className="h-4 w-4" /> {pkg.durationHours} hours coverage
                </p>
              )}
              <p className="mt-4 text-sm text-dark-500 leading-relaxed">{pkg.description}</p>
              {pkg.features && (
                <ul className="mt-5 space-y-2">
                  {pkg.features.split(',').map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-dark-700">
                      <Check className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                      {f.trim()}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Link to={`/packages/${pkg.id}`} className="btn-primary mt-6 w-full justify-center">
              View details
            </Link>
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <p className="text-center text-dark-500 py-12">No packages available at the moment.</p>
      )}
    </div>
  );
}
