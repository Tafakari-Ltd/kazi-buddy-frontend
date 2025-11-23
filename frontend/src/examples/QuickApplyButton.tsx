"use client";

import React from "react";
import { useJobApplicationModal } from "../Redux/Functions/jobs";
import { JobApplicationModal } from "../components/JobApplication";
import { JobDetails } from "../types/jobApplication.types";

interface QuickApplyButtonProps {
  job: JobDetails;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const QuickApplyButton: React.FC<QuickApplyButtonProps> = ({
  job,
  variant = "primary",
  size = "md",
  className = "",
}) => {
  const { showJobModal } = useJobApplicationModal();

  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    outline:
      "border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <>
      <button
        onClick={() => showJobModal()}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
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
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Apply Now
      </button>

      {/* Modal component */}
      <JobApplicationModal jobDetails={job} />
    </>
  );
};
