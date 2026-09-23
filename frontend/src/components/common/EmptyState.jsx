import React from 'react';
import { Camera, FolderOpen } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  title = 'No records found',
  description = 'There are no items to display at this time.',
  icon: Icon = FolderOpen,
  actionLabel,
  onAction
}) => {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-xl border border-dashed border-gray-300">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-gold-600 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
