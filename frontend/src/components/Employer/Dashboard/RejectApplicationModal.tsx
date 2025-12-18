import React from "react";

interface RejectApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rejectionReason: string;
  onReasonChange: (reason: string) => void;
}

const RejectApplicationModal: React.FC<RejectApplicationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  rejectionReason,
  onReasonChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        <h3 className="font-bold text-lg mb-4 text-gray-900">
          Reject Application
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Are you sure you want to reject this candidate? They will be notified.
        </p>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32 focus:ring-2 focus:ring-red-500 outline-none resize-none"
          placeholder="Optional: Provide a reason for rejection..."
          value={rejectionReason}
          onChange={(e) => onReasonChange(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Reject Candidate
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectApplicationModal;
