import { cn } from '@/lib/utils';

export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg className={cn('animate-spin text-primary-500', sizes[size])} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>
  );
}

export function PostSkeleton() {
  return (
    <div className="card p-4 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-2 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
      <div className="h-72 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
      <div className="flex gap-4">
        <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
      </div>
    </div>
  );
}

export function ExploreSkeleton() {
  return (
    <div className="masonry-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={cn('masonry-item rounded-2xl bg-neutral-200 dark:bg-neutral-700 animate-pulse', i % 3 === 0 ? 'h-64' : i % 3 === 1 ? 'h-48' : 'h-80')}
        />
      ))}
    </div>
  );
}
