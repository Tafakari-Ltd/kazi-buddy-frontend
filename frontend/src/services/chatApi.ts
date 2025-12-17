import api from "../lib/axios";
import {
  Conversation,
  Message,
  CreateMessageData,
  SendMessagePayload,
  User,
} from "../types/chat.types";

/**
 * Handles all chat and messaging-related API calls
 */
export class ChatApi {
  private static readonly BASE_ENDPOINT = "/messages";
  private static readonly CONVERSATIONS_ENDPOINT = "/conversations";

  /**
   * Fetch all conversations for the current user
   * GET /api/conversations/
   */
  static async getConversations(): Promise<Conversation[]> {
    try {
      const response = await api.get(this.CONVERSATIONS_ENDPOINT + "/");
      return response.data.results || response.data;
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to fetch conversations"
      );
    }
  }

  /**
   * Get or create a conversation with a specific user
   * POST /api/conversations/get-or-create/
   */
  static async getOrCreateConversation(
    participantId: string
  ): Promise<Conversation> {
    try {
      const response = await api.post(
        `${this.CONVERSATIONS_ENDPOINT}/get-or-create/`,
        {
          participant_id: participantId,
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create conversation"
      );
    }
  }

  /**
   * Fetch messages for a specific conversation
   * GET /api/conversations/{id}/messages/
   */
  static async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const response = await api.get(
        `${this.CONVERSATIONS_ENDPOINT}/${conversationId}/messages/`
      );
      return response.data.results || response.data;
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to fetch messages"
      );
    }
  }

  /**
   * Send a new message
   * POST /api/messages/
   */
  static async sendMessage(data: CreateMessageData): Promise<Message> {
    try {
      const response = await api.post(this.BASE_ENDPOINT + "/", data);
      return response.data;
    } catch (error: any) {
      console.error("Error sending message:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to send message"
      );
    }
  }

  /**
   * Mark messages as read
   * POST /api/conversations/{id}/mark-read/
   */
  static async markMessagesAsRead(conversationId: string): Promise<void> {
    try {
      await api.post(
        `${this.CONVERSATIONS_ENDPOINT}/${conversationId}/mark-read/`
      );
    } catch (error: any) {
      console.error("Error marking messages as read:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to mark messages as read"
      );
    }
  }

  /**
   * Delete a message
   * DELETE /api/messages/{id}/
   */
  static async deleteMessage(messageId: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_ENDPOINT}/${messageId}/`);
    } catch (error: any) {
      console.error("Error deleting message:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to delete message"
      );
    }
  }

  /**
   * Archive a conversation
   * POST /api/conversations/{id}/archive/
   */
  static async archiveConversation(conversationId: string): Promise<void> {
    try {
      await api.post(
        `${this.CONVERSATIONS_ENDPOINT}/${conversationId}/archive/`
      );
    } catch (error: any) {
      console.error("Error archiving conversation:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to archive conversation"
      );
    }
  }

  /**
   * Search users to start a conversation
   * GET /api/users/search/?q={query}
   */
  static async searchUsers(query: string): Promise<User[]> {
    try {
      const response = await api.get(`/accounts/users/`, {
        params: { search: query },
      });
      return response.data.results || response.data;
    } catch (error: any) {
      console.error("Error searching users:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to search users"
      );
    }
  }

  /**
   * Get conversation by ID
   * GET /api/conversations/{id}/
   */
  static async getConversation(conversationId: string): Promise<Conversation> {
    try {
      const response = await api.get(
        `${this.CONVERSATIONS_ENDPOINT}/${conversationId}/`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching conversation:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to fetch conversation"
      );
    }
  }
}

export default ChatApi;
