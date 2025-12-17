export interface User {
  id: string;
  full_name: string;
  email: string;
  user_type?: "worker" | "employer" | "admin";
  avatar?: string;
  is_online?: boolean;
  last_seen?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender: User;
  recipient_id: string;
  content: string;
  message_type: "text" | "file" | "image" | "system";
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  participants: User[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
  is_archived?: boolean;
}

export interface CreateMessageData {
  conversation_id?: string;
  recipient_id: string;
  content: string;
  message_type?: "text" | "file" | "image";
  attachment_url?: string;
}

export interface ConversationListItem {
  conversation: Conversation;
  otherParticipant: User;
  lastMessage?: Message;
  unreadCount: number;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Record<string, Message[]>; // conversation_id -> messages[]
  loading: boolean;
  sending: boolean;
  error: string | null;
  typingUsers: Record<string, string[]>; // conversation_id -> user_ids[]
}

export interface SendMessagePayload {
  conversationId?: string;
  recipientId: string;
  content: string;
  messageType?: "text" | "file" | "image";
  attachmentUrl?: string;
}

export interface MarkAsReadPayload {
  conversationId: string;
  messageIds: string[];
}

export interface TypingIndicatorPayload {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}
