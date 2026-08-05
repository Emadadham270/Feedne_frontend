import { useEffect } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { NotificationItem } from '@/features/notifications/components/NotificationItem';
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '@/components/ui/Button';
import { Bell } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { Spinner } from '@/components/ui/Skeleton';

export function NotificationsPage() {
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

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

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : notifications.length === 0 ? (
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
