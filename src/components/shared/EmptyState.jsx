import { cn } from '@/lib/utils';

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-8 text-center', className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
          <Icon size={28} className="text-primary-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-500 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
