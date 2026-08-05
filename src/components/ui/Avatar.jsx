import { cn, getInitials } from '@/lib/utils';

/**
 * Avatar component with optional story ring, online dot, and size variants.
 * @param {{ src?: string, name?: string, size?: 'xs'|'sm'|'md'|'lg'|'xl', hasStory?: boolean, isOnline?: boolean, className?: string, onClick?: Function }} props
 */
export function Avatar({ src, name = '', size = 'md', hasStory = false, isOnline = false, className, onClick }) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
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

      {isOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#1A1D27]" />
      )}
    </div>
  );
}
