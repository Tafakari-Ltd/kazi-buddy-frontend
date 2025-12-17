import React, { useState, useRef, KeyboardEvent } from "react";
import { Send, Smile, Paperclip, Image as ImageIcon, Loader2 } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  sending?: boolean;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  sending = false,
  disabled = false,
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim() || sending || disabled) return;

    onSendMessage(message.trim());
    setMessage("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    setMessage(target.value);

    // Auto-resize textarea
    target.style.height = "auto";
    target.style.height = Math.min(target.scrollHeight, 120) + "px";
  };

  return (
    <div className="border-t border-gray-200 bg-white px-6 py-4">
      <div className="flex items-end gap-3">
        {/* Attachment Buttons */}
        <div className="flex items-center gap-2 pb-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            title="Attach file"
            disabled={disabled}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            title="Attach image"
            disabled={disabled}
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? "Select a conversation to send messages"
                : "Type a message..."
            }
            disabled={disabled || sending}
            rows={1}
            className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
            style={{ maxHeight: "120px" }}
          />

          {/* Emoji Button */}
          <button
            className="absolute right-3 bottom-3 p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            title="Add emoji"
            disabled={disabled}
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || sending || disabled}
          className={`p-3 rounded-xl transition-all shadow-sm ${
            message.trim() && !sending && !disabled
              ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          title="Send message"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Tips */}
      <div className="mt-2 px-1">
        <p className="text-xs text-gray-500">
          Press <span className="font-semibold">Enter</span> to send,{" "}
          <span className="font-semibold">Shift + Enter</span> for new line
        </p>
      </div>
    </div>
  );
};
