// Job Application Types
export interface JobApplicationRequest {
  cover_letter: string;
  proposed_rate: number;
  availability_start: string; // ISO date string (YYYY-MM-DD)
  worker_notes?: string;
  employer_notes?: string;
}

export interface JobApplication {
  id: string;
  cover_letter: string;
  proposed_rate: string; // API returns as string
  availability_start: string;
  status: ApplicationStatus;
  employer_notes: string;
  worker_notes: string;
  applied_at: string; // ISO datetime string
  reviewed_at: string | null;
  responded_at: string | null;
  job: string; // Job ID
  worker: string; // Worker ID
}

export interface JobApplicationWithDetails extends JobApplication {
  job_details?: JobDetails;
  job?: FullJobDetails; // Full nested job object from API
  worker_details?: WorkerDetails;
  worker?: FullWorkerDetails; // Full nested worker object from API
  employer_details?: EmployerDetails;
}

// User info nested in worker/employer
export interface UserInfo {
  id: string;
  full_name: string;
  email: string;
}

// Full worker object 
export interface FullWorkerDetails {
  id: string;
  user: UserInfo;
  location: string;
  location_text: string;
  is_available: boolean;
  years_experience: number;
  hourly_rate: string;
  availability_schedule: Record<string, string[]>;
  bio: string;
  created_at: string;
  updated_at: string;
  profile_completion_percentage: number;
  verification_status: string;
  admin_notes: string | null;
}

// Category info
export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
}

// Full employer object
export interface FullEmployerDetails {
  id: string;
  user: UserInfo;
  company_name: string;
  business_type: string;
  industry: string;
  location: string;
  location_text: string;
  description: string;
  website_url: string;
  business_registration_number: string;
  verification_status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Full job object as returned by API
export interface FullJobDetails {
  id: string;
  employer: FullEmployerDetails;
  category: CategoryInfo;
  title: string;
  description: string;
  location: string;
  location_text: string;
  job_type: JobType;
  urgency_level: UrgencyLevel;
  budget_min: string;
  budget_max: string;
  payment_type: PaymentType;
  start_date: string;
  end_date: string;
  estimated_hours: number;
  max_applicants: number;
  status: JobStatus;
  visibility: JobVisibility;
  admin_approved: boolean;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  filled_at: string | null;
  job_skills: any[];
}

export interface JobDetails {
  id: string;
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
  employer: string; // Employer ID
  category: string; // Category ID
}

export interface WorkerDetails {
  id: string;
  full_name: string;
  email: string;
  username: string;
  phone_number?: string;
  profile_photo_url?: string;
  bio?: string;
  skills?: string[];
  experience_level?: ExperienceLevel;
  hourly_rate?: number;
  availability?: string;
}

export interface EmployerDetails {
  id: string;
  company_name?: string;
  full_name: string;
  email: string;
  username: string;
  phone_number?: string;
  profile_photo_url?: string;
  company_description?: string;
  website?: string;
  location?: string;
}

// Enums
export type ApplicationStatus = 
  | 'pending'
  | 'reviewed'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export type JobType = 
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'freelance'
  | 'internship';

export type UrgencyLevel = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export type PaymentType = 
  | 'hourly'
  | 'fixed'
  | 'monthly'
  | 'weekly';

export type JobStatus = 
  | 'active'
  | 'inactive'
  | 'closed'
  | 'draft'
  | 'archived';

export type JobVisibility = 
  | 'public'
  | 'private'
  | 'featured';

export type ExperienceLevel = 
  | 'entry'
  | 'junior'
  | 'mid'
  | 'senior'
  | 'expert';

// API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

export interface ApplicationApiResponse extends ApiResponse {
  application_id?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ApplicationListResponse extends ApiResponse {
  applications: JobApplication[];
  total?: number;
  page?: number;
  per_page?: number;
}

export interface ApplicationDetailResponse extends ApiResponse {
  application: JobApplicationWithDetails;
}

export interface UpdateApplicationRequest {
  cover_letter?: string;
  proposed_rate?: number;
  availability_start?: string;
  worker_notes?: string;
  status?: ApplicationStatus;
}

// Form validation types
export interface ApplicationFormErrors {
  cover_letter?: string[];
  proposed_rate?: string[];
  availability_start?: string[];
  worker_notes?: string[];
  general?: string[];
}

// Filter and pagination types
export interface ApplicationFilters {
  status?: ApplicationStatus[];
  job_type?: JobType[];
  date_from?: string;
  date_to?: string;
  min_rate?: number;
  max_rate?: number;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  ordering?: string; // e.g., '-applied_at', 'proposed_rate'
}

export interface ApplicationQueryParams extends ApplicationFilters, PaginationParams {
  search?: string;
  expand?: string; // For requesting expanded/nested data
}
