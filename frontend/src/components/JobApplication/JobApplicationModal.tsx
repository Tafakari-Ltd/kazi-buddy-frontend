'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { JobDetails } from '../../types/jobApplication.types';
import { useJobApplicationModal } from '../../Redux/Functions/jobs';
import JobApplicationForm from './JobApplicationForm';
import { toast } from 'sonner';

interface JobApplicationModalProps {
  jobDetails?: JobDetails;
  onSuccess?: () => void;
  className?: string;
}

export const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  jobDetails,
  onSuccess,
  className = ''
}) => {
  const {
    isModalOpen,
    hideJobModal,
    apiError,
    successMessage
  } = useJobApplicationModal();

  const handleClose = () => {
    hideJobModal();
  };

  const handleSuccess = () => {
    toast.success('Application submitted successfully!');
    onSuccess?.(); // Call external success handler if provided
    hideJobModal();
  };

  // Don't render if no job details
  if (!jobDetails) {
    return null;
  }

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex-1 mr-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Apply for Position
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Submit your application for this job opportunity
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-6">
                {/* Error Message */}
                {apiError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm font-medium text-red-800">{apiError}</p>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {successMessage && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm font-medium text-green-800">{successMessage}</p>
                    </div>
                  </div>
                )}

                {/* Application Form */}
                <JobApplicationForm
                  jobDetails={jobDetails}
                  onSuccess={handleSuccess}
                  onCancel={handleClose}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JobApplicationModal;