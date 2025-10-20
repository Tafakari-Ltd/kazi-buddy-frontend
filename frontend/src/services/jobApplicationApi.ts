import api from '../lib/axios';
import {
  JobApplicationRequest,
  JobApplication,
  JobApplicationWithDetails,
  ApplicationApiResponse,
  ApplicationListResponse,
  ApplicationDetailResponse,
  UpdateApplicationRequest,
  ApplicationQueryParams
} from '../types/jobApplication.types';

/**
 * Job Application API Service
 * Handles all job application-related API calls with proper error handling
 */
export class JobApplicationApi {
  private static readonly BASE_ENDPOINT = '/api/applications';

  /**
   * Apply for a job
   * POST /api/applications/{job_id}/apply/
   */
  static async applyForJob(
    jobId: string, 
    applicationData: JobApplicationRequest
  ): Promise<ApplicationApiResponse> {
    try {
      const url = `${this.BASE_ENDPOINT}/${jobId}/apply/`;
      console.log('Applying for job at:', url);
      console.log('Application data:', applicationData);
      
      const response = await api.post(url, applicationData);
      console.log('Apply response:', response);
      
      return response as any;
    } catch (error: any) {
      console.error('Error applying for job:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        url: error.config?.url
      });
      throw this.handleApiError(error);
    }
  }

  /**
   * Get current user's applications
   * GET /api/applications/me/
   */
  static async getMyApplications(
    params?: ApplicationQueryParams
  ): Promise<ApplicationListResponse> {
    try {
      const queryParams = this.buildQueryParams(params);
      const url = `${this.BASE_ENDPOINT}/me/${queryParams ? `?${queryParams}` : ''}`;
      console.log('Fetching applications from:', url);
      
      const response = await api.get(url);
      console.log('Applications response:', response);
      
      return response as any;
    } catch (error: any) {
      console.error('Error fetching my applications:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        url: error.config?.url
      });
      throw this.handleApiError(error);
    }
  }

  /**
   * Get specific application details
   * GET /api/applications/{application_id}/
   */
  static async getApplicationDetails(
    applicationId: string
  ): Promise<ApplicationDetailResponse> {
    try {
      const response = await api.get(`${this.BASE_ENDPOINT}/${applicationId}/`);
      return response as any;
    } catch (error: any) {
      console.error('Error fetching application details:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get applications for a specific job
   * GET /api/applications/job/{job_id}/
   */
  static async getJobApplications(
    jobId: string,
    params?: ApplicationQueryParams
  ): Promise<ApplicationListResponse> {
    try {
      const queryParams = this.buildQueryParams(params);
      const response = await api.get(
        `${this.BASE_ENDPOINT}/job/${jobId}/${queryParams ? `?${queryParams}` : ''}`
      );
      return response as any;
    } catch (error: any) {
      console.error('Error fetching job applications:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get all applications (admin/employer access)
   * GET /api/applications/all/
   */
  static async getAllApplications(
    params?: ApplicationQueryParams
  ): Promise<ApplicationListResponse> {
    try {
      const queryParams = this.buildQueryParams(params);
      const response = await api.get(
        `${this.BASE_ENDPOINT}/all/${queryParams ? `?${queryParams}` : ''}`
      );
      return response as any;
    } catch (error: any) {
      console.error('Error fetching all applications:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Update an application
   * PUT /api/applications/{application_id}/
   */
  static async updateApplication(
    applicationId: string,
    updateData: UpdateApplicationRequest
  ): Promise<ApplicationDetailResponse> {
    try {
      const response = await api.put(
        `${this.BASE_ENDPOINT}/${applicationId}/`,
        updateData
      );
      return response as any;
    } catch (error: any) {
      console.error('Error updating application:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Delete/withdraw an application
   * DELETE /api/applications/{application_id}/
   */
  static async deleteApplication(applicationId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`${this.BASE_ENDPOINT}/${applicationId}/`);
      return response as any;
    } catch (error: any) {
      console.error('Error deleting application:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Check if user has already applied to a job
   * Helper method to prevent duplicate applications
   */
  static async hasUserApplied(jobId: string): Promise<boolean> {
    try {
      const response = await this.getMyApplications({
        search: jobId,
        per_page: 1
      });
      return response.applications.some(app => app.job === jobId);
    } catch (error: any) {
      console.error('Error checking application status:', error);
      return false; // Return false on error to allow application attempt
    }
  }

  /**
   * Get application statistics for a job (for employers)
   */
  static async getJobApplicationStats(jobId: string): Promise<{
    total: number;
    pending: number;
    reviewed: number;
    accepted: number;
    rejected: number;
  }> {
    try {
      const response = await this.getJobApplications(jobId);
      const applications = response.applications;
      
      return {
        total: applications.length,
        pending: applications.filter(app => app.status === 'pending').length,
        reviewed: applications.filter(app => app.status === 'reviewed').length,
        accepted: applications.filter(app => app.status === 'accepted').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
      };
    } catch (error: any) {
      console.error('Error fetching application stats:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Bulk update application statuses (for employers)
   */
  static async bulkUpdateApplications(
    applicationIds: string[],
    status: 'reviewed' | 'accepted' | 'rejected'
  ): Promise<{ success: boolean; updated: number; errors: string[] }> {
    const results = {
      success: true,
      updated: 0,
      errors: [] as string[]
    };

    // Process applications in parallel with limited concurrency
    const concurrencyLimit = 5;
    const chunks = this.chunkArray(applicationIds, concurrencyLimit);

    for (const chunk of chunks) {
      const promises = chunk.map(async (id) => {
        try {
          await this.updateApplication(id, { status });
          results.updated++;
        } catch (error: any) {
          results.errors.push(`Failed to update application ${id}: ${error.message}`);
          results.success = false;
        }
      });

      await Promise.all(promises);
    }

    return results;
  }

  // Utility Methods

  /**
   * Build query parameters string from ApplicationQueryParams
   */
  private static buildQueryParams(params?: ApplicationQueryParams): string {
    if (!params) return '';

    const queryParams = new URLSearchParams();

    // Add filters
    if (params.status?.length) {
      params.status.forEach(status => queryParams.append('status', status));
    }
    if (params.job_type?.length) {
      params.job_type.forEach(type => queryParams.append('job_type', type));
    }
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.min_rate) queryParams.append('min_rate', params.min_rate.toString());
    if (params.max_rate) queryParams.append('max_rate', params.max_rate.toString());

    // Add pagination
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.ordering) queryParams.append('ordering', params.ordering);

    // Add search
    if (params.search) queryParams.append('search', params.search);

    return queryParams.toString();
  }

  /**
   * Handle API errors consistently
   */
  private static handleApiError(error: any): Error {
    if (error.message) {
      return new Error(error.message);
    }
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.response?.data?.detail) {
      return new Error(error.response.data.detail);
    }
    return new Error('An unexpected error occurred');
  }

  /**
   * Utility function to chunk array for batch processing
   */
  private static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Validate application data before submission
   */
  static validateApplicationData(data: JobApplicationRequest): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    // Validate cover letter
    if (!data.cover_letter?.trim()) {
      errors.cover_letter = 'Cover letter is required';
    } else if (data.cover_letter.length < 50) {
      errors.cover_letter = 'Cover letter must be at least 50 characters';
    } else if (data.cover_letter.length > 2000) {
      errors.cover_letter = 'Cover letter must not exceed 2000 characters';
    }

    // Validate proposed rate
    if (!data.proposed_rate || data.proposed_rate <= 0) {
      errors.proposed_rate = 'Proposed rate must be greater than 0';
    } else if (data.proposed_rate > 10000) {
      errors.proposed_rate = 'Proposed rate seems too high. Please verify.';
    }

    // Validate availability start date
    if (!data.availability_start) {
      errors.availability_start = 'Availability start date is required';
    } else {
      const startDate = new Date(data.availability_start);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        errors.availability_start = 'Availability start date cannot be in the past';
      }
    }

    // Validate worker notes (optional but if provided, check length)
    if (data.worker_notes && data.worker_notes.length > 1000) {
      errors.worker_notes = 'Worker notes must not exceed 1000 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format application data for display
   */
  static formatApplicationForDisplay(application: JobApplication): JobApplicationWithDetails {
    return {
      ...application,
      // Ensure dates are properly formatted
      applied_at: new Date(application.applied_at).toISOString(),
      reviewed_at: application.reviewed_at ? new Date(application.reviewed_at).toISOString() : null,
      responded_at: application.responded_at ? new Date(application.responded_at).toISOString() : null,
      // Parse proposed_rate to number for calculations
      proposed_rate: parseFloat(application.proposed_rate).toFixed(2)
    };
  }
}

export default JobApplicationApi;