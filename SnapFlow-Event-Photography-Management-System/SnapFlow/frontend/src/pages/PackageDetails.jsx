import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { packageApi } from '../services/api';
import { formatCurrency, getErrorMessage } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import { Clock, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PackageDetails() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    packageApi.getById(id)
      .then((res) => setPkg(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error || !pkg) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-red-600">{error || 'Package not found'}</p>
        <Link to="/packages" className="btn-primary mt-4 inline-flex">Back to packages</Link>
      </div>
    );
  }

  const features = pkg.features ? pkg.features.split(',').map((f) => f.trim()) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/packages" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> All packages
      </Link>

      <div className="card">
        <h1 className="font-display text-3xl font-bold text-dark-900">{pkg.name}</h1>
        <p className="mt-2 text-3xl font-bold text-brand-600">{formatCurrency(pkg.price)}</p>
        {pkg.durationHours && (
          <p className="mt-2 flex items-center gap-1 text-sm text-dark-500">
            <Clock className="h-4 w-4" /> {pkg.durationHours} hours coverage
          </p>
        )}
        <p className="mt-6 text-dark-600 leading-relaxed">{pkg.description}</p>

        {features.length > 0 && (
          <div className="mt-8">
            <h2 className="font-semibold text-dark-900 mb-3">What's included</h2>
            <ul className="space-y-2">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-dark-700">
                  <Check className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          {isAuthenticated && user?.role === 'CUSTOMER' ? (
            <Link to="/customer/book" className="btn-primary">Book this package</Link>
          ) : !isAuthenticated ? (
            <Link to="/register" className="btn-primary">Register to book</Link>
          ) : null}
          <Link to="/packages" className="btn-secondary">View all packages</Link>
        </div>
      </div>
    </div>
  );
}
