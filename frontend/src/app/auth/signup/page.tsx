"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Briefcase } from "lucide-react";

const SignupPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-maroon via-purple-dark to-redish p-12 items-center justify-center relative overflow-hidden">
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-maroon/90 via-purple-dark/90 to-redish/90"></div>

        <div className="relative z-10 text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Join Tafakari
          </h1>
          <p className="text-lg text-gray-100 mb-8">
            Connect with opportunities, grow your career, or find the perfect talent for your business.
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
                <h3 className="font-semibold text-lg">Quick & Easy</h3>
                <p className="text-gray-200 text-sm">
                  Create your account in minutes
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
                <h3 className="font-semibold text-lg">Secure Platform</h3>
                <p className="text-gray-200 text-sm">
                  Your information is safe with us
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
                <h3 className="font-semibold text-lg">Start Immediately</h3>
                <p className="text-gray-200 text-sm">
                  Begin applying or posting jobs right away
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Account Type Selection */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                Create Your Account
              </h2>
              <p className="text-gray-600">
                Choose how you want to get started
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Job Seeker Card */}
              <div
                onClick={() => router.push("/auth/signup/worker")}
                className="group cursor-pointer border-2 border-gray-200 rounded-xl p-8 hover:border-maroon hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-maroon to-redish rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Worker
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Looking for your dream job? Create a unique career profile with Tafakari
                  </p>
                  <button className="mt-auto px-6 py-2.5 bg-maroon text-white rounded-lg font-medium hover:bg-redish transition-colors group-hover:shadow-md">
                    Sign up as Worker
                  </button>
                </div>
              </div>

              {/* Employer Card */}
              <div
                onClick={() => router.push("/auth/signup/employer")}
                className="group cursor-pointer border-2 border-gray-200 rounded-xl p-8 hover:border-purple-dark hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-dark to-maroon rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Employer
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Looking for quality candidates? Advertise and search with Tafakari
                  </p>
                  <button className="mt-auto px-6 py-2.5 bg-purple-dark text-white rounded-lg font-medium hover:bg-maroon transition-colors group-hover:shadow-md">
                    Sign up as Employer
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-maroon font-semibold hover:underline"
              >
                Log in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
