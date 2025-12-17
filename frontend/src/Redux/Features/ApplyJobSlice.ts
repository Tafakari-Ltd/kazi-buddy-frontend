import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  JobApplicationRequest,
  JobApplication,
  JobApplicationWithDetails,
  ApplicationFormErrors,
  ApplicationStatus,
  JobDetails
} from '../../types/jobApplication.types';
import JobApplicationApi from '../../services/jobApplicationApi';

interface ApplyJobState {
  formData: JobApplicationRequest;
  myApplications: JobApplication[];
  jobApplications: JobApplication[];
  allApplications: JobApplication[];
  currentApplication: JobApplicationWithDetails | null;
  selectedJob: JobDetails | null;
  isModalOpen: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  errors: ApplicationFormErrors;
  apiError: string | null;
  successMessage: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  stats: {
    total: number;
    pending: number;
    reviewed: number;
    accepted: number;
    rejected: number;
  };
}

const initialFormData: JobApplicationRequest = {
  cover_letter: "",
  proposed_rate: 0,
  availability_start: "",
  worker_notes: "",
  employer_notes: ""
};

const initialState: ApplyJobState = {
  formData: initialFormData,
  myApplications: [],
  jobApplications: [],
  allApplications: [],
  currentApplication: null,
  selectedJob: null,
  isModalOpen: false,
  isLoading: false,
  isSubmitting: false,
  errors: {},
  apiError: null,
  successMessage: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  stats: {
    total: 0,
    pending: 0,
    reviewed: 0,
    accepted: 0,
    rejected: 0
  }
};

export const applyForJob = createAsyncThunk(
  'jobApplication/apply',
  async ({ jobId, applicationData }: { jobId: string; applicationData: JobApplicationRequest }) => {
    const response = await JobApplicationApi.applyForJob(jobId, applicationData);
    return response;
  }
);

export const fetchMyApplications = createAsyncThunk(
  'jobApplication/fetchMyApplications',
  async (params?: any) => {
    const response = await JobApplicationApi.getMyApplications(params);
    return response;
  }
);

export const fetchApplicationDetails = createAsyncThunk(
  'jobApplication/fetchDetails',
  async (applicationId: string) => {
    const response = await JobApplicationApi.getApplicationDetails(applicationId);
    return response;
  }
);

export const fetchJobApplications = createAsyncThunk(
  'jobApplication/fetchJobApplications',
  async ({ jobId, params }: { jobId: string; params?: any }) => {
    const response = await JobApplicationApi.getJobApplications(jobId, params);
    return response;
  }
);

export const updateApplication = createAsyncThunk(
  'jobApplication/update',
  async ({ applicationId, updateData }: { applicationId: string; updateData: any }) => {
    const response = await JobApplicationApi.updateApplication(applicationId, updateData);
    return response;
  }
);

export const deleteApplication = createAsyncThunk(
  'jobApplication/delete',
  async (applicationId: string) => {
    await JobApplicationApi.deleteApplication(applicationId);
    return applicationId;
  }
);

export const fetchApplicationStats = createAsyncThunk(
  'jobApplication/fetchStats',
  async (jobId: string) => {
    const stats = await JobApplicationApi.getJobApplicationStats(jobId);
    return stats;
  }
);

const applyJobSlice = createSlice({
  name: "jobApplication",
  initialState,
  reducers: {
    updateFormData(state, action: PayloadAction<Partial<JobApplicationRequest>>) {
      state.formData = { ...state.formData, ...action.payload };
    },
    setCoverLetter(state, action: PayloadAction<string>) {
      state.formData.cover_letter = action.payload;
    },
    setProposedRate(state, action: PayloadAction<number>) {
      state.formData.proposed_rate = action.payload;
    },
    setAvailabilityStart(state, action: PayloadAction<string>) {
      state.formData.availability_start = action.payload;
    },
    setWorkerNotes(state, action: PayloadAction<string>) {
      state.formData.worker_notes = action.payload;
    },
    setSelectedJob(state, action: PayloadAction<JobDetails>) {
      state.selectedJob = action.payload;
    },
    setFormErrors(state, action: PayloadAction<ApplicationFormErrors>) {
      state.errors = action.payload;
    },
    clearFormErrors(state) {
      state.errors = {};
    },
    resetForm(state) {
      state.formData = initialFormData;
      state.errors = {};
    },
    clearForm(state) {
      state.formData = initialFormData;
      state.errors = {};
      state.apiError = null;
      state.successMessage = null;
    },
    openJobModal(state) {
      state.isModalOpen = true;
      state.apiError = null;
      state.successMessage = null; 
    },
    closeJobModal(state) {
      state.isModalOpen = false;
      state.formData = initialFormData;
      state.errors = {};
      state.apiError = null;
      state.successMessage = null; 
    },
    setSuccessMessage(state, action: PayloadAction<string>) {
      state.successMessage = action.payload;
      state.apiError = null;
    },
    setApiError(state, action: PayloadAction<string>) {
      state.apiError = action.payload;
      state.successMessage = null;
    },
    clearMessages(state) {
      state.successMessage = null;
      state.apiError = null;
    },
    updateApplicationStatus(state, action: PayloadAction<{ id: string; status: ApplicationStatus }>) {
      const { id, status } = action.payload;
      const myApp = state.myApplications.find(app => app.id === id);
      if (myApp) myApp.status = status;
      const jobApp = state.jobApplications.find(app => app.id === id);
      if (jobApp) jobApp.status = status;
      const allApp = state.allApplications.find(app => app.id === id);
      if (allApp) allApp.status = status;
      if (state.currentApplication && state.currentApplication.id === id) {
        state.currentApplication.status = status;
      }
    },
    setPagination(state, action: PayloadAction<Partial<typeof initialState.pagination>>) {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyForJob.pending, (state) => {
        state.isSubmitting = true;
        state.apiError = null;
      })
      .addCase(applyForJob.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.successMessage = action.payload.message || 'Application submitted successfully!';
        state.isModalOpen = false;
        state.formData = initialFormData;
        state.errors = {};
      })
      .addCase(applyForJob.rejected, (state, action) => {
        state.isSubmitting = false;
        state.apiError = action.error.message || 'Failed to submit application';
      });
    
    builder
      .addCase(fetchMyApplications.pending, (state) => {
        state.isLoading = true;
        state.apiError = null;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myApplications = action.payload.applications;
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.apiError = action.error.message || 'Failed to fetch applications';
      });
    
    builder
      .addCase(fetchApplicationDetails.pending, (state) => {
        state.isLoading = true;
        state.apiError = null;
      })
      .addCase(fetchApplicationDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentApplication = action.payload.application;
      })
      .addCase(fetchApplicationDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.apiError = action.error.message || 'Failed to fetch application details';
      });
    
    builder
      .addCase(fetchJobApplications.pending, (state) => {
        state.isLoading = true;
        state.apiError = null;
      })
      .addCase(fetchJobApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobApplications = action.payload.applications;
      })
      .addCase(fetchJobApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.apiError = action.error.message || 'Failed to fetch job applications';
      });
    
    builder
      .addCase(updateApplication.pending, (state) => {
        state.isSubmitting = true;
        state.apiError = null;
      })
      .addCase(updateApplication.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.successMessage = action.payload.message || 'Application updated successfully!';
        state.currentApplication = action.payload.application;
      })
      .addCase(updateApplication.rejected, (state, action) => {
        state.isSubmitting = false;
        state.apiError = action.error.message || 'Failed to update application';
      });
    
    builder
      .addCase(deleteApplication.pending, (state) => {
        state.isSubmitting = true;
        state.apiError = null;
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.successMessage = 'Application deleted successfully!';
        const applicationId = action.payload;
        state.myApplications = state.myApplications.filter(app => app.id !== applicationId);
        state.jobApplications = state.jobApplications.filter(app => app.id !== applicationId);
        state.allApplications = state.allApplications.filter(app => app.id !== applicationId);
        if (state.currentApplication?.id === applicationId) {
          state.currentApplication = null;
        }
      })
      .addCase(deleteApplication.rejected, (state, action) => {
        state.isSubmitting = false;
        state.apiError = action.error.message || 'Failed to delete application';
      });
    
    builder
      .addCase(fetchApplicationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  }
});

export const {
  updateFormData,
  setCoverLetter,
  setProposedRate,
  setAvailabilityStart,
  setWorkerNotes,
  setFormErrors,
  clearFormErrors,
  resetForm,
  clearForm,
  openJobModal,
  closeJobModal,
  setSuccessMessage,
  setApiError,
  clearMessages,
  updateApplicationStatus,
  setPagination,
  setSelectedJob 
} = applyJobSlice.actions;

export default applyJobSlice;