import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import { JobSkill, JobSkillsResponse } from "@/types/job.types";

interface JobSkillsState {
  skills: JobSkill[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: JobSkillsState = {
  skills: [],
  loading: false,
  error: null,
  successMessage: null,
};

// Fetch job skills (job_skills endpoint)
export const fetchJobSkills = createAsyncThunk<
  JobSkill[],
  string,
  { rejectValue: string }
>(
  "jobSkills/fetchJobSkills",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/jobs/${jobId}/skills/`);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch job skills"
      );
    }
  }
);

const jobSkillsSlice = createSlice({
  name: "jobSkills",
  initialState,
  reducers: {
    clearJobSkills: (state) => {
      state.skills = [];
      state.error = null;
    },
    clearSkillsState: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobSkills.fulfilled, (state, action) => {
        state.loading = false;
        state.skills = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchJobSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearJobSkills, clearSkillsState } = jobSkillsSlice.actions;
export default jobSkillsSlice;