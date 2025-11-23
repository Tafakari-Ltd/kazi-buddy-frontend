"use client";

import { UploadCloud } from "lucide-react";
import JobPostingModal from "../JobPostingModal/JobPostingModal";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { fetchJobsByEmployer } from "@/Redux/Features/jobsSlice";
import { useEmployerProfiles } from "@/Redux/Functions/useEmployerProfiles";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const UploadNew = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, userId } = useSelector((state: RootState) => state.auth);
  const [createModal, setCreateModal] = useState<boolean>(false);

  // Get employer profile information
  const { userProfile } = useEmployerProfiles();

  // Get the actual user ID
  const currentUserId = userId || user?.user_id || user?.id;

  // Get the employer profile ID
  const employerProfileId = userProfile?.id;

  const handleModalClose = (jobCreated = false) => {
    setCreateModal(false);

    if (jobCreated) {
      // Redirect to manage jobs page to show the newly created job
      console.log("Job created successfully, redirecting to manage jobs page");
      toast.info("Redirecting to manage jobs...", {
        duration: 1000,
      });

      setTimeout(() => {
        router.push("/employer/manage/jobs");
      }, 1000);
      return; // Exit early to prevent the job refresh
    } else {
      // If no job was created, just refresh the current jobs list
      if (employerProfileId) {
        console.log(
          "Modal closed without job creation, refreshing current jobs list",
        );
        dispatch(fetchJobsByEmployer(employerProfileId));
      }
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
            <JobPostingModal
              onClose={() => handleModalClose(false)}
              onSuccess={() => handleModalClose(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadNew;
