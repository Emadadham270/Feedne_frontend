import { useState } from 'react';
import { cn } from '@/lib/utils';
import { EXPLORE_CATEGORIES } from '@/constants/config';

export function CategoryTabs({ active, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
      {EXPLORE_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
            active === cat
              ? 'bg-primary-500 text-white shadow-sm'
              : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-primary-50 dark:hover:bg-neutral-700',
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
