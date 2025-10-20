'use client';

import React from 'react';
import { useJobApplicationModal } from '../Redux/Functions/jobs';
import { JobApplicationModal } from '../components/JobApplication';
import { JobDetails } from '../types/jobApplication.types';


interface JobCardWithApplicationProps {
  job: JobDetails;
  className?: string;
}

export const JobCardWithApplication: React.FC<JobCardWithApplicationProps> = ({
  job,
  className = ''
}) => {
  const { showJobModal } = useJobApplicationModal();

  const handleApplyClick = () => {
    showJobModal();
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 ${className}`}>
      {/* Job Details */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location_text}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            ${job.budget_min} - ${job.budget_max}
          </span>
          <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            job.urgency_level === 'high' ? 'bg-red-100 text-red-700' :
            job.urgency_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {job.urgency_level} priority
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View Details
          </button>
          <button
            onClick={handleApplyClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* Application Modal - Only renders when modal is open */}
      <JobApplicationModal jobDetails={job} />
    </div>
  );
};