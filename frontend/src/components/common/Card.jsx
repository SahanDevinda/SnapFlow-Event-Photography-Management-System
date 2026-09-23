import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  headerAction,
  gold = false,
  padding = 'p-6',
  className = ''
}) => {
  const header = headerAction || action;
  const hasHeader = title || subtitle || header;

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
        gold ? 'border-gold-400/60 ring-1 ring-gold-400/20' : 'border-navy-200/70'
      } ${className}`}
    >
      {hasHeader && (
        <div className="px-6 py-4 border-b border-navy-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {title && <h3 className="font-semibold text-navy-900 text-base truncate">{title}</h3>}
            {subtitle && <p className="text-xs text-navy-500 mt-0.5">{subtitle}</p>}
          </div>
          {header && <div className="shrink-0">{header}</div>}
        </div>
      )}
      <div className={padding}>{children}</div>
    </div>
  );
};

export default Card;
