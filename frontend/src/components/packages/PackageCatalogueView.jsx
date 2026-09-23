import React, { useState, useEffect } from 'react';
import { PackageCard } from './PackageCard';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';
import api, { listOf } from '../../services/api';

export const PackageCatalogueView = ({ onSelectPackage, actionLabel = 'Book This Package' }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.get('/packages');
        if (res.success) {
          setPackages(listOf(res));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const categories = ['ALL', ...new Set(packages.map((p) => p.category).filter(Boolean))];

  const filtered = categoryFilter === 'ALL'
    ? packages
    : packages.filter((p) => p.category === categoryFilter);

  if (loading) {
    return <LoadingSkeleton count={3} height="h-64" />;
  }

  return (
    <div>
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition ${
                categoryFilter === cat
                  ? 'bg-charcoal-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title="No packages available" description="Check back soon or contact support for customized packages." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onSelect={onSelectPackage}
              actionLabel={actionLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PackageCatalogueView;
