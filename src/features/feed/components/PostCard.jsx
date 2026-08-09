import { useState } from 'react';
import { MessageCircle, Share2, Bookmark, Users, Check, ExternalLink } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { ReactionPicker } from '@/components/ui/ReactionPicker';
import { usePostStore } from '@/store/postStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { formatCount } from '@/lib/utils';
import { timeAgo } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { PostOptionsMenu } from '@/features/post/components/PostOptionsMenu';

export function PostCard({ post, isInsideModal = false }) {
  const { toggleReaction, toggleBookmark } = usePostStore();
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
  
  const userReaction = reactions.find((r) => r.userId === currentUserId)?.type || (post.isLiked ? 'LIKE' : null);
  const reactsCount = post._count?.reactions ?? reactions.length;
  const commentsCount = post._count?.comments ?? 0;
  const mediaUrl    = post.mediaUrl || null;
  const group       = post.group || null;

  const captionLimit = 160;
  const isLong       = content.length > captionLimit;
  const displayCaption = isExpanded || !isLong
    ? content
    : content.slice(0, captionLimit) + '…';

  // Handle clicking the outer post card to open it in a middle modal window
  const handlePostClick = (e) => {
    if (isInsideModal) return;
    // Don't open if user clicked an interactive element or button
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('video')) {
      return;
    }
    openModal('postDetail', post);
  };

  return (
    <article
      onClick={handlePostClick}
      className={cn(
        'card animate-fade-in transition-all',
        !isInsideModal && 'hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer',
        isInsideModal && 'shadow-none border-none bg-transparent cursor-default'
      )}
    >
      {/* Post Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={authorAvatar}
            name={authorName}
            size="md"
            hasStory={post.author?.hasStory}
            isVerified={isAuthorVerified}
            onClick={(e) => { e.stopPropagation(); navigate(ROUTES.PROFILE_VIEW(authorName)); }}
            className="cursor-pointer"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                onClick={(e) => { e.stopPropagation(); navigate(ROUTES.PROFILE_VIEW(authorName)); }}
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
                    onClick={(e) => { e.stopPropagation(); navigate(`/groups/${group.id}`); }}
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

      {/* Shared Post Original Banner — Clicking inner shared post opens ONLY that original post in middle modal */}
      {post.sharedFrom && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            openModal('postDetail', post.sharedFrom);
          }}
          className="mx-4 mb-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 hover:border-primary-500 dark:hover:border-primary-500 transition-all cursor-pointer group/share relative"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Avatar
                src={post.sharedFrom.author?.avatar || post.sharedFrom.author?.profile?.imgUrl}
                name={post.sharedFrom.author?.username || 'User'}
                size="xs"
                isVerified={post.sharedFrom.author?.isVerified}
              />
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1 group-hover/share:text-primary-500 transition-colors">
                <span>{post.sharedFrom.author?.username || post.sharedFrom.author?.displayName}</span>
                {post.sharedFrom.author?.isVerified && (
                  <span className="w-3 h-3 rounded-full bg-blue-500 text-white flex items-center justify-center inline-flex">
                    <Check size={8} strokeWidth={3.5} />
                  </span>
                )}
              </span>
              <span className="text-[10px] text-neutral-400">• Original Post</span>
            </div>
            <ExternalLink size={13} className="text-neutral-400 group-hover/share:text-primary-500 transition-colors" />
          </div>

          {post.sharedFrom.caption && (
            <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">
              {post.sharedFrom.caption}
            </p>
          )}

          {post.sharedFrom.mediaUrl && (
            <img
              src={post.sharedFrom.mediaUrl}
              alt="Original Post Media"
              className="w-full max-h-48 object-cover rounded-xl mt-2"
            />
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
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
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
          <ReactionPicker
            userReaction={userReaction}
            reactions={reactions}
            count={reactsCount}
            onReact={(type) => toggleReaction(postId, type)}
            onRemove={() => toggleReaction(postId, null)}
          />

          <button
            onClick={(e) => { e.stopPropagation(); openModal('comments', { postId }); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-primary-500 transition-colors"
          >
            <MessageCircle size={18} />
            <span>{formatCount(commentsCount)}</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); openModal('createPost', { shareFromPost: post }); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-primary-500 transition-colors"
            title="Reshare Post"
          >
            <Share2 size={18} />
            <span>{formatCount(post.numOfShares || 0)}</span>
          </button>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); toggleBookmark(postId); }}
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
