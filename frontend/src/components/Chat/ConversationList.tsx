import React, { useState } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { ConversationListItem, Conversation, User } from "@/types/chat.types";
import { ConversationItem } from "./ConversationItem";
import ChatApi from "@/services/chatApi";
import { toast } from "sonner";

interface ConversationListProps {
  conversations: ConversationListItem[];
  currentConversation: Conversation | null;
  currentUserId: string;
  onSelectConversation: (conversation: Conversation) => void;
  loading?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentConversation,
  currentUserId,
  onSelectConversation,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  const filteredConversations = conversations.filter((item) =>
    item.otherParticipant.full_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleSearchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const users = await ChatApi.searchUsers(query);
      // Filter out current user
      const filteredUsers = users.filter((u) => u.id !== currentUserId);
      setSearchResults(filteredUsers);
    } catch (error: any) {
      toast.error(error.message || "Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  const handleCreateConversation = async (user: User) => {
    setCreating(true);
    try {
      const conversation = await ChatApi.getOrCreateConversation(user.id);
      onSelectConversation(conversation);
      setShowNewChatModal(false);
      setUserSearchQuery("");
      setSearchResults([]);
      toast.success(`Started conversation with ${user.full_name}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create conversation");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full bg-white border-r border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              title="New conversation"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchQuery ? "No conversations found" : "No conversations yet"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchQuery
                  ? "Try a different search term"
                  : "Start a new conversation to get started"}
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Start New Chat
              </button>
            </div>
          ) : (
            filteredConversations.map((item) => (
              <ConversationItem
                key={item.conversation.id}
                item={item}
                isActive={
                  currentConversation?.id === item.conversation.id
                }
                onClick={() => onSelectConversation(item.conversation)}
              />
            ))
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  New Conversation
                </h3>
                <button
                  onClick={() => {
                    setShowNewChatModal(false);
                    setUserSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* User Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearchQuery}
                  onChange={(e) => {
                    setUserSearchQuery(e.target.value);
                    handleSearchUsers(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {searching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <p className="text-sm text-gray-500">
                    {userSearchQuery.length < 2
                      ? "Type at least 2 characters to search"
                      : "No users found"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleCreateConversation(user)}
                      disabled={creating}
                      className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                          {user.full_name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                        <span
                          className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${
                            user.user_type === "employer"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.user_type === "employer"
                            ? "Employer"
                            : "Worker"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
