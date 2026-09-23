import React from 'react';

const STATUS_VARIANTS = {
  CONFIRMED: 'success',
  VERIFIED: 'success',
  PUBLISHED: 'success',
  AVAILABLE: 'success',
  RESOLVED: 'success',
  APPROVED: 'success',
  ACTIVE: 'success',
  PAID: 'success',
  PENDING: 'warning',
  DRAFT: 'warning',
  PROOF_READY: 'warning',
  PENDING_VERIFICATION: 'warning',
  MAINTENANCE: 'warning',
  PARTIALLY_PAID: 'warning',
  IN_PROGRESS: 'info',
  ASSIGNED: 'info',
  ALLOCATED: 'info',
  REVIEWED: 'info',
  UNDER_REVIEW: 'info',
  CANCELLED: 'danger',
  REJECTED: 'danger',
  RETIRED: 'danger',
  INACTIVE: 'danger',
  OVERDUE: 'danger',
  COMPLETED: 'gold'
};

export const getStatusVariant = (status) =>
  STATUS_VARIANTS[String(status || '').toUpperCase()] || 'default';

const prettify = (value) =>
  String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const Badge = ({ children, status, variant, className = '' }) => {
  const variants = {
    default: 'bg-navy-100 text-navy-800 border border-navy-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    gold: 'bg-gold-50 text-gold-700 border border-gold-400/50'
  };

  // Pages call this either as <Badge status={x} /> or <Badge>{x}</Badge>.
  const label = children != null && children !== '' ? children : status;
  const source = status != null ? status : (typeof children === 'string' ? children : null);

  const resolvedVariant =
    variant && variants[variant]
      ? variant
      : source != null
      ? getStatusVariant(source)
      : 'default';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${variants[resolvedVariant]} ${className}`}>
      {typeof label === 'string' ? prettify(label) : label ?? '—'}
    </span>
  );
};

export default Badge;
