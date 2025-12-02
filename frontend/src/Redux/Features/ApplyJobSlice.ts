import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  JobApplicationRequest,
  JobApplication,
  JobApplicationWithDetails,
  ApplicationFormErrors,
  ApplicationStatus
} from '../../types/jobApplication.types';
import JobApplicationApi from '../../services/jobApplicationApi';

interface ApplyJobState {
  // Form state
  formData: JobApplicationRequest;
  
  // Application lists
  myApplications: JobApplication[];
  jobApplications: JobApplication[];
  allApplications: JobApplication[];
  
  // Current application details
  currentApplication: JobApplicationWithDetails | null;

  // Selected Job for Application 
  selectedJob: {
    id: string | number;
    title: string;
  } | null;
  
  // UI state
  isModalOpen: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  
  // Error handling
  errors: ApplicationFormErrors;
  apiError: string | null;
  
  // Success messages
  successMessage: string | null;
  
  // Pagination and filtering
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  
  // Application statistics
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
  selectedJob: null,// Initialize selectedJob
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

// Async Thunks for API calls
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
    // Form data management
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

    // Set Selected Job 
    setSelectedJob(state, action: PayloadAction<{ id: string | number; title: string }>) {
      state.selectedJob = action.payload;
    },
    
    // Form validation
    setFormErrors(state, action: PayloadAction<ApplicationFormErrors>) {
      state.errors = action.payload;
    },
    
    clearFormErrors(state) {
      state.errors = {};
    },
    
    // Form reset
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
    
    // Modal management
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
    
    // Success/Error message management
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
    
    // Application status update 
    updateApplicationStatus(state, action: PayloadAction<{ id: string; status: ApplicationStatus }>) {
      const { id, status } = action.payload;
      
      // Update in myApplications
      const myApp = state.myApplications.find(app => app.id === id);
      if (myApp) {
        myApp.status = status;
      }
      
      // Update in jobApplications
      const jobApp = state.jobApplications.find(app => app.id === id);
      if (jobApp) {
        jobApp.status = status;
      }
      
      // Update in allApplications
      const allApp = state.allApplications.find(app => app.id === id);
      if (allApp) {
        allApp.status = status;
      }
      
      // Update current application if it matches
      if (state.currentApplication && state.currentApplication.id === id) {
        state.currentApplication.status = status;
      }
    },
    
    // Pagination
    setPagination(state, action: PayloadAction<Partial<typeof initialState.pagination>>) {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  
  extraReducers: (builder) => {
    // Apply for job
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
    
    // Fetch my applications
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
    
    // Fetch application details
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
    
    // Fetch job applications
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
    
    // Update application
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
    
    // Delete application
    builder
      .addCase(deleteApplication.pending, (state) => {
        state.isSubmitting = true;
        state.apiError = null;
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.successMessage = 'Application deleted successfully!';
        
        // Remove from all lists
        const applicationId = action.payload;
        state.myApplications = state.myApplications.filter(app => app.id !== applicationId);
        state.jobApplications = state.jobApplications.filter(app => app.id !== applicationId);
        state.allApplications = state.allApplications.filter(app => app.id !== applicationId);
        
        // Clear current if it was the deleted one
        if (state.currentApplication?.id === applicationId) {
          state.currentApplication = null;
        }
      })
      .addCase(deleteApplication.rejected, (state, action) => {
        state.isSubmitting = false;
        state.apiError = action.error.message || 'Failed to delete application';
      });
    
    // Fetch application stats
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