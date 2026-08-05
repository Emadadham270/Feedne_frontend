import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { usePostStore } from '@/store/postStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { formatCount } from '@/lib/utils';
import { timeAgo } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { PostOptionsMenu } from '@/features/post/components/PostOptionsMenu';

export function PostCard({ post }) {
  const { toggleLike, toggleBookmark } = usePostStore();
  const { openModal }  = useUIStore();
  const { user }       = useAuthStore();
  const navigate       = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const postId      = post.id;
  const authorName  = post.author?.username || post.author?.displayName || 'Unknown';
  const authorAvatar = post.author?.avatar || post.author?.profile?.imgUrl;
  const content     = post.caption || post.content || '';
  const reactions   = post.reactions ?? [];
  const currentUserId = user?.id;
  const isLiked     = post.isLiked ?? reactions.some((r) => r.userId === currentUserId);
  const reactsCount = post._count?.reactions ?? reactions.length;
  const commentsCount = post._count?.comments ?? 0;
  const mediaUrl    = post.mediaUrl || null;
  const group       = post.group || null;

  const captionLimit = 160;
  const isLong       = content.length > captionLimit;
  const displayCaption = isExpanded || !isLong
    ? content
    : content.slice(0, captionLimit) + '…';

  return (
    <article className="card animate-fade-in">
      {/* Post Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={authorAvatar}
            name={authorName}
            size="md"
            hasStory={post.author?.hasStory}
            onClick={() => navigate(ROUTES.PROFILE_VIEW(authorName))}
            className="cursor-pointer"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                onClick={() => navigate(ROUTES.PROFILE_VIEW(authorName))}
                className="text-sm font-semibold text-neutral-900 dark:text-white hover:text-primary-500 transition-colors cursor-pointer"
              >
                {authorName}
              </span>

              {group && (
                <>
                  <span className="text-xs text-neutral-400 font-bold px-0.5">➔</span>
                  <span
                    onClick={() => navigate(ROUTES.GROUP_VIEW(group.id))}
                    className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer flex items-center gap-1 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-full border border-primary-200/50 dark:border-primary-900/50"
                  >
                    <Users size={12} />
                    {group.name}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">{timeAgo(post.createdAt || new Date())}</p>
          </div>
        </div>

        {/* Options menu (edit/delete for own, share for all) */}
        <PostOptionsMenu post={post} />
      </div>

      {/* Shared-from banner */}
      {post.sharedFrom && (
        <div className="mx-4 mb-3 px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm">
          <p className="text-xs text-neutral-400 mb-1">
            Reposted from <span className="font-medium text-neutral-600 dark:text-neutral-300">@{post.sharedFrom.author?.username}</span>
          </p>
          {post.sharedFrom.caption && (
            <p className="text-neutral-700 dark:text-neutral-200 line-clamp-2">{post.sharedFrom.caption}</p>
          )}
          {post.sharedFrom.mediaUrl && (
            <img
              src={post.sharedFrom.mediaUrl}
              alt="Shared post"
              className="mt-2 w-full max-h-48 object-cover rounded-lg"
            />
          )}
        </div>
      )}

      {/* Caption */}
      {content && (
        <div className="px-4 pb-3">
          <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed break-words">
            {displayCaption}
            {isLong && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-1 text-primary-500 font-medium hover:underline"
              >
                {isExpanded ? 'less' : 'more'}
              </button>
            )}
          </p>
        </div>
      )}

      {/* Media */}
      {mediaUrl && (
        <div className="relative overflow-hidden">
          {mediaUrl.includes('/video/') || post.mediaType === 'VIDEO' ? (
            <video
              src={mediaUrl}
              className="w-full max-h-[520px] object-cover"
              controls
            />
          ) : (
            <img
              src={mediaUrl}
              alt={content || 'Post image'}
              className="w-full max-h-[520px] object-cover"
              loading="lazy"
            />
          )}
        </div>
      )}

      {/* Engagement Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={() => toggleLike(postId)}
            className="flex items-center gap-1.5 group"
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart
              size={20}
              className={cn(
                'transition-all duration-200',
                isLiked
                  ? 'fill-primary-500 text-primary-500 scale-110'
                  : 'text-neutral-400 group-hover:text-primary-500 group-hover:scale-110',
              )}
            />
            <span className={cn('text-sm font-medium', isLiked ? 'text-primary-500' : 'text-neutral-500')}>
              {formatCount(reactsCount)}
            </span>
          </button>

          {/* Comment */}
          <button
            onClick={() => openModal('comments', post)}
            className="flex items-center gap-1.5 group"
            aria-label="Comments"
          >
            <MessageCircle size={20} className="text-neutral-400 group-hover:text-secondary-500 transition-colors" />
            <span className="text-sm font-medium text-neutral-500">{formatCount(commentsCount)}</span>
          </button>
        </div>

        {/* Bookmark */}
        <button
          onClick={() => toggleBookmark(postId)}
          aria-label={post.isBookmarked ? 'Unbookmark' : 'Bookmark'}
          className="group"
        >
          <Bookmark
            size={20}
            className={cn(
              'transition-all duration-200',
              post.isBookmarked
                ? 'fill-secondary-500 text-secondary-500'
                : 'text-neutral-400 group-hover:text-secondary-500',
            )}
          />
        </button>
      </div>
    </article>
  );
}
