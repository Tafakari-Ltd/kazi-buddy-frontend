"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import { WorkerData } from "../types";

// Define local state interface 
interface WorkerState {
  worker: WorkerData | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

//  Fetch Worker Profile 
export const fetchWorkerProfile = createAsyncThunk(
  "worker/fetchProfile",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`workers/${userId}/profile`);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch profile");
    }
  }
);

const initialState: WorkerState = {
  worker: null,
  loading: false,
  error: null,
  successMessage: null,
};

const workerSlice = createSlice({
  name: "worker",
  initialState,
  reducers: {
    clearWorkerState: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.worker = action.payload as any;
      })
      .addCase(fetchWorkerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearWorkerState } = workerSlice.actions;
export default workerSlice;