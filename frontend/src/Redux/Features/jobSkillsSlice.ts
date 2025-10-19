import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import {
  JobSkill,
  CreateJobSkillData,
  UpdateJobSkillData,
  JobSkillsResponse,
  JobSkillResponse,
  JobSkillDeleteResponse,
} from "@/types/job.types";
import { MasterSkillsService } from "@/services/masterSkillsService";

interface JobSkillsState {
  jobSkills: JobSkill[];
  currentJobSkill: JobSkill | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: JobSkillsState = {
  jobSkills: [],
  currentJobSkill: null,
  loading: false,
  error: null,
  successMessage: null,
};

// Async thunks

// 1. Fetch all job skills (list_jobSkills)
export const fetchJobSkills = createAsyncThunk<
  JobSkill[],
  void,
  { rejectValue: string }
>(
  "jobSkills/fetchJobSkills",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/jobs/skills/");
      // Handle both array response and object with data property
      return Array.isArray(response) ? response : (response.data || []);
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch job skills"
      );
    }
  }
);

// 2. Fetch single job skill details (jobSkill_details)
export const fetchJobSkillById = createAsyncThunk<
  JobSkill,
  string,
  { rejectValue: string }
>(
  "jobSkills/fetchJobSkillById",
  async (skillId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/jobs/skills/${skillId}/`);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch job skill details"
      );
    }
  }
);

// 3. Create new job skill (create_jobSkill)
export const createJobSkill = createAsyncThunk<
  JobSkill,
  { jobId: string; data: CreateJobSkillData },
  { rejectValue: string | { message: string; fieldErrors: Record<string, string[]> } }
>(
  "jobSkills/createJobSkill",
  async ({ jobId, data }, { rejectWithValue }) => {
    try {
      // Step 1: Ensure the skill exists in master database
      const masterSkill = await MasterSkillsService.getOrCreateSkill(data.skill);
      
      // Step 2: Create job-skill relationship with master skill ID
      const jobSkillData = {
        skill_id: masterSkill.id, // Use master skill ID instead of name
        is_required: data.is_required,
        experience_level: data.experience_level
      };
      
      const response = await api.post(`/jobs/skills/create/${jobId}/`, jobSkillData);
      
      // Return the response with skill name for display
      const result = response.data || response;
      return {
        ...result,
        skill: data.skill, // Include original skill name for display
        job_id: jobId // Ensure job_id is included
      };
    } catch (error: any) {
      if (error?.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        return rejectWithValue({
          message: "Validation errors occurred",
          fieldErrors: error.fieldErrors,
        } as any);
      }
      return rejectWithValue(error?.message || "Failed to create job skill");
    }
  }
);

// 4. Update job skill (update_jobSkill)
export const updateJobSkill = createAsyncThunk<
  JobSkill,
  { skillId: string; data: UpdateJobSkillData },
  { rejectValue: string | { message: string; fieldErrors: Record<string, string[]> } }
>(
  "jobSkills/updateJobSkill",
  async ({ skillId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/jobs/skills/update/${skillId}/`, data);
      return response.data || response;
    } catch (error: any) {
      if (error?.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        return rejectWithValue({
          message: "Validation errors occurred",
          fieldErrors: error.fieldErrors,
        } as any);
      }
      return rejectWithValue(error?.message || "Failed to update job skill");
    }
  }
);

// 5. Delete job skill (delete_jobSkill)
export const deleteJobSkill = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "jobSkills/deleteJobSkill",
  async (skillId, { rejectWithValue }) => {
    try {
      await api.delete(`/jobs/skills/delete/${skillId}/`);
      return skillId;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to delete job skill"
      );
    }
  }
);

// Job Skills slice
const jobSkillsSlice = createSlice({
  name: "jobSkills",
  initialState,
  reducers: {
    clearJobSkills: (state) => {
      state.jobSkills = [];
      state.error = null;
    },
    clearCurrentJobSkill: (state) => {
      state.currentJobSkill = null;
    },
    clearState: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setCurrentJobSkill: (state, action: PayloadAction<JobSkill>) => {
      state.currentJobSkill = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch job skills
    builder
      .addCase(fetchJobSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobSkills.fulfilled, (state, action) => {
        state.loading = false;
        state.jobSkills = action.payload;
      })
      .addCase(fetchJobSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch job skill by ID
    builder
      .addCase(fetchJobSkillById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobSkillById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJobSkill = action.payload;
      })
      .addCase(fetchJobSkillById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create job skill
    builder
      .addCase(createJobSkill.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createJobSkill.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure the skill has the job_id set if not already set by backend
        const skill = action.payload;
        state.jobSkills.push(skill);
        state.successMessage = "Job skill created successfully";
      })
      .addCase(createJobSkill.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string"
          ? action.payload
          : "Failed to create job skill";
      });

    // Update job skill
    builder
      .addCase(updateJobSkill.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateJobSkill.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.jobSkills.findIndex(skill => skill.id === action.payload.id);
        if (index !== -1) {
          state.jobSkills[index] = action.payload;
        }
        state.currentJobSkill = action.payload;
        state.successMessage = "Job skill updated successfully";
      })
      .addCase(updateJobSkill.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string"
          ? action.payload
          : "Failed to update job skill";
      });

    // Delete job skill
    builder
      .addCase(deleteJobSkill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteJobSkill.fulfilled, (state, action) => {
        state.loading = false;
        state.jobSkills = state.jobSkills.filter(skill => skill.id !== action.payload);
        if (state.currentJobSkill?.id === action.payload) {
          state.currentJobSkill = null;
        }
        state.successMessage = "Job skill deleted successfully";
      })
      .addCase(deleteJobSkill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearJobSkills,
  clearCurrentJobSkill,
  clearState,
  setCurrentJobSkill,
} = jobSkillsSlice.actions;

export default jobSkillsSlice;