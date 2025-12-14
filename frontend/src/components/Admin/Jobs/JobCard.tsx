"use client";
import React from "react";
import {
  DollarSign,
  MapPin,
  Calendar,
  Users,
  Eye,
  Edit2,
  Trash2,
  Pause,
  Play,
} from "lucide-react";
import { Job, JobStatus, JOB_STATUS_OPTIONS, URGENCY_LEVEL_OPTIONS } from "@/types/job.types";

interface JobCardProps {
  job: Job;
  categoryName: string;
  onView: (job: Job) => void;
  onEdit: (jobId: string) => void; // URL navigation handled by parent or link
  onDelete: (jobId: string) => void;
  onStatusChange: (jobId: string, status: JobStatus) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, categoryName, onView, onEdit, onDelete, onStatusChange }) => {
  const getStatusColor = (status: string) => JOB_STATUS_OPTIONS.find((o) => o.value === status)?.color || "bg-gray-100 text-gray-600";
  const getUrgencyColor = (urgency: string) => URGENCY_LEVEL_OPTIONS.find((o) => o.value === urgency)?.color || "bg-gray-100 text-gray-600";

  const formatCurrency = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{job.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                  {JOB_STATUS_OPTIONS.find((o) => o.value === job.status)?.label}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency_level)}`}>
                  {URGENCY_LEVEL_OPTIONS.find((o) => o.value === job.urgency_level)?.label}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  {categoryName}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {formatCurrency(job.budget_min)} - {formatCurrency(job.budget_max)}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(job.start_date)}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {job.max_applicants} max applicants
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => onView(job)} className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="View Details">
                <Eye className="w-4 h-4" />
              </button>
              <button onClick={() => onEdit(job.id)} className="text-yellow-600 hover:text-yellow-900 p-2 rounded-lg hover:bg-yellow-50 transition-colors" title="Edit Job">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(job.id)} className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Delete Job">
                <Trash2 className="w-4 h-4" />
              </button>

              {job.status === "active" ? (
                <button onClick={() => onStatusChange(job.id, JobStatus.PAUSED)} className="text-orange-600 hover:text-orange-900 p-2 rounded-lg hover:bg-orange-50 transition-colors" title="Pause Job">
                  <Pause className="w-4 h-4" />
                </button>
              ) : job.status === "paused" ? (
                <button onClick={() => onStatusChange(job.id, JobStatus.ACTIVE)} className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors" title="Activate Job">
                  <Play className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;