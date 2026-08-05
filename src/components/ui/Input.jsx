import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Base Input with optional leading icon and error state
 */
export const Input = forwardRef(function Input({ label, error, icon: Icon, className, ...props }, ref) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <Icon size={16} />
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'input-base',
            Icon && 'pl-9',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-200/50',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

/**
 * Textarea variant
 */
export const Textarea = forwardRef(function Textarea({ label, error, className, ...props }, ref) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={3}
        className={cn(
          'input-base resize-none',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-200/50',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});
