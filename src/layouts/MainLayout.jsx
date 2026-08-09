import { useUIStore } from '@/store/uiStore';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { RightPanel } from './RightPanel';
import { CreatePostModal } from '@/features/post/components/CreatePostModal';
import { PostDetailModal } from '@/features/post/components/PostDetailModal';
import { EditProfileModal } from '@/features/profile/components/EditProfileModal';
import { CommentsModal } from '@/features/post/components/CommentsModal';
import { ReactorsModal } from '@/features/post/components/ReactorsModal';
import { CreateStoryModal } from '@/features/story/components/CreateStoryModal';
import { StoryViewerModal } from '@/features/story/components/StoryViewerModal';
import { FloatingGroupWidget } from '@/features/group/components/FloatingGroupWidget';
import { IncomingCallOverlay } from '@/features/chat/components/IncomingCallOverlay';
import { cn } from '@/lib/utils';


import { useNotificationSSE } from '@/hooks/useNotificationSSE';

import { NotificationToastContainer } from '@/features/notifications/components/NotificationToastContainer';
import { VerificationRequiredModal } from '@/features/auth/components/VerificationRequiredModal';

/**
 * MainLayout — wraps all authenticated pages.
 * Structure: [Sidebar] [Topbar + Content] [RightPanel]
 */
export function MainLayout({ children, showRightPanel = true }) {
  const { sidebarOpen } = useUIStore();
  useNotificationSSE();

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* Sidebar — desktop always visible, sticky top-0 h-screen */}
      <div className={cn(
        'hidden lg:flex flex-col flex-shrink-0 sticky top-0 h-screen z-30 transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-0 overflow-hidden',
      )}>
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 flex">
          <div className="flex-1 min-w-0">
            {children}
          </div>
          {showRightPanel && <RightPanel />}
        </main>
      </div>

      {/* Global Modals & Floating Bottom-Right Widgets */}
      <CreatePostModal />
      <PostDetailModal />
      <CreateStoryModal />
      <StoryViewerModal />
      <EditProfileModal />
      <CommentsModal />
      <ReactorsModal />
      <FloatingGroupWidget />
      <IncomingCallOverlay />
      <NotificationToastContainer />
      <VerificationRequiredModal />
    </div>
  );
}


