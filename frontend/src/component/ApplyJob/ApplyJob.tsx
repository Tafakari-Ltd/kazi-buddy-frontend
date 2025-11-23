"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/Redux/Store/Store";
import { closeJobModal, applyForJob } from "@/Redux/Features/ApplyJobSlice";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const ApplyJob = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { isModalOpen, isSubmitting, apiError } = useSelector(
    (state: RootState) => state.applyJob,
  );
  const selectedJob = useSelector(
    (state: RootState) => state.moreDescription.selectedJob,
  );

  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [availabilityStart, setAvailabilityStart] = useState("");
  const [workerNotes, setWorkerNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!coverLetter.trim()) {
      errs.cover_letter = "Cover letter is required";
    } else if (coverLetter.length < 50) {
      errs.cover_letter = "Cover letter must be at least 50 characters";
    }

    if (!proposedRate || parseFloat(proposedRate) <= 0) {
      errs.proposed_rate = "Please enter a valid rate";
    }

    if (!availabilityStart) {
      errs.availability_start = "Please select when you can start";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!selectedJob) {
      toast.error("No job selected. Please try again.");
      return;
    }

    try {
      await dispatch(
        applyForJob({
          jobId: selectedJob.id,
          applicationData: {
            cover_letter: coverLetter,
            proposed_rate: parseFloat(proposedRate),
            availability_start: availabilityStart,
            worker_notes: workerNotes,
            employer_notes: "",
          },
        }),
      ).unwrap();

      toast.success("Application submitted successfully!");
      handleClose();
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to submit application. Please try again.",
      );
    }
  };

  const handleClose = () => {
    dispatch(closeJobModal());
    setCoverLetter("");
    setProposedRate("");
    setAvailabilityStart("");
    setWorkerNotes("");
    setErrors({});
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          aria-hidden={!isModalOpen}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-lg w-full max-w-[90%] sm:max-w-[700px] p-6 relative shadow-lg"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
              aria-label="Close modal"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold text-[#800000] mb-4">
              Apply for: {selectedJob?.title || "Job Position"}
            </h2>

            {apiError && (
              <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-400">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Cover Letter */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 flex">
                  Cover Letter <p className="text-red-500 ml-1">*</p>
                </span>
                <textarea
                  rows={6}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className={`mt-1 p-2 border rounded ${
                    errors.cover_letter ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Tell us why you're a great fit for this position... (minimum 50 characters)"
                />
                <span className="text-xs text-gray-500 mt-1">
                  {coverLetter.length} / 50 characters minimum
                </span>
                {errors.cover_letter && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.cover_letter}
                  </span>
                )}
              </label>

              {/* Proposed Rate */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 flex">
                  Proposed Rate (KSh) <p className="text-red-500 ml-1">*</p>
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value)}
                  className={`mt-1 p-2 border rounded ${
                    errors.proposed_rate ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your proposed rate"
                />
                {errors.proposed_rate && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.proposed_rate}
                  </span>
                )}
              </label>

              {/* Availability Start */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 flex">
                  When can you start? <p className="text-red-500 ml-1">*</p>
                </span>
                <input
                  type="date"
                  min={today}
                  value={availabilityStart}
                  onChange={(e) => setAvailabilityStart(e.target.value)}
                  className={`mt-1 p-2 border rounded ${
                    errors.availability_start
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.availability_start && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.availability_start}
                  </span>
                )}
              </label>

              {/* Additional Notes */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  Additional Notes (Optional)
                </span>
                <textarea
                  rows={3}
                  value={workerNotes}
                  onChange={(e) => setWorkerNotes(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded"
                  placeholder="Any additional information you'd like to share..."
                />
              </label>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#5a0000] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApplyJob;
