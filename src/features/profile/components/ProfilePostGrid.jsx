import { useEffect, useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { formatCount } from '@/lib/utils';
import { postService } from '@/services/postService';
import { mapPosts } from '@/lib/postMapper';
import { Spinner } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useUIStore } from '@/store/uiStore';
import { CONFIG } from '@/constants/config';

const getCurrentUserId = () => {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.USER_KEY))?.state?.user?.id ?? null;
  } catch {
    return null;
  }
};

export function ProfilePostGrid({ userId }) {
  const [posts, setPosts]       = useState([]);
  const [isLoading, setLoading] = useState(false);
  const { openModal }           = useUIStore();

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const { posts: raw } = await postService.getUserPosts(userId);
        const currentUserId  = getCurrentUserId();
        if (!cancelled) setPosts(mapPosts(raw, currentUserId));
      } catch (err) {
        console.error('Failed to load user posts:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!posts.length) {
    return (
      <EmptyState
        title="No posts yet"
        description="When this user posts something, it will appear here."
      />
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <div
          key={post.id}
          className="relative aspect-square overflow-hidden group cursor-pointer"
          onClick={() => openModal('comments', post)}
        >
          {post.mediaUrl ? (
            <img
              src={post.mediaUrl}
              alt={post.caption || 'Post'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center p-2">
              <p className="text-xs text-neutral-500 text-center line-clamp-4">{post.caption}</p>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1 text-white text-sm font-bold">
              <Heart size={16} className="fill-white" />
              {formatCount(post._count?.reactions ?? 0)}
            </span>
            <span className="flex items-center gap-1 text-white text-sm font-bold">
              <MessageCircle size={16} className="fill-white" />
              {formatCount(post._count?.comments ?? 0)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
