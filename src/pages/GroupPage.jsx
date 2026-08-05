import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PostCard } from '@/features/feed/components/PostCard';
import { Spinner } from '@/components/ui/Skeleton';
import { useGroupStore } from '@/store/groupStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { groupService } from '@/services/groupService';
import {
  Users,
  Globe,
  Lock,
  UserPlus,
  LogOut,
  Link as LinkIcon,
  PlusCircle,
  Shield,
  MessageSquare,
} from 'lucide-react';

export function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { openModal } = useUIStore();
  const { user } = useAuthStore();
  const {
    activeGroup,
    activeGroupPosts,
    activeGroupMembers,
    isLoadingActiveGroup,
    selectGroup,
    joinGroup,
    leaveGroup,
  } = useGroupStore();

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'members'
  const [copyFeedback, setCopyFeedback] = useState('');

  useEffect(() => {
    if (groupId) {
      selectGroup(groupId);
    }
  }, [groupId, selectGroup]);

  const generateInviteLink = async () => {
    try {
      const invite = await groupService.generateInviteCode(groupId, 24);
      const fullUrl = `${window.location.origin}/groups/join/${invite.code}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopyFeedback('Invite link copied to clipboard!');
      setTimeout(() => setCopyFeedback(''), 3000);
    } catch (err) {
      console.error('Invite link generation failed:', err);
    }
  };

  const handleCreatePost = () => {
    openModal('createPost', { group: activeGroup });
  };

  if (isLoadingActiveGroup || !activeGroup) {
    return (
      <MainLayout>
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      </MainLayout>
    );
  }

  const isMember = activeGroup.isMember;
  const isPrivate = activeGroup.type === 'PRIVATE';

  return (
    <MainLayout showRightPanel={false}>
      <div className="max-w-3xl mx-auto pb-12 animate-fade-in">
        {/* Cover / Header Banner */}
        <div className="h-48 bg-gradient-to-r from-primary-500 via-secondary-500 to-tertiary-500 rounded-b-3xl relative overflow-hidden">
          {activeGroup.backUrl && (
            <img src={activeGroup.backUrl} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Group Info Header */}
        <div className="px-6 pb-4 bg-white dark:bg-[#1A1D27] rounded-b-3xl shadow-sm -mt-6 pt-0 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <Avatar
              src={activeGroup.imgUrl}
              name={activeGroup.name}
              size="xl"
              className="ring-4 ring-white dark:ring-[#1A1D27]"
            />

            <div className="flex items-center gap-2">
              {isMember ? (
                <>
                  <Button variant="primary" size="sm" onClick={handleCreatePost}>
                    <PlusCircle size={16} className="mr-1.5" />
                    Create Post
                  </Button>
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => leaveGroup(activeGroup.id)}
                    className="!text-red-500 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <LogOut size={14} className="mr-1.5" />
                    Leave Group
                  </Button>
                </>
              ) : (
                <Button variant="primary" size="sm" onClick={() => joinGroup(activeGroup.id)}>
                  <UserPlus size={16} className="mr-1.5" />
                  Join Group
                </Button>
              )}

              {/* Invite link button for members */}
              {isMember && (
                <Button variant="outlined" size="sm" onClick={generateInviteLink}>
                  <LinkIcon size={14} className="mr-1.5" />
                  Invite
                </Button>
              )}
            </div>
          </div>

          {copyFeedback && (
            <div className="mb-3 px-3 py-1.5 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 text-xs font-medium rounded-xl border border-green-200 dark:border-green-900 flex items-center justify-between">
              <span>{copyFeedback}</span>
            </div>
          )}

          <div className="mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {activeGroup.name}
              </h1>
              <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                {isPrivate ? <Lock size={12} /> : <Globe size={12} />}
                {activeGroup.type}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {activeGroup.memberCount ?? activeGroup._count?.members ?? 1} members · {activeGroup.postsCount ?? activeGroup._count?.posts ?? 0} posts
            </p>
          </div>

          {activeGroup.bio && (
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              {activeGroup.bio}
            </p>
          )}

          {/* Group Tabs */}
          <div className="flex border-b border-neutral-100 dark:border-neutral-800 pt-2 gap-6">
            <button
              onClick={() => setActiveTab('feed')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'feed'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <MessageSquare size={16} />
              <span>Group Feed ({activeGroupPosts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'members'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <Users size={16} />
              <span>Members ({activeGroupMembers.length})</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* FEED TAB */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              {isPrivate && !isMember ? (
                <div className="card p-12 text-center">
                  <Lock size={40} className="mx-auto text-neutral-400 mb-3" />
                  <h3 className="font-bold text-neutral-900 dark:text-white text-lg">Private Group</h3>
                  <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
                    You must join this group using an invite code to view its feed and posts.
                  </p>
                </div>
              ) : activeGroupPosts.length === 0 ? (
                <div className="card p-12 text-center">
                  <MessageSquare size={40} className="mx-auto text-neutral-300 mb-3" />
                  <p className="text-neutral-500 text-sm font-medium">No posts in this group yet.</p>
                  {isMember && (
                    <Button variant="primary" size="sm" onClick={handleCreatePost} className="mt-4">
                      Be the first to post
                    </Button>
                  )}
                </div>
              ) : (
                activeGroupPosts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>
          )}

          {/* MEMBERS TAB */}
          {activeTab === 'members' && (
            <div className="card p-5 space-y-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Group Members ({activeGroupMembers.length})
              </h3>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {activeGroupMembers.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={m.user?.profile?.imgUrl}
                        name={m.user?.username}
                        size="md"
                      />
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {m.user?.username}
                        </p>
                        <p className="text-xs text-neutral-400">Joined {timeAgo(m.joinedAt)}</p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center gap-1">
                      {m.role === 'ADMIN' && <Shield size={12} />}
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
