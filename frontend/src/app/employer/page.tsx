"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Ban, CheckCircle, Mail, ArrowRight, Calendar, Phone, Users,
  AlertCircle, Briefcase, Shield, Building, MessageSquare, Home
} from "lucide-react";

// Components
import UploadNew from "@/component/UploadNew/UploadNew";
import EmployerApplicationsSection from "@/components/Employer/ApplicationsSection";
import EmployerProfileForm from "@/components/Employer/EmployerProfileForm";
import EmployerTabs from "@/components/Employer/EmployerTabs";
import EmployerHeader from "@/components/Employer/EmployerHeader";

// Hooks & Utils
import { JobApplicationApi } from "@/services/jobApplicationApi";
import { useEmployerProfiles } from "@/Redux/Functions/useEmployerProfiles";
import { RootState } from "@/Redux/Store/Store";
import { Application, ApplicationStage, ApplicationStatus } from "@/types/job.types";
import { JobApplicationWithDetails, ApplicationListResponse } from "@/types/jobApplication.types";

const STATUS_OPTIONS = [
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
  "Application Review", "Phone Interview", "Technical Assessment", 
  "In-Person Interview", "Reference Check", "Offer Extended", "Completed",
];

const EmployerApplicationsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [postjob, setPostjob] = useState<string | null>(null);

  // Redux Auth
  const { user, userId, isAuthenticated } = useSelector((state: RootState) => state.auth || {});
  const currentUserId = userId || user?.user_id || user?.id;

  // Custom Hooks
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
  } = useEmployerProfiles();

  // Local State
  const [filter, setFilter] = useState<string>("All");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [applicationToReject, setApplicationToReject] = useState<Application | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  // Handle URL Params
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPostjob(searchParams?.get("postjob") || null);
    }
  }, [searchParams]);

  // Fetch Profile
  useEffect(() => {
    if (currentUserId && isAuthenticated) {
      handleFetchUserEmployerProfile(currentUserId);
    }
  }, [currentUserId, isAuthenticated, handleFetchUserEmployerProfile]);

  useEffect(() => {
    if (postjob === "1") {
      if (!hasUserProfile()) {
        toast.error("Please complete your employer profile first");
        setShowProfileModal(true);
        setFilter("Profile Setup");
      } else {
        setFilter("Upload Job");
      }
    }
  }, [postjob, hasUserProfile]);

  // Fetch Applications
  useEffect(() => {
    if (currentUserId && isAuthenticated && hasUserProfile()) {
      fetchEmployerApplications();
    }
  }, [currentUserId, isAuthenticated, userProfile]);

  // Feedback Handling
  useEffect(() => {
    if (successMessage) {
      toast.success(typeof successMessage === "string" ? successMessage : "Success");
      handleClearState();
      setShowProfileModal(false);
      setShowEditModal(false);
    }
    if (profileError && profileError !== "Employer profile not found") {
      toast.error(typeof profileError === "string" ? profileError : "An error occurred");
      handleClearState();
    }
  }, [successMessage, profileError, handleClearState]);

  // --- Logic for Applications ---
  const fetchEmployerApplications = async () => {
    if (!currentUserId || !userProfile?.id) return;
    try {
      setApplicationsLoading(true);
      const response: ApplicationListResponse = await JobApplicationApi.getAllApplications({ ordering: "-applied_at" });
      
      const detailedApplications = await Promise.all(
        response.applications.map(async (app) => {
          try {
            const detailResponse = await JobApplicationApi.getApplicationDetails(app.id);
            return detailResponse.application;
          } catch { return app; }
        })
      );

      const employerApplications = detailedApplications.filter((app: any) => {
        const jobEmployerId = (typeof app.job !== "string" ? app.job?.employer?.id : undefined) || app.job_details?.employer;
        return jobEmployerId === userProfile.id;
      }) as JobApplicationWithDetails[];

      const convertedApplications: Application[] = employerApplications.map((app, index) => ({
        id: parseInt(app.id) || index + 1,
        applicantName: (typeof app.worker !== "string" ? app.worker?.user?.full_name : undefined) || app.worker_details?.full_name || "Unknown",
        jobTitle: (typeof app.job !== "string" ? app.job?.title : undefined) || app.job_details?.title || "Unknown Job",
        appliedDate: new Date(app.applied_at).toISOString().split("T")[0],
        phone: app.worker_details?.phone_number || "N/A",
        email: (typeof app.worker !== "string" ? app.worker?.user?.email : undefined) || app.worker_details?.email || "",
        experience: app.worker_details?.experience_level || "Not specified",
        availability: new Date(app.availability_start).toLocaleDateString(),
        status: mapApplicationStatus(app.status),
        stage: mapApplicationStage(app.status),
        message: app.cover_letter || "No message provided",
      }));

      setApplications(convertedApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const mapApplicationStatus = (status: string): ApplicationStatus => {
    switch (status) {
      case "pending": return "Pending";
      case "accepted": return "Accepted";
      case "rejected": return "Rejected";
      case "reviewed": return "Interview Scheduled";
      default: return "Pending";
    }
  };

  const mapApplicationStage = (status: string): ApplicationStage => {
    switch (status) {
      case "pending": return "Application Review";
      case "reviewed": return "Phone Interview";
      case "accepted": return "Offer Extended";
      case "rejected": return "Application Review";
      default: return "Application Review";
    }
  };

  // --- Handlers ---
  const handleProfileSubmit = async (data: any) => {
    if (showProfileModal) {
      await handleCreateEmployerProfile(data);
    } else {
      if (!userProfile?.id) return;
      await handleUpdateEmployerProfile(userProfile.id, data);
    }
  };

  const handleTabChange = (newTab: string) => {
    if (postjob === "1" && newTab !== "Upload Job") {
      router.replace("/employer");
    }
    setFilter(newTab);
  };

  // --- Render Helpers ---
  const filteredApplications = filter === "All"
    ? applications
    : filter === "Employees Offered Jobs"
      ? applications.filter((app) => app.status === "Accepted")
      : ["Upload Job", "Profile Setup", "Job Applications"].includes(filter)
        ? []
        : applications.filter((app) => app.status === filter);

  const getStatusBadgeClass = (status: ApplicationStatus) => {
    switch (status) {
      case "Rejected": return "bg-red-100 text-red-800";
      case "Accepted": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Interview Scheduled": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStageProgress = (stage: ApplicationStage) => ((STAGES.indexOf(stage) + 1) / STAGES.length) * 100;

  if (!isClient || (profileLoading && !userProfile)) {
    return (
      <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-2xl w-full" />
          <div className="h-12 bg-gray-200 rounded-full w-2/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="h-40 bg-gray-200 rounded-xl" />
            <div className="h-40 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
      
      {/* Back to Homepage Button */}
      <div className="container mb-6 flex gap-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          <Home className="w-4 h-4" />
          Back to Homepage
        </button>
        <button
          onClick={() => router.push("/messages")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <MessageSquare className="w-4 h-4" />
          Messages
        </button>
      </div>

      {/* Header Info */}
      <EmployerHeader 
        profile={userProfile} 
        hasProfile={hasUserProfile()} 
        onOpenProfileModal={() => setShowProfileModal(true)}
        onOpenEditModal={() => setShowEditModal(true)}
      />

      {/* Warning Banner */}
      {!hasUserProfile() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 container flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800">Action Required</h3>
            <p className="text-yellow-700 text-sm">Please complete your employer profile to unlock all features.</p>
          </div>
          <button onClick={() => setShowProfileModal(true)} className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition">
            Complete Now
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <EmployerTabs activeTab={filter} setTab={handleTabChange} options={STATUS_OPTIONS} />

      {/* Views */}
      {filter === "Job Applications" && (
        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl container min-h-[400px]">
          {hasUserProfile() ? <EmployerApplicationsSection /> : <ProfileRequiredView onClick={() => setShowProfileModal(true)} />}
        </div>
      )}

      {filter === "Upload Job" && (
        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl container min-h-[400px]">
          {hasUserProfile() ? <UploadNew /> : <ProfileRequiredView onClick={() => setShowProfileModal(true)} title="Post a Job" message="Complete your profile to start posting jobs" />}
        </div>
      )}

      {filter === "Profile Setup" && (
        <div className="bg-white border border-gray-200 shadow-sm p-12 rounded-xl container text-center min-h-[400px] flex flex-col items-center justify-center">
          <Shield className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Setup Your Profile</h3>
          <p className="text-gray-500 mb-6 max-w-md">Create a professional profile to build trust with candidates and manage your hiring process efficiently.</p>
          <button onClick={() => setShowProfileModal(true)} className="bg-red-800 text-white px-8 py-3 rounded-xl font-medium hover:bg-red-700 transition shadow-lg shadow-red-800/20">
            Start Setup
          </button>
        </div>
      )}

      {/* Default Application List View */}
      {!["Upload Job", "Profile Setup", "Job Applications"].includes(filter) && (
        <div className="grid gap-6 container">
          {applicationsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Fetching applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No applications found in this category.</p>
            </div>
          ) : (
            filteredApplications.map((app) => (
              <div key={app.id} className="bg-white p-6 shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{app.applicantName}</h2>
                    <p className="text-gray-600 mb-2 text-sm">Applied for: <span className="font-semibold text-red-800">{app.jobTitle}</span></p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(app.appliedDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {app.phone}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {app.experience}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(app.status)}`}>{app.status}</span>
                    {app.status !== "Rejected" && app.status !== "Accepted" && (
                      <div className="flex gap-2">
                        <button onClick={() => window.location.href = `mailto:${app.email}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Email"><Mail className="w-4 h-4" /></button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Next Stage"><ArrowRight className="w-4 h-4" /></button>
                        <button onClick={() => { setApplicationToView(app); setShowRejectModal(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Reject"><Ban className="w-4 h-4" /></button>
                      </div>
                    )}
                    {app.status === "Accepted" && <span className="text-green-600 flex items-center gap-1 font-medium text-sm"><CheckCircle className="w-4 h-4" /> Hired</span>}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm text-gray-700">{app.message}</div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                  <div className="bg-red-800 h-1.5 rounded-full transition-all duration-500" style={{ width: `${getStageProgress(app.stage)}%` }} />
                </div>
                <p className="text-xs text-gray-500 text-right">{app.stage}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <EmployerProfileForm 
        isOpen={showProfileModal || showEditModal}
        onClose={() => { setShowProfileModal(false); setShowEditModal(false); }}
        onSubmit={handleProfileSubmit}
        initialData={userProfile}
        loading={profileLoading}
        isEdit={showEditModal}
      />

      {/* Reject Modal Placeholder  */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-bold text-lg mb-4">Reject Application</h3>
            <textarea 
              className="w-full border rounded-lg p-3 mb-4 h-32 focus:ring-2 focus:ring-red-500 outline-none" 
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileRequiredView = ({ onClick, title = "Profile Required", message = "Complete your profile to access this section" }: any) => (
  <div className="text-center py-12 flex flex-col items-center justify-center h-full">
    <Building className="w-16 h-16 text-gray-300 mb-4" />
    <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6">{message}</p>
    <button onClick={onClick} className="bg-red-800 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-red-700 transition">
      Complete Profile
    </button>
  </div>
);

function setApplicationToView(app: Application) {
  // Helper for reject logic placeholder
}

export default EmployerApplicationsPage;