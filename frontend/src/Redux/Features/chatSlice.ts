"use client";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import ChatApi from "@/services/chatApi";
import {
  ChatState,
  Conversation,
  Message,
  SendMessagePayload,
} from "@/types/chat.types";

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: {},
  loading: false,
  sending: false,
  error: null,
  typingUsers: {},
};

// Async Thunks

/**
 * Fetch all conversations for the current user
 */
export const fetchConversations = createAsyncThunk<
  Conversation[],
  void,
  { rejectValue: string }
>("chat/fetchConversations", async (_, { rejectWithValue }) => {
  try {
    const conversations = await ChatApi.getConversations();
    return conversations;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch conversations");
  }
});

/**
 * Get or create a conversation with a specific user
 */
export const getOrCreateConversation = createAsyncThunk<
  Conversation,
  string,
  { rejectValue: string }
>("chat/getOrCreateConversation", async (participantId, { rejectWithValue }) => {
  try {
    const conversation = await ChatApi.getOrCreateConversation(participantId);
    return conversation;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to create conversation");
  }
});

/**
 * Fetch messages for a specific conversation
 */
export const fetchMessages = createAsyncThunk<
  { conversationId: string; messages: Message[] },
  string,
  { rejectValue: string }
>("chat/fetchMessages", async (conversationId, { rejectWithValue }) => {
  try {
    const messages = await ChatApi.getMessages(conversationId);
    return { conversationId, messages };
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch messages");
  }
});

/**
 * Send a new message
 */
export const sendMessage = createAsyncThunk<
  Message,
  SendMessagePayload,
  { rejectValue: string }
>("chat/sendMessage", async (payload, { rejectWithValue }) => {
  try {
    const messageData = {
      conversation_id: payload.conversationId,
      recipient_id: payload.recipientId,
      content: payload.content,
      message_type: payload.messageType || "text",
      attachment_url: payload.attachmentUrl,
    };
    const message = await ChatApi.sendMessage(messageData);
    return message;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to send message");
  }
});

/**
 * Mark messages as read
 */
export const markMessagesAsRead = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("chat/markMessagesAsRead", async (conversationId, { rejectWithValue }) => {
  try {
    await ChatApi.markMessagesAsRead(conversationId);
    return conversationId;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to mark messages as read");
  }
});

/**
 * Archive a conversation
 */
export const archiveConversation = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("chat/archiveConversation", async (conversationId, { rejectWithValue }) => {
  try {
    await ChatApi.archiveConversation(conversationId);
    return conversationId;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to archive conversation");
  }
});

// Slice
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.currentConversation = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const conversationId = message.conversation_id;
      
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      // Avoid duplicates
      const exists = state.messages[conversationId].some(m => m.id === message.id);
      if (!exists) {
        state.messages[conversationId].push(message);
      }
      
      // Update last message in conversations
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.last_message = message;
        conversation.updated_at = message.created_at;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setTypingIndicator: (
      state,
      action: PayloadAction<{ conversationId: string; userId: string; isTyping: boolean }>
    ) => {
      const { conversationId, userId, isTyping } = action.payload;
      
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      
      if (isTyping) {
        if (!state.typingUsers[conversationId].includes(userId)) {
          state.typingUsers[conversationId].push(userId);
        }
      } else {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(
          id => id !== userId
        );
      }
    },
    incrementUnreadCount: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.unread_count += 1;
      }
    },
    resetChatState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch conversations";
      });

    // Get or Create Conversation
    builder
      .addCase(getOrCreateConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrCreateConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentConversation = action.payload;
        
        // Add to conversations if not already there
        const exists = state.conversations.some(c => c.id === action.payload.id);
        if (!exists) {
          state.conversations.unshift(action.payload);
        }
      })
      .addCase(getOrCreateConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create conversation";
      });

    // Fetch Messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch messages";
      });

    // Send Message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        const message = action.payload;
        const conversationId = message.conversation_id;
        
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        
        state.messages[conversationId].push(message);
        
        // Update conversation last message
        const conversation = state.conversations.find(c => c.id === conversationId);
        if (conversation) {
          conversation.last_message = message;
          conversation.updated_at = message.created_at;
          
          // Move to top
          state.conversations = [
            conversation,
            ...state.conversations.filter(c => c.id !== conversationId),
          ];
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload || "Failed to send message";
      });

    // Mark Messages as Read
    builder
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const conversationId = action.payload;
        const conversation = state.conversations.find(c => c.id === conversationId);
        if (conversation) {
          conversation.unread_count = 0;
        }
        
        // Mark all messages as read
        if (state.messages[conversationId]) {
          state.messages[conversationId] = state.messages[conversationId].map(m => ({
            ...m,
            is_read: true,
          }));
        }
      });

    // Archive Conversation
    builder
      .addCase(archiveConversation.fulfilled, (state, action) => {
        const conversationId = action.payload;
        state.conversations = state.conversations.filter(c => c.id !== conversationId);
        
        if (state.currentConversation?.id === conversationId) {
          state.currentConversation = null;
        }
      });
  },
});

export const {
  setCurrentConversation,
  addMessage,
  clearError,
  setTypingIndicator,
  incrementUnreadCount,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
