import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const SIZE_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  '2xl': 'max-w-4xl',
  full: 'max-w-6xl'
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size,
  maxWidth
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll while the modal is open.
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);

  if (!isOpen) return null;

  const widthClass = maxWidth || SIZE_MAP[size] || SIZE_MAP.lg;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="min-h-screen px-4 py-8 text-center flex items-center justify-center">
        <div className="fixed inset-0 bg-black/60 transition-opacity backdrop-blur-xs" onClick={onClose} />

        <div className={`inline-block w-full ${widthClass} p-6 text-left align-middle bg-white rounded-2xl shadow-xl transform transition-all relative z-10 border border-navy-100`}>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-navy-100 gap-4">
            <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1 rounded-lg text-navy-400 hover:text-navy-600 hover:bg-navy-100 transition shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto -mx-1 px-1">{children}</div>

          {footer && (
            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-navy-100">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
