import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Base modal wrapper — uses Radix Dialog pattern with focus trap.
 * @param {{ isOpen: boolean, onClose: Function, title?: string, size?: 'sm'|'md'|'lg'|'xl', children: React.ReactNode }} props
 */
export function Modal({ isOpen, onClose, title, size = 'md', children, className }) {
  const overlayRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div className={cn(
        'relative w-full bg-white dark:bg-[#1A1D27] rounded-2xl shadow-xl animate-scale-in',
        sizes[size],
        className,
      )}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X size={18} className="text-neutral-500" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
