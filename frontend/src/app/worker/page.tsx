"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  AlertCircle,
  MapPin,
  DollarSign,
  Clock,
  User,
  Badge,
  ArrowRight,
  Star,
  Activity,
  Settings
} from "lucide-react";

// Hooks & Utils
import { RootState } from "@/Redux/Store/Store";
import { useWorkerProfiles } from "@/Redux/Functions/useWorkerProfiles";
import { useJobs } from "@/Redux/Functions/useJobs";
import { formatAvailabilitySchedule, CreateWorkerProfileData } from "@/types/worker.types";
import { JobDetails } from "@/types/jobApplication.types";

// Components
import DashboardWelcome from "@/components/WorkerDashboard/DashboardWelcome";
import WorkerStatsCards from "@/components/WorkerDashboard/WorkerStatsCards";
import WorkerProfileForm from "@/components/WorkerDashboard/WorkerProfileForm";
import WorkerTabs from "@/components/WorkerDashboard/WorkerTabs";
import { AvailableJobs } from "@/components/WorkerDashboard/AvailableJobs";
import { MyApplicationsSection } from "@/components/WorkerDashboard/MyApplicationsSection";

const STATUS_OPTIONS = [
  "Dashboard",
  "Profile Setup",
  "My Applications",
  "Available Jobs",
  "Settings",
];

const WorkerDashboardPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [setupProfile, setSetupProfile] = useState<string | null>(null);

  const { user, userId, isAuthenticated } = useSelector((state: RootState) => state.auth || {});
  const currentUserId = userId || user?.user_id || user?.id;

  // Hooks
  const {
    userProfile,
    loading: profileLoading,
    error: profileError,
    successMessage,
    handleFetchUserWorkerProfile,
    handleCreateWorkerProfile,
    handleUpdateWorkerProfile,
    handleClearState,
    hasUserProfile,
  } = useWorkerProfiles();

  const { handleFetchJobs } = useJobs();

  // Local State
  const [filter, setFilter] = useState<string>("Dashboard");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [availableJobs, setAvailableJobs] = useState<JobDetails[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);

  useEffect(() => { setIsClient(true); }, []);

  // Sync with URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSetupProfile(searchParams?.get("setup") || null);
    }
  }, [searchParams]);

  // Fetch Profile
  useEffect(() => {
    if (currentUserId && isAuthenticated) {
      handleFetchUserWorkerProfile(currentUserId);
    }
  }, [currentUserId, isAuthenticated, handleFetchUserWorkerProfile]);

  // Handle Profile Setup Redirect
  useEffect(() => {
    if (setupProfile === "1") {
      if (!hasUserProfile()) {
        setShowProfileModal(true);
        setFilter("Profile Setup");
      } else {
        setFilter("Dashboard");
      }
    }
  }, [setupProfile, hasUserProfile]);

  // Notifications
  useEffect(() => {
    if (successMessage) {
      toast.success(typeof successMessage === 'string' ? successMessage : 'Success');
      handleClearState();
      setShowProfileModal(false);
      setShowEditModal(false);
      if (currentUserId) setTimeout(() => handleFetchUserWorkerProfile(currentUserId), 500);
    }
    if (profileError && typeof profileError === 'string' && !profileError.includes('No worker profile found')) {
      toast.error(profileError);
      handleClearState();
    }
  }, [successMessage, profileError, handleClearState, currentUserId, handleFetchUserWorkerProfile]);

  // Fetch Jobs
  const fetchAvailableJobs = async () => {
    try {
      setJobsLoading(true);
      const result = await handleFetchJobs({ status: 'active' as any, page: 1, limit: 50 });
      
      if (result && typeof result !== 'string') {
        let jobsArray = [];
        if ('data' in result && Array.isArray(result.data)) jobsArray = result.data;
        else if (Array.isArray(result)) jobsArray = result;
        else if ('jobs' in result && Array.isArray(result.jobs)) jobsArray = result.jobs;

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
            category: job.category
          }));
          setAvailableJobs(transformedJobs);
        } else {
          setAvailableJobs([]);
        }
      } else {
        setAvailableJobs([]);
      }
    } catch (err: any) {
      setJobsError(err?.message || 'Failed to fetch jobs');
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    if ((filter === "Available Jobs" || filter === "Dashboard") && availableJobs.length === 0 && !jobsLoading) {
      fetchAvailableJobs();
    }
  }, [filter, availableJobs.length, jobsLoading]);

  // Handlers
  const handleProfileSubmit = async (data: CreateWorkerProfileData) => {
    try {
      if (showProfileModal) {
        await handleCreateWorkerProfile(data);
      } else if (userProfile?.id) {
        await handleUpdateWorkerProfile(userProfile.id, data);
      }
    } catch (error: any) {
      toast.error(error?.message || "Operation failed");
    }
  };

  if (!isClient || (profileLoading && !userProfile)) {
    return (
      <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
      
      <DashboardWelcome 
        userName={userProfile?.user?.full_name || user?.full_name || "Worker"}
        availableJobsCount={availableJobs.length}
        profileCompletion={userProfile?.profile_completion_percentage || 0}
        onBrowseJobs={() => setFilter("Available Jobs")}
        onCompleteProfile={() => setShowEditModal(true)}
        showCompleteProfileBtn={!!userProfile}
      />

      {!hasUserProfile() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 flex items-start gap-4 shadow-sm container">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-yellow-900 text-lg">Finish Setting Up Your Account</h3>
            <p className="text-yellow-800 text-sm mt-1 mb-3">
              You need to create a worker profile before you can apply for jobs. It only takes 2 minutes!
            </p>
            <button onClick={() => setShowProfileModal(true)} className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition">
              Create Profile Now
            </button>
          </div>
        </div>
      )}

      {hasUserProfile() && <WorkerStatsCards />}

      <WorkerTabs activeTab={filter} setTab={setFilter} options={STATUS_OPTIONS} />

      {/* DASHBOARD CONTENT */}
      {filter === "Dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 container">
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Snapshot */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-500" /> My Profile
                </h3>
                {userProfile && (
                  <button onClick={() => setShowEditModal(true)} className="text-red-600 text-sm font-medium hover:underline">
                    Edit Profile
                  </button>
                )}
              </div>

              {userProfile ? (
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" /> <span>{userProfile?.location || "Location not set"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Badge className="w-4 h-4" /> <span>{userProfile?.years_experience || 0} Years Experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" /> <span>{userProfile?.hourly_rate ? `${userProfile.hourly_rate}/hr` : "Rate not set"}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-4 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                      {userProfile?.bio || "No bio added yet."}
                    </p>
                  </div>

                  <div className="md:w-1/3 flex flex-col gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                      <div className="text-sm text-blue-600 font-semibold mb-1">Completion</div>
                      <div className="text-3xl font-bold text-blue-900">{userProfile?.profile_completion_percentage || 0}%</div>
                      <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${userProfile?.profile_completion_percentage || 0}%` }}></div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl border text-center ${userProfile?.is_available ? "bg-green-50 border-green-100 text-green-800" : "bg-red-50 border-red-100 text-red-800"}`}>
                      <div className="text-sm font-semibold mb-1">Current Status</div>
                      <div className="font-bold flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${userProfile?.is_available ? "bg-green-500" : "bg-red-500"}`}></div>
                        {userProfile?.is_available ? "Available for Work" : "Busy / Offline"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't created a profile yet.</p>
                  <button onClick={() => setShowProfileModal(true)} className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">Create Profile</button>
                </div>
              )}
            </div>

            {/* Recommended Jobs */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" /> Recommended For You
                </h3>
                <button onClick={() => setFilter("Available Jobs")} className="text-red-600 text-sm font-medium hover:underline flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {availableJobs.length > 0 ? (
                <div className="grid gap-4">
                  {availableJobs.slice(0, 3).map(job => (
                    <div key={job.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:bg-red-50 transition cursor-pointer group">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-red-700">{job.title}</h4>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{job.description}</p>
                          <div className="flex gap-3 mt-2 text-xs font-medium text-gray-500">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.job_type}</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {job.budget_min}-{job.budget_max}</span>
                          </div>
                        </div>
                        <button onClick={() => setFilter("Available Jobs")} className="bg-white text-red-600 border border-red-200 px-3 py-1 rounded text-xs font-semibold hover:bg-red-600 hover:text-white transition">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No jobs found matching your profile yet.</div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {userProfile && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-8 h-8 text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold">Availability</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${userProfile.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {userProfile.is_available ? "Available Now" : "Busy"}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {formatAvailabilitySchedule(userProfile.availability_schedule)}
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-500" /> Recent Activity
              </h3>
              <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:h-full before:w-0.5 before:bg-gray-100">
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-red-500 border-4 border-white"></div>
                  <p className="text-sm text-gray-800 font-medium">Logged in to Dashboard</p>
                  <p className="text-xs text-gray-500 mt-0.5">Just now</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
              <h3 className="font-bold text-red-900 mb-2">Pro Tip 💡</h3>
              <p className="text-red-800 text-sm leading-relaxed mb-4">
                Complete your profile to 100% to appear higher in employer searches. Adding a verified phone number doubles your chances!
              </p>
              {userProfile && (
                <button onClick={() => setShowEditModal(true)} className="text-xs font-bold text-red-700 hover:text-red-900 underline">
                  Improve Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OTHER VIEWS */}
      {filter === "Available Jobs" && (
        <div className="container">
          {hasUserProfile() ? (
            <AvailableJobs jobs={availableJobs} loading={jobsLoading} error={jobsError} onRefresh={fetchAvailableJobs} />
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <h3 className="font-bold text-yellow-800">Profile Required</h3>
              <p className="text-sm text-yellow-700 mt-1 mb-4">Please create a profile to view jobs.</p>
              <button onClick={() => setShowProfileModal(true)} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Create Profile</button>
            </div>
          )}
        </div>
      )}

      {filter === "My Applications" && (
        <div className="container">
          {hasUserProfile() ? <MyApplicationsSection showAll={true} /> : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <h3 className="font-bold text-yellow-800">Profile Required</h3>
              <button onClick={() => setShowProfileModal(true)} className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Create Profile</button>
            </div>
          )}
        </div>
      )}

      {filter === "Settings" && (
        <div className="bg-white border border-gray-200 shadow-sm p-12 rounded-lg container text-center">
          <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">Account Settings</h3>
          <p className="text-gray-500 mt-2">Manage your account preferences, notifications, and security settings here.</p>
          <span className="inline-block mt-4 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Coming Soon</span>
        </div>
      )}

      {/* PROFILE MODAL */}
      {(showProfileModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {showProfileModal ? "Create Worker Profile" : "Edit Worker Profile"}
              </h3>
              <button onClick={() => { setShowProfileModal(false); setShowEditModal(false); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6">
              <WorkerProfileForm
                initialData={showEditModal && userProfile ? {
                  location: userProfile.location,
                  location_text: userProfile.location_text,
                  is_available: userProfile.is_available,
                  years_experience: userProfile.years_experience,
                  hourly_rate: userProfile.hourly_rate,
                  availability_schedule: userProfile.availability_schedule,
                  bio: userProfile.bio,
                  skills: userProfile.skills || []
                } : undefined}
                onSubmit={handleProfileSubmit}
                onCancel={() => { setShowProfileModal(false); setShowEditModal(false); }}
                loading={profileLoading}
                isEdit={showEditModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboardPage;