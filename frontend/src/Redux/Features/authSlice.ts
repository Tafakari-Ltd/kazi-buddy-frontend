"use client";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import type { ILoginResponse } from "@/types";

export interface ApproveUserData {
  profile_photo?: File;
  username: string;
  phone_number: string;
  email: string;
  full_name: string;
  password: string;
  user_type: string;
}

export const approveUser = createAsyncThunk<
  {
    message: string;
    user: {
      id: string;
      phone_number: string;
      is_verified: boolean;
      email_verified: boolean;
      phone_verified: boolean;
    };
  },
  { userId: string; data: ApproveUserData },
  { rejectValue: string }
>("auth/approveUser", async ({ userId, data }, { rejectWithValue }) => {
  try {
    const formData = new FormData();

    // Add all fields to FormData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });

    const res = await api.post(
      `/adminpanel/users/${userId}/approve/`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return res as unknown as {
      message: string;
      user: {
        id: string;
        phone_number: string;
        is_verified: boolean;
        email_verified: boolean;
        phone_verified: boolean;
      };
    };
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to approve user");
  }
});

export const login = createAsyncThunk<
  {
    accessToken: string;
    refreshToken: string;
    userId: string;
    user: any;
  },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const res: ILoginResponse = await api.post("/accounts/login/", {
      identifier: email,
      password,
    });

    if (!res || !res.tokens) {
      return rejectWithValue("Invalid login response");
    }

    const accessToken = res.tokens.access;
    const refreshToken = res.tokens.refresh;
    const userId = res.user_id;
    const userType = res.user_type; // "worker", "employer", "admin", etc.

    // Fetch user details
    const userFromApi = await api.get("/accounts/me/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Ensure the stored user object always has user_type so role checks work
    const user = {
      ...userFromApi,
      user_type: userFromApi.user_type ?? userType,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("user", JSON.stringify(user));
    }

    return {
      accessToken,
      refreshToken,
      userId,
      user,
    };
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.message ||
        "Login failed",
    );
  }
});

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  user: any | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  userId: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loadSession: (state) => {
      const accessToken = sessionStorage.getItem("accessToken");
      const refreshToken = sessionStorage.getItem("refreshToken");
      const userId = sessionStorage.getItem("userId");
      const user = sessionStorage.getItem("user");
      const isAuthenticated = sessionStorage.getItem("isAuthenticated");

      if (accessToken && refreshToken && userId && isAuthenticated === "true") {
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.userId = userId;
        state.user = user ? JSON.parse(user) : null;
        state.isAuthenticated = true;
      }
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.userId = null;
      state.user = null;
      state.isAuthenticated = false;
      sessionStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.userId = action.payload.userId;
        state.user = action.payload.user;
        state.isAuthenticated = true;

        sessionStorage.setItem("accessToken", action.payload.accessToken);
        sessionStorage.setItem("refreshToken", action.payload.refreshToken);
        sessionStorage.setItem("userId", action.payload.userId);
        sessionStorage.setItem("user", JSON.stringify(action.payload.user));
        sessionStorage.setItem("isAuthenticated", "true");
      })
      .addCase(login.rejected, (state, action) => { 
        state.loading = false;
        state.error = action.payload ?? "Login failed";
      });

    // Approve User
    builder
      .addCase(approveUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(approveUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Approval failed";
      });
  },
});

export const { loadSession, logout } = authSlice.actions;
export default authSlice;
