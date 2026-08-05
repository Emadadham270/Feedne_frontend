import { useEffect } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { PostCard } from '@/features/feed/components/PostCard';
import { PostSkeleton } from '@/components/ui/Skeleton';
import { usePostStore } from '@/store/postStore';
import { EmptyState } from '@/components/shared/EmptyState';
import { TrendingUp } from 'lucide-react';

const TRENDING_TOPICS = [
  { tag: '#AIRevolution', posts: '24.5k', category: 'Technology' },
  { tag: 'New Album Drops', posts: '12k', category: 'Music' },
  { tag: '#SundayVibes', posts: '8.2k', category: 'Lifestyle' },
  { tag: '#FashionWeek', posts: '31k', category: 'Fashion' },
  { tag: '#TravelDiaries', posts: '15k', category: 'Travel' },
];

export function TrendingPage() {
  const { trendingPosts, isLoadingTrending, fetchTrending } = usePostStore();

  useEffect(() => {
    fetchTrending(true);
  }, []);

  return (
    <MainLayout showRightPanel={false}>
      <div className="flex gap-6 p-6">
        {/* Trending feed */}
        <div className="flex-1 max-w-xl space-y-4">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={22} className="text-primary-500" /> What's Trending
          </h1>
          {isLoadingTrending ? (
            Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
          ) : trendingPosts.length === 0 ? (
            <EmptyState
              title="Nothing trending yet"
              description="Check back soon — trending posts update every hour."
            />
          ) : (
            trendingPosts.map((p) => <PostCard key={p.id} post={p} />)
          )}
        </div>

        {/* Right sidebar */}
        <aside className="w-72 flex-shrink-0 hidden lg:block space-y-4">
          {/* Trending topics */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
              Trending Topics
            </h3>
            <div className="space-y-3">
              {TRENDING_TOPICS.map((t, i) => (
                <div key={t.tag} className="flex items-center gap-3 cursor-pointer group">
                  <span className="text-lg font-bold text-neutral-300 dark:text-neutral-600 w-5 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs text-neutral-400">{t.category}</p>
                    <p className="text-sm font-bold group-hover:text-primary-500 transition-colors">
                      {t.tag}
                    </p>
                    <p className="text-xs text-neutral-400">{t.posts} posts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
