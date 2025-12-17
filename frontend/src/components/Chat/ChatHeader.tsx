import React from "react";
import { User, MoreVertical, Phone, Video, Info } from "lucide-react";
import { User as UserType } from "@/types/chat.types";

interface ChatHeaderProps {
  otherParticipant: UserType | null;
  onBack?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  otherParticipant,
  onBack,
}) => {
  if (!otherParticipant) {
    return (
      <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-center">
        <p className="text-gray-500 text-sm">Select a conversation</p>
      </div>
    );
  }

  return (
    <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {/* Back Button (Mobile) */}
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
            {otherParticipant.avatar ? (
              <img
                src={otherParticipant.avatar}
                alt={otherParticipant.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          {otherParticipant.is_online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>

        {/* User Info */}
        <div>
          <h3 className="font-semibold text-gray-900">
            {otherParticipant.full_name}
          </h3>
          <p className="text-xs text-gray-500">
            {otherParticipant.is_online ? (
              <span className="text-green-600 font-medium">Active now</span>
            ) : otherParticipant.last_seen ? (
              `Last seen ${new Date(
                otherParticipant.last_seen
              ).toLocaleTimeString()}`
            ) : (
              "Offline"
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
          title="Voice call"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
          title="Video call"
        >
          <Video className="w-5 h-5" />
        </button>
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
          title="Conversation info"
        >
          <Info className="w-5 h-5" />
        </button>
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
          title="More options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
