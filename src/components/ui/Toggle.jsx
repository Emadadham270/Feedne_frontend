import { cn } from '@/lib/utils';

/**
 * Toggle / switch component matching the CreatePost modal design
 */
export function Toggle({ checked, onChange, label, id }) {
  return (
    <label htmlFor={id} className="flex items-center justify-between cursor-pointer group">
      {label && (
        <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
          {label}
        </span>
      )}
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
          checked ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-600',
        )}
      >
        <span className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300',
          checked ? 'translate-x-5' : 'translate-x-0',
        )} />
      </button>
    </label>
  );
}
