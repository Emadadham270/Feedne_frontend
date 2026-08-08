import { Avatar } from '@/components/ui/Avatar';
import { timeAgo } from '@/lib/dateUtils';
import { Heart, UserPlus, UserCheck, MessageCircle, Share2, CornerDownRight, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const NOTIFICATION_ICONS = {
  // Enum mappings
  FOLLOW:           { Icon: UserPlus,         color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  FOLLOW_REQUEST:   { Icon: UserPlus,         color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  FOLLOW_ACCEPTED:  { Icon: UserCheck,        color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
  REACTION:         { Icon: Heart,            color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
  COMMENT:          { Icon: MessageCircle,    color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  REPLY:            { Icon: CornerDownRight,  color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' },
  COMMENT_REACTION: { Icon: ThumbsUp,         color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' },
  POST_SHARE:       { Icon: Share2,           color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },

  // Legacy fallback mappings
  like:    { Icon: Heart, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
  follow:  { Icon: UserPlus, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  comment: { Icon: MessageCircle, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
};

export function NotificationItem({ notification, onRead }) {
  const actorName = notification.actor?.displayName || notification.actor?.username || 'Someone';
  const avatarUrl = notification.actor?.avatar || notification.actor?.profile?.imgUrl || null;
  const config = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.REACTION;
  const Icon = config.Icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors',
        notification.isRead
          ? 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
          : 'bg-blue-50/60 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20',
      )}
      onClick={() => !notification.isRead && onRead?.(notification.id)}
    >
      {/* Actor avatar */}
      <Avatar src={avatarUrl} name={actorName} size="md" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-800 dark:text-neutral-200">
          <span className="font-semibold">{actorName}</span>
          {' '}{notification.message}
        </p>
        <p className="text-xs text-neutral-400 mt-0.5">{timeAgo(notification.createdAt)}</p>
      </div>

      {/* Type icon */}
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', config.color)}>
        <Icon size={14} />
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
      )}
    </div>
  );
}
