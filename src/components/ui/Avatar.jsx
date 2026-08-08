import { cn, getInitials } from '@/lib/utils';
import { Check } from 'lucide-react';

/**
 * Avatar component with optional story ring, online dot, verified checkmark badge, and size variants.
 * @param {{ src?: string, name?: string, size?: 'xs'|'sm'|'md'|'lg'|'xl', hasStory?: boolean, isOnline?: boolean, isVerified?: boolean, className?: string, onClick?: Function }} props
 */
export function Avatar({ src, name = '', size = 'md', hasStory = false, isOnline = false, isVerified = false, className, onClick }) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const badgeSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  const checkSizes = {
    xs: 8,
    sm: 9,
    md: 10,
    lg: 12,
    xl: 14,
  };

  return (
    <div className={cn('relative flex-shrink-0', className)} onClick={onClick}>
      <div className={cn(
        sizes[size],
        'rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-tertiary-500 flex items-center justify-center',
        hasStory && 'ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-[#1A1D27]',
        onClick && 'cursor-pointer hover:opacity-90 transition-opacity',
      )}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-semibold text-white">{getInitials(name)}</span>
        )}
      </div>

      {/* Verified Checkmark Badge ("Correct" band) */}
      {isVerified && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white dark:border-[#1A1D27] shadow-sm font-bold',
            badgeSizes[size] || 'w-4 h-4'
          )}
          title="Verified Account"
        >
          <Check size={checkSizes[size] || 10} strokeWidth={3.5} />
        </span>
      )}

      {/* Online indicator (only if not showing verified badge at same spot) */}
      {isOnline && !isVerified && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#1A1D27]" />
      )}
    </div>
  );
}
