// src/features/worker/workerSlice.ts
"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import { WorkerData, WorkerState, RegisterFormData, VerifyEmailData } from "../types";

// ========================
// Thunks
// ========================

// Register Worker
export const registerWorker = createAsyncThunk<
    { message: string; user_id: string; user_data: WorkerData }, // return type
    RegisterFormData, // argument type
    { rejectValue: string } // error type
>(
    "worker/register",
    async (formData, { rejectWithValue }) => {
        try {
            const form = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined && value !== null && key !== "confirm_password") {
                    form.append(key, value as any);
                }
            });


            const response = await api.post("accounts/register/", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log(response);

            return response as unknown as { message: string; user_id: string; user_data: WorkerData };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message ?? "Registration failed");
        }
    }
);




// Verify Email
export const verifyEmail = createAsyncThunk<
    { message: string }, // return type
    VerifyEmailData, // argument type
    { rejectValue: string } // error type
>(
    "worker/verifyEmail",
    async ({ user_id, otp_code }, { rejectWithValue }) => {
        try {
            const response = await api.post("accounts/verify-email/", {
                user_id,
                otp_code,
                otp_type: "registration",
            });

            // Axios interceptor already returns response.data
            return response as unknown as { message: string };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message ?? "Verification failed");
        }
    }
);

// ========================
// Initial State
// ========================
const initialState: WorkerState = {
    worker: null,
    loading: false,
    error: null,
    successMessage: null,
    verified: false,
};

// ========================
// Slice
// ========================
const workerSlice = createSlice({
    name: "worker",
    initialState,
    reducers: {
        clearState: (state) => {
            state.error = null;
            state.successMessage = null;
            state.verified = false;
        },
    },
    extraReducers: (builder) => {
        // Register Worker
        builder
            .addCase(registerWorker.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(
                registerWorker.fulfilled,
                (state, action: PayloadAction<{ message: string; user_id: string; user_data: WorkerData }>) => {
                    state.loading = false;
                    state.worker = action.payload.user_data;
                    state.successMessage = action.payload.message;
                }
            )
            .addCase(registerWorker.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Registration failed";
            });

        // Verify Email
        builder
            .addCase(verifyEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyEmail.fulfilled, (state, action: PayloadAction<{ message: string }>) => {
                state.loading = false;
                state.verified = true;
                state.successMessage = action.payload.message;
            })
            .addCase(verifyEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Verification failed";
            });
    },
});

// ========================
// Exports
// ========================
export const { clearState } = workerSlice.actions;
export default workerSlice;
