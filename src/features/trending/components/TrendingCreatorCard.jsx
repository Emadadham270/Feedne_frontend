import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { formatCount } from '@/lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

/**
 * TrendingCreatorCard — used in the Explore right panel
 */
export function TrendingCreatorCard({ user }) {
  const [following, setFollowing] = useState(user.isFollowing);
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar
        src={user.avatar}
        name={user.displayName}
        size="md"
        onClick={() => navigate(ROUTES.PROFILE_VIEW(user.username))}
        className="cursor-pointer flex-shrink-0"
      />
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(ROUTES.PROFILE_VIEW(user.username))}>
        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate hover:text-primary-500 transition-colors">
          {user.displayName}
        </p>
        <p className="text-xs text-neutral-400 truncate">
          {user.role === 'creator' ? 'Creator' : 'User'} · {formatCount(user.followersCount)} follows
        </p>
      </div>
      <Button
        variant={following ? 'outlined' : 'primary'}
        size="sm"
        onClick={() => setFollowing((f) => !f)}
        className="flex-shrink-0 text-xs"
      >
        {following ? 'Following' : 'Follow'}
      </Button>
    </div>
  );
}

export function CreatorHubCTA() {
  return (
    <div className="card p-5 bg-gradient-to-br from-primary-50 to-tertiary-50 dark:from-primary-900/20 dark:to-tertiary-900/20 border border-primary-100 dark:border-primary-800/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-primary-500 font-bold text-sm">🎨 Creator Hub</span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        Ready to start sharing your own story? Join our creative ecosystem.
      </p>
      <Button variant="primary" size="sm" fullWidth>
        Learn More
      </Button>
    </div>
  );
}
