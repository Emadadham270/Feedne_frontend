import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Badge } from '@/components/ui/Badge';
import { Eye, Play, Heart, MessageCircle } from 'lucide-react';
import { formatCount } from '@/lib/utils';
import { cn } from '@/lib/utils';

/**
 * Single card in the Explore masonry grid.
 * Clicking block navigates directly to publisher's profile.
 */
export function ExploreGridItem({ post, style }) {
  const navigate = useNavigate();
  const mediaUrl = post.mediaUrl || post.media?.[0]?.url;
  const authorUsername = post.author?.username || post.author?.displayName;

  const handleClick = () => {
    if (authorUsername) {
      navigate(ROUTES.PROFILE_VIEW(authorUsername));
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn('masonry-item relative rounded-2xl overflow-hidden cursor-pointer group shadow-card hover:shadow-card-hover transition-shadow duration-300 bg-neutral-100 dark:bg-neutral-800 min-h-48', style)}
    >
      {/* Media */}
      {mediaUrl ? (
        <img
          src={mediaUrl}
          alt={post.caption || 'Post media'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      ) : (
        <div className="p-4 flex flex-col justify-between h-48 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 dark:from-neutral-800 dark:to-neutral-900">
          <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 line-clamp-4">
            {post.caption || post.content}
          </p>
          <span className="text-[11px] font-bold text-primary-500">@{authorUsername}</span>
        </div>
      )}

      {/* Badge overlay (top-left) */}
      {post.badge && (
        <div className="absolute top-3 left-3">
          <Badge variant={post.badge === 'new' ? 'new' : 'trending'}>
            {post.badge === 'new' ? 'NEW' : 'Trending'}
          </Badge>
        </div>
      )}

      {/* Video indicator */}
      {post.media?.[0]?.type === 'video' && (
        <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
          <Play size={14} className="text-neutral-800" />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        {post.caption && (
          <p className="text-white text-xs font-semibold line-clamp-2 mb-1">{post.caption}</p>
        )}
        <div className="flex items-center gap-2">
          <Eye size={12} className="text-white/80" />
          <span className="text-white/80 text-xs">{formatCount((post.likesCount || post.reactionsCount || 1) * 10)} views</span>
          {post.badge === 'trending' && (
            <span className="text-orange-300 text-xs">• Trending</span>
          )}
        </div>
      </div>
    </div>
  );
}
