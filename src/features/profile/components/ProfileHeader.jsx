import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { formatCount } from '@/lib/utils';
import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useBlockStore } from '@/store/blockStore';
import { userService } from '@/services/userService';
import { getErrorMessage } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { MessageCircle, ShieldAlert, Check, Ban } from 'lucide-react';
import { OTPModal } from '@/features/auth/components/OTPModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export function ProfileHeader({ user, isOwn, onOpenFollowList }) {
  const [followState, setFollowState] = useState(
    user?.isFollowing ? 'following' : user?.isRequested || user?.followStatus === 'requested' ? 'requested' : 'none'
  );
  const [isFollowingLoading, setIsLoading] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const { openModal }   = useUIStore();
  const { startConversation } = useChatStore();
  const navigate = useNavigate();

  const handleFollowToggle = async () => {
    if (isFollowingLoading || !user) return;
    setIsLoading(true);
    try {
      if (followState === 'following' || followState === 'requested') {
        await userService.unfollowUser(user.id);
        setFollowState('none');
      } else {
        const res = await userService.followUser(user.id);
        setFollowState(res.status === 'requested' ? 'requested' : 'following');
      }
    } catch (err) {
      console.error('Follow toggle failed:', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonLabel = () => {
    if (followState === 'following') return 'Following';
    if (followState === 'requested') return 'Requested';
    return 'Follow';
  };

  const handleStartMessage = () => {
    if (!user) return;
    startConversation(user);
    navigate(ROUTES.MESSAGES);
  };

  const { blockedUserIds, blockUser, unblockUser } = useBlockStore();
  const isBlocked = user?.id ? blockedUserIds.includes(user.id) : false;
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [isBlockLoading, setIsBlockLoading] = useState(false);

  const handleToggleBlock = async () => {
    if (!user) return;
    setIsBlockLoading(true);
    try {
      if (isBlocked) {
        await unblockUser(user.id);
      } else {
        await blockUser(user.id);
        setShowBlockConfirm(false);
      }
    } catch (err) {
      console.error('Failed to toggle block:', err);
    } finally {
      setIsBlockLoading(false);
    }
  };

  return (
    <div>
      {/* Cover image */}
      <div className="h-48 bg-gradient-to-br from-primary-400 to-tertiary-500 relative overflow-hidden">
        {user?.coverImage && !isBlocked && (
          <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Profile info */}
      <div className="px-6 pb-4">
        <div className="flex items-end justify-between -mt-10 mb-4">
          <Avatar
            src={user?.avatar}
            name={user?.displayName || user?.username}
            size="xl"
            userId={user?.id}
            hasStory={user?.hasStory}
            isVerified={user?.isVerified}
            className="ring-4 ring-white dark:ring-[#1A1D27]"
          />
          {isOwn ? (
            <div className="flex items-center gap-2">
              {!user?.isVerified && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsOTPModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 border-amber-600 text-white font-bold"
                >
                  Verify Account
                </Button>
              )}
              <Button variant="outlined" size="sm" onClick={() => openModal('editProfile')}>
                Edit Profile
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {!isBlocked && (
                <>
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={handleStartMessage}
                    className="flex items-center gap-1.5"
                  >
                    <MessageCircle size={14} />
                    Message
                  </Button>
                  <Button
                    variant={followState !== 'none' ? 'outlined' : 'primary'}
                    size="sm"
                    isLoading={isFollowingLoading}
                    onClick={handleFollowToggle}
                  >
                    {getButtonLabel()}
                  </Button>
                </>
              )}
              {isBlocked ? (
                <Button
                  variant="outlined"
                  size="sm"
                  isLoading={isBlockLoading}
                  onClick={handleToggleBlock}
                  className="text-neutral-700 dark:text-neutral-200"
                >
                  Unblock
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBlockConfirm(true)}
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-2"
                  title="Block User"
                >
                  <Ban size={16} />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Unverified Warning Banner for Own Account */}
        {isOwn && !user?.isVerified && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-3">
              <ShieldAlert size={22} className="flex-shrink-0" />
              <div>
                <p className="text-sm font-bold">Account Not Verified</p>
                <p className="text-xs opacity-90">
                  Verbal actions (creating posts, commenting, sending messages) are restricted until you verify your email address.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOTPModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition-all flex-shrink-0 self-end sm:self-auto"
            >
              Verify Now (Send OTP)
            </button>
          </div>
        )}

        <div className="mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span>{user?.displayName || user?.username}</span>
              {user?.isVerified && (
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center inline-flex" title="Verified Account">
                  <Check size={12} strokeWidth={3.5} />
                </span>
              )}
            </h1>
          </div>
          <p className="text-sm text-neutral-400">{user?.handle || `@${user?.username}`}</p>
        </div>

        {user?.bio && (
          <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">{user.bio}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6">
          <ProfileStat value={user?.postsCount ?? user?._count?.posts} label="Posts" />
          <ProfileStat
            value={user?.followersCount ?? user?._count?.followers}
            label="Followers"
            onClick={() => onOpenFollowList?.('followers')}
          />
          <ProfileStat
            value={user?.followingCount ?? user?._count?.following}
            label="Following"
            onClick={() => onOpenFollowList?.('following')}
          />
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OTPModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
      />

      {/* Confirm Block Modal */}
      <ConfirmModal
        isOpen={showBlockConfirm}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={handleToggleBlock}
        title={`Block @${user?.username}?`}
        description="They will not be able to view your profile, posts, or message you. You also won't see their posts."
        confirmText="Block User"
        isLoading={isBlockLoading}
      />
    </div>
  );
}

function ProfileStat({ value, label, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`text-center ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity group' : ''}`}
    >
      <p className="font-bold text-neutral-900 dark:text-white group-hover:text-primary-500 transition-colors">
        {formatCount(value || 0)}
      </p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}
