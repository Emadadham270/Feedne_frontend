import { Avatar } from '@/components/ui/Avatar';
import { timeAgo } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export function ChatListItem({ conversation, isActive, onClick }) {
  const { participant, lastMessage, unreadCount } = conversation;

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors rounded-xl',
        isActive
          ? 'bg-primary-50 dark:bg-primary-900/20'
          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
      )}
    >
      <Avatar src={participant.avatar} name={participant.displayName} size="md" isOnline isVerified={participant.isVerified} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={cn('text-sm truncate flex items-center gap-1', unreadCount > 0 ? 'font-bold text-neutral-900 dark:text-white' : 'font-medium text-neutral-700 dark:text-neutral-300')}>
            <span className="truncate">{participant.displayName}</span>
            {participant.isVerified && (
              <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center inline-flex flex-shrink-0" title="Verified User">
                <Check size={9} strokeWidth={3.5} />
              </span>
            )}
          </p>
          <span className="text-xs text-neutral-400 flex-shrink-0 ml-2">
            {timeAgo(lastMessage?.createdAt)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className={cn('text-xs truncate', unreadCount > 0 ? 'text-neutral-900 dark:text-white font-medium' : 'text-neutral-400')}>
            {lastMessage?.content || lastMessage?.text}
          </p>
          {unreadCount > 0 && (
            <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
