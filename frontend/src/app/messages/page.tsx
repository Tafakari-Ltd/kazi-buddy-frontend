"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Home } from "lucide-react";

import { RootState, AppDispatch } from "@/Redux/Store/Store";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  setCurrentConversation,
  markMessagesAsRead,
} from "@/Redux/Features/chatSlice";
import {
  ConversationList,
  ChatHeader,
  MessageThread,
  MessageInput,
} from "@/components/Chat";
import { Conversation, ConversationListItem, User } from "@/types/chat.types";

const MessagesPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Auth state
  const { user, userId, isAuthenticated } = useSelector(
    (state: RootState) => state.auth || {}
  );
  const currentUserId = userId || user?.user_id || user?.id;

  // Chat state
  const { conversations, currentConversation, messages, loading, sending } =
    useSelector((state: RootState) => state.chat);

  // Local state
  const [isClient, setIsClient] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check authentication
  useEffect(() => {
    if (isClient && !isAuthenticated) {
      toast.error("Please log in to access messages");
      router.push("/auth/login");
    }
  }, [isClient, isAuthenticated, router]);

  // Fetch conversations on mount
  useEffect(() => {
    if (isClient && isAuthenticated && currentUserId) {
      dispatch(fetchConversations());
    }
  }, [isClient, isAuthenticated, currentUserId, dispatch]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      dispatch(fetchMessages(currentConversation.id));
      dispatch(markMessagesAsRead(currentConversation.id));
    }
  }, [currentConversation, dispatch]);

  // Prepare conversation list with formatted data
  const conversationListItems: ConversationListItem[] = conversations.map(
    (conversation) => {
      const otherParticipant = conversation.participants.find(
        (p) => p.id !== currentUserId
      ) || {
        id: "unknown",
        full_name: "Unknown User",
        email: "",
      } as User;

      return {
        conversation,
        otherParticipant,
        lastMessage: conversation.last_message,
        unreadCount: conversation.unread_count,
      };
    }
  );

  const handleSelectConversation = (conversation: Conversation) => {
    dispatch(setCurrentConversation(conversation));
    setShowMobileChat(true);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentConversation) return;

    const recipientId = currentConversation.participants.find(
      (p) => p.id !== currentUserId
    )?.id;

    if (!recipientId) {
      toast.error("Recipient not found");
      return;
    }

    try {
      await dispatch(
        sendMessage({
          conversationId: currentConversation.id,
          recipientId,
          content,
          messageType: "text",
        })
      ).unwrap();
    } catch (error: any) {
      toast.error(error || "Failed to send message");
    }
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  const currentMessages = currentConversation
    ? messages[currentConversation.id] || []
    : [];

  const otherParticipant = currentConversation
    ? currentConversation.participants.find((p) => p.id !== currentUserId) ||
      null
    : null;

  if (!isClient || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Back to Homepage Button */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="container mx-auto">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">Back to Homepage</span>
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div
          className={`w-full md:w-96 flex-shrink-0 ${
            showMobileChat ? "hidden md:flex" : "flex"
          }`}
        >
          <ConversationList
            conversations={conversationListItems}
            currentConversation={currentConversation}
            currentUserId={currentUserId}
            onSelectConversation={handleSelectConversation}
            loading={loading}
          />
        </div>

        {/* Chat Area  */}
        <div
          className={`flex-1 flex flex-col ${
            !showMobileChat ? "hidden md:flex" : "flex"
          }`}
        >
          <ChatHeader
            otherParticipant={otherParticipant}
            onBack={handleBackToList}
          />
          <MessageThread
            messages={currentMessages}
            currentUserId={currentUserId}
            otherParticipant={otherParticipant}
            loading={loading && !!currentConversation}
          />
          <MessageInput
            onSendMessage={handleSendMessage}
            sending={sending}
            disabled={!currentConversation}
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
