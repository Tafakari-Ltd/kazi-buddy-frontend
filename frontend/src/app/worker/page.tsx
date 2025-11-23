"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  AlertCircle,
  Settings,
  Shield,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  User,
  Badge,
  ArrowRight,
} from "lucide-react";

// Import job application components
import { AvailableJobs } from "@/components/WorkerProfile/AvailableJobs";
import { MyApplicationsSection } from "@/components/WorkerProfile/MyApplicationsSection";
import { JobDetails } from "@/types/jobApplication.types";

import { RootState } from "@/Redux/Store/Store";
import { useWorkerProfiles } from "@/Redux/Functions/useWorkerProfiles";
import { useJobs } from "@/Redux/Functions/useJobs";
import WorkerProfileForm from "@/components/WorkerProfiles/WorkerProfileForm";
import {
  CreateWorkerProfileData,
  VerificationStatus,
  formatAvailabilitySchedule,
  calculateProfileCompletion,
} from "@/types/worker.types";

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

  // Handle search params on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSetupProfile(searchParams?.get("setup") || null);
    }
  }, [searchParams]);

  // Auth state with defensive checks
  const authState = useSelector((state: RootState) => state.auth || {});
  const { user, userId, isAuthenticated } = authState;

  // Get the actual user ID
  const currentUserId = userId || user?.user_id || user?.id;

  // Worker profiles hook with error handling
  let workerProfiles;
  let jobsHook;
  try {
    workerProfiles = useWorkerProfiles();
    jobsHook = useJobs();
  } catch (error) {
    console.error("Error loading hooks:", error);
    return (
      <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            Error Loading Profile
          </h2>
          <p className="text-gray-600 mb-6">
            Failed to load worker profile system.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

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
    isProfileVerified,
    isProfilePending,
  } = workerProfiles;

  const { handleFetchJobs } = jobsHook;

  // Local state
  const [filter, setFilter] = useState<string>("Dashboard");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {},
  );
  const [isClient, setIsClient] = useState(false);

  // Job application state
  const [availableJobs, setAvailableJobs] = useState<JobDetails[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch user profile on mount
  useEffect(() => {
    if (currentUserId && isAuthenticated) {
      try {
        console.log("Fetching worker profile for user:", currentUserId);
        handleFetchUserWorkerProfile(currentUserId);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  }, [currentUserId, isAuthenticated, handleFetchUserWorkerProfile]);

  // Handle setup profile redirect
  useEffect(() => {
    try {
      console.log("Setup profile redirect check:", {
        setupProfile,
        userProfile,
        hasProfile: hasUserProfile(),
        currentUserId,
      });

      if (setupProfile === "1") {
        if (!hasUserProfile()) {
          console.log("No user profile found, showing profile setup modal");
          toast.info("Let's set up your worker profile");
          setShowProfileModal(true);
          setFilter("Profile Setup");
        } else {
          console.log("User profile exists, showing dashboard");
          setFilter("Dashboard");
        }
      }
    } catch (error) {
      console.error("Error in setup profile redirect handler:", error);
    }
  }, [setupProfile, hasUserProfile, userProfile, currentUserId]);

  // Handle success messages
  useEffect(() => {
    if (successMessage) {
      const message =
        typeof successMessage === "string"
          ? successMessage
          : "Operation completed successfully";
      toast.success(message);
      handleClearState();
      setShowProfileModal(false);
      setShowEditModal(false);

      // Refresh the user profile after successful creation/update
      if (currentUserId && isAuthenticated) {
        setTimeout(() => {
          handleFetchUserWorkerProfile(currentUserId);
        }, 500); // Small delay to ensure API state is updated
      }
    }
  }, [
    successMessage,
    handleClearState,
    currentUserId,
    isAuthenticated,
    handleFetchUserWorkerProfile,
  ]);

  // Handle profile errors
  useEffect(() => {
    if (profileError) {
      console.error("Profile error:", profileError);
      // Don't show error for "No worker profile found" as it's expected for new users
      if (
        typeof profileError === "string" &&
        !profileError.includes("No worker profile found")
      ) {
        toast.error(profileError);
      } else if (typeof profileError !== "string") {
        toast.error("An error occurred with your profile");
      }
      handleClearState();
    }
  }, [profileError, handleClearState]);

  // Fetch jobs when Available Jobs tab is accessed
  useEffect(() => {
    if (
      filter === "Available Jobs" &&
      availableJobs.length === 0 &&
      !jobsLoading
    ) {
      fetchAvailableJobs();
    }
  }, [filter, availableJobs.length, jobsLoading]);

  // Profile management functions
  const validateProfileForm = (data: CreateWorkerProfileData) => {
    const errors: Record<string, string> = {};

    if (!data.location.trim()) errors.location = "Location is required";
    if (!data.bio.trim()) errors.bio = "Bio is required";
    if (!data.hourly_rate || parseFloat(data.hourly_rate) <= 0)
      errors.hourly_rate = "Valid hourly rate is required";
    if (data.years_experience < 0)
      errors.years_experience = "Experience cannot be negative";

    // Check if at least one availability day is set
    const hasAvailability = Object.keys(data.availability_schedule).some(
      (day) =>
        data.availability_schedule[day] &&
        data.availability_schedule[day].length >= 2,
    );
    if (!hasAvailability) {
      errors.availability_schedule = "Please set at least one availability day";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProfile = async (data: CreateWorkerProfileData) => {
    if (!validateProfileForm(data)) {
      toast.error("Please fix the errors in the form");
      return;
    }

    console.log("Profile form data before submission:", data);

    try {
      const result = await handleCreateWorkerProfile(data);

      if (result.type.endsWith("/rejected")) {
        const errorPayload = result.payload;

        if (
          errorPayload &&
          typeof errorPayload === "object" &&
          "fieldErrors" in errorPayload
        ) {
          const backendErrors: Record<string, string> = {};
          const payloadWithErrors = errorPayload as {
            fieldErrors: Record<string, string[]>;
          };

          Object.entries(payloadWithErrors.fieldErrors).forEach(
            ([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                backendErrors[field] = messages[0];
              }
            },
          );

          setProfileErrors(backendErrors);
          toast.error(
            `Please fix ${Object.keys(backendErrors).length} validation error${Object.keys(backendErrors).length > 1 ? "s" : ""}`,
          );
        } else {
          toast.error(
            typeof errorPayload === "string"
              ? errorPayload
              : "Failed to create profile",
          );
        }
      } else if (result.type.endsWith("/fulfilled")) {
        console.log("Profile created successfully:", result.payload);
      }
    } catch (error: any) {
      console.error("Profile creation error:", error);
      toast.error(error?.message || "Failed to create profile");
    }
  };

  const handleUpdateProfile = async (data: CreateWorkerProfileData) => {
    if (!validateProfileForm(data) || !userProfile?.id) return;

    try {
      await handleUpdateWorkerProfile(userProfile.id, data);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  // Job fetching function
  const fetchAvailableJobs = async () => {
    try {
      setJobsLoading(true);
      setJobsError(null);

      // Use the actual jobs API to fetch available jobs
      const result = await handleFetchJobs({
        status: "active" as any,
        page: 1,
        limit: 50,
      });

      console.log("Raw jobs result:", result);

      if (result && typeof result !== "string") {
        let jobsArray = [];

        // Handle different response formats
        if ("data" in result && result.data && Array.isArray(result.data)) {
          jobsArray = result.data;
        } else if (Array.isArray(result)) {
          jobsArray = result;
        } else if ("jobs" in result && Array.isArray(result.jobs)) {
          jobsArray = result.jobs;
        }

        console.log("Jobs array to transform:", jobsArray);

        if (jobsArray.length > 0) {
          // Transform Job[] to JobDetails[] format
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

          console.log("Transformed jobs:", transformedJobs);
          setAvailableJobs(transformedJobs);
        } else {
          console.log("No jobs found in result");
          setAvailableJobs([]);
        }
      } else {
        console.log("No result returned from API");
        setAvailableJobs([]);
      }
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      const errorMessage =
        err?.message || err?.toString() || "Failed to fetch available jobs";
      setJobsError(errorMessage);
      toast.error(`Failed to load available jobs: ${errorMessage}`);
    } finally {
      setJobsLoading(false);
    }
  };

  const getVerificationStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return "bg-green-100 text-green-800";
      case VerificationStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case VerificationStatus.REJECTED:
        return "bg-red-100 text-red-800";
      case VerificationStatus.SUSPENDED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Show loading state during SSR or initial client load
  if (!isClient || (profileLoading && !userProfile)) {
    return (
      <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
      {/* Header with Profile Info */}
      <div className="container mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-red-800">
              {userProfile ? "Worker Dashboard" : "Welcome to KaziBuddy"}
            </h1>
            {userProfile && (
              <div className="flex items-center gap-4 mt-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatusColor(userProfile.verification_status)}`}
                >
                  {userProfile.verification_status.charAt(0).toUpperCase() +
                    userProfile.verification_status.slice(1)}
                </span>
                <span className="text-gray-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {userProfile.location}
                </span>
                <span className="text-gray-600 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {userProfile.hourly_rate}/hr
                </span>
                <span className="text-gray-600 flex items-center gap-1">
                  <Badge className="w-4 h-4" />
                  {userProfile.years_experience} years
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              <ArrowRight className="w-4 h-4" />
              Go to Homepage
            </button>
            {!hasUserProfile() ? (
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <Plus className="w-4 h-4" />
                Create Profile
              </button>
            ) : (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Warning */}
        {!hasUserProfile() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 container">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">
                  Profile Required
                </h3>
                <p className="text-yellow-700 text-sm">
                  Please create your worker profile to start finding jobs and
                  connecting with employers.
                </p>
                <p className="text-yellow-600 text-xs mt-1">
                  Already have a profile?{" "}
                  <button
                    onClick={() =>
                      currentUserId &&
                      handleFetchUserWorkerProfile(currentUserId)
                    }
                    className="underline hover:text-yellow-800"
                  >
                    Refresh to check
                  </button>
                </p>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="ml-auto bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition"
              >
                Create Now
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 flex-wrap container">
          {STATUS_OPTIONS.map((statusOption) => (
            <button
              key={statusOption}
              onClick={() => {
                if (setupProfile === "1" && statusOption !== "Profile Setup") {
                  router.replace("/worker");
                }
                setFilter(statusOption);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === statusOption
                  ? "bg-red-800 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {statusOption === "Profile Setup" && (
                <Settings className="w-4 h-4" />
              )}
              {statusOption === "Settings" && <Shield className="w-4 h-4" />}
              {statusOption}
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
        {filter === "Dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 container">
            {userProfile ? (
              <>
                {/* Profile Summary Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="w-8 h-8 text-red-600" />
                    <div>
                      <h3 className="text-lg font-semibold">My Profile</h3>
                      <p className="text-sm text-gray-600">
                        {userProfile.profile_completion_percentage}% Complete
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{
                        width: `${userProfile.profile_completion_percentage}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {userProfile.bio}
                  </p>
                </div>

                {/* Availability Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold">Availability</h3>
                      <p className="text-sm text-gray-600">
                        {userProfile.is_available
                          ? "Available"
                          : "Not Available"}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    {formatAvailabilitySchedule(
                      userProfile.availability_schedule,
                    )}
                  </div>
                </div>

                {/* Stats Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="text-lg font-semibold">Member Since</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(userProfile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Profile Views:</span>
                      <span className="font-medium">--</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Applications:</span>
                      <span className="font-medium">--</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-full text-center py-12">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Create Your Worker Profile
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Get started by creating your profile to showcase your skills
                  and connect with employers.
                </p>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="bg-red-800 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Create Profile
                </button>
              </div>
            )}
          </div>
        )}

        {/* Profile Setup View */}
        {filter === "Profile Setup" && (
          <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg container">
            <div className="text-center py-8">
              <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Set Up Your Worker Profile
              </h3>
              <p className="text-gray-500 mb-4">
                Create your profile to start finding work opportunities
              </p>
              <button
                onClick={() => setShowProfileModal(true)}
                className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {/* Available Jobs View */}
        {filter === "Available Jobs" && (
          <div className="container">
            {hasUserProfile() ? (
              <AvailableJobs
                jobs={availableJobs}
                loading={jobsLoading}
                error={jobsError}
                onRefresh={fetchAvailableJobs}
              />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Profile Required
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    Please create your worker profile first to view and apply
                    for available jobs.
                  </p>
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition"
                  >
                    Create Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Applications View */}
        {filter === "My Applications" && (
          <div className="container">
            {hasUserProfile() ? (
              <MyApplicationsSection showAll={true} />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Profile Required
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    Please create your worker profile first to view your job
                    applications.
                  </p>
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition"
                  >
                    Create Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings View */}
        {filter === "Settings" && (
          <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg container">
            <div className="text-center py-8">
              <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Account Settings
              </h3>
              <p className="text-gray-500 mb-4">
                Account settings and preferences coming soon!
              </p>
            </div>
          </div>
        )}

        {/* Profile Creation/Edit Modal */}
        {(showProfileModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {showProfileModal
                    ? "Create Worker Profile"
                    : "Edit Worker Profile"}
                </h3>
              </div>

              <div className="p-6">
                <WorkerProfileForm
                  initialData={
                    showEditModal && userProfile
                      ? {
                          location: userProfile.location,
                          location_text: userProfile.location_text,
                          is_available: userProfile.is_available,
                          years_experience: userProfile.years_experience,
                          hourly_rate: userProfile.hourly_rate,
                          availability_schedule:
                            userProfile.availability_schedule,
                          bio: userProfile.bio,
                        }
                      : undefined
                  }
                  onSubmit={
                    showProfileModal ? handleCreateProfile : handleUpdateProfile
                  }
                  onCancel={() => {
                    setShowProfileModal(false);
                    setShowEditModal(false);
                    setProfileErrors({});
                  }}
                  loading={profileLoading}
                  errors={profileErrors}
                  isEdit={showEditModal}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboardPage;
