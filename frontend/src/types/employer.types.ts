// Employer Profile Types and Interfaces

// Employer Profile Interface
export interface EmployerProfile {
    id: string;
    company_name: string;
    business_type: BusinessType;
    industry: string;
    location: string;
    location_text: string;
    description: string;
    website_url?: string;
    business_registration_number: string;
    verification_status: VerificationStatus;
    admin_notes?: string;
    created_at: string;
    updated_at: string;
    user: string;
  }
  
  // Create Employer Profile Data
  export interface CreateEmployerProfileData {
    company_name: string;
    business_type: BusinessType;
    industry: string;
    location: string;
    location_text: string;
    description: string;
    website_url?: string;
    business_registration_number: string;
  }
  
  // Update Employer Profile Data
  export interface UpdateEmployerProfileData {
    company_name?: string;
    business_type?: BusinessType;
    industry?: string;
    location?: string;
    location_text?: string;
    description?: string;
    website_url?: string;
    business_registration_number?: string;
  }
  
  // Filter Employer Profiles Data
  export interface EmployerProfileFilters {
    industry?: string;
    business_type?: BusinessType;
    verification_status?: VerificationStatus;
    location?: string;
    search_query?: string;
    page?: number;
    limit?: number;
  }
  
  // API Response Interfaces
  export interface EmployerProfileResponse {
    message: string;
    data: EmployerProfile;
  }
  
  export interface EmployerProfilesResponse {
    message: string;
    data: EmployerProfile[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  }
  
  // Enums
  export enum BusinessType {
    SOLE_PROPRIETORSHIP = 'sole_proprietorship',
    PARTNERSHIP = 'partnership',
    CORPORATION = 'corporation',
    LLC = 'llc',
    NON_PROFIT = 'non_profit',
    OTHER = 'other'
  }
  
  export enum VerificationStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    REJECTED = 'rejected',
    SUSPENDED = 'suspended'
  }
  
  // State Interface
  export interface EmployerProfileState {
    profiles: EmployerProfile[];
    currentProfile: EmployerProfile | null;
    userProfile: EmployerProfile | null; // Current user's profile
    filters: EmployerProfileFilters;
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
  export interface EmployerProfileFormErrors {
    company_name?: string;
    business_type?: string;
    industry?: string;
    location?: string;
    location_text?: string;
    description?: string;
    website_url?: string;
    business_registration_number?: string;
  }
  
  // Constants for dropdown options
  export const BUSINESS_TYPE_OPTIONS = [
    { value: BusinessType.SOLE_PROPRIETORSHIP, label: 'Sole Proprietorship' },
    { value: BusinessType.PARTNERSHIP, label: 'Partnership' },
    { value: BusinessType.CORPORATION, label: 'Corporation' },
    { value: BusinessType.LLC, label: 'Limited Liability Company (LLC)' },
    { value: BusinessType.NON_PROFIT, label: 'Non-Profit Organization' },
    { value: BusinessType.OTHER, label: 'Other' }
  ];
  
  export const VERIFICATION_STATUS_OPTIONS = [
    { value: VerificationStatus.PENDING, label: 'Pending', color: 'text-yellow-600 bg-yellow-100' },
    { value: VerificationStatus.VERIFIED, label: 'Verified', color: 'text-green-600 bg-green-100' },
    { value: VerificationStatus.REJECTED, label: 'Rejected', color: 'text-red-600 bg-red-100' },
    { value: VerificationStatus.SUSPENDED, label: 'Suspended', color: 'text-gray-600 bg-gray-100' }
  ];
  
  // Popular Industries List
  export const INDUSTRY_OPTIONS = [
    'Information Technology',
    'Healthcare',
    'Finance and Banking',
    'Education',
    'Retail and E-commerce',
    'Manufacturing',
    'Construction',
    'Real Estate',
    'Transportation and Logistics',
    'Hospitality and Tourism',
    'Media and Entertainment',
    'Food and Beverage',
    'Consulting',
    'Non-Profit',
    'Agriculture',
    'Energy and Utilities',
    'Government',
    'Other'
  ];