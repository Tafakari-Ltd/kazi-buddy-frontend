"use client";
import React from "react";
import { MapPin, Clock, Tag, DollarSign, X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  selectJobDescriptionOpen,
  closeJobDescription,
  selectSelectedJob,
} from "@/Redux/Features/JobDescriptionSlice";

import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { openJobModal } from "@/Redux/Features/ApplyJobSlice";
import { fetchUserWorkerProfile } from "@/Redux/Features/workerProfilesSlice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const JobMoreDescription = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const isOpen = useSelector(selectJobDescriptionOpen);
  const jobData = useSelector(selectSelectedJob);
  const { isAuthenticated, userId } = useSelector((state: RootState) => state.auth);
  const { userProfile } = useSelector((state: RootState) => state.workerProfiles);

  // If no job data, return null
  if (!jobData) return null;

  // Format the job data from backend
  const job = {
    id: jobData.id,
    title: jobData.title || "Job Title",
    jobType: jobData.jobType || jobData.job_type || "Full-Time",
    category: typeof jobData.category === 'string' ? jobData.category : jobData.category?.name || "General",
    location: (jobData as any).location_address || jobData.location_text || jobData.location || "Location not specified",
    rate: jobData.budget_min && jobData.budget_max 
      ? `KSh ${jobData.budget_min} - ${jobData.budget_max}`
      : "Negotiable",
    description: jobData.description || "No description available",
    image: (jobData as any).job_image || (jobData as any).image || "https://images.pexels.com/photos/4239016/pexels-photo-4239016.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    postedDate: jobData.created_at ? new Date(jobData.created_at).toLocaleDateString() : (jobData as any).postedDate || "Recently",
    urgency: (jobData as any).is_urgent || jobData.urgency_level === 'urgent' ? "Hiring Immediately" : "Open Position",
    requirements: (jobData as any).requirements || [
      "Please contact employer for details",
    ],
    benefits: (jobData as any).benefits || [
      "Competitive compensation",
      "Professional work environment",
    ],
  };

  const handleApply = async (jobTitle: string, jobId: string) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login page with return URL
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        sessionStorage.setItem('pendingJobApplication', jobId);
        window.location.href = '/auth/login';
      }
      return;
    }
    
    // Check if user has a worker profile
    if (!userProfile && userId) {
      // Try to fetch user's worker profile
      try {
        const result = await dispatch(fetchUserWorkerProfile(userId)).unwrap();
        
        if (!result) {
          // No worker profile exists, redirect to create one
          toast.info("Please create a worker profile to apply for jobs");
          router.push('/worker');
          return;
        }
      } catch (error) {
        // Error fetching profile, redirect to create one
        toast.info("Please create a worker profile to apply for jobs");
        router.push('/worker');
        return;
      }
    }
    
    // User has a worker profile, open the application modal
    dispatch(openJobModal());
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 right-0 w-[97%] md:w-[65%] h-screen z-40 overflow-y-auto shadow-2xl bg-white"
      >
        {/* Header with Image */}
        <div className="relative w-full h-60 sm:h-72">
          <img
            src={job.image}
            alt="Job"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 via-red-800/70 to-gray-900/60">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => dispatch(closeJobDescription())}
                className="fixed right-[2rem] p-2 bg-red-400 hover:bg-red-500 rounded-sm backdrop-blur-sm transition-all duration-200"
                aria-label="Close job description"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full">
                  {job.urgency}
                </span>
                <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur-sm">
                  {job.postedDate}
                </span>
              </div>
              <h1 className="text-white text-2xl sm:text-4xl font-bold mb-2 leading-tight">
                {job.title}
              </h1>
              <div className="flex items-center gap-4 text-white/90 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-semibold">{job.rate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 sm:p-8"
        >
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              {
                icon: <Clock className="text-red-700" />,
                label: "Job Type",
                value: job.jobType,
              },
              {
                icon: <Tag className="text-red-700" />,
                label: "Category",
                value: job.category,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1 }}
                className="bg-gray-50 p-4 rounded-sm border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-100 rounded-lg">{item.icon}</div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      {item.label}
                    </p>
                    <p className="font-semibold text-gray-800">{item.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Job Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              Job Description
              <div className="h-1 w-12 bg-red-600 rounded"></div>
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              Requirements
              <div className="h-1 w-8 bg-gray-400 rounded"></div>
            </h3>
            <div className="space-y-3">
              {job.requirements.map((req, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700">{req}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              Benefits & Perks
              <div className="h-1 w-8 bg-gray-400 rounded"></div>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {job.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-gray-50 rounded-lg border border-red-100"
                >
                  <Star className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200"
          >
            <button
              className="flex-1 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-4 px-6 transition-all rounded-sm duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={() => handleApply(job.title, job.id)}
            >
              Apply Now
            </button>
            <button className="px-6 py-4 border-2 border-gray-300 hover:border-red-600 text-gray-700 hover:text-red-600 font-semibold transition-all duration-200 hover:bg-red-50 rounded-sm">
              Save Job
            </button>
          </motion.div>

          {/* Contact Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-red-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              <strong>Ready to apply?</strong> Click "Apply Now" to submit your
              application or contact us for more information.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JobMoreDescription;
