import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useGroupStore } from '@/store/groupStore';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Textarea, Input } from '@/components/ui/Input';
import {
  Users,
  Plus,
  Compass,
  Search,
  X,
  Image,
  Link as LinkIcon,
  Lock,
  Globe,
} from 'lucide-react';

export function FloatingGroupWidget() {
  const navigate = useNavigate();
  const {
    isWidgetOpen,
    widgetTab,
    closeWidget,
    toggleWidget,
    setWidgetTab,
    groups,
    myGroups,
    isLoadingGroups,
    fetchGroups,
    createGroup,
    joinGroup,
    joinByInvite,
    isSubmitting,
    error,
  } = useGroupStore();

  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Form states for creating group
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [type, setType] = useState('PUBLIC');
  const [groupFile, setGroupFile] = useState(null);
  const [groupFilePreview, setGroupFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchGroups('all');
  }, [fetchGroups]);

  const handleGroupFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setGroupFile(file);
      setGroupFilePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateGroupSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (bio.trim()) formData.append('bio', bio.trim());
      formData.append('type', type);
      if (groupFile) formData.append('media', groupFile);

      const newGroup = await createGroup(formData);
      setName('');
      setBio('');
      setGroupFile(null);
      setGroupFilePreview(null);
      closeWidget();
      if (newGroup?.id) {
        navigate(ROUTES.GROUP_VIEW(newGroup.id));
      }
    } catch {}
  };

  const handleJoinInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    try {
      const code = inviteCodeInput.trim().split('/').pop();
      const res = await joinByInvite(code);
      setInviteCodeInput('');
      setShowInviteModal(false);
      closeWidget();
      const targetId = res.member?.groupId || res.groupId;
      if (targetId) {
        navigate(ROUTES.GROUP_VIEW(targetId));
      }
    } catch {}
  };

  const handleGroupClick = (groupId) => {
    closeWidget();
    navigate(ROUTES.GROUP_VIEW(groupId));
  };

  const handleJoinClick = async (e, groupId) => {
    e.stopPropagation();
    await joinGroup(groupId);
    closeWidget();
    navigate(ROUTES.GROUP_VIEW(groupId));
  };

  const filteredGroups = (widgetTab === 'my' ? myGroups : groups).filter((g) =>
    g.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Floating Bottom-Right Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleWidget}
          className="relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-primary-500 to-tertiary-500 hover:from-primary-600 hover:to-tertiary-600 text-white font-semibold rounded-full shadow-2xl hover:shadow-primary-500/25 hover:scale-105 active:scale-95 transition-all duration-200"
          title="Groups"
        >
          <Users size={20} />
          <span className="text-sm">Groups</span>
          {myGroups.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-primary-600 text-xs font-bold flex items-center justify-center">
              {myGroups.length}
            </span>
          )}
        </button>
      </div>

      {/* Floating Bottom-Right Panel */}
      {isWidgetOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-6rem)] bg-white dark:bg-[#1A1D27] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary-500" />
              <h3 className="font-bold text-neutral-900 dark:text-white text-base">Groups</h3>
            </div>

            <button
              onClick={toggleWidget}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-neutral-100 dark:border-neutral-800 px-3 pt-2">
            <TabButton
              active={widgetTab === 'my'}
              onClick={() => setWidgetTab('my')}
              label={`My Groups (${myGroups.length})`}
            />
            <TabButton
              active={widgetTab === 'explore'}
              onClick={() => setWidgetTab('explore')}
              label="Explore"
              icon={Compass}
            />
            <TabButton
              active={widgetTab === 'create'}
              onClick={() => setWidgetTab('create')}
              label="Create"
              icon={Plus}
            />
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* MY GROUPS & EXPLORE TABS */}
            {(widgetTab === 'my' || widgetTab === 'explore') && (
              <div className="space-y-3">
                {/* Search & Invite row */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search groups..."
                      className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full pl-8 pr-4 py-1.5 text-xs outline-none placeholder:text-neutral-400"
                    />
                  </div>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-neutral-600 dark:text-neutral-300 hover:text-primary-500 transition-colors"
                    title="Join with Invite Code"
                  >
                    <LinkIcon size={14} />
                  </button>
                </div>

                {/* Invite Code Modal Overlay inside Panel */}
                {showInviteModal && (
                  <form onSubmit={handleJoinInviteSubmit} className="bg-primary-50/70 dark:bg-primary-950/40 p-3 rounded-2xl border border-primary-200 dark:border-primary-900 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-primary-700 dark:text-primary-300">
                      <span>Join via Invite Code</span>
                      <button type="button" onClick={() => setShowInviteModal(false)}>×</button>
                    </div>
                    <input
                      type="text"
                      value={inviteCodeInput}
                      onChange={(e) => setInviteCodeInput(e.target.value)}
                      placeholder="Paste invite code or link..."
                      className="w-full bg-white dark:bg-neutral-800 rounded-xl px-3 py-1.5 text-xs outline-none border border-neutral-200 dark:border-neutral-700"
                    />
                    <Button type="submit" variant="primary" size="xs" isLoading={isSubmitting}>
                      Join Group
                    </Button>
                  </form>
                )}

                {/* Groups List */}
                {isLoadingGroups ? (
                  <div className="flex justify-center py-8">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="text-center py-10">
                    <Users size={28} className="mx-auto text-neutral-300 mb-2" />
                    <p className="text-xs text-neutral-400">
                      {widgetTab === 'my' ? 'You have not joined any groups yet.' : 'No groups found.'}
                    </p>
                    {widgetTab === 'my' && (
                      <button
                        onClick={() => setWidgetTab('explore')}
                        className="mt-2 text-xs text-primary-500 hover:underline font-medium"
                      >
                        Explore Public Groups
                      </button>
                    )}
                  </div>
                ) : (
                  filteredGroups.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => handleGroupClick(g.id)}
                      className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl cursor-pointer transition-colors border border-neutral-100 dark:border-neutral-800 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={g.imgUrl} name={g.name} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-neutral-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                              {g.name}
                            </p>
                            {g.type === 'PRIVATE' && <Lock size={12} className="text-neutral-400 flex-shrink-0" />}
                          </div>
                          <p className="text-[11px] text-neutral-400">
                            {g.memberCount ?? g._count?.members ?? 1} members
                          </p>
                        </div>
                      </div>

                      {g.isMember ? (
                        <span className="text-[10px] bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                          {g.memberRole || 'Member'}
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleJoinClick(e, g.id)}
                          className="text-[11px] bg-primary-500 hover:bg-primary-600 text-white font-medium px-2.5 py-1 rounded-full transition-colors flex-shrink-0"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* CREATE GROUP TAB */}
            {widgetTab === 'create' && (
              <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
                <Input
                  label="Group Name"
                  placeholder="e.g. AI & Tech Enthusiasts"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <Textarea
                  label="Description / Bio"
                  placeholder="What is this group about?"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Group Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType('PUBLIC')}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                        type === 'PUBLIC'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      <Globe size={14} />
                      Public
                    </button>

                    <button
                      type="button"
                      onClick={() => setType('PRIVATE')}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                        type === 'PRIVATE'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      <Lock size={14} />
                      Private
                    </button>
                  </div>
                </div>

                {/* Group Avatar Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Group Cover / Avatar (optional)
                  </label>
                  {!groupFilePreview ? (
                    <label
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 p-3 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl cursor-pointer hover:border-primary-500 transition-colors text-xs text-neutral-500"
                    >
                      <Image size={16} />
                      <span>Upload image</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleGroupFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden max-h-28">
                      <img src={groupFilePreview} alt="Preview" className="w-full h-28 object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={() => { setGroupFile(null); setGroupFilePreview(null); }}
                        className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full"
                  isLoading={isSubmitting}
                  disabled={!name.trim() || isSubmitting}
                >
                  Create Group
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function TabButton({ active, onClick, label, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
        active
          ? 'border-primary-500 text-primary-500'
          : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
      }`}
    >
      {Icon && <Icon size={13} />}
      <span>{label}</span>
    </button>
  );
}
