import { useEffect } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { StoriesRow } from '@/features/feed/components/StoriesRow';
import { PostCard } from '@/features/feed/components/PostCard';
import { PostSkeleton } from '@/components/ui/Skeleton';
import { usePostStore } from '@/store/postStore';

export function HomePage() {
  const { feedPosts, isLoadingFeed, fetchFeed } = usePostStore();

  useEffect(() => {
    fetchFeed(true);
  }, []);

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto px-4 py-4">
        {/* Stories */}
        <div className="card mb-4">
          <StoriesRow />
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {isLoadingFeed
            ? Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
            : feedPosts.map((post) => <PostCard key={post.id} post={post} />)
          }
        </div>
      </div>
    </MainLayout>
  );
}
