import React from 'react';
import { Clock, Check, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../common/Button';
import { parseFeatures } from '../../utils/features';

export const PackageCard = ({ pkg, onSelect, actionLabel = 'Book This Package' }) => {
  const featureList = parseFeatures(pkg.features);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-600 bg-amber-50 px-2.5 py-1 rounded-full border border-gold-400/30">
            {pkg.category || 'Event'}
          </span>
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
            <span>{pkg.durationHours} Hours Coverage</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{pkg.description}</p>

        <div className="mt-5 pb-5 border-b border-gray-100">
          <span className="text-2xl font-bold text-charcoal-900">{formatCurrency(pkg.price)}</span>
          <span className="text-xs text-gray-400 block mt-0.5">All taxes included</span>
        </div>

        <div className="mt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Includes:</h4>
          <ul className="space-y-2">
            {featureList.map((feature, idx) => (
              <li key={idx} className="flex items-start text-xs text-gray-600">
                <Check className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-50">
        <Button
          variant="primary"
          className="w-full"
          onClick={() => onSelect(pkg)}
          icon={ArrowRight}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
};

export default PackageCard;
