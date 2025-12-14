"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { verifyEmail, resendOTP, clearState } from "@/Redux/Features/WorkersSlice";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation"; 
import { AuthLayout } from "@/component/Authentication/AuthLayout";
import { Shield, BadgeCheck, Lock } from "lucide-react";

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

  // Redirect to login when verified
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

  const handleResendOTP = () => {
    if (!userId || !email) {
      toast.error("Missing user information. Cannot resend OTP.");
      return;
    }

    setResendDisabled(true);
    setCountdown(60); 

    dispatch(resendOTP({ user_id: userId, email }));
  };

  const heroContent = (
    <>
      <h1 className="text-5xl font-bold mb-6 leading-tight">
        One Last Step!
      </h1>
      <p className="text-lg text-gray-100 mb-8">
        We need to verify your identity to keep the platform secure for everyone.
      </p>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Secure Account</h3>
            <p className="text-gray-200 text-sm">
              Protect your personal information
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <BadgeCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Verified Badge</h3>
            <p className="text-gray-200 text-sm">
              Stand out to employers and workers
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Full Access</h3>
            <p className="text-gray-200 text-sm">
              Unlock all platform features instantly
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <AuthLayout heroContent={heroContent}>
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Verify Email
        </h2>
        <p className="text-gray-600 mb-6">
          We sent a verification code to <br/>
          <span className="font-semibold text-maroon">{email || "your email"}</span>
        </p>

        {verified ? (
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <BadgeCheck className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Email Verified!</h3>
            <p className="text-gray-500 mt-2">Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter 6-Digit Code
              </label>
              <input
                id="otp"
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000 000"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition"
                required
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon hover:bg-redish disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendDisabled || loading}
                  className={`font-medium transition ${
                    resendDisabled 
                      ? "text-gray-400 cursor-not-allowed" 
                      : "text-maroon hover:underline"
                  }`}
                >
                  {resendDisabled ? `Resend available in ${countdown}s` : "Resend Code"}
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;