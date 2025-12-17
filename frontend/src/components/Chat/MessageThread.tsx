import React, { useRef, useEffect } from "react";
import { Message, User } from "@/types/chat.types";
import { Check, CheckCheck } from "lucide-react";

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  otherParticipant: User | null;
  loading?: boolean;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  currentUserId,
  otherParticipant,
  loading = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach((message) => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups).map(([date, msgs]) => ({
      date: msgs[0].created_at,
      messages: msgs,
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!otherParticipant) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to Messages
          </h3>
          <p className="text-gray-600">
            Select a conversation from the list or start a new one to begin
            messaging.
          </p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No messages yet
          </h3>
          <p className="text-gray-600">
            Start the conversation by sending a message to{" "}
            {otherParticipant.full_name}
          </p>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex}>
          {/* Date Separator */}
          <div className="flex items-center justify-center my-6">
            <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
              {formatDate(group.date)}
            </div>
          </div>

          {/* Messages */}
          {group.messages.map((message, index) => {
            const isOwn = message.sender_id === currentUserId;
            const showAvatar =
              index === group.messages.length - 1 ||
              group.messages[index + 1]?.sender_id !== message.sender_id;

            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 mb-3 ${
                  isOwn ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div className="w-8 h-8 flex-shrink-0">
                  {!isOwn && showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                      {otherParticipant.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex flex-col ${
                    isOwn ? "items-end" : "items-start"
                  } max-w-[70%]`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2 shadow-sm ${
                      isOwn
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">
                      {message.content}
                    </p>
                  </div>

                  {/* Time and Status */}
                  <div
                    className={`flex items-center gap-1 mt-1 px-2 ${
                      isOwn ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <span className="text-xs text-gray-500">
                      {formatTime(message.created_at)}
                    </span>
                    {isOwn && (
                      <div className="text-gray-500">
                        {message.is_read ? (
                          <CheckCheck className="w-3 h-3 text-blue-600" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
};
