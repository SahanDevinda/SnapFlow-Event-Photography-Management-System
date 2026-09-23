import React from 'react';
import PackageCatalogueView from '../../components/packages/PackageCatalogueView';

export default function CustomerPackages() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Photography Packages</h1>
        <p className="text-navy-600 text-sm">Select a tailored photography package for your upcoming event.</p>
      </div>

      <PackageCatalogueView
        baseBookingPath="/customer/book"
        baseDetailPath="/customer/packages"
      />
    </div>
  );
}
