import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageCatalogueView } from '../../components/packages/PackageCatalogueView';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export const PackagesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Packages' }]} />

      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900">Photography Packages & Collections</h1>
        <p className="mt-2 text-sm text-gray-500">
          Select from our curated photography packages or book online directly.
        </p>
      </div>

      <PackageCatalogueView
        onSelectPackage={(pkg) => navigate(`/packages/${pkg.id}`)}
        actionLabel="View Details & Book"
      />
    </div>
  );
};

export default PackagesPage;
