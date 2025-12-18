import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { JobStatus, ApplicationStatus, ApplicationStage } from "@/types/job.types";

/**
 * Get status color classes for job status badges
 */
export const getStatusColor = (status: JobStatus): string => {
  switch (status) {
    case JobStatus.ACTIVE:
      return "bg-green-100 text-green-800";
    case JobStatus.PENDING:
      return "bg-orange-100 text-orange-800";
    case JobStatus.PAUSED:
      return "bg-yellow-100 text-yellow-800";
    case JobStatus.CLOSED:
      return "bg-gray-100 text-gray-800";
    case JobStatus.FILLED:
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Get detailed status information including label, color, and icon
 */
export const getDetailedStatus = (status: JobStatus, admin_approved?: boolean) => {
 
  if (admin_approved === false && status !== JobStatus.CANCELLED) {
    return {
      label: "Awaiting Admin Approval",
      color: "bg-yellow-100 text-yellow-700",
      icon: Clock,
    };
  }

  switch (status) {
    case JobStatus.ACTIVE:
      return {
        label: "Approved & Live",
        color: "bg-green-100 text-green-700",
        icon: CheckCircle,
      };
    case JobStatus.PENDING:
    case JobStatus.PAUSED:
      return {
        label: "Awaiting Admin Approval",
        color: "bg-yellow-100 text-yellow-700",
        icon: Clock,
      };
    case JobStatus.CANCELLED:
      return {
        label: "Rejected by Admin",
        color: "bg-red-100 text-red-700",
        icon: XCircle,
      };
    default:
      return {
        label: status.replace("_", " "),
        color: "bg-gray-100 text-gray-700",
        icon: AlertCircle,
      };
  }
};

/**
 * Get status badge classes for application status
 */
export const getStatusBadgeClass = (status: ApplicationStatus): string => {
  switch (status) {
    case "Rejected":
      return "bg-red-100 text-red-800";
    case "Accepted":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Interview Scheduled":
      return "bg-blue-100 text-blue-800";
    case "Final Interview":
      return "bg-purple-100 text-purple-800";
    case "Cancelled":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount?: number): string => {
  if (!amount) return "N/A";
  return `KSh ${amount.toLocaleString()}`;
};

/**
 * Get stage progress percentage
 */
export const getStageProgress = (
  stage: ApplicationStage,
  stages: ApplicationStage[]
): number => {
  return ((stages.indexOf(stage) + 1) / stages.length) * 100;
};

/**
 * Map backend status to frontend ApplicationStatus
 */
export const mapApplicationStatus = (status: string): ApplicationStatus => {
  switch (status) {
    case "pending":
      return "Pending";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "reviewed":
      return "Interview Scheduled";
    case "cancelled":
      return "Cancelled";
    case "final_interview":
      return "Final Interview";
    default:
      return "Pending";
  }
};

/**
 * Map backend status to application stage
 */
export const mapApplicationStage = (status: string): ApplicationStage => {
  switch (status) {
    case "pending":
      return "Application Review";
    case "reviewed":
      return "Phone Interview";
    case "accepted":
      return "Offer Extended";
    case "rejected":
      return "Application Review";
    default:
      return "Application Review";
  }
};

/**
 * Get status message for job posting
 */
export const getJobStatusMessage = (status: JobStatus, admin_approved?: boolean): string => {
  if (admin_approved === false && status !== JobStatus.CANCELLED) {
    return "An administrator is currently reviewing your job posting. This usually takes 12-24 hours.";
  }

  switch (status) {
    case JobStatus.ACTIVE:
      return "Your job is live! Workers can now see and apply to this position.";
    case JobStatus.PENDING:
    case JobStatus.PAUSED:
      return "An administrator is currently reviewing your job posting. This usually takes 12-24 hours.";
    case JobStatus.CANCELLED:
      return "This posting did not meet our guidelines. Please edit and resubmit or contact support.";
    default:
      return "Current status: " + status;
  }
};

/**
 * Get category name from job category field
 */
export const getCategoryName = (
  category: any,
  categories: Array<{ id: string; name: string }>
): string => {
  if (typeof category === "string") {
    return categories.find((c) => c.id === category)?.name || "Uncategorized";
  }
  return category?.name || "Uncategorized";
};
