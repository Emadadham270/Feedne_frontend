import { Avatar } from '@/components/ui/Avatar';
import { timeAgo } from '@/lib/dateUtils';
import { Heart, UserPlus, MessageCircle, AtSign, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const NOTIFICATION_ICONS = {
  like: { Icon: Heart, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
  follow: { Icon: UserPlus, color: 'text-tertiary-500 bg-tertiary-50 dark:bg-tertiary-900/20' },
  comment: { Icon: MessageCircle, color: 'text-secondary-500 bg-secondary-50 dark:bg-secondary-900/20' },
  mention: { Icon: AtSign, color: 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' },
  tag: { Icon: Star, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
  trending: { Icon: TrendingUp, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
};

export function NotificationItem({ notification, onRead }) {
  const { Icon, color } = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.like;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors',
        notification.isRead
          ? 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
          : 'bg-primary-50/60 dark:bg-primary-900/10 hover:bg-primary-50 dark:hover:bg-primary-900/20',
      )}
      onClick={() => !notification.isRead && onRead?.(notification.id)}
    >
      {/* Actor avatar */}
      <Avatar src={notification.actor.avatar} name={notification.actor.displayName} size="md" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-800 dark:text-neutral-200">
          <span className="font-semibold">{notification.actor.displayName}</span>
          {' '}{notification.message}
        </p>
        <p className="text-xs text-neutral-400 mt-0.5">{timeAgo(notification.createdAt)}</p>
      </div>

      {/* Type icon */}
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', color)}>
        <Icon size={14} />
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
      )}
    </div>
  );
}
