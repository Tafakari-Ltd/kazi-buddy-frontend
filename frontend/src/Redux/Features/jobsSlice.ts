import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import {
  Job,
  JobsState,
  CreateJobData,
  UpdateJobData,
  JobFilters,
  JobsResponse,
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

export const fetchJobs = createAsyncThunk<
  JobsResponse,
  JobFilters | void,
  { rejectValue: string }
>("jobs/fetchJobs", async (filters, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters && typeof filters === "object") {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const url = `/jobs/${queryString ? `?${queryString}` : ""}`;

    const response = await api.get(url);
    return response as any;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to fetch jobs");
  }
});

export const fetchJobById = createAsyncThunk<
  Job,
  string,
  { rejectValue: string }
>("jobs/fetchJobById", async (jobId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/jobs/${jobId}/`);
    return response as any;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to fetch job details");
  }
});

export const createJob = createAsyncThunk<
  Job,
  CreateJobData,
  {
    rejectValue:
      | string
      | { message: string; fieldErrors: Record<string, string[]> };
  }
>("jobs/createJob", async (jobData, { rejectWithValue }) => {
  try {
    const response = await api.post("/jobs/create/", jobData);
    return response as any;
  } catch (error: any) {
    if (error?.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
      return rejectWithValue({
        message: "Validation errors occurred",
        fieldErrors: error.fieldErrors,
      } as any);
    }
    return rejectWithValue(error?.message || "Failed to create job");
  }
});

export const updateJob = createAsyncThunk<
  Job,
  { jobId: string; data: UpdateJobData },
  {
    rejectValue:
      | string
      | { message: string; fieldErrors: Record<string, string[]> };
  }
>("jobs/updateJob", async ({ jobId, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/jobs/update/${jobId}/`, data);
    return response as any;
  } catch (error: any) {
    if (error?.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
      return rejectWithValue({
        message: "Validation errors occurred",
        fieldErrors: error.fieldErrors,
      } as any);
    }
    return rejectWithValue(error?.message || "Failed to update job");
  }
});

export const deleteJob = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("jobs/deleteJob", async (jobId, { rejectWithValue }) => {
  try {
    await api.delete(`/jobs/delete/${jobId}/`);
    return jobId;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to delete job");
  }
});

export const updateJobStatus = createAsyncThunk<
  { jobId: string; status: JobStatus },
  { jobId: string; status: JobStatus },
  { rejectValue: string }
>("jobs/updateJobStatus", async ({ jobId, status }, { rejectWithValue }) => {
  try {
    await api.post(`/jobs/${jobId}/status/`, { status });
    return { jobId, status };
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to update job status");
  }
});

export const fetchJobsByEmployer = createAsyncThunk<
  JobsResponse,
  string,
  { rejectValue: string }
>("jobs/fetchJobsByEmployer", async (employerId, { rejectWithValue }) => {
  try {
    const response = await api.get(
      `/jobs/employers/?employer_id=${employerId}`,
    );
    return response as any;
  } catch (error: any) {
    return rejectWithValue(
      error?.message || "Failed to fetch jobs by employer",
    );
  }
});

export const fetchJobsByCategory = createAsyncThunk<
  JobsResponse,
  string,
  { rejectValue: string }
>("jobs/fetchJobsByCategory", async (categoryId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/jobs/category/${categoryId}/filter/`);
    return response as any;
  } catch (error: any) {
    return rejectWithValue(
      error?.message || "Failed to fetch jobs by category",
    );
  }
});

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearJobs: (state) => {
      state.jobs = [];
      state.error = null;
      // Removed sessionStorage clearing since we don't store it there anymore
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
    setPagination: (
      state,
      action: PayloadAction<{ page: number; limit?: number }>,
    ) => {
      state.pagination.page = action.payload.page;
      if (action.payload.limit) {
        state.pagination.limit = action.payload.limit;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;

        if (payload.results && Array.isArray(payload.results)) {
            state.jobs = payload.results;
        } else if (payload.data && Array.isArray(payload.data)) {
            state.jobs = payload.data;
        } else if (Array.isArray(payload)) {
            state.jobs = payload;
        } else {
            state.jobs = [];
        }

        if (payload.pagination) {
          state.pagination = payload.pagination;
        } else if (payload.count !== undefined) {
           const total = payload.count;
           const limit = state.filters.limit || 10;
           state.pagination = {
             total: total,
             page: state.filters.page || 1,
             limit: limit,
             total_pages: Math.ceil(total / limit)
           };
        }
        // Removed sessionStorage.setItem
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

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
        // Removed sessionStorage.setItem
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string" ? action.payload : "Failed to create job";
      });

    builder
      .addCase(updateJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.jobs.findIndex((job) => job.id === action.payload.id);
        if (index !== -1) state.jobs[index] = action.payload;
        state.currentJob = action.payload;
        state.successMessage = "Job updated successfully";
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string" ? action.payload : "Failed to update job";
      });

    builder
      .addCase(deleteJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = state.jobs.filter((job) => job.id !== action.payload);
        if (state.currentJob?.id === action.payload) state.currentJob = null;
        state.successMessage = "Job deleted successfully";
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateJobStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { jobId, status } = action.payload;
        const index = state.jobs.findIndex((job) => job.id === jobId);
        if (index !== -1) state.jobs[index].status = status;
        if (state.currentJob?.id === jobId) state.currentJob.status = status;
        state.successMessage = "Job status updated successfully";
      })
      .addCase(updateJobStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchJobsByEmployer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobsByEmployer.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload.results && Array.isArray(payload.results)) {
            state.jobs = payload.results;
        } else if (payload && payload.data) {
          state.jobs = payload.data;
        } else {
          state.jobs = Array.isArray(action.payload) ? action.payload : [];
        }
        if (action.payload && action.payload.pagination) state.pagination = action.payload.pagination;
      })
      .addCase(fetchJobsByEmployer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchJobsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload.results && Array.isArray(payload.results)) {
             state.jobs = payload.results;
        } else if (payload && payload.data) {
          state.jobs = payload.data;
        } else {
          state.jobs = Array.isArray(action.payload) ? action.payload : [];
        }
        if (action.payload && action.payload.pagination) state.pagination = action.payload.pagination;
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