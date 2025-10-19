import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import {
  WorkerProfile,
  WorkerProfileState,
  CreateWorkerProfileData,
  UpdateWorkerProfileData,
  WorkerProfileFilters,
  WorkerProfileResponse,
  WorkerProfilesResponse,
} from "@/types/worker.types";

const initialState: WorkerProfileState = {
  profiles: [],
  currentProfile: null,
  userProfile: null,
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

// 1. Fetch all worker profiles with filters
export const fetchWorkerProfiles = createAsyncThunk<
  WorkerProfile[] | WorkerProfilesResponse,
  WorkerProfileFilters | void,
  { rejectValue: string }
>(
  "workerProfiles/fetchWorkerProfiles",
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
      const url = `/workers/profiles/list/${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch worker profiles"
      );
    }
  }
);

// 2. Fetch single worker profile by ID
export const fetchWorkerProfileById = createAsyncThunk<
  WorkerProfile,
  string,
  { rejectValue: string }
>(
  "workerProfiles/fetchWorkerProfileById",
  async (profileId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/workers/profiles/${profileId}/`);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch worker profile"
      );
    }
  }
);

// 3. Fetch current user's worker profile
export const fetchUserWorkerProfile = createAsyncThunk<
  WorkerProfile,
  string,
  { rejectValue: string }
>(
  "workerProfiles/fetchUserWorkerProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/workers/profiles/${userId}/`);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch user worker profile"
      );
    }
  }
);

// 4. Create worker profile
export const createWorkerProfile = createAsyncThunk<
  WorkerProfile,
  CreateWorkerProfileData,
  { rejectValue: string | { message: string; fieldErrors: Record<string, string[]> } }
>(
  "workerProfiles/createWorkerProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      console.log('Sending worker profile data:', profileData);
      const response = await api.post("/workers/profiles/", profileData);
      console.log('Worker profile created successfully:', response);
      return response.data || response;
    } catch (error: any) {
      console.error('Create worker profile error:', error);
      
      if (error?.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        return rejectWithValue({
          message: "Validation errors occurred",
          fieldErrors: error.fieldErrors,
        } as any);
      }
      
      if (error?.data && typeof error.data === 'object') {
        const fieldErrors: Record<string, string[]> = {};
        let hasFieldErrors = false;
        
        Object.entries(error.data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            fieldErrors[key] = value;
            hasFieldErrors = true;
          } else if (typeof value === 'string') {
            fieldErrors[key] = [value];
            hasFieldErrors = true;
          }
        });
        
        if (hasFieldErrors) {
          return rejectWithValue({
            message: "Please fix the validation errors",
            fieldErrors: fieldErrors,
          } as any);
        }
      }
      
      return rejectWithValue(error?.message || "Failed to create worker profile");
    }
  }
);

// 5. Update worker profile
export const updateWorkerProfile = createAsyncThunk<
  WorkerProfile,
  { profileId: string; data: UpdateWorkerProfileData },
  { rejectValue: string | { message: string; fieldErrors: Record<string, string[]> } }
>(
  "workerProfiles/updateWorkerProfile",
  async ({ profileId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/workers/profiles/${profileId}/update/`, data);
      return response.data || response;
    } catch (error: any) {
      if (error?.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        return rejectWithValue({
          message: "Validation errors occurred",
          fieldErrors: error.fieldErrors,
        } as any);
      }
      return rejectWithValue(error?.message || "Failed to update worker profile");
    }
  }
);

// Worker profiles slice
const workerProfilesSlice = createSlice({
  name: "workerProfiles",
  initialState,
  reducers: {
    clearWorkerProfiles: (state) => {
      state.profiles = [];
      state.error = null;
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("workerProfiles");
      }
    },
    hydrateWorkerProfiles: (state, action: PayloadAction<WorkerProfile[]>) => {
      state.profiles = action.payload;
    },
    clearWorkerProfileState: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearCurrentProfile: (state) => {
      state.currentProfile = null;
    },
    clearUserProfile: (state) => {
      state.userProfile = null;
    },
    setFilters: (state, action: PayloadAction<WorkerProfileFilters>) => {
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
    // Fetch worker profiles
    builder
      .addCase(fetchWorkerProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkerProfiles.fulfilled, (state, action) => {
        state.loading = false;
        
        // Handle both direct array response and object with data property
        if (Array.isArray(action.payload)) {
          state.profiles = action.payload;
        } else if (action.payload && typeof action.payload === 'object' && 'data' in action.payload) {
          state.profiles = action.payload.data || [];
          if (action.payload.pagination) {
            state.pagination = action.payload.pagination;
          }
        } else {
          state.profiles = [];
        }

        if (typeof window !== "undefined") {
          sessionStorage.setItem("workerProfiles", JSON.stringify(state.profiles));
        }
      })
      .addCase(fetchWorkerProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch worker profile by ID
    builder
      .addCase(fetchWorkerProfileById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkerProfileById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProfile = action.payload;
      })
      .addCase(fetchWorkerProfileById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch user worker profile
    builder
      .addCase(fetchUserWorkerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserWorkerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload;
        
        if (typeof window !== "undefined") {
          sessionStorage.setItem("userWorkerProfile", JSON.stringify(action.payload));
        }
      })
      .addCase(fetchUserWorkerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create worker profile
    builder
      .addCase(createWorkerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createWorkerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles.unshift(action.payload);
        state.userProfile = action.payload; // Set as user's profile
        state.successMessage = "Worker profile created successfully";

        if (typeof window !== "undefined") {
          sessionStorage.setItem("workerProfiles", JSON.stringify(state.profiles));
          sessionStorage.setItem("userWorkerProfile", JSON.stringify(action.payload));
        }
      })
      .addCase(createWorkerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string"
          ? action.payload
          : "Failed to create worker profile";
      });

    // Update worker profile
    builder
      .addCase(updateWorkerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateWorkerProfile.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.profiles.findIndex(
          (profile) => profile.id === action.payload.id
        );
        if (index !== -1) {
          state.profiles[index] = action.payload;
        }
        state.currentProfile = action.payload;
        
        // Update user profile if it matches
        if (state.userProfile?.id === action.payload.id) {
          state.userProfile = action.payload;
        }
        
        state.successMessage = "Worker profile updated successfully";

        if (typeof window !== "undefined") {
          sessionStorage.setItem("workerProfiles", JSON.stringify(state.profiles));
          if (state.userProfile?.id === action.payload.id) {
            sessionStorage.setItem("userWorkerProfile", JSON.stringify(action.payload));
          }
        }
      })
      .addCase(updateWorkerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string"
          ? action.payload
          : "Failed to update worker profile";
      });
  },
});

export const {
  clearWorkerProfiles,
  hydrateWorkerProfiles,
  clearWorkerProfileState,
  clearCurrentProfile,
  clearUserProfile,
  setFilters,
  clearFilters,
  setPagination,
} = workerProfilesSlice.actions;

export default workerProfilesSlice;