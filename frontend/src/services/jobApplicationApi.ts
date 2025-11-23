// File: src/services/jobApplicationApi.ts

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

export class JobApplicationApi {
  private static readonly BASE_ENDPOINT = '/applications';
  // Add the admin endpoint base
  private static readonly ADMIN_ENDPOINT = '/adminpanel/applications'; 

  /**
   * ADMIN ONLY: Change application status (Accept/Reject)
   * PATCH /api/adminpanel/applications/{id}/status/
   */
  static async adminChangeStatus(
    applicationId: string, 
    status: 'accepted' | 'rejected',
    notes?: string
  ): Promise<{ message: string; application: JobApplicationWithDetails }> {
    try {
      const url = `${this.ADMIN_ENDPOINT}/${applicationId}/status/`;
      
      const payload: any = { status };
      
      // Add notes if provided (mapped to employer_notes based on your API response)
      if (notes) {
        payload.employer_notes = notes;
      }

      const response = await api.patch(url, payload);
      return response as any;
    } catch (error: any) {
      console.error('Error changing application status:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Apply for a job
   */
  static async applyForJob(
    jobId: string, 
    applicationData: JobApplicationRequest
  ): Promise<ApplicationApiResponse> {
    try {
      const url = `${this.BASE_ENDPOINT}/${jobId}/apply/`;
      const response = await api.post(url, applicationData);
      return response as any;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get current user's applications
   */
  static async getMyApplications(
    params?: ApplicationQueryParams
  ): Promise<ApplicationListResponse> {
    try {
      const queryParams = this.buildQueryParams(params);
      const url = `${this.BASE_ENDPOINT}/me/${queryParams ? `?${queryParams}` : ''}`;
      const response = await api.get(url);
      return response as any;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get specific application details
   */
  static async getApplicationDetails(
    applicationId: string
  ): Promise<ApplicationDetailResponse> {
    try {
      const url = `${this.BASE_ENDPOINT}/${applicationId}/`;
      const response = await api.get(url);
      return response as any;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get applications for a specific job
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
      throw this.handleApiError(error);
    }
  }

  /**
   * Get all applications (admin/employer access)
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
      throw this.handleApiError(error);
    }
  }

  /**
   * Delete/withdraw an application
   */
  static async deleteApplication(applicationId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`${this.BASE_ENDPOINT}/${applicationId}/`);
      return response as any;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  static async hasUserApplied(jobId: string): Promise<boolean> {
    try {
      const response = await this.getMyApplications({ search: jobId, per_page: 1 });
      return response.applications.some(app => app.job === jobId);
    } catch (error: any) {
      return false;
    }
  }

  // --- Utility Methods ---

  private static buildQueryParams(params?: ApplicationQueryParams): string {
    if (!params) return '';
    const queryParams = new URLSearchParams();

    if (params.status?.length) params.status.forEach(status => queryParams.append('status', status));
    if (params.job_type?.length) params.job_type.forEach(type => queryParams.append('job_type', type));
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.min_rate) queryParams.append('min_rate', params.min_rate.toString());
    if (params.max_rate) queryParams.append('max_rate', params.max_rate.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.ordering) queryParams.append('ordering', params.ordering);
    if (params.search) queryParams.append('search', params.search);
    if (params.expand) queryParams.append('expand', params.expand);

    return queryParams.toString();
  }

  private static handleApiError(error: any): Error {
    if (error.message) return new Error(error.message);
    if (error.response?.data?.message) return new Error(error.response.data.message);
    if (error.response?.data?.detail) return new Error(error.response.data.detail);
    return new Error('An unexpected error occurred');
  }

  // Utility to chunk arrays for batch processing
  private static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

export default JobApplicationApi;