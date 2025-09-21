"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { verifyEmail, clearState } from "@/Redux/Features/WorkersSlice";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

const VerifyEmail: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, successMessage, verified } = useSelector(
        (state: RootState) => state.worker
    );

    const searchParams = useSearchParams();
    const userId = searchParams.get("userId"); // Get userId from URL query

    const [otp, setOtp] = useState("");

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(clearState());
        }

        if (error) {
            toast.error(error);
            dispatch(clearState());
        }
    }, [successMessage, error, dispatch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp) {
            toast.error("Please enter the OTP code.");
            return;
        }

        if (!userId) {
            toast.error("User ID not found. Please register again.");
            return;
        }

        dispatch(
            verifyEmail({
                user_id: userId,
                otp_code: otp,
            })
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maroon via-purple-dark to-redish px-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-[400px]">
                <h2 className="text-2xl font-bold text-center text-maroon mb-6">
                    Verify Your Email
                </h2>

                {verified ? (
                    <div className="text-center text-green-600 font-medium">
                        Your email has been verified successfully! You can now{" "}
                        <a href="/auth/login" className="text-maroon underline">
                            login
                        </a>.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                                Enter OTP
                            </label>
                            <input
                                id="otp"
                                type="text"
                                name="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                                className="w-full border border-gray-300 rounded-md px-4 py-2"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 w-full bg-maroon hover:bg-redish disabled:opacity-50 text-white py-2 rounded-md font-medium transition"
                        >
                            {loading ? "Verifying..." : "Verify Email"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
