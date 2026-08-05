import { Badge } from '@/components/ui/Badge';
import { Eye, Play } from 'lucide-react';
import { formatCount } from '@/lib/utils';
import { cn } from '@/lib/utils';

/**
 * Single card in the Explore masonry grid.
 * Overlay appears on hover with title and view count.
 */
export function ExploreGridItem({ post, style }) {
  return (
    <div
      className={cn('masonry-item relative rounded-2xl overflow-hidden cursor-pointer group shadow-card hover:shadow-card-hover transition-shadow duration-300', style)}
    >
      {/* Media */}
      <img
        src={post.media[0]?.url}
        alt={post.caption}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />

      {/* Badge overlay (top-left) */}
      {post.badge && (
        <div className="absolute top-3 left-3">
          <Badge variant={post.badge === 'new' ? 'new' : 'trending'}>
            {post.badge === 'new' ? 'NEW' : 'Trending'}
          </Badge>
        </div>
      )}

      {/* Video indicator */}
      {post.media[0]?.type === 'video' && (
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
          <span className="text-white/80 text-xs">{formatCount(post.likesCount * 10)} views</span>
          {post.badge === 'trending' && (
            <span className="text-orange-300 text-xs">• Trending</span>
          )}
        </div>
      </div>
    </div>
  );
}
