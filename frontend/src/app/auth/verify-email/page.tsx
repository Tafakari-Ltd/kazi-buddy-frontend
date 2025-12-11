"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { verifyEmail, resendOTP, clearState } from "@/Redux/Features/WorkersSlice";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation"; 

const VerifyEmail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter(); 
  const { loading, error, successMessage, verified } = useSelector(
    (state: RootState) => state.worker,
  );

  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Handle Success & Error Messages
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

  //Redirect to login when verified
  useEffect(() => {
    if (verified) {
      const timer = setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [verified, router]);

  // Resend Countdown Timer Logic
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

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
      }),
    );
  };

  // RESEND OTP LOGIC
  const handleResendOTP = () => {
    if (!userId || !email) {
      toast.error("Missing user information. Cannot resend OTP.");
      return;
    }

    setResendDisabled(true);
    setCountdown(60); 

    dispatch(resendOTP({ user_id: userId, email }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maroon via-purple-dark to-redish px-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-[400px]">
        <h2 className="text-2xl font-bold text-center text-maroon mb-2">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-600 mb-6 text-sm">
          We sent a code to <span className="font-medium text-gray-800">{email}</span>
        </p>

        {verified ? (
          <div className="text-center py-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Verified!</h3>
            <p className="text-gray-500 mt-2">Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-center text-xl tracking-widest font-mono focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                required
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-maroon hover:bg-redish disabled:opacity-50 text-white py-2 rounded-md font-medium transition"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            {/* RESEND OTP BUTTON */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Didn't receive code?{" "}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendDisabled || loading}
                  className={`font-medium ${
                    resendDisabled 
                      ? "text-gray-400 cursor-not-allowed" 
                      : "text-maroon hover:underline"
                  }`}
                >
                  {resendDisabled ? `Resend in ${countdown}s` : "Resend Code"}
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;