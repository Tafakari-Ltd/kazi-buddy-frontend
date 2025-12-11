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
import { AuthLayout } from "@/component/Authentication/AuthLayout";

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
            const targetUrl = redirectAfterLogin || '/';
            router.push(targetUrl);
            toast.success('Welcome back! You can now complete your application.');
           
          } else {
            router.push('/worker?setup=1');
            toast.info('Please create a worker profile before applying for jobs');
          }
        } catch (err) {
         
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
        
        if (user?.user_type === 'employer') {
          router.push('/employer');
        } else {
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

  const heroContent = (
    <>
      <h1 className="text-5xl font-bold mb-6 leading-tight">
        Welcome Back!
      </h1>
      <p className="text-lg text-gray-100 mb-8">
        Log in and get productive. Continue your journey with Tafakari.
      </p>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Access Your Dashboard</h3>
            <p className="text-gray-200 text-sm">
              Manage your profile and applications
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Stay Updated</h3>
            <p className="text-gray-200 text-sm">
              Get notifications on new opportunities
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Connect & Grow</h3>
            <p className="text-gray-200 text-sm">
              Build your professional network
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <AuthLayout heroContent={heroContent}>
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Log in and get productive
        </h2>
        <p className="text-gray-600 mb-6">
          Use your social account to log in
        </p>

        {/* Google Sign In */}
        <button
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 transition mb-4"
          onClick={() => { }}
          disabled={loading}
        >
          <FcGoogle size={24} />
          Continue with Google
        </button>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">Or continue with</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-maroon transition"
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <Link
                href="/auth/forgot"
                className="text-sm text-maroon hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-maroon transition"
              disabled={loading}
            />
          </div>

          <div className="flex items-center">
            <input
              id="keep-logged-in"
              type="checkbox"
              className="w-4 h-4 text-maroon border-gray-300 rounded focus:ring-maroon"
            />
            <label
              htmlFor="keep-logged-in"
              className="ml-2 text-sm text-gray-700"
            >
              Keep me logged in
            </label>
          </div>

          {(formError || error) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">
                {formError || error}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-maroon hover:bg-redish text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-maroon font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;