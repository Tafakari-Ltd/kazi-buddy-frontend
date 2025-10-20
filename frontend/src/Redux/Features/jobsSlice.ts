import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import {
  Job,
  JobsState,
  CreateJobData,
  UpdateJobData,
  JobFilters,
  JobsResponse,
  JobDetailResponse,
  JobStatus,
} from "@/types/job.types";

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  jobSkills: [],
  jobEmployer: null,
  filters: {
    page: 1,
    limit: 10,
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 0,
  },
  loading: false,
  error: null,
  successMessage: null,
};

// Async thunks

// 1. Fetch all jobs (list_jobs)
export const fetchJobs = createAsyncThunk<
  JobsResponse,
  JobFilters | void,
  { rejectValue: string }
>(
  "jobs/fetchJobs",
  async (filters, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Build query parameters - handle void filters
      if (filters && typeof filters === 'object') {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      const queryString = queryParams.toString();
      const url = `/jobs/${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching jobs from URL:', url);
      const response = await api.get(url);
      console.log('Jobs response:', response);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch jobs"
      );
    }
  }
);

// 2. Fetch single job details (job_details)
export const fetchJobById = createAsyncThunk<
  Job,
  string,
  { rejectValue: string }
>(
  "jobs/fetchJobById",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/jobs/${jobId}/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch job details"
      );
    }
  }
);

// 3. Create new job (create_job)
export const createJob = createAsyncThunk<
  Job,
  CreateJobData,
  { rejectValue: string | { message: string; fieldErrors: Record<string, string[]> } }
>(
  "jobs/createJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await api.post("/jobs/create/", jobData);
      return response.data;
    } catch (error: any) {
      if (error?.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        return rejectWithValue({
          message: "Validation errors occurred",
          fieldErrors: error.fieldErrors,
        } as any);
      }
      return rejectWithValue(error?.message || "Failed to create job");
    }
  }
);

// 4. Update job (update_job)
export const updateJob = createAsyncThunk<
  Job,
  { jobId: string; data: UpdateJobData },
  { rejectValue: string | { message: string; fieldErrors: Record<string, string[]> } }
>(
  "jobs/updateJob",
  async ({ jobId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/jobs/update/${jobId}/`, data);
      return response.data;
    } catch (error: any) {
      if (error?.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        return rejectWithValue({
          message: "Validation errors occurred",
          fieldErrors: error.fieldErrors,
        } as any);
      }
      return rejectWithValue(error?.message || "Failed to update job");
    }
  }
);

// 5. Delete job (delete_job)
export const deleteJob = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "jobs/deleteJob",
  async (jobId, { rejectWithValue }) => {
    try {
      await api.delete(`/jobs/delete/${jobId}/`);
      return jobId;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to delete job"
      );
    }
  }
);

// 6. Update job status (update_JobStatus)
export const updateJobStatus = createAsyncThunk<
  { jobId: string; status: JobStatus },
  { jobId: string; status: JobStatus },
  { rejectValue: string }
>(
  "jobs/updateJobStatus",
  async ({ jobId, status }, { rejectWithValue }) => {
    try {
      await api.post(`/jobs/${jobId}/status/`, { status });
      return { jobId, status };
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to update job status"
      );
    }
  }
);

// 7. Fetch jobs by employer (jobs_byEmployer)
export const fetchJobsByEmployer = createAsyncThunk<
  JobsResponse,
  string,
  { rejectValue: string }
>(
  "jobs/fetchJobsByEmployer",
  async (employerId, { rejectWithValue }) => {
    try {
      console.log('Fetching jobs for employer ID:', employerId);
      // Try with employer_id parameter first
      const response = await api.get(`/jobs/employers/?employer_id=${employerId}`);
      console.log('Jobs fetch response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch jobs by employer:', error);
      return rejectWithValue(
        error?.message || "Failed to fetch jobs by employer"
      );
    }
  }
);

// 8. Fetch jobs by category (jobs_byCategory)
export const fetchJobsByCategory = createAsyncThunk<
  JobsResponse,
  string,
  { rejectValue: string }
>(
  "jobs/fetchJobsByCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/jobs/category/${categoryId}/filter/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch jobs by category"
      );
    }
  }
);

// Jobs slice
const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearJobs: (state) => {
      state.jobs = [];
      state.error = null;
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("jobs");
      }
    },
    hydrateJobs: (state, action: PayloadAction<Job[]>) => {
      state.jobs = action.payload;
    },
    clearState: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
      state.jobSkills = [];
      state.jobEmployer = null;
    },
    setFilters: (state, action: PayloadAction<JobFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
      };
    },
    setPagination: (state, action: PayloadAction<{ page: number; limit?: number }>) => {
      state.pagination.page = action.payload.page;
      if (action.payload.limit) {
        state.pagination.limit = action.payload.limit;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch jobs
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.jobs = action.payload.data;
        } else {
          state.jobs = Array.isArray(action.payload) ? action.payload : [];
        }
        
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }

        if (typeof window !== "undefined") {
          sessionStorage.setItem("jobs", JSON.stringify(state.jobs));
        }
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch job by ID
    builder
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create job
    builder
      .addCase(createJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs.unshift(action.payload);
        state.successMessage = "Job created successfully";

        if (typeof window !== "undefined") {
          sessionStorage.setItem("jobs", JSON.stringify(state.jobs));
        }
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string"
          ? action.payload
          : "Failed to create job";
      });

    // Update job
    builder
      .addCase(updateJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.jobs.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
        state.currentJob = action.payload;
        state.successMessage = "Job updated successfully";

        if (typeof window !== "undefined") {
          sessionStorage.setItem("jobs", JSON.stringify(state.jobs));
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string"
          ? action.payload
          : "Failed to update job";
      });

    // Delete job
    builder
      .addCase(deleteJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = state.jobs.filter(job => job.id !== action.payload);
        if (state.currentJob?.id === action.payload) {
          state.currentJob = null;
        }
        state.successMessage = "Job deleted successfully";

        if (typeof window !== "undefined") {
          sessionStorage.setItem("jobs", JSON.stringify(state.jobs));
        }
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update job status
    builder
      .addCase(updateJobStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { jobId, status } = action.payload;
        const index = state.jobs.findIndex(job => job.id === jobId);
        if (index !== -1) {
          state.jobs[index].status = status;
        }
        if (state.currentJob?.id === jobId) {
          state.currentJob.status = status;
        }
        state.successMessage = "Job status updated successfully";

        if (typeof window !== "undefined") {
          sessionStorage.setItem("jobs", JSON.stringify(state.jobs));
        }
      })
      .addCase(updateJobStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch jobs by employer
    builder
      .addCase(fetchJobsByEmployer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobsByEmployer.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.jobs = action.payload.data;
        } else {
          state.jobs = Array.isArray(action.payload) ? action.payload : [];
        }
        
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchJobsByEmployer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch jobs by category
    builder
      .addCase(fetchJobsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.jobs = action.payload.data;
        } else {
          state.jobs = Array.isArray(action.payload) ? action.payload : [];
        }
        
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchJobsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearJobs,
  hydrateJobs,
  clearState,
  clearCurrentJob,
  setFilters,
  clearFilters,
  setPagination,
} = jobsSlice.actions;

export default jobsSlice;