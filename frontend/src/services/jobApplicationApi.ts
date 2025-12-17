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
  private static readonly ADMIN_ENDPOINT = '/adminpanel/applications'; 

  static async adminChangeStatus(
    applicationId: string, 
    status: 'accepted' | 'rejected',
    notes?: string
  ): Promise<{ message: string; application: JobApplicationWithDetails }> {
    const payload: any = { status };
    if (notes) payload.employer_notes = notes;
    return api.patch(`${this.ADMIN_ENDPOINT}/${applicationId}/status/`, payload) as any;
  }

  static async applyForJob(
    jobId: string, 
    applicationData: JobApplicationRequest
  ): Promise<ApplicationApiResponse> {
    return api.post(`${this.BASE_ENDPOINT}/${jobId}/apply/`, applicationData) as any;
  }

  static async getMyApplications(
    params?: ApplicationQueryParams
  ): Promise<ApplicationListResponse> {
    const query = this.buildQueryParams(params);
    return api.get(`${this.BASE_ENDPOINT}/me/${query ? `?${query}` : ''}`) as any;
  }

  static async getApplicationDetails(
    applicationId: string
  ): Promise<ApplicationDetailResponse> {
    return api.get(`${this.BASE_ENDPOINT}/${applicationId}/`) as any;
  }

  static async getJobApplications(
    jobId: string,
    params?: ApplicationQueryParams
  ): Promise<ApplicationListResponse> {
    const query = this.buildQueryParams(params);
    return api.get(`${this.BASE_ENDPOINT}/job/${jobId}/${query ? `?${query}` : ''}`) as any;
  }

  static async getAllApplications(
    params?: ApplicationQueryParams
  ): Promise<ApplicationListResponse> {
    const query = this.buildQueryParams(params);
    return api.get(`${this.BASE_ENDPOINT}/all/${query ? `?${query}` : ''}`) as any;
  }

  static async updateApplication(
    applicationId: string,
    updateData: UpdateApplicationRequest
  ): Promise<ApplicationDetailResponse> {
    return api.put(`${this.BASE_ENDPOINT}/${applicationId}/`, updateData) as any;
  }

  static async deleteApplication(applicationId: string): Promise<{ message: string }> {
    return api.delete(`${this.BASE_ENDPOINT}/${applicationId}/`) as any;
  }

  static async hasUserApplied(jobId: string): Promise<boolean> {
    try {
      const response = await this.getMyApplications({ search: jobId, per_page: 1 });
      return response.applications.some(app => app.job === jobId);
    } catch {
      return false; 
    }
  }

  static async getJobApplicationStats(jobId: string): Promise<{
    total: number; pending: number; reviewed: number; accepted: number; rejected: number;
  }> {
    const response = await this.getJobApplications(jobId);
    const apps = response.applications;
    return {
      total: apps.length,
      pending: apps.filter(app => app.status === 'pending').length,
      reviewed: apps.filter(app => app.status === 'reviewed').length,
      accepted: apps.filter(app => app.status === 'accepted').length,
      rejected: apps.filter(app => app.status === 'rejected').length,
    };
  }

  static async bulkUpdateApplications(
    applicationIds: string[],
    status: 'reviewed' | 'accepted' | 'rejected'
  ): Promise<{ success: boolean; updated: number; errors: string[] }> {
    const results = { success: true, updated: 0, errors: [] as string[] };
    const chunks = this.chunkArray(applicationIds, 5);

    for (const chunk of chunks) {
      await Promise.all(chunk.map(async (id) => {
        try {
          await this.updateApplication(id, { status });
          results.updated++;
        } catch (error: any) {
          results.errors.push(`Failed to update ${id}: ${error.message}`);
          results.success = false;
        }
      }));
    }
    return results;
  }

  private static buildQueryParams(params?: ApplicationQueryParams): string {
    if (!params) return '';
    const q = new URLSearchParams();
    if (params.status) params.status.forEach(s => q.append('status', s));
    if (params.job_type) params.job_type.forEach(t => q.append('job_type', t));
    if (params.date_from) q.append('date_from', params.date_from);
    if (params.date_to) q.append('date_to', params.date_to);
    if (params.min_rate) q.append('min_rate', params.min_rate.toString());
    if (params.max_rate) q.append('max_rate', params.max_rate.toString());
    if (params.page) q.append('page', params.page.toString());
    if (params.per_page) q.append('per_page', params.per_page.toString());
    if (params.ordering) q.append('ordering', params.ordering);
    if (params.search) q.append('search', params.search);
    if (params.expand) q.append('expand', params.expand);
    return q.toString();
  }

  private static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  static validateApplicationData(data: JobApplicationRequest) {
    const errors: Record<string, string> = {};
    if (!data.cover_letter?.trim()) errors.cover_letter = 'Cover letter is required';
    else if (data.cover_letter.length < 50) errors.cover_letter = 'Min 50 chars required';
    else if (data.cover_letter.length > 2000) errors.cover_letter = 'Max 2000 chars allowed';

    if (!data.proposed_rate || data.proposed_rate <= 0) errors.proposed_rate = 'Invalid rate';
    
    if (!data.availability_start) {
      errors.availability_start = 'Start date required';
    } else {
      const start = new Date(data.availability_start);
      if (start < new Date(new Date().setHours(0,0,0,0))) errors.availability_start = 'Date cannot be in past';
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  }

  static formatApplicationForDisplay(application: JobApplication): JobApplicationWithDetails {
    return {
      ...application,
      applied_at: new Date(application.applied_at).toISOString(),
      reviewed_at: application.reviewed_at ? new Date(application.reviewed_at).toISOString() : null,
      responded_at: application.responded_at ? new Date(application.responded_at).toISOString() : null,
      proposed_rate: parseFloat(application.proposed_rate).toFixed(2)
    } as unknown as JobApplicationWithDetails;
  }
}

export default JobApplicationApi;