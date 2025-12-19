"use client";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import type { 
  ILoginResponse, 
  RegisterFormData, 
  VerifyEmailData, 
  ApproveUserData 
} from "@/types";

interface AuthState {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  isVerified: boolean;
}

const setAuthCookie = (token: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax; Secure`;
  }
};

const removeAuthCookie = () => {
  if (typeof document !== 'undefined') {
    document.cookie = "accessToken=; path=/; max-age=0";
  }
};

export const registerUser = createAsyncThunk<
  { message: string; user_id: string },
  RegisterFormData,
  { rejectValue: string }
>("auth/register", async (formData, { rejectWithValue }) => {
  try {
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== "confirm_password") {
        form.append(key, value);
      }
    });

    const response = await api.post("accounts/register/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response as any;
  } catch (err: any) {
    // Only return field errors if they actually exist and are not empty
    if (err?.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
      return rejectWithValue(JSON.stringify({ message: "Validation failed", fieldErrors: err.fieldErrors }));
    }
    // Fallback to the message
    return rejectWithValue(err?.message || "Registration failed");
  }
});

export const verifyEmail = createAsyncThunk<
  { message: string },
  VerifyEmailData,
  { rejectValue: string }
>("auth/verifyEmail", async ({ user_id, otp_code }, { rejectWithValue }) => {
  try {
    const response = await api.post("accounts/verify-email/", {
      user_id,
      otp_code,
      otp_type: "registration",
    });
    return response as any;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Verification failed");
  }
});

export const resendOTP = createAsyncThunk<
  { message: string },
  { user_id: string; email: string },
  { rejectValue: string }
>("auth/resendOTP", async ({ user_id, email }, { rejectWithValue }) => {
  try {
    const response = await api.post("accounts/resend-otp/", {
      user_id,
      email,
      otp_type: "registration",
    });
    return response as any;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to resend OTP");
  }
});

export const login = createAsyncThunk<
  { accessToken: string; refreshToken: string; userId: string; user: any },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const res: ILoginResponse = await api.post("/accounts/login/", {
      identifier: email,
      password,
    });

    if (!res || !res.tokens) return rejectWithValue("Invalid login response");

    const { access: accessToken, refresh: refreshToken } = res.tokens;
    const userId = res.user_id;

    // Set cookie for middleware
    setAuthCookie(accessToken);

    const userFromApi = await api.get("/accounts/me/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }) as any;

    const user = { ...userFromApi, user_type: userFromApi.user_type ?? res.user_type };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("user", JSON.stringify(user));
    }

    return { accessToken, refreshToken, userId, user };
  } catch (err: any) {
    let errorMessage = err?.message || "Login failed";
    
    // Handle 401 Unauthorized specifically
    if (err?.status === 401 || err?.response?.status === 401) {
      errorMessage = "Invalid email or password";
    }
    
    if (err?.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
      const errors = Object.values(err.fieldErrors).flat();
      if (errors.length > 0) {
        errorMessage = errors.join(". ");
      }
    }
    
    if (err?.response?.data?.detail) {
      errorMessage = err.response.data.detail;
    }

    return rejectWithValue(errorMessage);
  }
});

export const approveUser = createAsyncThunk<
  { message: string; user: any },
  { userId: string; data: ApproveUserData },
  { rejectValue: string }
>("auth/approveUser", async ({ userId, data }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value as any);
    });

    const res = await api.post(`/adminpanel/users/${userId}/approve/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res as any;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to approve user");
  }
});

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  userId: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  user: null,
  successMessage: null,
  isVerified: false,
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
      removeAuthCookie();
    },
    clearAuthState: (state) => {
      state.error = null;
      state.successMessage = null;
      state.loading = false;
      state.isVerified = false;
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
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.isVerified = true;
        state.successMessage = action.payload.message;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(resendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(approveUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(approveUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { loadSession, logout, clearAuthState } = authSlice.actions;
export default authSlice;