"use client";

import { UploadCloud } from "lucide-react";
import JobPostingModal from "../JobPostingModal/JobPostingModal";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { fetchJobsByEmployer } from "@/Redux/Features/jobsSlice";

const UploadNew = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, userId } = useSelector((state: RootState) => state.auth);
  const [createModal, setCreateModal] = useState<boolean>(false);
  
  // Get the actual user ID
  const currentUserId = userId || user?.user_id || user?.id;
  
  const handleModalClose = () => {
    setCreateModal(false);
    // Refresh the jobs list after modal closes to show any newly created jobs
    if (currentUserId) {
      console.log('Refreshing jobs list after modal close');
      dispatch(fetchJobsByEmployer(currentUserId));
    }
  };

  return (
    <div>
      <div className="text-center py-8">
        <UploadCloud className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Upload New Job
        </h3>
        <p className="text-gray-500 mb-4">
          Create a new job posting to attract candidates
        </p>
        <button
          className="bg-[#800000] text-white px-6 py-2 rounded-lg hover:bg-[#600000] transition"
          onClick={() => setCreateModal(true)}
        >
          Create Job Posting
        </button>
      </div>

      <AnimatePresence>
        {createModal && (
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50"
          >
            <JobPostingModal onClose={handleModalClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadNew;
