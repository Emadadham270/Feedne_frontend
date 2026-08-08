import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { formatCount } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

/**
 * UserCard — shown in trending creators, suggestions, search results.
 */
export function UserCard({ user, compact = false, onFollow }) {
  const navigate = useNavigate();
  const [followState, setFollowState] = useState(
    user?.isFollowing ? 'following' : user?.isRequested || user?.followStatus === 'requested' ? 'requested' : 'none'
  );

  useEffect(() => {
    setFollowState(
      user?.isFollowing ? 'following' : user?.isRequested || user?.followStatus === 'requested' ? 'requested' : 'none'
    );
  }, [user?.isFollowing, user?.isRequested, user?.followStatus]);

  const handleFollow = (e) => {
    e.stopPropagation();
    if (followState === 'following' || followState === 'requested') {
      setFollowState('none');
      onFollow?.(user.id, false);
    } else {
      setFollowState(user.isPrivate ? 'requested' : 'following');
      onFollow?.(user.id, true);
    }
  };

  const handleNavigate = () => {
    navigate(ROUTES.PROFILE_VIEW(user.username));
  };

  const getButtonLabel = () => {
    if (followState === 'following') return 'Following';
    if (followState === 'requested') return 'Requested';
    return 'Follow';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2 cursor-pointer group" onClick={handleNavigate}>
        <Avatar src={user.avatar} name={user.displayName} size="sm" hasStory={user.hasStory} isVerified={user.isVerified} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate group-hover:text-primary-500 transition-colors flex items-center gap-1">
            <span>{user.displayName}</span>
            {user.isVerified && (
              <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center inline-flex flex-shrink-0" title="Verified User">
                <Check size={9} strokeWidth={3.5} />
              </span>
            )}
          </p>
          <p className="text-xs text-neutral-500 truncate">{user.handle || `@${user.username}`}</p>
        </div>
        <Button
          variant={followState !== 'none' ? 'ghost' : 'primary'}
          size="xs"
          onClick={handleFollow}
        >
          {getButtonLabel()}
        </Button>
      </div>
    );
  }

  return (
    <div className="card p-4 flex flex-col items-center text-center cursor-pointer group hover:border-primary-200 dark:hover:border-primary-800 transition-all" onClick={handleNavigate}>
      <Avatar src={user.avatar} name={user.displayName} size="lg" hasStory={user.hasStory} isVerified={user.isVerified} className="mb-3" />
      <h3 className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-primary-500 transition-colors flex items-center justify-center gap-1">
        <span>{user.displayName}</span>
        {user.isVerified && (
          <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center inline-flex" title="Verified User">
            <Check size={10} strokeWidth={3.5} />
          </span>
        )}
      </h3>
      <p className="text-xs text-neutral-500 mb-2">{user.handle || `@${user.username}`}</p>
      {user.bio && (
        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
          {user.bio}
        </p>
      )}
      <Button
        variant={followState !== 'none' ? 'outlined' : 'primary'}
        size="sm"
        className="w-full mt-auto"
        onClick={handleFollow}
      >
        {getButtonLabel()}
      </Button>
    </div>
  );
}
