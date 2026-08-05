import { useEffect, useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { ChatListItem } from '@/features/chat/components/ChatListItem';
import { ChatWindow } from '@/features/chat/components/ChatWindow';
import { useChatStore } from '@/store/chatStore';
import { userService } from '@/services/userService';
import { mapUsers } from '@/lib/userMapper';
import { Spinner } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { MessageCircle, Search, X } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

export function MessagesPage() {
  const {
    conversations,
    isLoading,
    fetchConversations,
    setActiveConversation,
    startConversation: storeStartConversation,
    activeConversationId,
  } = useChatStore();

  const [searchQuery, setSearchQuery]         = useState('');
  const [searchResults, setSearchResults]     = useState([]);
  const [isSearching, setIsSearching]         = useState(false);
  const [showUserSearch, setShowUserSearch]   = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Search for users to start a new conversation
  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const result = await userService.searchUsers(q.trim(), { limit: 8 });
      setSearchResults(mapUsers(result.data || []));
    } catch {}
    finally { setIsSearching(false); }
  };

  const startConversation = (user) => {
    storeStartConversation(user);
    setShowUserSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <MainLayout showRightPanel={false}>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Conversation list */}
        <div className="w-80 flex-shrink-0 border-r border-neutral-100 dark:border-neutral-800 flex flex-col">
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <h2 className="font-bold text-neutral-900 dark:text-white">Messages</h2>
            <button
              onClick={() => setShowUserSearch((v) => !v)}
              className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="New message"
            >
              {showUserSearch ? <X size={16} className="text-neutral-400" /> : <Search size={16} className="text-neutral-400" />}
            </button>
          </div>

          {/* User search for new conversations */}
          {showUserSearch && (
            <div className="p-3 border-b border-neutral-100 dark:border-neutral-800">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full px-4 py-2 text-sm outline-none placeholder:text-neutral-400"
                autoFocus
              />
              {isSearching && (
                <div className="flex justify-center py-3">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {searchResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => startConversation(u)}
                  className="w-full flex items-center gap-3 px-2 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-colors mt-1"
                >
                  <Avatar src={u.avatar} name={u.displayName} size="sm" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{u.displayName}</p>
                    <p className="text-xs text-neutral-400">{u.handle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Conversation items */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MessageCircle size={32} className="text-neutral-300 mb-2" />
                <p className="text-sm text-neutral-400">No conversations yet</p>
                <button
                  onClick={() => setShowUserSearch(true)}
                  className="mt-2 text-sm text-primary-500 hover:underline"
                >
                  Start a new conversation
                </button>
              </div>
            ) : (
              conversations.map((conv) => (
                <ChatListItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeConversationId}
                  onClick={() => setActiveConversation(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1">
          <ChatWindow conversation={activeConversation} />
        </div>
      </div>
    </MainLayout>
  );
}
