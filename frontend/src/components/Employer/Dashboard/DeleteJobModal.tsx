import React from "react";
import { Trash2 } from "lucide-react";
import { Job } from "@/types/job.types";

interface DeleteJobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteJobModal: React.FC<DeleteJobModalProps> = ({
  job,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="font-bold text-lg text-gray-900">
            Delete Job Posting
          </h3>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          Are you sure you want to delete{" "}
          <span className="font-semibold">"{job.title}"</span>?
        </p>
        <p className="text-sm text-red-600 mb-4">
          This action cannot be undone. All applications for this job will
          remain but the job posting will be permanently removed.
        </p>
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
            Delete Job
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteJobModal;
