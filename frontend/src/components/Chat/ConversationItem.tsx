import React from "react";
import { User, Clock } from "lucide-react";
import { ConversationListItem } from "@/types/chat.types";

interface ConversationItemProps {
  item: ConversationListItem;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  item,
  isActive,
  onClick,
}) => {
  const { otherParticipant, lastMessage, unreadCount } = item;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        isActive ? "bg-blue-50 hover:bg-blue-50" : ""
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
          {otherParticipant.avatar ? (
            <img
              src={otherParticipant.avatar}
              alt={otherParticipant.full_name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-6 h-6" />
          )}
        </div>
        {otherParticipant.is_online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h3
            className={`font-semibold text-sm truncate ${
              isActive ? "text-blue-700" : "text-gray-900"
            }`}
          >
            {otherParticipant.full_name}
          </h3>
          {lastMessage && (
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {formatTime(lastMessage.created_at)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p
            className={`text-sm truncate ${
              unreadCount > 0
                ? "font-medium text-gray-900"
                : "text-gray-600"
            }`}
          >
            {lastMessage?.content || "No messages yet"}
          </p>
          {unreadCount > 0 && (
            <span className="flex-shrink-0 ml-2 bg-blue-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>

        {/* User Type Badge */}
        <div className="mt-1">
          <span
            className={`inline-block text-xs px-2 py-0.5 rounded-full ${
              otherParticipant.user_type === "employer"
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {otherParticipant.user_type === "employer" ? "Employer" : "Worker"}
          </span>
        </div>
      </div>
    </div>
  );
};
