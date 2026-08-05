import { ExploreGridItem } from './ExploreGridItem';
import { ExploreSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Search } from 'lucide-react';

export function ExploreGrid({ posts, isLoading }) {
  if (isLoading) return <ExploreSkeleton />;

  if (!posts?.length) {
    return (
      <EmptyState
        icon={Search}
        title="No posts found"
        description="Try a different category or check back later."
      />
    );
  }

  return (
    <div className="masonry-grid">
      {posts.map((post) => (
        <ExploreGridItem key={post.id} post={post} />
      ))}
    </div>
  );
}
