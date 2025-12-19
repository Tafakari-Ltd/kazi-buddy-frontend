"use client";

import React, { useState, useEffect } from "react";
import { AvailableJobs } from "../components/WorkerProfile/AvailableJobs";
import { MyApplicationsSection } from "../components/WorkerProfile/MyApplicationsSection";
import { JobDetails } from "../types/jobApplication.types";
import { useJobs } from "../Redux/Functions/useJobs";

export default function WorkerProfilePage() {
  const [availableJobs, setAvailableJobs] = useState<JobDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"available" | "applications">(
    "available",
  );

  const { handleFetchJobs } = useJobs();

  const fetchAvailableJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await handleFetchJobs({
        status: "active" as any,
        page: 1,
        limit: 50,
      });

      if (result && typeof result !== "string") {
        let jobsArray = [];

        if ("data" in result && result.data && Array.isArray(result.data)) {
          jobsArray = result.data;
        } else if (Array.isArray(result)) {
          jobsArray = result;
        } else if ("jobs" in result && Array.isArray(result.jobs)) {
          jobsArray = result.jobs;
        }

        if (jobsArray.length > 0) {
          const transformedJobs: JobDetails[] = jobsArray.map((job: any) => ({
            id: job.id,
            title: job.title,
            description: job.description,
            location: job.location,
            location_text: job.location_text || job.location,
            job_type: job.job_type,
            urgency_level: job.urgency_level,
            budget_min: job.budget_min,
            budget_max: job.budget_max,
            payment_type: job.payment_type,
            start_date: job.start_date,
            end_date: job.end_date,
            estimated_hours: job.estimated_hours,
            max_applicants: job.max_applicants,
            status: job.status,
            visibility: job.visibility,
            employer: job.employer,
            category: job.category,
          }));

          setAvailableJobs(transformedJobs);
        } else {
          setAvailableJobs([]);
        }
      } else {
        setAvailableJobs([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs on component mount
  useEffect(() => {
    fetchAvailableJobs();
  }, []);

  const handleRefreshJobs = () => {
    fetchAvailableJobs();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-6">
            {/* Profile Picture */}
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">John Worker</h1>
              <p className="text-gray-600">Full-Stack Developer</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                San Francisco, CA
              </div>
            </div>

            {/* Profile Actions */}
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("available")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "available"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Available Jobs
              {availableJobs.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {availableJobs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "applications"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Applications
            </button>
            <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
              Profile Settings
            </button>
            <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
              Reviews
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === "available" && (
            <AvailableJobs
              jobs={availableJobs}
              loading={loading}
              error={error}
              onRefresh={handleRefreshJobs}
            />
          )}

          {activeTab === "applications" && (
            <MyApplicationsSection showAll={true} />
          )}
        </div>
      </div>
    </div>
  );
}
