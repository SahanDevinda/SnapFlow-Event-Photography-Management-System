import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gold-500 text-charcoal-900 hover:bg-gold-400 focus:ring-gold-500 font-semibold shadow-sm',
    // `gold` is used widely across the pages as the main call-to-action.
    gold: 'bg-gold-500 text-charcoal-900 hover:bg-gold-400 focus:ring-gold-500 font-semibold shadow-sm',
    secondary: 'bg-navy-900 text-white hover:bg-navy-800 focus:ring-navy-900 border border-navy-700',
    // outline: removed hardcoded bg-white so className can override the background in dark contexts
    outline: 'border border-navy-300 text-navy-700 hover:bg-navy-50 focus:ring-gold-500',
    // dark: for charcoal-background hero sections
    dark: 'bg-charcoal-900 text-white border border-gold-500/60 hover:bg-gold-500/10 hover:border-gold-400 focus:ring-gold-500',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
    ghost: 'text-navy-700 hover:bg-navy-100 focus:ring-navy-300'
  };

  const sizes = {
    xs: 'text-[11px] px-2 py-1 gap-1',
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
    xl: 'text-lg px-6 py-3 gap-3'
  };

  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;
  const iconSize = size === 'xs' ? 'w-3.5 h-3.5' : size === 'xl' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className={`${iconSize} animate-spin shrink-0`} />
      ) : Icon ? (
        <Icon className={`${iconSize} shrink-0`} />
      ) : null}
      {children != null && children !== false && <span>{children}</span>}
    </button>
  );
};

export default Button;
