import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { useUIStore } from '@/store/uiStore';
import { REACTION_TYPES } from '@/components/ui/ReactionPicker';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

export function ReactorsModal() {
  const { activeModal, activeModalData, closeModal } = useUIStore();
  const [activeTab, setActiveTab] = useState('ALL');
  const navigate = useNavigate();

  const isOpen = activeModal === 'reactors';
  const reactions = activeModalData?.reactions || [];

  if (!isOpen) return null;

  // Group reactions by type & count
  const countsByType = reactions.reduce((acc, r) => {
    const t = r.type?.toUpperCase() || 'LIKE';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const availableTabs = [
    { key: 'ALL', label: 'All', count: reactions.length, emoji: null },
    ...REACTION_TYPES.map((r) => ({
      key: r.type,
      label: r.label,
      count: countsByType[r.type] || 0,
      emoji: r.emoji,
    })).filter((t) => t.count > 0),
  ];

  const filteredReactions = activeTab === 'ALL'
    ? reactions
    : reactions.filter((r) => r.type?.toUpperCase() === activeTab);

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="People Who Reacted" size="md">
      <div className="flex flex-col h-[460px] max-h-[75vh]">
        {/* Reaction Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto">
          {availableTabs.map(({ key, label, count, emoji }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all',
                activeTab === key
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              )}
            >
              {emoji && <span className="text-sm">{emoji}</span>}
              <span>{count}</span>
            </button>
          ))}
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredReactions.length === 0 ? (
            <p className="text-center text-xs text-neutral-400 py-8">No reactions found.</p>
          ) : (
            filteredReactions.map((r, idx) => {
              const u = r.user || {};
              const username = u.username || 'User';
              const avatar = u.profile?.imgUrl || u.avatar;
              const isVerified = Boolean(u.isVerified);
              const reactObj = REACTION_TYPES.find((t) => t.type === r.type?.toUpperCase());

              return (
                <div
                  key={r.userId || idx}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
                >
                  <div
                    onClick={() => { closeModal(); navigate(ROUTES.PROFILE_VIEW(username)); }}
                    className="flex items-center gap-3 cursor-pointer min-w-0"
                  >
                    <div className="relative">
                      <Avatar src={avatar} name={username} size="md" isVerified={isVerified} />
                      {reactObj && (
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-neutral-900 shadow-md flex items-center justify-center text-xs">
                          {reactObj.emoji}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate flex items-center gap-1 hover:text-primary-500 transition-colors">
                        <span>{username}</span>
                        {isVerified && (
                          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center inline-flex" title="Verified User">
                            <Check size={9} strokeWidth={3.5} />
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
