import { Avatar } from '@/components/ui/Avatar';
import { timeAgo } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

export function MessageBubble({ message, isMine }) {
  return (
    <div className={cn('flex gap-2 items-end', isMine ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn(
        'max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
        isMine
          ? 'bg-primary-500 text-white rounded-br-sm'
          : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 shadow-sm rounded-bl-sm',
      )}>
        {message.text}
        <p className={cn('text-[10px] mt-1 text-right', isMine ? 'text-primary-100' : 'text-neutral-400')}>
          {timeAgo(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
