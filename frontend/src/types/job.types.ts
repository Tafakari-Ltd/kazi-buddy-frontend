// Job Types and Interfaces

// Application related types (existing)
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

// New Job-related interfaces
export interface Job {
  id: string;
  employer: string;
  category: string;
  title: string;
  description: string;
  location: string;
  location_text: string;
  job_type: JobType;
  urgency_level: UrgencyLevel;
  budget_min: number;
  budget_max: number;
  payment_type: PaymentType;
  start_date: string;
  end_date: string;
  estimated_hours: number;
  max_applicants: number;
  status: JobStatus;
  visibility: JobVisibility;
  created_at?: string;
  updated_at?: string;
}

export interface CreateJobData {
  employer: string;
  category: string;
  title: string;
  description: string;
  location: string;
  location_text: string;
  job_type: JobType;
  urgency_level: UrgencyLevel;
  budget_min: number;
  budget_max: number;
  payment_type: PaymentType;
  start_date: string;
  end_date: string;
  estimated_hours: number;
  max_applicants: number;
  status: JobStatus;
  visibility: JobVisibility;
}

export interface UpdateJobData {
  title?: string;
  description?: string;
  location?: string;
  location_text?: string;
  job_type?: JobType;
  urgency_level?: UrgencyLevel;
  budget_min?: number;
  budget_max?: number;
  payment_type?: PaymentType;
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  max_applicants?: number;
  visibility?: JobVisibility;
}

export interface JobSkill {
  id: string;
  job_id?: string;
  skill: string;
  experience_level: SkillLevel;
  is_required: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateJobSkillData {
  skill: string;
  is_required: boolean;
  experience_level: SkillLevel;
}

export interface UpdateJobSkillData {
  skill?: string;
  is_required?: boolean;
  experience_level?: SkillLevel;
}

export interface JobEmployer {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  company_name?: string;
  company_description?: string;
  company_logo?: string;
  location?: string;
  website?: string;
  total_jobs_posted?: number;
  verified?: boolean;
  rating?: number;
  created_at?: string;
}

export interface JobFilters {
  category?: string;
  job_type?: JobType;
  urgency_level?: UrgencyLevel;
  payment_type?: PaymentType;
  budget_min?: number;
  budget_max?: number;
  location?: string;
  status?: JobStatus;
  employer_id?: string;
  search_query?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface JobsResponse {
  message: string;
  data: Job[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface JobDetailResponse {
  message: string;
  data: Job;
}

export interface JobSkillsResponse {
  message: string;
  data: JobSkill[];
}

export interface JobSkillResponse {
  message: string;
  data: JobSkill;
}

export interface JobSkillDeleteResponse {
  message: string;
}

export interface JobEmployerResponse {
  message: string;
  data: JobEmployer;
}

// Enums
export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  FREELANCE = 'freelance',
  TEMPORARY = 'temporary',
  INTERNSHIP = 'internship'
}

export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum PaymentType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  MILESTONE = 'milestone'
}

export enum JobStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  CLOSED = 'closed',
  EXPIRED = 'expired',
  FILLED = 'filled',
  CANCELLED = 'cancelled'
}

export enum JobVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  INVITED_ONLY = 'invited_only'
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

// State Interfaces
export interface JobsState {
  jobs: Job[];
  currentJob: Job | null;
  jobSkills: JobSkill[];
  jobEmployer: JobEmployer | null;
  filters: JobFilters;
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

// Form Validation
export interface JobFormErrors {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  job_type?: string;
  urgency_level?: string;
  budget_min?: string;
  budget_max?: string;
  payment_type?: string;
  start_date?: string;
  end_date?: string;
  estimated_hours?: string;
  max_applicants?: string;
  status?: string;
  visibility?: string;
}

// Constants for dropdown options
export const JOB_TYPE_OPTIONS = [
  { value: JobType.FULL_TIME, label: 'Full Time' },
  { value: JobType.PART_TIME, label: 'Part Time' },
  { value: JobType.CONTRACT, label: 'Contract' },
  { value: JobType.FREELANCE, label: 'Freelance' },
  { value: JobType.TEMPORARY, label: 'Temporary' },
  { value: JobType.INTERNSHIP, label: 'Internship' }
];

export const URGENCY_LEVEL_OPTIONS = [
  { value: UrgencyLevel.LOW, label: 'Low', color: 'text-green-600 bg-green-100' },
  { value: UrgencyLevel.MEDIUM, label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
  { value: UrgencyLevel.HIGH, label: 'High', color: 'text-orange-600 bg-orange-100' },
  { value: UrgencyLevel.URGENT, label: 'Urgent', color: 'text-red-600 bg-red-100' }
];

export const PAYMENT_TYPE_OPTIONS = [
  { value: PaymentType.FIXED, label: 'Fixed Price' },
  { value: PaymentType.HOURLY, label: 'Hourly Rate' },
  { value: PaymentType.MILESTONE, label: 'Milestone Based' }
];

export const JOB_STATUS_OPTIONS = [
  { value: JobStatus.DRAFT, label: 'Draft', color: 'text-gray-600 bg-gray-100' },
  { value: JobStatus.ACTIVE, label: 'Active', color: 'text-green-600 bg-green-100' },
  { value: JobStatus.PAUSED, label: 'Paused', color: 'text-yellow-600 bg-yellow-100' },
  { value: JobStatus.CLOSED, label: 'Closed', color: 'text-red-600 bg-red-100' },
  { value: JobStatus.EXPIRED, label: 'Expired', color: 'text-red-600 bg-red-100' },
  { value: JobStatus.FILLED, label: 'Filled', color: 'text-blue-600 bg-blue-100' },
  { value: JobStatus.CANCELLED, label: 'Cancelled', color: 'text-gray-600 bg-gray-100' }
];

export const VISIBILITY_OPTIONS = [
  { value: JobVisibility.PUBLIC, label: 'Public' },
  { value: JobVisibility.PRIVATE, label: 'Private' },
  { value: JobVisibility.INVITED_ONLY, label: 'Invited Only' }
];

export const SKILL_LEVEL_OPTIONS = [
  { value: SkillLevel.BEGINNER, label: 'Beginner' },
  { value: SkillLevel.INTERMEDIATE, label: 'Intermediate' },
  { value: SkillLevel.ADVANCED, label: 'Advanced' },
  { value: SkillLevel.EXPERT, label: 'Expert' }
];
