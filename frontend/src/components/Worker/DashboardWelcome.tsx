"use client";
import React from "react";

interface DashboardWelcomeProps {
  userName: string;
  availableJobsCount: number;
  profileCompletion: number;
  onBrowseJobs: () => void;
  onCompleteProfile: () => void;
  showCompleteProfileBtn: boolean;
}

const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({
  userName,
  availableJobsCount,
  profileCompletion,
  onBrowseJobs,
  onCompleteProfile,
  showCompleteProfileBtn,
}) => {
  return (
    <div className="mb-8 bg-gradient-to-r from-red-900 to-red-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden container">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {userName}! 👋
        </h1>
        <p className="text-red-100 max-w-2xl">
          You have <span className="font-semibold text-white">{availableJobsCount} active jobs</span> waiting for you today.
          Your profile is <span className="font-semibold text-white">{profileCompletion}% complete</span>.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onBrowseJobs}
            className="bg-white text-red-900 px-5 py-2 rounded-lg font-semibold hover:bg-red-50 transition shadow-sm"
          >
            Browse Jobs
          </button>
          {showCompleteProfileBtn && (
            <button
              onClick={onCompleteProfile}
              className="bg-red-800 text-white border border-red-400 px-5 py-2 rounded-lg font-medium hover:bg-red-900 transition"
            >
              Complete Profile
            </button>
          )}
        </div>
      </div>
      <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 transform skew-x-12 translate-x-12"></div>
    </div>
  );
};

export default DashboardWelcome;