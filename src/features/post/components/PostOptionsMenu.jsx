import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Pencil, Trash2, Share2 } from 'lucide-react';
import { usePostStore } from '@/store/postStore';
import { useAuthStore } from '@/store/authStore';
import { postService } from '@/services/postService';
import { getErrorMessage } from '@/services/api';
import { cn } from '@/lib/utils';

/**
 * PostOptionsMenu — the "..." dropdown on PostCard.
 * Shows edit/delete for own posts, share for all posts.
 */
export function PostOptionsMenu({ post }) {
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError]     = useState(null);
  const menuRef = useRef(null);

  const { user }              = useAuthStore();
  const { removePost, updatePostCaption } = usePostStore();

  const isOwn = post.author?.id === user?.id;

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await postService.deletePost(post.id);
      removePost(post.id);
    } catch (err) {
      alert(getErrorMessage(err));
    }
    setOpen(false);
  };

  const handleEdit = async () => {
    if (!caption.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      await postService.editPost(post.id, caption.trim());
      updatePostCaption(post.id, caption.trim());
      setEditing(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    openModal('createPost', { shareFromPost: post });
    setOpen(false);
  };

  if (editing) {
    return (
      <div className="px-4 pb-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-2">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full text-sm bg-neutral-100 dark:bg-neutral-800 rounded-xl p-3 outline-none resize-none min-h-[80px]"
            autoFocus
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditing(false)}
              className="text-xs text-neutral-500 hover:text-neutral-700 px-3 py-1.5 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={isSaving || !caption.trim()}
              className="text-xs bg-primary-500 text-white px-3 py-1.5 rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        aria-label="Post options"
      >
        <MoreHorizontal size={18} className="text-neutral-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-44 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl shadow-xl py-1 animate-fade-in">
          {isOwn && (
            <>
              <button
                onClick={() => { setEditing(true); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <Pencil size={15} />
                Edit post
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={15} />
                Delete post
              </button>
              <div className="border-t border-neutral-100 dark:border-neutral-800 my-1" />
            </>
          )}
          <button
            onClick={handleShare}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Share2 size={15} />
            Repost
          </button>
        </div>
      )}
    </div>
  );
}
