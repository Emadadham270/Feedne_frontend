import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfilePostGrid } from '@/features/profile/components/ProfilePostGrid';
import { FollowListModal } from '@/features/profile/components/FollowListModal';
import { useAuthStore } from '@/store/authStore';
import { useBlockStore } from '@/store/blockStore';
import { userService } from '@/services/userService';
import { mapUser } from '@/lib/userMapper';
import { Spinner } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Lock, Ban } from 'lucide-react';

export function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const { blockedUserIds, unblockUser } = useBlockStore();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [followListModal, setFollowListModal] = useState({ isOpen: false, type: 'followers' });

  // Determine if viewing own profile
  const isOwn = !username || username === 'me' || username === currentUser?.username;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        if (isOwn) {
          // Own profile — use the already-fetched currentUser
          setProfile(currentUser);
        } else {
          // Other user — search by username to get their ID first,
          // then fetch full profile by ID
          const searchResult = await userService.searchUsers(username, { limit: 1 });
          const found = searchResult?.data?.[0];
          if (found && !cancelled) {
            const fullProfile = await userService.getUserById(found.id);
            if (!cancelled) setProfile(mapUser(fullProfile));
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [username, isOwn, currentUser?.username]);

  const handleOpenFollowList = (type) => {
    setFollowListModal({ isOpen: true, type });
  };

  const handleUnblock = async () => {
    if (!profile?.id) return;
    setIsUnblocking(true);
    try {
      await unblockUser(profile.id);
    } catch (err) {
      console.error('Failed to unblock user:', err);
    } finally {
      setIsUnblocking(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      </MainLayout>
    );
  }

  const displayUser = isOwn ? currentUser : profile;
  const isBlocked = !isOwn && displayUser?.id && blockedUserIds.includes(displayUser.id);

  return (
    <MainLayout showRightPanel={false}>
      <div className="max-w-2xl mx-auto">
        <ProfileHeader user={displayUser} isOwn={isOwn} onOpenFollowList={handleOpenFollowList} />

        {isBlocked ? (
          /* Blocked Wall */
          <div className="border-t border-neutral-100 dark:border-neutral-800 mt-6 p-12 text-center card bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="w-14 h-14 rounded-full border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-3 text-red-500">
              <Ban size={28} />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              You Have Blocked @{displayUser?.username}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto mb-4">
              You cannot see their posts, photos, or message them while they are blocked.
            </p>
            <Button
              variant="outlined"
              size="sm"
              isLoading={isUnblocking}
              onClick={handleUnblock}
              className="mx-auto"
            >
              Unblock User
            </Button>
          </div>
        ) : displayUser?.isPrivate && !displayUser?.isFollowing && !isOwn ? (
          /* Private Account Wall */
          <div className="border-t border-neutral-100 dark:border-neutral-800 mt-6 p-12 text-center card bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="w-14 h-14 rounded-full border-2 border-neutral-300 dark:border-neutral-700 flex items-center justify-center mx-auto mb-3">
              <Lock size={28} className="text-neutral-500" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">This Account is Private</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              Follow this account to see their photos, videos, and posts.
            </p>
          </div>
        ) : (
          /* Posts / Saved Grid */
          <div className="border-t border-neutral-100 dark:border-neutral-800 mt-2">
            <ProfilePostGrid userId={displayUser?.id} isOwn={isOwn} />
          </div>
        )}
      </div>

      <FollowListModal
        isOpen={followListModal.isOpen}
        onClose={() => setFollowListModal({ ...followListModal, isOpen: false })}
        userId={displayUser?.id}
        type={followListModal.type}
      />
    </MainLayout>
  );
}
