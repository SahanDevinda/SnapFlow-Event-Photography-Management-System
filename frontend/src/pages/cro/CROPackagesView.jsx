import React from 'react';
import PackageCatalogueView from '../../components/packages/PackageCatalogueView';

export default function CROPackagesView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Package Catalogue Reference</h1>
        <p className="text-navy-600 text-sm">Consult pricing and tier inclusions when assisting clients.</p>
      </div>

      <PackageCatalogueView
        baseBookingPath="/cro/new-booking"
        baseDetailPath="/cro/packages"
      />
    </div>
  );
}
