import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { formatCount } from '@/lib/utils';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { userService } from '@/services/userService';
import { getErrorMessage } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { MessageCircle } from 'lucide-react';

export function ProfileHeader({ user, isOwn, onOpenFollowList }) {
  const [followState, setFollowState] = useState(
    user?.isFollowing ? 'following' : user?.isRequested || user?.followStatus === 'requested' ? 'requested' : 'none'
  );
  const [isFollowingLoading, setIsLoading] = useState(false);
  const { openModal }   = useUIStore();
  const { refreshUser } = useAuthStore();
  const { startConversation } = useChatStore();
  const navigate = useNavigate();

  const handleFollowToggle = async () => {
    if (isFollowingLoading || !user) return;
    setIsLoading(true);
    try {
      if (followState === 'following' || followState === 'requested') {
        await userService.unfollowUser(user.id);
        setFollowState('none');
      } else {
        const res = await userService.followUser(user.id);
        setFollowState(res.status === 'requested' ? 'requested' : 'following');
      }
    } catch (err) {
      console.error('Follow toggle failed:', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonLabel = () => {
    if (followState === 'following') return 'Following';
    if (followState === 'requested') return 'Requested';
    return 'Follow';
  };

  const handleStartMessage = () => {
    if (!user) return;
    startConversation(user);
    navigate(ROUTES.MESSAGES);
  };

  return (
    <div>
      {/* Cover image */}
      <div className="h-48 bg-gradient-to-br from-primary-400 to-tertiary-500 relative overflow-hidden">
        {user?.coverImage && (
          <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Profile info */}
      <div className="px-6 pb-4">
        <div className="flex items-end justify-between -mt-10 mb-4">
          <Avatar
            src={user?.avatar}
            name={user?.displayName || user?.username}
            size="xl"
            hasStory={user?.hasStory}
            className="ring-4 ring-white dark:ring-[#1A1D27]"
          />
          {isOwn ? (
            <Button variant="outlined" size="sm" onClick={() => openModal('editProfile')}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                size="sm"
                onClick={handleStartMessage}
                className="flex items-center gap-1.5"
              >
                <MessageCircle size={14} />
                Message
              </Button>
              <Button
                variant={followState !== 'none' ? 'outlined' : 'primary'}
                size="sm"
                isLoading={isFollowingLoading}
                onClick={handleFollowToggle}
              >
                {getButtonLabel()}
              </Button>
            </div>
          )}
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
              {user?.displayName || user?.username}
            </h1>
          </div>
          <p className="text-sm text-neutral-400">{user?.handle || `@${user?.username}`}</p>
        </div>

        {user?.bio && (
          <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">{user.bio}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6">
          <ProfileStat value={user?.postsCount ?? user?._count?.posts} label="Posts" />
          <ProfileStat
            value={user?.followersCount ?? user?._count?.followers}
            label="Followers"
            onClick={() => onOpenFollowList?.('followers')}
          />
          <ProfileStat
            value={user?.followingCount ?? user?._count?.following}
            label="Following"
            onClick={() => onOpenFollowList?.('following')}
          />
        </div>
      </div>
    </div>
  );
}

function ProfileStat({ value, label, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`text-center ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity group' : ''}`}
    >
      <p className="font-bold text-neutral-900 dark:text-white group-hover:text-primary-500 transition-colors">
        {formatCount(value || 0)}
      </p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}
