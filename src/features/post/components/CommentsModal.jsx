import { useEffect, useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { ReactionPicker } from '@/components/ui/ReactionPicker';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { postService } from '@/services/postService';
import { getErrorMessage } from '@/services/api';
import { Trash2, Reply, ChevronDown, Send } from 'lucide-react';
import { timeAgo } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { CONFIG } from '@/constants/config';

const getCurrentUserId = () => {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.USER_KEY))?.state?.user?.id ?? null;
  } catch {
    return null;
  }
};

const updateCommentInTree = (comments, targetId, updater) =>
  comments.map((comment) => {
    if (comment.id === targetId) return updater(comment);
    if (comment._replies?.length) {
      return { ...comment, _replies: updateCommentInTree(comment._replies, targetId, updater) };
    }
    return comment;
  });

const addReplyToCommentTree = (comments, parentId, newReply) =>
  updateCommentInTree(comments, parentId, (comment) => ({
    ...comment,
    _count: { ...comment._count, replies: (comment._count?.replies ?? 0) + 1 },
    _replies: [...(comment._replies || []), newReply],
  }));

const setRepliesInCommentTree = (comments, parentId, replies) =>
  updateCommentInTree(comments, parentId, (comment) => ({
    ...comment,
    _replies: replies,
  }));

const removeCommentFromTree = (comments, targetId) =>
  comments
    .filter((comment) => comment.id !== targetId)
    .map((comment) => {
      if (comment._replies?.length) {
        return {
          ...comment,
          _count: {
            ...comment._count,
            replies: comment._replies.some((r) => r.id === targetId)
              ? Math.max(0, (comment._count?.replies ?? 1) - 1)
              : comment._count?.replies,
          },
          _replies: removeCommentFromTree(comment._replies, targetId),
        };
      }
      return comment;
    });

const updateReactionInCommentTree = (comments, targetId, currentUserId, type) =>
  updateCommentInTree(comments, targetId, (comment) => {
    const prevReactions = comment.reactions || [];
    let nextReactions = [];

    if (!type) {
      nextReactions = prevReactions.filter((r) => r.userId !== currentUserId);
    } else {
      const exists = prevReactions.some((r) => r.userId === currentUserId);
      if (exists) {
        nextReactions = prevReactions.map((r) => (r.userId === currentUserId ? { ...r, type } : r));
      } else {
        nextReactions = [...prevReactions, { userId: currentUserId, type }];
      }
    }

    return { ...comment, reactions: nextReactions };
  });

export function CommentsModal() {
  const { activeModal, activeModalData, closeModal } = useUIStore();
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null); // { id, username }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  const isOpen = activeModal === 'comments';
  const post = activeModalData;

  // Load comments when modal opens
  useEffect(() => {
    if (!isOpen || !post?.id) return;
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const result = await postService.getComments(post.id);
        if (!cancelled) setComments(result.data || []);
      } catch {}
      finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    setComments([]);
    load();
    return () => { cancelled = true; };
  }, [isOpen, post?.id]);

  const handleClose = () => {
    closeModal();
    setText('');
    setReplyTo(null);
  };

  const handleReplyTo = (comment) => {
    setReplyTo({ id: comment.id, username: comment.author?.username || 'user' });
    setText(`@${comment.author?.username || 'user'} `);
    inputRef.current?.focus();
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsSubmitting(true);
    try {
      const newComment = await postService.addComment(
        post.id,
        text.trim(),
        replyTo?.id ?? null
      );
      if (replyTo) {
        setComments((prev) => addReplyToCommentTree(prev, replyTo.id, newComment));
      } else {
        setComments((prev) => [newComment, ...prev]);
      }
      setText('');
      setReplyTo(null);
    } catch (err) {
      console.error('Failed to post comment:', getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    setComments((prev) => removeCommentFromTree(prev, commentId));
    try {
      await postService.deleteComment(commentId);
    } catch (err) {
      console.error('Failed to delete comment:', getErrorMessage(err));
    }
  };

  const handleReact = async (commentId, type) => {
    const currentUserId = user?.id || getCurrentUserId();
    setComments((prev) => updateReactionInCommentTree(prev, commentId, currentUserId, type));

    try {
      if (!type) {
        await postService.undoReactToComment(commentId);
      } else {
        await postService.reactToComment(commentId, type);
      }
    } catch (err) {
      console.error('Failed to react to comment:', getErrorMessage(err));
    }
  };

  const handleLoadReplies = (parentId, replies) => {
    setComments((prev) => setRepliesInCommentTree(prev, parentId, replies));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Comments" size="md">
      <div className="flex flex-col h-[520px] max-h-[80vh]">
        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm text-neutral-400 py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={user?.id || getCurrentUserId()}
                onDelete={handleDelete}
                onReact={handleReact}
                onReply={handleReplyTo}
                onLoadReplies={handleLoadReplies}
                postId={post?.id}
                depth={0}
              />
            ))
          )}
        </div>

        {/* Input bar */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 p-4">
          {replyTo && (
            <div className="flex items-center justify-between mb-2 text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg px-3 py-1.5">
              <span>Replying to <strong>@{replyTo.username}</strong></span>
              <button onClick={() => { setReplyTo(null); setText(''); }} className="hover:text-red-400">×</button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatar} name={user?.displayName || user?.username} size="sm" />
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              placeholder="Write a comment..."
              className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full px-4 py-2 text-sm outline-none placeholder:text-neutral-400 text-neutral-800 dark:text-neutral-100"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={!text.trim()}
              className="!rounded-full !px-3"
            >
              <Send size={14} />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function CommentItem({
  comment,
  currentUserId,
  onDelete,
  onReact,
  onReply,
  onLoadReplies,
  postId,
  depth = 0,
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingR] = useState(false);
  const replyCount = comment._count?.replies ?? 0;

  const userReaction = comment.reactions?.find((r) => r.userId === currentUserId)?.type;
  const reactionCount = comment.reactions?.length ?? 0;
  const isOwn = comment.author?.id === currentUserId;

  useEffect(() => {
    if (comment._replies?.length > 0) {
      setShowReplies(true);
    }
  }, [comment._replies?.length]);

  const loadReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }

    if (comment._replies && comment._replies.length > 0) {
      setShowReplies(true);
      return;
    }

    setLoadingR(true);
    try {
      const result = await postService.getCommentReplies(comment.id);
      onLoadReplies(comment.id, result.data || []);
      setShowReplies(true);
    } catch {}
    finally {
      setLoadingR(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar
        src={comment.author?.profile?.imgUrl}
        name={comment.author?.username}
        size={depth > 0 ? 'xs' : 'sm'}
        className="flex-shrink-0 mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl px-4 py-2.5">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            {comment.author?.username}
          </p>
          <p className="text-sm text-neutral-700 dark:text-neutral-200 break-words mt-0.5">
            {comment.content}
          </p>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-3 mt-1 px-2">
          <span className="text-xs text-neutral-400">{timeAgo(comment.createdAt)}</span>
          
          <ReactionPicker
            userReaction={userReaction}
            count={reactionCount}
            onReact={(type) => onReact(comment.id, type)}
            onRemove={() => onReact(comment.id, null)}
            size="sm"
          />

          <button
            onClick={() => onReply(comment)}
            className="flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-secondary-500 transition-colors"
          >
            <Reply size={12} />
            Reply
          </button>
          {isOwn && (
            <button
              onClick={() => onDelete(comment.id)}
              className="flex items-center gap-1 text-xs text-neutral-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>

        {/* Replies toggle button */}
        {(replyCount > 0 || (comment._replies && comment._replies.length > 0)) && (
          <button
            onClick={loadReplies}
            className="mt-2 ml-2 flex items-center gap-1.5 text-xs text-primary-500 font-medium hover:underline"
          >
            <ChevronDown size={12} className={cn('transition-transform', showReplies && 'rotate-180')} />
            {loadingReplies
              ? 'Loading...'
              : showReplies
              ? 'Hide replies'
              : `View ${Math.max(replyCount, comment._replies?.length ?? 0)} ${
                  Math.max(replyCount, comment._replies?.length ?? 0) === 1 ? 'reply' : 'replies'
                }`}
          </button>
        )}

        {/* Nested Replies list rendered recursively */}
        {showReplies && comment._replies?.length > 0 && (
          <div className="mt-3 ml-2 space-y-3 border-l-2 border-neutral-100 dark:border-neutral-800 pl-3">
            {comment._replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                onDelete={onDelete}
                onReact={onReact}
                onReply={onReply}
                onLoadReplies={onLoadReplies}
                postId={postId}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
