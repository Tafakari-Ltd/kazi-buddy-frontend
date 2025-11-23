import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import { JobEmployer, JobEmployerResponse } from "@/types/job.types";

interface JobEmployerState {
  employer: JobEmployer | null;
  loading: boolean;
  error: string | null;
}

const initialState: JobEmployerState = {
  employer: null,
  loading: false,
  error: null,
};

// Fetch employer who posted the job (get_employer_whoPostedJob endpoint)
export const fetchJobEmployer = createAsyncThunk<
  JobEmployer,
  string,
  { rejectValue: string }
>("jobEmployer/fetchJobEmployer", async (jobId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/jobs/employer/${jobId}/`);
    return response.data || response;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to fetch job employer");
  }
});

const jobEmployerSlice = createSlice({
  name: "jobEmployer",
  initialState,
  reducers: {
    clearJobEmployer: (state) => {
      state.employer = null;
      state.error = null;
    },
    clearEmployerState: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobEmployer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobEmployer.fulfilled, (state, action) => {
        state.loading = false;
        state.employer = action.payload;
      })
      .addCase(fetchJobEmployer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearJobEmployer, clearEmployerState } =
  jobEmployerSlice.actions;
export default jobEmployerSlice;
