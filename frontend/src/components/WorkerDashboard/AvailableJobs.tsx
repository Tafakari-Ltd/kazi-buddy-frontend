"use client";

import React, { useState, useEffect } from "react";
import {
  useJobApplicationModal,
  useMyApplications,
} from "../../Redux/Functions/jobs";
import { JobApplicationModal } from "../JobApplication";
import { JobDetails } from "../../types/jobApplication.types";
import JobApplicationApi from "../../services/jobApplicationApi";
import { toast } from "sonner";

interface AvailableJobsProps {
  jobs: JobDetails[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
}

interface JobWithApplicationStatus extends JobDetails {
  applicationId?: string;
  applicationStatus?:
    | "pending"
    | "reviewed"
    | "accepted"
    | "rejected"
    | "withdrawn"
    | null;
  hasApplied?: boolean;
}

export const AvailableJobs: React.FC<AvailableJobsProps> = ({
  jobs,
  loading = false,
  error = null,
  onRefresh,
  className = "",
}) => {
  const [jobsWithStatus, setJobsWithStatus] = useState<
    JobWithApplicationStatus[]
  >([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );
  const [currentApplyingJob, setCurrentApplyingJob] =
    useState<JobDetails | null>(null);

  const { showJobModal } = useJobApplicationModal();
  const { applications, fetchApplications } = useMyApplications();

  // Merge jobs with application status
  useEffect(() => {
    const mergedJobs = jobs.map((job) => {
      // Handle both app.job as string (ID) or object
      const application = applications.find((app) => {
        const jobId =
          typeof app.job === "string" ? app.job : (app.job as any)?.id;
        return jobId === job.id;
      });
      return {
        ...job,
        applicationId: application?.id,
        applicationStatus: application?.status || null,
        hasApplied: !!application,
      };
    });
    setJobsWithStatus(mergedJobs);
  }, [jobs, applications]);

  // Fetch applications on mount
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApplyClick = (job: JobDetails) => {
    setCurrentApplyingJob(job);
    showJobModal();
  };

  const handleWithdrawApplication = async (
    jobId: string,
    applicationId: string,
  ) => {
    if (
      !confirm(
        "Are you sure you want to withdraw your application for this job?",
      )
    ) {
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [jobId]: true }));

    try {
      await JobApplicationApi.deleteApplication(applicationId);
      toast.success("Application withdrawn successfully");

      // Update local state immediately
      setJobsWithStatus((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? {
                ...job,
                applicationId: undefined,
                applicationStatus: null,
                hasApplied: false,
              }
            : job,
        ),
      );

      // Refresh applications
      fetchApplications();
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to withdraw application");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const handleApplicationSuccess = () => {
    toast.success("Application submitted successfully!");
    fetchApplications(); // Refresh applications
    onRefresh?.(); // Refresh jobs if needed
    setCurrentApplyingJob(null);
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending Review",
      },
      reviewed: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Under Review",
      },
      accepted: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Accepted",
      },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
      withdrawn: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Withdrawn",
      },
    };

    const config = configs[status as keyof typeof configs];
    if (!config) return null;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getActionButton = (job: JobWithApplicationStatus) => {
    const isLoading = loadingStates[job.id];

    if (isLoading) {
      return (
        <button
          disabled
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-400 bg-white cursor-not-allowed"
        >
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </button>
      );
    }

    if (!job.hasApplied) {
      return (
        <button
          onClick={() => handleApplyClick(job)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Apply Now
        </button>
      );
    }

    // Show different actions based on application status
    if (job.applicationStatus === "pending") {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Applied</span>
          <button
            onClick={() =>
              handleWithdrawApplication(job.id, job.applicationId!)
            }
            className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Withdraw
          </button>
        </div>
      );
    }

    if (job.applicationStatus === "accepted") {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-green-600 font-medium">Accepted!</span>
        </div>
      );
    }

    if (job.applicationStatus === "rejected") {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-red-600">Not selected</span>
          <button
            onClick={() =>
              handleWithdrawApplication(job.id, job.applicationId!)
            }
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Remove
          </button>
        </div>
      );
    }

    return (
      <span className="text-sm text-gray-500 capitalize">
        {job.applicationStatus?.replace("_", " ")}
      </span>
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  // Loading state
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Available Jobs
          </h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-red-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Error loading jobs
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Available Jobs
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {jobsWithStatus.length} job{jobsWithStatus.length !== 1 ? "s" : ""}{" "}
            available
          </p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        )}
      </div>

      {/* Jobs List */}
      {jobsWithStatus.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No jobs available
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Check back later for new opportunities that match your skills.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobsWithStatus.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Job Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
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
                        {job.location_text}
                      </span>
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
                        KES {job.budget_min} - KES {job.budget_max}
                      </span>
                      <span className="capitalize">
                        {job.job_type.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-end space-y-2">
                    {job.applicationStatus &&
                      getStatusBadge(job.applicationStatus)}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        job.urgency_level === "high"
                          ? "bg-red-100 text-red-700"
                          : job.urgency_level === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {job.urgency_level} priority
                    </span>
                  </div>
                </div>

                {/* Job Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {job.description}
                </p>

                {/* Job Details */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span>Posted {formatTimeAgo(job.start_date)}</span>
                    <span>•</span>
                    <span>{job.estimated_hours} hours estimated</span>
                    <span>•</span>
                    <span>
                      Ends {new Date(job.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View Details
                  </button>
                  {getActionButton(job)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Modal */}
      {currentApplyingJob && (
        <JobApplicationModal
          jobDetails={currentApplyingJob}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

export default AvailableJobs;
