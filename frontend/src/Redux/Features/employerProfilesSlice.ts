import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import {
  EmployerProfile,
  EmployerProfileState,
  CreateEmployerProfileData,
  UpdateEmployerProfileData,
  EmployerProfileFilters,
  EmployerProfileResponse,
  EmployerProfilesResponse,
} from "@/types/employer.types";

const initialState: EmployerProfileState = {
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

// 1. Fetch all employer profiles with filters
export const fetchEmployerProfiles = createAsyncThunk<
  EmployerProfilesResponse,
  EmployerProfileFilters | void,
  { rejectValue: string }
>(
  "employerProfiles/fetchEmployerProfiles",
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
      const url = `/employers/employer-profiles/${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch employer profiles"
      );
    }
  }
);

// 2. Fetch single employer profile by ID
export const fetchEmployerProfileById = createAsyncThunk<
  EmployerProfile,
  string,
  { rejectValue: string }
>(
  "employerProfiles/fetchEmployerProfileById",
  async (profileId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/employers/employer-profiles/${profileId}/`);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch employer profile"
      );
    }
  }
);

// 3. Fetch current user's employer profile
export const fetchUserEmployerProfile = createAsyncThunk<
  EmployerProfile,
  string,
  { rejectValue: string }
>(
  "employerProfiles/fetchUserEmployerProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/employers/employer-profiles/${userId}/`);
      return response.data || response;
    } catch (error: any) {
    
      if (error?.status === 404) {
        return rejectWithValue("Employer profile not found");
      }
      return rejectWithValue(
        error?.message || "Failed to fetch user employer profile"
      );
    }
  }
);

// 4. Create employer profile
export const createEmployerProfile = createAsyncThunk<
  EmployerProfile,
  CreateEmployerProfileData,
  { rejectValue: string | { message: string; fieldErrors: Record<string, string[]> } }
>(
  "employerProfiles/createEmployerProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      console.log('Sending profile data:', profileData);
      const response = await api.post("/employers/employer-profiles/create/", profileData);
      console.log('Profile created successfully:', response);
      return response.data || response;
    } catch (error: any) {
      console.error('Create profile error:', error);
      
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
      
      return rejectWithValue(error?.message || "Failed to create employer profile");
    }
  }
);

// 5. Update employer profile
export const updateEmployerProfile = createAsyncThunk<
  EmployerProfile,
  { profileId: string; data: UpdateEmployerProfileData },
  { rejectValue: string | { message: string; fieldErrors: Record<string, string[]> } }
>(
  "employerProfiles/updateEmployerProfile",
  async ({ profileId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/employers/employer-profiles/${profileId}/update/`, data);
      return response.data || response;
    } catch (error: any) {
      if (error?.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        return rejectWithValue({
          message: "Validation errors occurred",
          fieldErrors: error.fieldErrors,
        } as any);
      }
      return rejectWithValue(error?.message || "Failed to update employer profile");
    }
  }
);

// Employer profiles slice
const employerProfilesSlice = createSlice({
  name: "employerProfiles",
  initialState,
  reducers: {
    clearEmployerProfiles: (state) => {
      state.profiles = [];
      state.error = null;
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("employerProfiles");
      }
    },
    hydrateEmployerProfiles: (state, action: PayloadAction<EmployerProfile[]>) => {
      state.profiles = action.payload;
    },
    clearEmployerProfileState: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearCurrentProfile: (state) => {
      state.currentProfile = null;
    },
    clearUserProfile: (state) => {
      state.userProfile = null;
    },
    setFilters: (state, action: PayloadAction<EmployerProfileFilters>) => {
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
    // Fetch employer profiles
    builder
      .addCase(fetchEmployerProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployerProfiles.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.profiles = action.payload.data;
        } else {
          state.profiles = Array.isArray(action.payload) ? action.payload : [];
        }
        
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }

        if (typeof window !== "undefined") {
          sessionStorage.setItem("employerProfiles", JSON.stringify(state.profiles));
        }
      })
      .addCase(fetchEmployerProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch employer profile by ID
    builder
      .addCase(fetchEmployerProfileById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployerProfileById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProfile = action.payload;
      })
      .addCase(fetchEmployerProfileById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch user employer profile
    builder
      .addCase(fetchUserEmployerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserEmployerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload;
        
        if (typeof window !== "undefined") {
          sessionStorage.setItem("userEmployerProfile", JSON.stringify(action.payload));
        }
      })
      .addCase(fetchUserEmployerProfile.rejected, (state, action) => {
        state.loading = false;
        
        const errorMsg = action.payload as string;
        if (errorMsg === "Employer profile not found") {
         
          state.error = null;
          state.userProfile = null;
        } else {
          state.error = errorMsg;
        }
      });

    // Create employer profile
    builder
      .addCase(createEmployerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createEmployerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles.unshift(action.payload);
        state.userProfile = action.payload; // Set as user's profile
        state.successMessage = "Employer profile created successfully";

        if (typeof window !== "undefined") {
          sessionStorage.setItem("employerProfiles", JSON.stringify(state.profiles));
          sessionStorage.setItem("userEmployerProfile", JSON.stringify(action.payload));
        }
      })
      .addCase(createEmployerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string"
          ? action.payload
          : "Failed to create employer profile";
      });

    // Update employer profile
    builder
      .addCase(updateEmployerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateEmployerProfile.fulfilled, (state, action) => {
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
        
        state.successMessage = "Employer profile updated successfully";

        if (typeof window !== "undefined") {
          sessionStorage.setItem("employerProfiles", JSON.stringify(state.profiles));
          if (state.userProfile?.id === action.payload.id) {
            sessionStorage.setItem("userEmployerProfile", JSON.stringify(action.payload));
          }
        }
      })
      .addCase(updateEmployerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string"
          ? action.payload
          : "Failed to update employer profile";
      });
  },
});

export const {
  clearEmployerProfiles,
  hydrateEmployerProfiles,
  clearEmployerProfileState,
  clearCurrentProfile,
  clearUserProfile,
  setFilters,
  clearFilters,
  setPagination,
} = employerProfilesSlice.actions;

export default employerProfilesSlice;