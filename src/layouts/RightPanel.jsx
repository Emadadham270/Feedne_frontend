import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '@/services/userService';
import { postService } from '@/services/postService';
import { mapUsers } from '@/lib/userMapper';
import { mapPosts } from '@/lib/postMapper';
import { UserCard } from '@/components/shared/UserCard';
import { Avatar } from '@/components/ui/Avatar';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { timeAgo } from '@/lib/dateUtils';
import { Flame, Heart, MessageCircle, TrendingUp } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export function RightPanel() {
  const [suggested, setSuggested] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const { openModal } = useUIStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    userService.getUsers({ limit: 5 })
      .then((res) => setSuggested(mapUsers(res.data || [])))
      .catch(() => {});

    setIsLoadingTrending(true);
    postService.getTrendingPosts({ limit: 5 })
      .then((res) => {
        setTrendingPosts(mapPosts(res.posts || res.data || [], user?.id));
      })
      .catch(() => {})
      .finally(() => setIsLoadingTrending(false));
  }, [user?.id]);

  const handleFollow = async (userId, shouldFollow) => {
    try {
      if (shouldFollow) {
        await userService.followUser(userId);
      } else {
        await userService.unfollowUser(userId);
      }
      setSuggested((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isFollowing: shouldFollow } : u))
      );
    } catch (err) {
      console.error('Follow failed:', err);
    }
  };

  return (
    <aside className="w-80 flex-shrink-0 hidden xl:flex flex-col gap-4 py-6 px-2">
      {/* Real Trending Posts (ranked by interactions / hours^1.5) */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500" size={18} />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Trending Posts</h3>
          </div>
          <button
            onClick={() => navigate(ROUTES.TRENDING)}
            className="text-xs text-primary-500 font-semibold hover:underline"
          >
            View All
          </button>
        </div>

        {isLoadingTrending ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : trendingPosts.length === 0 ? (
          <p className="text-xs text-neutral-400 py-2">No trending posts right now.</p>
        ) : (
          <div className="space-y-3.5">
            {trendingPosts.map((post, idx) => (
              <div
                key={post.id}
                onClick={() => openModal('postDetail', post)}
                className="group cursor-pointer p-2.5 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors border border-transparent hover:border-neutral-100 dark:hover:border-neutral-800"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xs font-black text-neutral-400 dark:text-neutral-500 w-4 pt-0.5">
                    #{idx + 1}
                  </span>
                  <Avatar
                    src={post.author?.avatar || post.author?.profile?.imgUrl}
                    name={post.author?.username}
                    size="xs"
                    isVerified={post.author?.isVerified}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-neutral-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                        {post.author?.username}
                      </p>
                      <span className="text-[10px] text-neutral-400">· {timeAgo(post.createdAt)}</span>
                    </div>

                    {post.caption && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 mt-0.5 leading-relaxed">
                        {post.caption}
                      </p>
                    )}

                    {/* Shared original post snippet */}
                    {post.sharedFrom && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('postDetail', post.sharedFrom);
                        }}
                        className="mt-1.5 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/50 hover:border-primary-500 transition-all text-[11px]"
                      >
                        <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                          Original: @{post.sharedFrom.author?.username || 'User'}
                        </span>
                        {post.sharedFrom.caption && (
                          <p className="text-neutral-500 dark:text-neutral-400 line-clamp-1">
                            {post.sharedFrom.caption}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Heart size={11} className="text-red-500 fill-red-500/20" />
                        {post._count?.reactions ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={11} className="text-blue-500" />
                        {post._count?.comments ?? 0}
                      </span>
                    </div>
                  </div>

                  {post.mediaUrl && (
                    <img
                      src={post.mediaUrl}
                      alt="Thumbnail"
                      className="w-10 h-10 object-cover rounded-xl flex-shrink-0"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Who to follow */}
      {suggested.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">Who to follow</h3>
          <div className="space-y-1">
            {suggested.map((user) => (
              <UserCard key={user.id} user={user} compact onFollow={handleFollow} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-neutral-400 dark:text-neutral-600 px-1 leading-relaxed">
        Terms of Service · Privacy Policy · Cookie Policy
        <br />© 2025 Feedne Inc.
      </p>
    </aside>
  );
}
