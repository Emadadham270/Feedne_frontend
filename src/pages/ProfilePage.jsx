import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfilePostGrid } from '@/features/profile/components/ProfilePostGrid';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/userService';
import { mapUser } from '@/lib/userMapper';
import { Spinner } from '@/components/ui/Skeleton';

export function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <MainLayout showRightPanel={false}>
      <div className="max-w-2xl mx-auto">
        <ProfileHeader user={displayUser} isOwn={isOwn} />
        <div className="border-t border-neutral-100 dark:border-neutral-800 mt-2">
          <ProfilePostGrid userId={displayUser?.id} />
        </div>
      </div>
    </MainLayout>
  );
}
