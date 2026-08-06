import { ExploreGridItem } from './ExploreGridItem';
import { ExploreSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { mapPosts } from '@/lib/postMapper';
import { Search } from 'lucide-react';

export function ExploreGrid({ posts, isLoading }) {
  if (isLoading) return <ExploreSkeleton />;

  const mappedPosts = mapPosts(posts || []);

  if (!mappedPosts?.length) {
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
      {mappedPosts.map((post) => (
        <ExploreGridItem key={post.id} post={post} />
      ))}
    </div>
  );
}
