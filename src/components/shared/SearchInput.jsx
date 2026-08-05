import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SearchInput — used in Topbar and Explore page
 */
export function SearchInput({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base pl-9 pr-4"
      />
    </div>
  );
}
