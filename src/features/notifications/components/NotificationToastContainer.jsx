import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/store/notificationStore';
import { Avatar } from '@/components/ui/Avatar';
import { X, Heart, UserPlus, UserCheck, MessageCircle, Share2, CornerDownRight, ThumbsUp, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOAST_ICONS = {
  FOLLOW:           { Icon: UserPlus,        color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' },
  FOLLOW_REQUEST:   { Icon: UserPlus,        color: 'text-purple-400 bg-purple-500/20 border-purple-500/30' },
  FOLLOW_ACCEPTED:  { Icon: UserCheck,       color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' },
  REACTION:         { Icon: Heart,           color: 'text-red-400 bg-red-500/20 border-red-500/30' },
  COMMENT:          { Icon: MessageCircle,   color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' },
  REPLY:            { Icon: CornerDownRight, color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30' },
  COMMENT_REACTION: { Icon: ThumbsUp,        color: 'text-pink-400 bg-pink-500/20 border-pink-500/30' },
  POST_SHARE:       { Icon: Share2,          color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' },
};

function ToastItem({ toast, onClose }) {
  const navigate = useNavigate();
  const actorName = toast.actor?.displayName || toast.actor?.username || 'Someone';
  const avatarUrl = toast.actor?.avatar || toast.actor?.profile?.imgUrl || null;
  const config = TOAST_ICONS[toast.type] || { Icon: Bell, color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' };
  const Icon = config.Icon;

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const handleClick = () => {
    onClose(toast.id);
    navigate('/notifications');
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative flex items-start gap-3.5 p-4 rounded-2xl cursor-pointer pointer-events-auto',
        'bg-neutral-900/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/60 shadow-[0_10px_30px_rgba(0,0,0,0.5)]',
        'hover:border-blue-500/50 hover:shadow-[0_10px_35px_rgba(29,78,216,0.3)] transition-all duration-300 transform animate-in slide-in-from-right-8 fade-in-0 duration-300'
      )}
    >
      {/* Actor Avatar with Icon Overlay */}
      <div className="relative flex-shrink-0">
        <Avatar src={avatarUrl} name={actorName} size="md" />
        <div className={cn('absolute -bottom-1 -right-1 w-5 h-5 rounded-full border flex items-center justify-center shadow-sm', config.color)}>
          <Icon size={10} />
        </div>
      </div>

      {/* Toast Details */}
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-0.5">
          New Notification
        </p>
        <p className="text-sm font-medium text-neutral-100 leading-snug line-clamp-2">
          <span className="font-bold text-white">{actorName}</span>
          {' '}{toast.message || 'interacted with your content.'}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose(toast.id);
        }}
        className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors flex-shrink-0"
        title="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function NotificationToastContainer() {
  const { activeToasts, removeToast } = useNotificationStore();

  if (!activeToasts || activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      {activeToasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
}
