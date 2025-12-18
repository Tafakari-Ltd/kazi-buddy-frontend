import React from "react";
import { Eye, Edit2, Trash2, MapPin, DollarSign } from "lucide-react";
import { Job, JobStatus } from "@/types/job.types";
import {
  getDetailedStatus,
  getJobStatusMessage,
  getCategoryName,
} from "./employerDashboardUtils";

interface JobCardProps {
  job: Job;
  categories: Array<{ id: string; name: string }>;
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  categories,
  onView,
  onEdit,
  onDelete,
}) => {
  const status = getDetailedStatus(job.status, job.admin_approved);
  const StatusIcon = status.icon;
  const categoryName = getCategoryName(job.category, categories);
  const statusMessage = getJobStatusMessage(job.status, job.admin_approved);

  return (
    <div className="p-5 rounded-xl hover:shadow-md transition bg-white group shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-800 transition mb-2">
            {job.title}
          </h3>
          <div className="flex flex-wrap gap-3 mt-2 text-sm items-center mb-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {categoryName}
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <MapPin className="w-3 h-3" /> {job.location}
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <DollarSign className="w-3 h-3" />{" "}
              {job.budget_min.toLocaleString()} -{" "}
              {job.budget_max.toLocaleString()}
            </span>
          </div>
          {job.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {job.description}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}
          >
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onView(job)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(job)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(job)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Message for Users */}
      <div className="mt-4 p-3 rounded-lg bg-gray-50 text-xs text-gray-600">
        {statusMessage}
      </div>
    </div>
  );
};

export default JobCard;
