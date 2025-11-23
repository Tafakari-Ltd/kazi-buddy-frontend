"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { JobApplicationForm } from "../components/JobApplication";
import { JobDetails } from "../types/jobApplication.types";

interface StandaloneApplicationPageProps {
  job: JobDetails;
}

export const StandaloneApplicationPage: React.FC<
  StandaloneApplicationPageProps
> = ({ job }) => {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to applications page after successful submission
    router.push("/applications?status=success");
  };

  const handleCancel = () => {
    // Go back to job details
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Job Details
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            Apply for Position
          </h1>
          <p className="text-gray-600 mt-2">
            Submit your application for this opportunity
          </p>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <JobApplicationForm
            jobDetails={job}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            className="p-6"
          />
        </div>
      </div>
    </div>
  );
};
