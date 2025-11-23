"use client";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// Types
interface UserProfile {
  user_id: string;
  email: string;
  phone_number: string;
  user_type: string;
  full_name: string;
  profile_photo_url: string | null;
  email_verified: boolean;
  phone_verified: boolean;
}

interface UpdateProfilePayload {
  full_name?: string;
  phone_number?: string;
  profile_photo?: File;
}

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
}

// Async Thunks
export const getProfile = createAsyncThunk<
  UserProfile,
  void,
  { rejectValue: string }
>("profile/getProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("accounts/me/");

    return response as unknown as UserProfile;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch profile");
  }
});

export const updateProfile = createAsyncThunk<
  UserProfile,
  UpdateProfilePayload,
  { rejectValue: string }
>("profile/updateProfile", async (payload, { rejectWithValue }) => {
  try {
    // If there's a profile photo, use FormData
    if (payload.profile_photo) {
      const formData = new FormData();
      if (payload.full_name) formData.append("full_name", payload.full_name);
      if (payload.phone_number)
        formData.append("phone_number", payload.phone_number);
      formData.append("profile_photo", payload.profile_photo);

      const response = await api.put("accounts/me/update/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response as unknown as UserProfile;
    } else {
      const response = await api.put("accounts/me/update/", payload);

      return response as unknown as UserProfile;
    }
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to update profile");
  }
});

export const deleteProfile = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("profile/deleteProfile", async (_, { rejectWithValue }) => {
  try {
    await api.delete("accounts/me/delete/");
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to delete profile");
  }
});

// Initial State
const initialState: ProfileState = {
  profile: null,
  loading: false,
  updating: false,
  deleting: false,
  error: null,
};

// Slice
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Profile
    builder
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;

        // Optionally sync with sessionStorage
        if (typeof window !== "undefined") {
          sessionStorage.setItem("user", JSON.stringify(action.payload));
        }
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch profile";
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;

        // Sync with sessionStorage
        if (typeof window !== "undefined") {
          sessionStorage.setItem("user", JSON.stringify(action.payload));
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload ?? "Failed to update profile";
      });

    // Delete Profile
    builder
      .addCase(deleteProfile.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteProfile.fulfilled, (state) => {
        state.deleting = false;
        state.profile = null;

        // Clear session storage and redirect
        if (typeof window !== "undefined") {
          sessionStorage.clear();
          window.location.href = "/auth/login";
        }
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload ?? "Failed to delete profile";
      });
  },
});

export const { clearProfileError, clearProfile } = profileSlice.actions;
export default profileSlice;
