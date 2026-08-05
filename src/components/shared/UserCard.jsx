import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { formatCount } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useEffect, useState } from 'react';

/**
 * UserCard — shown in trending creators, suggestions, search results.
 */
export function UserCard({ user, compact = false, onFollow }) {
  const navigate = useNavigate();
  const [following, setFollowing] = useState(!!user?.isFollowing);

  useEffect(() => {
    setFollowing(!!user?.isFollowing);
  }, [user?.isFollowing]);

  const handleFollow = (e) => {
    e.stopPropagation();
    setFollowing((f) => !f);
    onFollow?.(user.id, !following);
  };

  const handleNavigate = () => {
    navigate(ROUTES.PROFILE_VIEW(user.username));
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2 cursor-pointer group" onClick={handleNavigate}>
        <Avatar src={user.avatar} name={user.displayName} size="sm" hasStory={user.hasStory} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
            {user.displayName}
          </p>
          <p className="text-xs text-neutral-500 truncate">{user.handle}</p>
        </div>
        <Button
          variant={following ? 'ghost' : 'primary'}
          size="sm"
          onClick={handleFollow}
          className="flex-shrink-0"
        >
          {following ? 'Following' : 'Follow'}
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors group"
      onClick={handleNavigate}
    >
      <Avatar src={user.avatar} name={user.displayName} size="md" hasStory={user.hasStory} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
          {user.displayName}
        </p>
        <p className="text-xs text-neutral-500">
          {user.bio ? user.bio.slice(0, 40) : `${formatCount(user.followersCount)} followers`}
        </p>
      </div>
      <Button
        variant={following ? 'outlined' : 'primary'}
        size="sm"
        onClick={handleFollow}
        className="flex-shrink-0"
      >
        {following ? 'Following' : 'Follow'}
      </Button>
    </div>
  );
}
