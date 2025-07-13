// job.types.ts

export type ApplicationStage =
  | "Application Review"
  | "Phone Interview"
  | "Technical Assessment"
  | "In-Person Interview"
  | "Reference Check"
  | "Offer Extended"
  | "Completed";

export type ApplicationStatus =
  | "Pending"
  | "Interview Scheduled"
  | "Final Interview"
  | "Accepted"
  | "Rejected"
  | "Cancelled";

export interface Application {
  id: number;
  applicantName: string;
  jobTitle: string;
  appliedDate: string;
  phone: string;
  experience: string;
  availability: string;
  status: ApplicationStatus;
  stage: ApplicationStage;
  email: string;
  message: string;
  rejectionReason?: string;
}
