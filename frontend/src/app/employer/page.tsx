"use client";
import {
  Ban,
  CheckCircle,
  Mail,
  UploadCloud,
  ArrowRight,
  Calendar,
  Phone,
  AlertCircle,
  Users,
  Building,
  MapPin,
  Globe,
  FileText,
  Settings,
  Shield,
  Plus,
  Edit,
  Briefcase,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import UploadNew from "@/component/UploadNew/UploadNew";
import EmployerApplicationsSection from "@/components/Employer/ApplicationsSection";
import { JobApplicationApi } from "@/services/jobApplicationApi";
import {
  JobApplicationWithDetails,
  ApplicationListResponse,
} from "@/types/jobApplication.types";
import {
  Application,
  ApplicationStage,
  ApplicationStatus,
} from "@/types/job.types";
import {
  BusinessType,
  VerificationStatus,
  BUSINESS_TYPE_OPTIONS,
  INDUSTRY_OPTIONS,
} from "@/types/employer.types";

import { useRouter } from "next/navigation";
import { useEmployerProfiles } from "@/Redux/Functions/useEmployerProfiles";
import { RootState } from "@/Redux/Store/Store";

const STATUS_OPTIONS: (
  | ApplicationStatus
  | "All"
  | "Employees Offered Jobs"
  | "Upload Job"
  | "Profile Setup"
  | "Job Applications"
)[] = [
  "All",
  "Pending",
  "Interview Scheduled",
  "Final Interview",
  "Accepted",
  "Rejected",
  "Cancelled",
  "Employees Offered Jobs",
  "Job Applications",
  "Upload Job",
  "Profile Setup",
];

const STAGES: ApplicationStage[] = [
  "Application Review",
  "Phone Interview",
  "Technical Assessment",
  "In-Person Interview",
  "Reference Check",
  "Offer Extended",
  "Completed",
];

const EmployerApplicationsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [postjob, setPostjob] = useState<string | null>(null);

  // Handle search params on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPostjob(searchParams?.get("postjob") || null);
    }
  }, [searchParams]);

  const authState = useSelector((state: RootState) => state.auth || {});
  const { user, userId, isAuthenticated } = authState;

  // Get the actual user ID
  const currentUserId = userId || user?.user_id || user?.id;

  // Employer profiles hook
  let employerProfiles;
  try {
    employerProfiles = useEmployerProfiles();
  } catch (error) {
    console.error("Error loading employer profiles hook:", error);
    return (
      <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            Error Loading Profile
          </h2>
          <p className="text-gray-600 mb-6">
            Failed to load employer profile system.
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
    handleFetchUserEmployerProfile,
    handleCreateEmployerProfile,
    handleUpdateEmployerProfile,
    handleClearState,
    hasUserProfile,
  } = employerProfiles;

  // Local state
  const [applications, setApplications] = useState<Application[]>([]);
  const [realApplications, setRealApplications] = useState<
    JobApplicationWithDetails[]
  >([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [filter, setFilter] = useState<string>("All");
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [applicationToReject, setApplicationToReject] =
    useState<Application | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    company_name: "",
    business_type: BusinessType.CORPORATION,
    industry: "",
    location: "",
    location_text: "",
    description: "",
    website_url: "",
    business_registration_number: "",
  });

  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {},
  );
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch user profile on mount
  useEffect(() => {
    if (currentUserId && isAuthenticated) {
      try {
        handleFetchUserEmployerProfile(currentUserId);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  }, [currentUserId, isAuthenticated, handleFetchUserEmployerProfile]);

  // Fetch applications when user is authenticated and has profile
  useEffect(() => {
    if (currentUserId && isAuthenticated && hasUserProfile()) {
      fetchEmployerApplications();
    }
  }, [currentUserId, isAuthenticated, userProfile]);

  // Fetch real applications for this employer
  const fetchEmployerApplications = async () => {
    if (!currentUserId || !userProfile?.id) {
      return;
    }

    try {
      setApplicationsLoading(true);

      const response: ApplicationListResponse =
        await JobApplicationApi.getAllApplications({
          ordering: "-applied_at",
        });

      const detailedApplications = await Promise.all(
        response.applications.map(async (app) => {
          try {
            const detailResponse =
              await JobApplicationApi.getApplicationDetails(app.id);
            return detailResponse.application;
          } catch (error) {
            return app;
          }
        }),
      );

      const employerApplications = detailedApplications.filter((app: any) => {
        const jobEmployerId =
          (typeof app.job !== "string" ? app.job?.employer?.id : undefined) ||
          app.job_details?.employer;
        const isMatch = jobEmployerId === userProfile.id;
        return isMatch;
      }) as JobApplicationWithDetails[];

      setRealApplications(employerApplications);

      const convertedApplications: Application[] = employerApplications.map(
        (app, index) => ({
          id: parseInt(app.id) || index + 1,
          applicantName:
            (typeof app.worker !== "string"
              ? app.worker?.user?.full_name
              : undefined) ||
            app.worker_details?.full_name ||
            "Unknown Worker",
          jobTitle:
            (typeof app.job !== "string" ? app.job?.title : undefined) ||
            app.job_details?.title ||
            "Unknown Job",
          appliedDate: new Date(app.applied_at).toISOString().split("T")[0],
          phone: app.worker_details?.phone_number || "N/A",
          email:
            (typeof app.worker !== "string"
              ? app.worker?.user?.email
              : undefined) ||
            app.worker_details?.email ||
            "",
          experience: app.worker_details?.experience_level || "Not specified",
          availability: new Date(app.availability_start).toLocaleDateString(),
          status: mapApplicationStatus(app.status),
          stage: mapApplicationStage(app.status),
          message: app.cover_letter || "No message provided",
          rejectionReason: undefined,
        }),
      );

      setApplications(convertedApplications);
    } catch (error) {
      console.error("Error fetching employer applications:", error);
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const mapApplicationStatus = (status: string): ApplicationStatus => {
    switch (status) {
      case "pending":
        return "Pending";
      case "accepted":
        return "Accepted";
      case "rejected":
        return "Rejected";
      case "reviewed":
        return "Interview Scheduled";
      default:
        return "Pending";
    }
  };

  const mapApplicationStage = (status: string): ApplicationStage => {
    switch (status) {
      case "pending":
        return "Application Review";
      case "reviewed":
        return "Phone Interview";
      case "accepted":
        return "Offer Extended";
      case "rejected":
        return "Application Review";
      default:
        return "Application Review";
    }
  };

  // Handle postjob redirect
  useEffect(() => {
    try {
      if (postjob === "1") {
        if (!hasUserProfile()) {
          toast.error("Please complete your employer profile first");
          setShowProfileModal(true);
          setFilter("Profile Setup");
        } else {
          setFilter("Upload Job");
        }
      }
    } catch (error) {
      console.error("Error in postjob redirect handler:", error);
    }
  }, [postjob, hasUserProfile, userProfile, currentUserId]);

  // Update profile form when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        company_name: userProfile.company_name,
        business_type: userProfile.business_type,
        industry: userProfile.industry,
        location: userProfile.location,
        location_text: userProfile.location_text,
        description: userProfile.description,
        website_url: userProfile.website_url || "",
        business_registration_number: userProfile.business_registration_number,
      });
    }
  }, [userProfile]);

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
    }
  }, [successMessage, handleClearState]);

  // Handle profile errors
  useEffect(() => {
    if (profileError) {
      if (profileError !== "Employer profile not found") {
        const errorMessage =
          typeof profileError === "string"
            ? profileError
            : "An error occurred with your profile";
        toast.error(errorMessage);
      }
      handleClearState();
    }
  }, [profileError, handleClearState]);

  // Application management functions
  const moveToNextStage = (id: number) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const currentStageIndex = STAGES.indexOf(app.stage);
          const nextStageIndex = Math.min(
            currentStageIndex + 1,
            STAGES.length - 1,
          );
          const nextStage = STAGES[nextStageIndex];

          let newStatus: ApplicationStatus = app.status;

          if (nextStage === "Phone Interview")
            newStatus = "Interview Scheduled";
          else if (nextStage === "In-Person Interview")
            newStatus = "Final Interview";
          else if (nextStage === "Offer Extended" || nextStage === "Completed")
            newStatus = "Accepted";

          return { ...app, stage: nextStage, status: newStatus };
        }
        return app;
      }),
    );
  };

  const handleRejectApplication = () => {
    if (applicationToReject && rejectionReason.trim()) {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationToReject.id
            ? {
                ...app,
                status: "Rejected",
                rejectionReason: rejectionReason.trim(),
              }
            : app,
        ),
      );
      setShowRejectModal(false);
      setRejectionReason("");
      setApplicationToReject(null);
    }
  };

  const openRejectModal = (application: Application) => {
    setApplicationToReject(application);
    setShowRejectModal(true);
  };

  const respondToApplicant = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const getStageProgress = (stage: ApplicationStage): number => {
    const stageIndex = STAGES.indexOf(stage);
    return ((stageIndex + 1) / STAGES.length) * 100;
  };

  // Profile management functions
  const handleProfileFormChange = (
    field: string,
    value: string | BusinessType,
  ) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    if (profileErrors[field]) {
      setProfileErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateProfileForm = () => {
    const errors: Record<string, string> = {};

    if (!profileForm.company_name.trim())
      errors.company_name = "Company name is required";
    if (!profileForm.industry) errors.industry = "Industry is required";
    if (!profileForm.location.trim()) errors.location = "Location is required";
    if (!profileForm.description.trim())
      errors.description = "Description is required";
    if (!profileForm.business_registration_number.trim()) {
      errors.business_registration_number =
        "Business registration number is required";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProfile = async () => {
    if (!validateProfileForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const result = await handleCreateEmployerProfile(profileForm);

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
      }
    } catch (error: any) {
      console.error("Profile creation error:", error);
      toast.error(error?.message || "Failed to create profile");
    }
  };

  const handleUpdateProfile = async () => {
    if (!validateProfileForm() || !userProfile?.id) return;

    try {
      await handleUpdateEmployerProfile(userProfile.id, profileForm);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  // Filter applications
  const filteredApplications: Application[] =
    filter === "All"
      ? applications
      : filter === "Employees Offered Jobs"
        ? applications.filter((app) => app.status === "Accepted")
        : filter === "Upload Job" ||
            filter === "Profile Setup" ||
            filter === "Job Applications"
          ? []
          : applications.filter((app) => app.status === filter);

  const getStatusBadgeClass = (status: ApplicationStatus): string => {
    switch (status) {
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Interview Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Final Interview":
        return "bg-purple-100 text-purple-800";
      case "Cancelled":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
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
              {userProfile?.company_name || "Employer Dashboard"}
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
                  <Building className="w-4 h-4" />
                  {userProfile.industry}
                </span>
              </div>
            )}
          </div>

          {!hasUserProfile() ? (
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              <Plus className="w-4 h-4" />
              Complete Profile
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

      {/* Profile Warning for Job Creation */}
      {!hasUserProfile() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 container">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-800">
                Profile Required
              </h3>
              <p className="text-yellow-700 text-sm">
                Please complete your employer profile before creating job
                postings.
              </p>
            </div>
            <button
              onClick={() => setShowProfileModal(true)}
              className="ml-auto bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition"
            >
              Complete Now
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
              if (postjob === "1" && statusOption !== "Upload Job") {
                router.replace("/employer");
              }
              setFilter(statusOption);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === statusOption
                ? "bg-red-800 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {statusOption === "Employees Offered Jobs" && (
              <Users className="w-4 h-4" />
            )}
            {statusOption === "Upload Job" && (
              <UploadCloud className="w-4 h-4" />
            )}
            {statusOption === "Job Applications" && (
              <Briefcase className="w-4 h-4" />
            )}
            {statusOption === "Profile Setup" && (
              <Settings className="w-4 h-4" />
            )}
            {statusOption}
          </button>
        ))}
      </div>

      {/* Job Applications View */}
      {filter === "Job Applications" && (
        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg container">
          {hasUserProfile() ? (
            <EmployerApplicationsSection />
          ) : (
            <div className="text-center py-8">
              <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Profile Required
              </h3>
              <p className="text-gray-500 mb-4">
                Complete your employer profile to view job applications
              </p>
              <button
                onClick={() => setShowProfileModal(true)}
                className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Complete Profile
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload Job View */}
      {filter === "Upload Job" && (
        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg container">
          {hasUserProfile() ? (
            <UploadNew />
          ) : (
            <div className="text-center py-8">
              <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Profile Required
              </h3>
              <p className="text-gray-500 mb-4">
                Complete your employer profile to start posting jobs
              </p>
              <button
                onClick={() => setShowProfileModal(true)}
                className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Complete Profile
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
              Complete Your Profile
            </h3>
            <p className="text-gray-500 mb-4">
              Set up your company profile to start using employer features
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

      {/* Applications List */}
      {filter !== "Upload Job" &&
        filter !== "Profile Setup" &&
        filter !== "Job Applications" && (
          <div className="grid gap-6 container">
            {applicationsLoading ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">
                  {hasUserProfile()
                    ? "No applications found for this filter."
                    : "Complete your profile to view job applications."}
                </p>
              </div>
            ) : (
              filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white p-6 shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-red-800 mb-1">
                        {app.applicantName}
                      </h2>
                      <p className="text-gray-700 mb-2">
                        Applied for: <strong>{app.jobTitle}</strong>
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied:{" "}
                          {new Date(app.appliedDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {app.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {app.experience}
                        </span>
                        <span>Availability: {app.availability}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(
                          app.status,
                        )}`}
                      >
                        {app.status}
                      </span>

                      {app.status !== "Rejected" &&
                        app.status !== "Accepted" && (
                          <>
                            <button
                              onClick={() => respondToApplicant(app.email)}
                              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                              title="Send Email"
                            >
                              <Mail className="w-4 h-4" />
                              Email
                            </button>
                            <button
                              onClick={() => moveToNextStage(app.id)}
                              className="text-green-600 hover:underline text-sm flex items-center gap-1"
                              title="Move to next stage"
                            >
                              <ArrowRight className="w-4 h-4" />
                              Next Stage
                            </button>
                            <button
                              onClick={() => openRejectModal(app)}
                              className="text-red-600 hover:underline text-sm flex items-center gap-1"
                              title="Reject Application"
                            >
                              <Ban className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}

                      {app.status === "Rejected" && (
                        <button
                          onClick={() =>
                            alert(
                              `Rejection Reason: ${app.rejectionReason || "N/A"}`,
                            )
                          }
                          className="text-red-600 underline text-sm"
                          title="View Rejection Reason"
                        >
                          View Reason
                        </button>
                      )}

                      {app.status === "Accepted" && (
                        <span className="text-green-700 font-semibold text-sm flex items-center gap-1">
                          <CheckCircle className="w-5 h-5" />
                          Hired
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{app.message}</p>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-red-800 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getStageProgress(app.stage)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">Stage: {app.stage}</p>
                </div>
              ))
            )}
          </div>
        )}

      {/* Profile Creation/Edit Modal */}
      {(showProfileModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {showProfileModal
                  ? "Create Employer Profile"
                  : "Edit Employer Profile"}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  className={`w-full p-3 border rounded-lg ${profileErrors.company_name ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter company name"
                  value={profileForm.company_name}
                  onChange={(e) =>
                    handleProfileFormChange("company_name", e.target.value)
                  }
                />
                {profileErrors.company_name && (
                  <p className="text-xs text-red-600 mt-1">
                    {profileErrors.company_name}
                  </p>
                )}
              </div>

              {/* Business Type and Industry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type *
                  </label>
                  <select
                    className={`w-full p-3 border rounded-lg ${profileErrors.business_type ? "border-red-500" : "border-gray-300"}`}
                    value={profileForm.business_type}
                    onChange={(e) =>
                      handleProfileFormChange(
                        "business_type",
                        e.target.value as BusinessType,
                      )
                    }
                  >
                    {BUSINESS_TYPE_OPTIONS.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {/* Validation error display */}
                  {profileErrors.business_type && (
                    <p className="text-xs text-red-600 mt-1">
                      {profileErrors.business_type}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry *
                  </label>
                  <select
                    className={`w-full p-3 border rounded-lg ${profileErrors.industry ? "border-red-500" : "border-gray-300"}`}
                    value={profileForm.industry}
                    onChange={(e) =>
                      handleProfileFormChange("industry", e.target.value)
                    }
                  >
                    <option value="">Select industry</option>
                    {INDUSTRY_OPTIONS.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                  {profileErrors.industry && (
                    <p className="text-xs text-red-600 mt-1">
                      {profileErrors.industry}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    className={`w-full p-3 border rounded-lg ${profileErrors.location ? "border-red-500" : "border-gray-300"}`}
                    placeholder="City, Country"
                    value={profileForm.location}
                    onChange={(e) =>
                      handleProfileFormChange("location", e.target.value)
                    }
                  />
                  {profileErrors.location && (
                    <p className="text-xs text-red-600 mt-1">
                      {profileErrors.location}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Details
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg border-gray-300"
                    placeholder="e.g., Downtown area"
                    value={profileForm.location_text}
                    onChange={(e) =>
                      handleProfileFormChange("location_text", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Description *
                </label>
                <textarea
                  rows={4}
                  className={`w-full p-3 border rounded-lg ${profileErrors.description ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Describe your company..."
                  value={profileForm.description}
                  onChange={(e) =>
                    handleProfileFormChange("description", e.target.value)
                  }
                />
                {profileErrors.description && (
                  <p className="text-xs text-red-600 mt-1">
                    {profileErrors.description}
                  </p>
                )}
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  className="w-full p-3 border rounded-lg border-gray-300"
                  placeholder="https://your-website.com"
                  value={profileForm.website_url}
                  onChange={(e) =>
                    handleProfileFormChange("website_url", e.target.value)
                  }
                />
              </div>

              {/* Business Registration Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Registration Number *
                </label>
                <input
                  type="text"
                  className={`w-full p-3 border rounded-lg ${profileErrors.business_registration_number ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Your business registration number"
                  value={profileForm.business_registration_number}
                  onChange={(e) =>
                    handleProfileFormChange(
                      "business_registration_number",
                      e.target.value,
                    )
                  }
                />
                {profileErrors.business_registration_number && (
                  <p className="text-xs text-red-600 mt-1">
                    {profileErrors.business_registration_number}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowEditModal(false);
                    setProfileErrors({});
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    showProfileModal ? handleCreateProfile : handleUpdateProfile
                  }
                  disabled={profileLoading}
                  className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {profileLoading
                    ? "Saving..."
                    : showProfileModal
                      ? "Create Profile"
                      : "Update Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal  */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 container">
          <div className="bg-white p-6 rounded-lg w-full max-w-[700px] shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-red-800">
              Reject Application
            </h3>
            <p className="mb-2 text-gray-700">
              Reason for rejecting{" "}
              <strong>{applicationToReject?.applicantName}</strong>?
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border rounded p-2 mb-4 border-neutral-300"
              rows={15}
              placeholder="Type rejection reason..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setApplicationToReject(null);
                }}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectApplication}
                disabled={!rejectionReason.trim()}
                className={`px-4 py-2 rounded text-white ${
                  rejectionReason.trim()
                    ? "bg-red-800 hover:bg-red-700"
                    : "bg-red-300 cursor-not-allowed"
                }`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerApplicationsPage;