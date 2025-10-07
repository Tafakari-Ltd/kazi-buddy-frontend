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

            console.log("Registering worker with FormData...");
            console.log("Form entries:", Array.from(form.entries()));
            
            const response = await api.post("accounts/register/", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("Registration successful:", response);

            return response as unknown as { message: string; user_id: string; user_data: WorkerData };
        } catch (err: any) {
            console.error("Registration error caught:", err);
            
            
            if (err?.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
                const errorMessages: string[] = [];
                Object.entries(err.fieldErrors).forEach(([field, messages]) => {
                    if (Array.isArray(messages) && messages.length > 0) {
                        const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        errorMessages.push(`${fieldName}: ${messages[0]}`);
                    }
                });
                
                // Return both the formatted message and raw field errors
                return rejectWithValue(JSON.stringify({
                    message: errorMessages.join('\n'),
                    fieldErrors: err.fieldErrors
                }));
            }
            
            const errorMessage = err?.message || "Registration failed";
            return rejectWithValue(errorMessage);
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

            console.log("Verification successful:", response);

            return response as unknown as { message: string };
        } catch (err: any) {
            console.error("Verification error caught:", err);
            
            const errorMessage = err?.message || "Verification failed";
            
            return rejectWithValue(errorMessage);
        }
    }
);

// Resend OTP
export const resendOTP = createAsyncThunk<
    { message: string }, // return type
    { user_id: string; email: string }, // argument type
    { rejectValue: string } // error type
>(
    "worker/resendOTP",
    async ({ user_id, email }, { rejectWithValue }) => {
        try {
            const response = await api.post("accounts/resend-otp/", {
                user_id,
                email,
                otp_type: "registration",
            });

            console.log("OTP resent successfully:", response);

            return response as unknown as { message: string };
        } catch (err: any) {
            console.error("Resend OTP error caught:", err);
            
            const errorMessage = err?.message || "Failed to resend OTP";
            
            return rejectWithValue(errorMessage);
        }
    }
);

const initialState: WorkerState = {
    worker: null,
    loading: false,
    error: null,
    successMessage: null,
    verified: false,
};

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

        // Resend OTP
        builder
            .addCase(resendOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resendOTP.fulfilled, (state, action: PayloadAction<{ message: string }>) => {
                state.loading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(resendOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Failed to resend OTP";
            });
    },
});

export const { clearState } = workerSlice.actions;
export default workerSlice;