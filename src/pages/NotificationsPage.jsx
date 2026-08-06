import { useEffect, useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { NotificationItem } from '@/features/notifications/components/NotificationItem';
import { useNotificationStore } from '@/store/notificationStore';
import { userService } from '@/services/userService';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Bell, UserPlus } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { Spinner } from '@/components/ui/Skeleton';

export function NotificationsPage() {
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [followRequests, setFollowRequests] = useState([]);

  useEffect(() => {
    fetchNotifications();
    userService.getFollowRequests()
      .then((data) => setFollowRequests(data || []))
      .catch(() => {});
  }, []);

  const handleAcceptRequest = async (reqId) => {
    try {
      await userService.acceptFollowRequest(reqId);
      setFollowRequests((prev) => prev.filter((r) => r.id !== reqId));
    } catch {}
  };

  const handleDeclineRequest = async (reqId) => {
    try {
      await userService.declineFollowRequest(reqId);
      setFollowRequests((prev) => prev.filter((r) => r.id !== reqId));
    } catch {}
  };

  const unread = notifications.filter((n) => !n.isRead);

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Notifications</h1>
          {unread.length > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {/* Pending Follow Requests */}
        {followRequests.length > 0 && (
          <div className="card p-4 mb-5 space-y-3 border-l-4 border-primary-500">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus size={14} className="text-primary-500" /> Follow Requests ({followRequests.length})
            </h3>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {followRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <Avatar src={req.user.avatar} name={req.user.displayName} size="md" />
                    <div>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">
                        {req.user.displayName}
                      </p>
                      <p className="text-xs text-neutral-400">Requested to follow you</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="xs" onClick={() => handleAcceptRequest(req.id)}>
                      Confirm
                    </Button>
                    <Button variant="ghost" size="xs" onClick={() => handleDeclineRequest(req.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : notifications.length === 0 && followRequests.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications yet" description="When people interact with your posts, you'll see it here." />
        ) : (
          <div className="card divide-y divide-neutral-50 dark:divide-neutral-800">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
