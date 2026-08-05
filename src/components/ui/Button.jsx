import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-primary-500 text-white border-transparent hover:bg-primary-600 shadow-sm hover:shadow-glow',
  secondary: 'bg-secondary-500 text-white border-transparent hover:bg-secondary-600',
  outlined: 'border border-primary-400 text-primary-500 bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/20',
  ghost: 'border-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
  danger: 'bg-red-500 text-white border-transparent hover:bg-red-600',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
  icon: 'p-2',
};

/**
 * Button component with variant + size API, loading spinner, icon support.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  rounded = 'full',
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        rounded === 'full' ? 'rounded-full' : rounded === 'xl' ? 'rounded-xl' : 'rounded-lg',
        fullWidth && 'w-full',
        className,
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
