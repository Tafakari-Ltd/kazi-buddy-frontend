"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import { RootState, AppDispatch } from "@/Redux/Store/Store";
import { closeJobModal } from "@/Redux/Features/ApplyJobSlice";
import JobApplicationForm from "@/components/JobApplication/JobApplicationForm"; 
import { JobDetails } from "@/types/jobApplication.types";

const ApplyJob = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isModalOpen, selectedJob } = useSelector((state: RootState) => state.applyJob);

  const handleClose = () => {
    dispatch(closeJobModal());
  };

  const handleSuccess = () => {
    dispatch(closeJobModal());
  };

  if (!selectedJob) return null;

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex-1 mr-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Apply for {selectedJob.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Complete the form below to submit your application.
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

            <div className="overflow-y-auto p-6">
              <JobApplicationForm 
                jobDetails={selectedJob} 
                onSuccess={handleSuccess} 
                onCancel={handleClose}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApplyJob;