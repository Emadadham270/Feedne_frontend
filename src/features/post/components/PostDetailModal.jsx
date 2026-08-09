import { Modal } from '@/components/ui/Modal';
import { useUIStore } from '@/store/uiStore';
import { usePostStore } from '@/store/postStore';
import { PostCard } from '@/features/feed/components/PostCard';

export function PostDetailModal() {
  const { activeModal, activeModalData, closeModal } = useUIStore();
  const isOpen = activeModal === 'postDetail';

  const initialPost = activeModalData;
  const postId = initialPost?.id;

  // Subscribe to live post state from Zustand store so reactions/comments update in real-time inside modal
  const livePost = usePostStore((s) => {
    if (!postId) return null;
    return (
      s.feedPosts.find((p) => p.id === postId) ||
      s.explorePosts.find((p) => p.id === postId) ||
      s.trendingPosts.find((p) => p.id === postId) ||
      s.savedPosts.find((p) => p.id === postId) ||
      initialPost
    );
  });

  const post = livePost || initialPost;

  if (!isOpen || !post) return null;

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Post Detail" size="lg">
      <div className="p-4 overflow-y-auto max-h-[80vh]">
        <PostCard post={post} isInsideModal />
      </div>
    </Modal>
  );
}
