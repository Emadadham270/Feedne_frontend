import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { UserCard } from '@/components/shared/UserCard';
import { userService } from '@/services/userService';
import { mapUsers } from '@/lib/userMapper';
import { Spinner } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Users } from 'lucide-react';

export function FollowListModal({ isOpen, onClose, userId, type = 'followers' }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const res = type === 'followers'
          ? await userService.getFollowers(userId)
          : await userService.getFollowing(userId);
        
        if (!cancelled) {
          setUsers(mapUsers(res.data || res || []));
        }
      } catch (err) {
        console.error(`Failed to load ${type}:`, err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [isOpen, userId, type]);

  const handleFollow = async (targetId, shouldFollow) => {
    try {
      if (shouldFollow) {
        await userService.followUser(targetId);
      } else {
        await userService.unfollowUser(targetId);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === targetId ? { ...u, isFollowing: shouldFollow } : u))
      );
    } catch {}
  };

  const title = type === 'followers' ? 'Followers' : 'Following';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="p-4 max-h-96 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : !users.length ? (
          <EmptyState
            icon={Users}
            title={`No ${type} yet`}
            description={type === 'followers' ? "No followers to display." : "Not following anyone yet."}
          />
        ) : (
          users.map((u) => (
            <UserCard key={u.id} user={u} onFollow={handleFollow} />
          ))
        )}
      </div>
    </Modal>
  );
}
