"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/Redux/Features/authSlice";
import { fetchUserWorkerProfile } from "@/Redux/Features/workerProfilesSlice"; 
import { isApprovalNeededError } from "@/lib/approvalUtils";
import { toast } from "sonner";

import { AppDispatch, RootState } from "@/Redux/Store/Store";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [formError, setFormError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // 1. Perform Login
      const result = await dispatch(login({ email, password })).unwrap();
      
      // 2. Check Intent
      const pendingJobApplication = sessionStorage.getItem('pendingJobApplication');
      const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
      const returnTo = searchParams.get("returnTo");
      const user = result.user;
      
      const isAdmin =
        user?.is_staff ||
        user?.is_superuser ||
        user?.role === 'admin' ||
        user?.user_type === 'admin';

      // 3. Handle Routing Logic
      if (isAdmin) {
        // Admin always goes to admin dashboard
        if (pendingJobApplication) sessionStorage.removeItem('pendingJobApplication');
        if (redirectAfterLogin) sessionStorage.removeItem('redirectAfterLogin');
        router.push('/admin');
        return;
      }

      // User was trying to Apply for a Job
      if (pendingJobApplication) {
        try {
          // Check if they have a worker profile
          const userId = user.user_id || user.id;
        
          const profileResult = await dispatch(fetchUserWorkerProfile(userId)).unwrap();

          if (profileResult) {
            // Profile Exists -> Go back to Homepage/Job Page
            const targetUrl = redirectAfterLogin || '/';
            router.push(targetUrl);
            toast.success('Welcome back! You can now complete your application.');
           
          } else {
            // Profile Missing -> Go to Worker Dashboard to create one
            router.push('/worker?setup=1');
            toast.info('Please create a worker profile before applying for jobs');
          }
        } catch (err) {
          // If fetch fails (likely 404 no profile), send to setup
          router.push('/worker?setup=1');
          toast.info('Please create a worker profile before applying for jobs');
        }
      } 
      //Normal Redirects
      else if (returnTo) {
        router.push(returnTo);
      } else if (redirectAfterLogin) {
        router.push(redirectAfterLogin);
        sessionStorage.removeItem('redirectAfterLogin');
      } else {
        // Default Dashboard Redirection
        if (user?.user_type === 'employer') {
          router.push('/employer');
        } else {
          // Default to worker if not specified or explicit worker
          router.push('/worker');
        }
      }

    } catch (err: any) {
      // Error Handling
      let errorMessage = "Login failed";
     
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.error) {
        errorMessage = err.error;
      }
     
      console.log('Login error:', err);
     
      if (isApprovalNeededError(errorMessage)) {
        toast.info(
          "Your account is pending admin approval. Please wait for approval notification via email.",
          { duration: 5000 }
        );
        setFormError(
          "Your account is pending admin approval. You will be able to login once approved."
        );
      } else if (errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('invalid')) {
        setFormError("Invalid email or password");
      } else if (errorMessage.toLowerCase().includes('verified')) {
        setFormError("Please verify your email before logging in");
      } else {
        setFormError(errorMessage);
        toast.error(errorMessage, { duration: 4000 });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maroon via-purple-dark to-redish px-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center text-maroon mb-6">
          KaziBuddy
        </h2>

        {/* Google Sign In */}
        <button
          className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-200 transition mb-6"
          onClick={() => { }}
          disabled={loading}
        >
          <FcGoogle size={24} />
          Continue with Google
        </button>

        <div className="text-center text-sm text-gray-400 mb-4">— OR —</div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-maroon"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-maroon"
              disabled={loading}
            />
          </div>

          {(formError || error) && (
            <p className="text-red-600 text-sm mb-4 text-center">
              {formError || error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-maroon hover:bg-redish text-white py-2 rounded-md font-medium transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-maroon hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;