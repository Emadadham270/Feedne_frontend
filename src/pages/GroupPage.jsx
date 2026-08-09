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
import { timeAgo } from '@/lib/dateUtils';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
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
  UserCheck,
  UserX,
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
    updateMemberRole,
    removeMember,
  } = useGroupStore();

  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'members'
  const [inviteCode, setInviteCode] = useState(null);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [removeTargetMemberId, setRemoveTargetMemberId] = useState(null);
  const [makeAdminTargetMemberId, setMakeAdminTargetMemberId] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (groupId) {
      selectGroup(groupId);
    }
  }, [groupId, selectGroup]);

  if (isLoadingActiveGroup) {
    return (
      <MainLayout showRightPanel={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (!activeGroup) {
    return (
      <MainLayout showRightPanel={false}>
        <div className="card p-12 text-center max-w-md mx-auto my-12 space-y-4">
          <Users size={48} className="mx-auto text-neutral-400" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Group Not Found</h2>
          <p className="text-xs text-neutral-400">The group you're looking for doesn't exist or was removed.</p>
          <Button variant="primary" size="sm" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </MainLayout>
    );
  }

  const isMember = activeGroup.isMember;
  const isAdmin = activeGroup.memberRole === 'ADMIN';

  const handleJoin = async () => {
    await joinGroup(activeGroup.id);
  };



  const confirmLeaveGroup = async () => {
    setIsActionLoading(true);
    try {
      await leaveGroup(activeGroup.id);
      setShowLeaveConfirm(false);
    } catch (err) {
      alert(err.message || 'Failed to leave group');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCreatePost = () => {
    openModal('createPost', { defaultGroupId: activeGroup.id });
  };

  const handleGenerateInvite = async () => {
    setIsGeneratingInvite(true);
    try {
      const res = await groupService.generateInviteCode(activeGroup.id, 24);
      setInviteCode(res.inviteUrl);
    } catch (err) {
      console.error('Failed to generate invite:', err);
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleCopyInvite = () => {
    if (!inviteCode) return;
    const fullUrl = `${window.location.origin}${inviteCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confirmMakeAdmin = async () => {
    if (!makeAdminTargetMemberId) return;
    setIsActionLoading(true);
    try {
      await updateMemberRole(activeGroup.id, makeAdminTargetMemberId, 'ADMIN');
      setMakeAdminTargetMemberId(null);
    } catch (err) {
      alert(err.message || 'Failed to make admin');
    } finally {
      setIsActionLoading(false);
    }
  };

  const confirmRemoveMember = async () => {
    if (!removeTargetMemberId) return;
    setIsActionLoading(true);
    try {
      await removeMember(activeGroup.id, removeTargetMemberId);
      setRemoveTargetMemberId(null);
    } catch (err) {
      alert(err.message || 'Failed to remove member');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <MainLayout showRightPanel={false}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header Banner & Group Info */}
        <div className="card overflow-hidden">
          {/* Banner cover */}
          <div className="h-44 bg-gradient-to-r from-primary-600 via-tertiary-600 to-indigo-600 relative">
            {activeGroup.imgUrl && (
              <img
                src={activeGroup.imgUrl}
                alt={activeGroup.name}
                className="w-full h-full object-cover opacity-60"
              />
            )}
          </div>

          {/* Details Bar */}
          <div className="p-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-end gap-4 -mt-12">
              <Avatar
                src={activeGroup.imgUrl}
                name={activeGroup.name}
                size="xl"
                className="ring-4 ring-white dark:ring-neutral-900 shadow-xl"
              />
              <div className="space-y-1 mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                    {activeGroup.name}
                  </h1>
                  {activeGroup.type === 'PRIVATE' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                      <Lock size={12} /> Private
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Globe size={12} /> Public
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400">
                  {activeGroup.memberCount ?? activeGroup._count?.members ?? 1} Members
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mb-1">
              {isMember ? (
                <>
                  <Button variant="primary" size="sm" onClick={handleCreatePost} className="gap-1.5">
                    <PlusCircle size={16} /> Create Post
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={handleGenerateInvite}
                      isLoading={isGeneratingInvite}
                      className="gap-1.5"
                    >
                      <LinkIcon size={16} /> Invite
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setShowLeaveConfirm(true)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                    <LogOut size={16} />
                  </Button>
                </>
              ) : (
                <Button variant="primary" size="sm" onClick={handleJoin} className="gap-1.5">
                  <UserPlus size={16} /> Join Group
                </Button>
              )}
            </div>
          </div>

          {/* Group Description & Invite link display */}
          <div className="p-6 space-y-4">
            {activeGroup.bio && (
              <p className="text-sm text-neutral-600 dark:text-neutral-300">{activeGroup.bio}</p>
            )}

            {inviteCode && (
              <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800 p-3 rounded-xl">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}${inviteCode}`}
                  className="bg-transparent text-xs font-mono text-neutral-800 dark:text-neutral-200 flex-1 outline-none truncate"
                />
                <Button size="xs" variant="primary" onClick={handleCopyInvite}>
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Group Tabs */}
        <div className="space-y-4">
          <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'posts'
                  ? 'border-primary-500 text-primary-500 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'members'
                  ? 'border-primary-500 text-primary-500 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Members ({activeGroupMembers.length})
            </button>
          </div>

          {/* POSTS TAB */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {activeGroupPosts.length === 0 ? (
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

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center gap-1">
                        {m.role === 'ADMIN' && <Shield size={12} />}
                        {m.role}
                      </span>

                      {isAdmin && m.user?.id !== user?.id && (
                        <div className="flex items-center gap-1.5 ml-2">
                          {m.role !== 'ADMIN' && (
                            <Button
                              size="xs"
                              variant="outlined"
                              onClick={() => setMakeAdminTargetMemberId(m.user.id)}
                              className="text-xs gap-1"
                              title="Make Admin"
                            >
                              <UserCheck size={12} /> Make Admin
                            </Button>
                          )}
                          <Button
                            size="xs"
                            variant="danger"
                            onClick={() => setRemoveTargetMemberId(m.user.id)}
                            className="text-xs gap-1"
                            title="Remove Member"
                          >
                            <UserX size={12} /> Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={confirmLeaveGroup}
        title="Leave Group"
        description="Are you sure you want to leave this group?"
        confirmText="Leave Group"
        isLoading={isActionLoading}
      />

      <ConfirmModal
        isOpen={!!removeTargetMemberId}
        onClose={() => setRemoveTargetMemberId(null)}
        onConfirm={confirmRemoveMember}
        title="Remove Member"
        description="Are you sure you want to remove this member from the group?"
        confirmText="Remove Member"
        isLoading={isActionLoading}
      />

      <ConfirmModal
        isOpen={!!makeAdminTargetMemberId}
        onClose={() => setMakeAdminTargetMemberId(null)}
        onConfirm={confirmMakeAdmin}
        title="Make Group Admin"
        description="Are you sure you want to promote this member to Group Admin?"
        confirmText="Make Admin"
        variant="primary"
        isLoading={isActionLoading}
      />
    </MainLayout>
  );
}
