import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300',
  tertiary: 'bg-tertiary-100 text-tertiary-700 dark:bg-tertiary-900/30 dark:text-tertiary-400',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  new: 'bg-primary-500 text-white',
  trending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

/**
 * Badge / pill label component
 */
export function Badge({ variant = 'neutral', className, children }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide',
      variants[variant],
      className,
    )}>
      {children}
    </span>
  );
}
