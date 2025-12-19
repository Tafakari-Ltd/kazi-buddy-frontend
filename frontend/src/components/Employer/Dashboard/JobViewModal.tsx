import React from "react";
import { XCircle, MapPin, DollarSign } from "lucide-react";
import { Job } from "@/types/job.types";
import { getStatusColor, formatCurrency } from "./employerDashboardUtils";

interface JobViewModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const JobViewModal: React.FC<JobViewModalProps> = ({
  job,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl my-8">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-xl text-gray-900">{job.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 text-sm">
            <span
              className={`px-3 py-1 rounded-full font-medium ${getStatusColor(job.status)}`}
            >
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
            <span className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4" /> {job.location}
            </span>
            <span className="flex items-center gap-1 text-gray-600">
              {formatCurrency(job.budget_min)} - {formatCurrency(job.budget_max)}
            </span>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600 whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {(job as any).requirements && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
              <p className="text-gray-600 whitespace-pre-line">
                {(job as any).requirements}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <span className="text-sm text-gray-500">Job Type</span>
              <p className="font-medium text-gray-900">
                {job.job_type.replace("_", " ").toUpperCase()}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Max Applicants</span>
              <p className="font-medium text-gray-900">
                {job.max_applicants || "Unlimited"}
              </p>
            </div>
            {job.estimated_hours && (
              <div>
                <span className="text-sm text-gray-500">Estimated Hours</span>
                <p className="font-medium text-gray-900">
                  {job.estimated_hours} hours
                </p>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500">Posted</span>
              <p className="font-medium text-gray-900">
                {job.created_at
                  ? new Date(job.created_at).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000]"
          >
            Edit Job
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobViewModal;
