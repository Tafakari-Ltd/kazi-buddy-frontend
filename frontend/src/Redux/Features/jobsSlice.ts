// src/Redux/Features/jobsSlice.ts
"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";


// Types

export interface CreateJobData {
    employer: string;
    category: string;
    title: string;
    description: string;
    location: string;
    location_text?: string;
    job_type: "full_time" | "part_time" | "contract" | "internship";
    urgency_level?: "low" | "medium" | "high";
    budget_min?: number;
    budget_max?: number;
    payment_type?: "fixed" | "hourly";
    start_date?: string;
    end_date?: string;
    estimated_hours?: number;
    max_applicants?: number;
    status?: "active" | "draft" | "closed";
    visibility?: "public" | "private";
}

export interface JobData {
    id: string;
    employer: string;
    category: string;
    title: string;
    description: string;
    location: string;
    location_text?: string;
    job_type: string;
    urgency_level?: string;
    budget_min?: number;
    budget_max?: number;
    payment_type?: string;
    start_date?: string;
    end_date?: string;
    estimated_hours?: number;
    max_applicants?: number;
    status: string;
    visibility: string;
    created_at: string;
    updated_at: string;
}

export interface JobsState {
    jobs: JobData[];
    currentJob: JobData | null;
    loading: boolean;
    error: string | null;
    successMessage: string | null;
}

// ========================
// Thunks
// ========================

// Create Job
export const createJob = createAsyncThunk<
    { message: string; job: JobData }, // return type
    CreateJobData, // argument type
    { rejectValue: string | { message: string; fieldErrors: Record<string, string[]> } } // error type
>(
    "jobs/create",
    async (jobData, { rejectWithValue }) => {
        try {
            console.log("Creating job with data:", jobData);
            
            const response = await api.post("jobs/create/", jobData);

            console.log("Job created successfully:", response);

            return response as unknown as { message: string; job: JobData };
        } catch (err: any) {
            console.error("Create job error caught:", err);
            console.error("Error structure:", {
                message: err?.message,
                fieldErrors: err?.fieldErrors,
                data: err?.data
            });
            
            if (err?.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
                return rejectWithValue({
                    message: "Validation errors occurred",
                    fieldErrors: err.fieldErrors
                } as any);
            }
            
            const errorMessage = err?.message || "Failed to create job";
            return rejectWithValue(errorMessage);
        }
    }
);

// Fetch Jobs (for listing jobs)
export const fetchJobs = createAsyncThunk<
    JobData[], 
    void, 
    { rejectValue: string }
>(
    "jobs/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("jobs/");
            return response as unknown as JobData[];
        } catch (err: any) {
            const errorMessage = err?.message || "Failed to fetch jobs";
            return rejectWithValue(errorMessage);
        }
    }
);

// Fetch Single Job
export const fetchJobById = createAsyncThunk<
    JobData, 
    string, // job id
    { rejectValue: string }
>(
    "jobs/fetchById",
    async (jobId, { rejectWithValue }) => {
        try {
            const response = await api.get(`jobs/${jobId}/`);
            return response as unknown as JobData;
        } catch (err: any) {
            const errorMessage = err?.message || "Failed to fetch job";
            return rejectWithValue(errorMessage);
        }
    }
);

// Update Job
export const updateJob = createAsyncThunk<
    { message: string; job: JobData },
    { jobId: string; jobData: Partial<CreateJobData> },
    { rejectValue: string | { message: string; fieldErrors: Record<string, string[]> } }
>(
    "jobs/update",
    async ({ jobId, jobData }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`jobs/${jobId}/`, jobData);
            return response as unknown as { message: string; job: JobData };
        } catch (err: any) {
            if (err?.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
                return rejectWithValue({
                    message: "Validation errors occurred",
                    fieldErrors: err.fieldErrors
                } as any);
            }
            
            const errorMessage = err?.message || "Failed to update job";
            return rejectWithValue(errorMessage);
        }
    }
);

// Delete Job
export const deleteJob = createAsyncThunk<
    string, // return the deleted job id
    string, // job id
    { rejectValue: string }
>(
    "jobs/delete",
    async (jobId, { rejectWithValue }) => {
        try {
            await api.delete(`jobs/${jobId}/`);
            return jobId;
        } catch (err: any) {
            const errorMessage = err?.message || "Failed to delete job";
            return rejectWithValue(errorMessage);
        }
    }
);


const initialState: JobsState = {
    jobs: [],
    currentJob: null,
    loading: false,
    error: null,
    successMessage: null,
};

const jobsSlice = createSlice({
    name: "jobs",
    initialState,
    reducers: {
        clearJobState: (state) => {
            state.error = null;
            state.successMessage = null;
        },
        clearCurrentJob: (state) => {
            state.currentJob = null;
        },
    },
    extraReducers: (builder) => {
        // Create Job
        builder
            .addCase(createJob.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createJob.fulfilled, (state, action: PayloadAction<{ message: string; job: JobData }>) => {
                state.loading = false;
                state.currentJob = action.payload.job;
                state.jobs.unshift(action.payload.job); // Add to beginning of list
                state.successMessage = action.payload.message || "Job created successfully";
            })
            .addCase(createJob.rejected, (state, action) => {
                state.loading = false;
                state.error = typeof action.payload === 'string' 
                    ? action.payload 
                    : "Failed to create job";
            });

        // Fetch Jobs
        builder
            .addCase(fetchJobs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<JobData[]>) => {
                state.loading = false;
                state.jobs = action.payload;
            })
            .addCase(fetchJobs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Failed to fetch jobs";
            });

        // Fetch Job By ID
        builder
            .addCase(fetchJobById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJobById.fulfilled, (state, action: PayloadAction<JobData>) => {
                state.loading = false;
                state.currentJob = action.payload;
            })
            .addCase(fetchJobById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Failed to fetch job";
            });

        // Update Job
        builder
            .addCase(updateJob.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateJob.fulfilled, (state, action: PayloadAction<{ message: string; job: JobData }>) => {
                state.loading = false;
                state.currentJob = action.payload.job;
                // Update in jobs array
                const index = state.jobs.findIndex(job => job.id === action.payload.job.id);
                if (index !== -1) {
                    state.jobs[index] = action.payload.job;
                }
                state.successMessage = action.payload.message || "Job updated successfully";
            })
            .addCase(updateJob.rejected, (state, action) => {
                state.loading = false;
                state.error = typeof action.payload === 'string' 
                    ? action.payload 
                    : "Failed to update job";
            });

        // Delete Job
        builder
            .addCase(deleteJob.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteJob.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.jobs = state.jobs.filter(job => job.id !== action.payload);
                if (state.currentJob?.id === action.payload) {
                    state.currentJob = null;
                }
                state.successMessage = "Job deleted successfully";
            })
            .addCase(deleteJob.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Failed to delete job";
            });
    },
});

export const { clearJobState, clearCurrentJob } = jobsSlice.actions;
export default jobsSlice;