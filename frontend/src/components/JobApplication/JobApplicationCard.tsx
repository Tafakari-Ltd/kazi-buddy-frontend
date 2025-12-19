"use client";

import React from "react";
import {
  JobApplicationWithDetails,
  ApplicationStatus,
} from "../../types/jobApplication.types";

const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  } else {
    return "just now";
  }
};

interface JobApplicationCardProps {
  application: JobApplicationWithDetails;
  onView?: (applicationId: string) => void;
  onUpdate?: (applicationId: string) => void;
  onDelete?: (applicationId: string) => void;
  showJobDetails?: boolean;
  showWorkerDetails?: boolean;
  className?: string;
}

const statusConfig: Record<
  ApplicationStatus,
  {
    color: string;
    bgColor: string;
    label: string;
    icon: string;
  }
> = {
  pending: {
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    label: "Pending Review",
    icon: "⏳",
  },
  reviewed: {
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    label: "Under Review",
    icon: "👀",
  },
  accepted: {
    color: "text-green-700",
    bgColor: "bg-green-100",
    label: "Accepted",
    icon: "✅",
  },
  rejected: {
    color: "text-red-700",
    bgColor: "bg-red-100",
    label: "Rejected",
    icon: "❌",
  },
  withdrawn: {
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    label: "Withdrawn",
    icon: "⛔",
  },
};

export const JobApplicationCard: React.FC<JobApplicationCardProps> = ({
  application,
  onView,
  onUpdate,
  onDelete,
  showJobDetails = true,
  showWorkerDetails = false,
  className = "",
}) => {
  const statusInfo = statusConfig[application.status];
  const appliedDate = new Date(application.applied_at);
  const timeAgo = formatDistanceToNow(appliedDate);

  const handleViewClick = () => {
    onView?.(application.id);
  };

  const handleUpdateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate?.(application.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(application.id);
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
      onClick={handleViewClick}
      role={onView ? "button" : undefined}
      tabIndex={onView ? 0 : undefined}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Job Details */}
            {showJobDetails && (application.job || application.job_details) && (
              <div className="mb-2">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {(typeof application.job !== "string"
                    ? application.job?.title
                    : undefined) ||
                    application.job_details?.title ||
                    "Job Application"}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {((typeof application.job !== "string"
                    ? application.job?.location_text
                    : undefined) ||
                    application.job_details?.location_text) && (
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {(typeof application.job !== "string"
                        ? application.job?.location_text
                        : undefined) || application.job_details?.location_text}
                    </span>
                  )}
                  {((typeof application.job !== "string"
                    ? application.job?.budget_min && application.job?.budget_max
                    : false) ||
                    (application.job_details?.budget_min &&
                      application.job_details?.budget_max)) && (
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      $
                      {(typeof application.job !== "string"
                        ? application.job?.budget_min
                        : undefined) ||
                        application.job_details?.budget_min}{" "}
                      - $
                      {(typeof application.job !== "string"
                        ? application.job?.budget_max
                        : undefined) || application.job_details?.budget_max}
                    </span>
                  )}
                  {((typeof application.job !== "string"
                    ? application.job?.job_type
                    : undefined) ||
                    application.job_details?.job_type) && (
                    <span className="capitalize">
                      {(
                        (typeof application.job !== "string"
                          ? application.job?.job_type
                          : undefined) ||
                        application.job_details?.job_type ||
                        ""
                      ).replace("_", " ")}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Worker Details */}
            {showWorkerDetails &&
              (application.worker || application.worker_details) && (
                <div className="mb-2">
                  <div className="flex items-center mb-2">
                    {application.worker_details?.profile_photo_url ? (
                      <img
                        src={application.worker_details.profile_photo_url}
                        alt={
                          (typeof application.worker !== "string"
                            ? application.worker?.user?.full_name
                            : undefined) ||
                          application.worker_details?.full_name ||
                          "Worker"
                        }
                        className="w-8 h-8 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">
                          {(
                            (typeof application.worker !== "string"
                              ? application.worker?.user?.full_name
                              : undefined) ||
                            application.worker_details?.full_name ||
                            "U"
                          ).charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {(typeof application.worker !== "string"
                          ? application.worker?.user?.full_name
                          : undefined) ||
                          application.worker_details?.full_name ||
                          "Unknown Worker"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        @{application.worker_details?.username || "worker"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Status Badge */}
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
          >
            <span className="mr-1">{statusInfo.icon}</span>
            {statusInfo.label}
          </div>
        </div>

        {/* Application Details */}
        <div className="space-y-3">
          {/* Proposed Rate */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Proposed Rate:</span>
            <span className="text-sm font-medium text-gray-900">
              KES {parseFloat(application.proposed_rate).toFixed(2)}
            </span>
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Available from:</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(application.availability_start).toLocaleDateString()}
            </span>
          </div>

          {/* Cover Letter Preview */}
          {application.cover_letter && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Cover Letter:</p>
              <p className="text-sm text-gray-900 line-clamp-2">
                {application.cover_letter.length > 100
                  ? `${application.cover_letter.substring(0, 100)}...`
                  : application.cover_letter}
              </p>
            </div>
          )}

          {/* Worker Notes */}
          {application.worker_notes && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Additional Notes:</p>
              <p className="text-sm text-gray-900 line-clamp-1">
                {application.worker_notes.length > 80
                  ? `${application.worker_notes.substring(0, 80)}...`
                  : application.worker_notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">Applied {timeAgo}</div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {onView && (
              <button
                onClick={handleViewClick}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View Details
              </button>
            )}

            {onUpdate && application.status === "pending" && (
              <button
                onClick={handleUpdateClick}
                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
              >
                Edit
              </button>
            )}

            {onDelete &&
              ["pending", "rejected"].includes(application.status) && (
                <button
                  onClick={handleDeleteClick}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  {application.status === "pending" ? "Withdraw" : "Delete"}
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationCard;
