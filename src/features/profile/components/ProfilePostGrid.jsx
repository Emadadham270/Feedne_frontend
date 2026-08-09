import { useEffect, useState } from 'react';
import { Heart, MessageCircle, LayoutList, Grid, Bookmark, Image as ImageIcon } from 'lucide-react';
import { formatCount } from '@/lib/utils';
import { postService } from '@/services/postService';
import { mapPosts } from '@/lib/postMapper';
import { PostCard } from '@/features/feed/components/PostCard';
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

export function ProfilePostGrid({ userId, isOwn = false }) {
  const [posts, setPosts]       = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'saved'
  const [viewMode, setViewMode] = useState('feed'); // 'feed' | 'grid'
  const { openModal }           = useUIStore();

  useEffect(() => {
    if (!userId && activeTab !== 'saved') return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        let raw = [];
        if (activeTab === 'saved') {
          const res = await postService.getSavedPosts();
          raw = res.posts || [];
        } else {
          const res = await postService.getUserPosts(userId);
          raw = res.posts || [];
        }
        const currentUserId = getCurrentUserId();
        if (!cancelled) setPosts(mapPosts(raw, currentUserId));
      } catch (err) {
        console.error(`Failed to load ${activeTab}:`, err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [userId, activeTab]);

  return (
    <div className="space-y-4 pt-2">
      {/* Tab Switcher & View Mode Toggle */}
      <div className="flex items-center justify-between px-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
        {isOwn ? (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider pb-1.5 transition-colors border-b-2 ${
                activeTab === 'posts'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
            >
              <ImageIcon size={14} />
              Posts ({activeTab === 'posts' ? posts.length : '…'})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider pb-1.5 transition-colors border-b-2 ${
                activeTab === 'saved'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
            >
              <Bookmark size={14} />
              Saved ({activeTab === 'saved' ? posts.length : '…'})
            </button>
          </div>
        ) : (
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Posts ({posts.length})
          </span>
        )}

        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('feed')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'feed'
                ? 'bg-white dark:bg-neutral-700 text-primary-500 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
            title="Feed View"
          >
            <LayoutList size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-neutral-700 text-primary-500 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
            title="Grid View"
          >
            <Grid size={16} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : !posts.length ? (
        <EmptyState
          title={activeTab === 'saved' ? 'No saved posts' : 'No posts yet'}
          description={
            activeTab === 'saved'
              ? 'Bookmark posts to save them for later.'
              : 'When this user posts something, it will appear here.'
          }
        />
      ) : viewMode === 'feed' ? (
        /* Feed View Stream */
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        /* Media Grid View */
        <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
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
      )}
    </div>
  );
}
