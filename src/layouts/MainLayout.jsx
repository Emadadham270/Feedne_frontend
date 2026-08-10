import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useBlockStore } from '@/store/blockStore';
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
  const fetchBlockedUsers = useBlockStore((state) => state.fetchBlockedUsers);
  useNotificationSSE();

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => useUIStore.getState().toggleSidebar()}
        />
      )}

      {/* Sidebar Container */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 h-screen transition-transform duration-300 lg:static lg:flex lg:flex-shrink-0 lg:sticky lg:top-0 lg:translate-x-0 lg:w-64',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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


