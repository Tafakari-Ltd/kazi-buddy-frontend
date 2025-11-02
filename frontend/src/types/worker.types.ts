// Worker Profile Types and Interfaces

// Availability Schedule Interface
export interface AvailabilitySchedule {
  [day: string]: string[]; 
}

// User Info for nested structure
export interface WorkerUserInfo {
  id: string;
  full_name: string;
  email: string;
}

// Worker Profile Interface
export interface WorkerProfile {
  id: string;
  user: string | WorkerUserInfo; 
  location: string;
  location_text: string;
  is_available: boolean;
  years_experience: number;
  hourly_rate: string;
  availability_schedule: AvailabilitySchedule;
  bio: string;
  created_at: string;
  updated_at: string;
  profile_completion_percentage: number;
  verification_status: VerificationStatus;
  admin_notes?: string | null;
}

// Create Worker Profile Data
export interface CreateWorkerProfileData {
  location: string;
  location_text: string;
  is_available: boolean;
  years_experience: number;
  hourly_rate: string;
  availability_schedule: AvailabilitySchedule;
  bio: string;
}

// Update Worker Profile Data
export interface UpdateWorkerProfileData {
  location?: string;
  location_text?: string;
  is_available?: boolean;
  years_experience?: number;
  hourly_rate?: string;
  availability_schedule?: AvailabilitySchedule;
  bio?: string;
}

// Filter Worker Profiles Data
export interface WorkerProfileFilters {
  location?: string;
  min_experience?: number;
  max_experience?: number;
  min_hourly_rate?: string;
  max_hourly_rate?: string;
  is_available?: boolean;
  verification_status?: VerificationStatus;
  search_query?: string;
  page?: number;
  limit?: number;
}

// API Response Interfaces
export interface WorkerProfileResponse {
  message?: string;
  data?: WorkerProfile;
}

export interface WorkerProfilesResponse {
  message?: string;
  data?: WorkerProfile[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// Enums
export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

// State Interface
export interface WorkerProfileState {
  profiles: WorkerProfile[];
  currentProfile: WorkerProfile | null;
  userProfile: WorkerProfile | null; // Current user's profile
  filters: WorkerProfileFilters;
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
export interface WorkerProfileFormErrors {
  location?: string;
  location_text?: string;
  is_available?: string;
  years_experience?: string;
  hourly_rate?: string;
  availability_schedule?: string;
  bio?: string;
}

// Constants for dropdown options
export const VERIFICATION_STATUS_OPTIONS = [
  { value: VerificationStatus.PENDING, label: 'Pending', color: 'text-yellow-600 bg-yellow-100' },
  { value: VerificationStatus.VERIFIED, label: 'Verified', color: 'text-green-600 bg-green-100' },
  { value: VerificationStatus.REJECTED, label: 'Rejected', color: 'text-red-600 bg-red-100' },
  { value: VerificationStatus.SUSPENDED, label: 'Suspended', color: 'text-gray-600 bg-gray-100' }
];

// Days of the week for availability scheduling
export const DAYS_OF_WEEK = [
  'monday',
  'tuesday', 
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

// Popular locations in Kenya 
export const LOCATION_OPTIONS = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret',
  'Thika',
  'Malindi',
  'Kitale',
  'Garissa',
  'Kakamega',
  'Nyeri',
  'Machakos',
  'Meru',
  'Kericho',
  'Embu'
];

// Time slots for availability schedule
export const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

// Experience level options
export const EXPERIENCE_LEVELS = [
  { value: 0, label: 'Entry Level (0 years)' },
  { value: 1, label: 'Junior (1 year)' },
  { value: 2, label: 'Junior (2 years)' },
  { value: 3, label: 'Mid Level (3 years)' },
  { value: 4, label: 'Mid Level (4 years)' },
  { value: 5, label: 'Senior (5+ years)' },
  { value: 7, label: 'Senior (7+ years)' },
  { value: 10, label: 'Expert (10+ years)' },
  { value: 15, label: 'Expert (15+ years)' }
];

// Helper function to format availability schedule for display
export const formatAvailabilitySchedule = (schedule: AvailabilitySchedule): string => {
  const days = Object.keys(schedule).filter(day => schedule[day] && schedule[day].length >= 2);
  if (days.length === 0) return 'No availability set';
  
  return days.map(day => {
    const times = schedule[day];
    if (times.length >= 2) {
      return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${times[0]} - ${times[1]}`;
    }
    return '';
  }).filter(Boolean).join(', ');
};

// Helper function to check if worker is currently available based on schedule
export const isWorkerCurrentlyAvailable = (profile: WorkerProfile): boolean => {
  if (!profile.is_available) return false;
  
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5); 
  
  const todaySchedule = profile.availability_schedule[currentDay];
  if (!todaySchedule || todaySchedule.length < 2) return false;
  
  const startTime = todaySchedule[0];
  const endTime = todaySchedule[1];
  
  return currentTime >= startTime && currentTime <= endTime;
};

// Helper function to calculate profile completion percentage
export const calculateProfileCompletion = (profile: Partial<CreateWorkerProfileData>): number => {
  const requiredFields = [
    'location',
    'location_text',
    'years_experience',
    'hourly_rate',
    'bio'
  ];
  
  const filledFields = requiredFields.filter(field => {
    const value = profile[field as keyof CreateWorkerProfileData];
    if (typeof value === 'string') {
      return value.trim() !== '';
    }
    if (typeof value === 'number') {
      return value >= 0;
    }
    return value !== undefined && value !== null;
  }).length;
  
  // Check if availability schedule has at least one day
  const hasAvailability = profile.availability_schedule && 
    Object.keys(profile.availability_schedule).some(day => 
      profile.availability_schedule![day] && profile.availability_schedule![day].length >= 2
    );
  
  const availabilityScore = hasAvailability ? 1 : 0;
  const totalFields = requiredFields.length + 1; 
  
  return Math.round(((filledFields + availabilityScore) / totalFields) * 100);
};