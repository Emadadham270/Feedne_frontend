import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Users, Check } from 'lucide-react';
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
  const isAuthorVerified = Boolean(post.author?.isVerified);
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
            isVerified={isAuthorVerified}
            onClick={() => navigate(ROUTES.PROFILE_VIEW(authorName))}
            className="cursor-pointer"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                onClick={() => navigate(ROUTES.PROFILE_VIEW(authorName))}
                className="text-sm font-semibold text-neutral-900 dark:text-white hover:text-primary-500 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>{authorName}</span>
                {isAuthorVerified && (
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center inline-flex" title="Verified User">
                    <Check size={9} strokeWidth={3.5} />
                  </span>
                )}
              </span>

              {group && (
                <>
                  <span className="text-neutral-400 text-xs">•</span>
                  <span
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-primary-500 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Users size={12} />
                    <span>{group.name}</span>
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-neutral-400">{timeAgo(post.createdAt)}</p>
          </div>
        </div>

        {/* Options Menu */}
        <PostOptionsMenu post={post} />
      </div>

      {/* Shared Post Original Banner */}
      {post.sharedFrom && (
        <div className="mx-4 mb-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-700/50">
          <div className="flex items-center gap-2 mb-1.5">
            <Avatar
              src={post.sharedFrom.author?.profile?.imgUrl}
              name={post.sharedFrom.author?.username}
              size="xs"
              isVerified={post.sharedFrom.author?.isVerified}
            />
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
              <span>{post.sharedFrom.author?.username}</span>
              {post.sharedFrom.author?.isVerified && (
                <span className="w-3 h-3 rounded-full bg-blue-500 text-white flex items-center justify-center inline-flex">
                  <Check size={8} strokeWidth={3.5} />
                </span>
              )}
            </span>
            <span className="text-[10px] text-neutral-400">• Original Post</span>
          </div>
          {post.sharedFrom.caption && (
            <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">
              {post.sharedFrom.caption}
            </p>
          )}
        </div>
      )}

      {/* Caption */}
      {content && (
        <div className="px-4 pb-3">
          <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line">
            {displayCaption}
          </p>
          {isLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-primary-500 hover:text-primary-600 mt-1 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Media Image/Video */}
      {mediaUrl && (
        <div className="relative bg-neutral-950 overflow-hidden max-h-[500px] flex items-center justify-center">
          {mediaUrl.includes('/video/') || mediaUrl.endsWith('.mp4') ? (
            <video src={mediaUrl} controls className="w-full max-h-[500px] object-contain" />
          ) : (
            <img src={mediaUrl} alt="Post content" className="w-full max-h-[500px] object-cover" />
          )}
        </div>
      )}

      {/* Post Actions Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 dark:border-neutral-800/60 mt-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => toggleLike(postId)}
            className={cn(
              'flex items-center gap-1.5 text-xs font-semibold transition-colors',
              isLiked ? 'text-red-500' : 'text-neutral-500 hover:text-red-500'
            )}
          >
            <Heart size={18} className={isLiked ? 'fill-current' : ''} />
            <span>{formatCount(reactsCount)}</span>
          </button>

          <button
            onClick={() => openModal('comments', { postId })}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-primary-500 transition-colors"
          >
            <MessageCircle size={18} />
            <span>{formatCount(commentsCount)}</span>
          </button>

          <button
            onClick={() => openModal('createPost', { shareFromPost: post })}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-primary-500 transition-colors"
          >
            <Share2 size={18} />
            <span>{formatCount(post.numOfShares || 0)}</span>
          </button>
        </div>

        <button
          onClick={() => toggleBookmark(postId)}
          className={cn(
            'text-neutral-500 hover:text-primary-500 transition-colors',
            post.isBookmarked && 'text-primary-500'
          )}
        >
          <Bookmark size={18} className={post.isBookmarked ? 'fill-current' : ''} />
        </button>
      </div>
    </article>
  );
}
