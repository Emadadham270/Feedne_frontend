import { useUIStore } from '@/store/uiStore';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { RightPanel } from './RightPanel';
import { CreatePostModal } from '@/features/post/components/CreatePostModal';
import { EditProfileModal } from '@/features/profile/components/EditProfileModal';
import { CommentsModal } from '@/features/post/components/CommentsModal';
import { cn } from '@/lib/utils';


/**
 * MainLayout — wraps all authenticated pages.
 * Structure: [Sidebar] [Topbar + Content] [RightPanel]
 */
export function MainLayout({ children, showRightPanel = true }) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* Sidebar — desktop always visible, mobile overlay */}
      <div className={cn(
        'hidden lg:flex flex-col flex-shrink-0 transition-all duration-300',
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

      {/* Global Modals */}
      <CreatePostModal />
      <EditProfileModal />
      <CommentsModal />
    </div>
  );
}
