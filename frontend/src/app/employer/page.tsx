"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";

// Components
import EmployerProfileForm from "@/components/Employer/EmployerProfileForm";
import JobEditModal from "@/component/JobEditModal/JobEditModal";
import JobPostingModal from "@/component/JobPostingModal/JobPostingModal";
import {
  EmployerDashboardHeader,
  ProfileWarningBanner,
  DashboardTabNav,
  DashboardOverview,
  MyJobsList,
  ApplicationsList,
  JobViewModal,
  DeleteJobModal,
  RejectApplicationModal,
  SettingsView,
  mapApplicationStatus,
  mapApplicationStage,
} from "@/components/Employer/Dashboard";

// Hooks & Utils
import { JobApplicationApi } from "@/services/jobApplicationApi";
import { useEmployerProfiles } from "@/Redux/Functions/useEmployerProfiles";
import { useJobs } from "@/Redux/Functions/useJobs";
import { RootState, AppDispatch } from "@/Redux/Store/Store";
import { Application, ApplicationStage, Job, JobStatus } from "@/types/job.types";
import { JobApplicationWithDetails, ApplicationListResponse } from "@/types/jobApplication.types";
import { deleteJob, updateJobStatus } from "@/Redux/Features/jobsSlice";
import { useCategories } from "@/Redux/Functions/useCategories";

const TABS = [
  "Dashboard",
  "My Jobs",
  "All Applications",
  "Pending",
  "Interview Scheduled",
  "Final Interview",
  "Accepted",
  "Rejected",
  "Cancelled",
  "Settings",
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

const EmployerDashboardPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();

  // Redux selectors
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

  const { jobs, handleFetchJobsByEmployer } = useJobs();
  const { categories, handleFetchCategories } = useCategories();

  // State
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showJobViewModal, setShowJobViewModal] = useState(false);
  const [showJobEditModal, setShowJobEditModal] = useState(false);
  const [showJobPostModal, setShowJobPostModal] = useState(false);
  const [showDeleteJobModal, setShowDeleteJobModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Selected items
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [applicationToReject, setApplicationToReject] = useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  // Initialize
  useEffect(() => {
    setIsClient(true);
    handleFetchCategories();
  }, []);

  // Handle URL params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const postParam = searchParams?.get("postjob");
      if (postParam === "1") {
        if (!hasUserProfile()) {
          toast.error("Please complete your employer profile first");
          setShowProfileModal(true);
        } else {
          setActiveTab("My Jobs");
        }
      }
    }
  }, [searchParams, hasUserProfile]);

  // Fetch data
  useEffect(() => {
    if (currentUserId && isAuthenticated) {
      handleFetchUserEmployerProfile(currentUserId);
    }
  }, [currentUserId, isAuthenticated]);

  useEffect(() => {
    if (userProfile?.id) {
      fetchEmployerApplications();
      handleFetchJobsByEmployer(userProfile.id);
    }
  }, [userProfile]);

  // Handle feedback
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
  }, [successMessage, profileError]);

  // Fetch applications
  const fetchEmployerApplications = async () => {
    if (!currentUserId || !userProfile?.id) return;
    try {
      setApplicationsLoading(true);
      const response: ApplicationListResponse = await JobApplicationApi.getAllApplications({
        ordering: "-applied_at",
      });

      const detailedApplications = await Promise.all(
        response.applications.map(async (app) => {
          try {
            const detailResponse = await JobApplicationApi.getApplicationDetails(app.id);
            return detailResponse.application;
          } catch {
            return app;
          }
        })
      );

      const employerApplications = detailedApplications.filter((app: any) => {
        const jobEmployerId =
          (typeof app.job !== "string" ? app.job?.employer?.id : undefined) ||
          app.job_details?.employer;
        return jobEmployerId === userProfile.id;
      }) as JobApplicationWithDetails[];

      const convertedApplications: Application[] = employerApplications.map((app, index) => ({
        id: parseInt(app.id) || index + 1,
        applicantName:
          (typeof app.worker !== "string" ? app.worker?.user?.full_name : undefined) ||
          app.worker_details?.full_name ||
          "Unknown",
        jobTitle:
          (typeof app.job !== "string" ? app.job?.title : undefined) ||
          app.job_details?.title ||
          "Unknown Job",
        appliedDate: new Date(app.applied_at).toISOString().split("T")[0],
        phone: app.worker_details?.phone_number || "N/A",
        email:
          (typeof app.worker !== "string" ? app.worker?.user?.email : undefined) ||
          app.worker_details?.email ||
          "",
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

  // Handlers
  const handleProfileSubmit = async (data: any) => {
    if (showProfileModal) await handleCreateEmployerProfile(data);
    else if (userProfile?.id) await handleUpdateEmployerProfile(userProfile.id, data);
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setShowJobViewModal(true);
  };

  const handleEditJob = (job: Job) => {
    setJobToEdit(job);
    setShowJobEditModal(true);
  };

  const handleDeleteJob = (job: Job) => {
    setJobToDelete(job);
    setShowDeleteJobModal(true);
  };

  const confirmDeleteJob = async () => {
    if (jobToDelete) {
      const result = await dispatch(deleteJob(jobToDelete.id));
      if (deleteJob.fulfilled.match(result)) {
        toast.success("Job deleted successfully");
        if (userProfile?.id) handleFetchJobsByEmployer(userProfile.id);
      } else {
        toast.error("Failed to delete job");
      }
      setShowDeleteJobModal(false);
      setJobToDelete(null);
    }
  };

  // Computed values
  const stats = useMemo(
    () => ({
      totalApplications: applications.length,
      pending: applications.filter((a) => a.status === "Pending").length,
      interviews: applications.filter((a) =>
        ["Interview Scheduled", "Final Interview"].includes(a.status)
      ).length,
      hired: applications.filter((a) => a.status === "Accepted").length,
      rejected: applications.filter((a) => a.status === "Rejected").length,
      cancelled: applications.filter((a) => a.status === "Cancelled").length,
      activeJobs: jobs.length,
    }),
    [applications, jobs]
  );

  const filteredApplications = useMemo(() => {
    const statusMap: Record<string, string> = {
      "All Applications": "",
      Pending: "Pending",
      "Interview Scheduled": "Interview Scheduled",
      "Final Interview": "Final Interview",
      Accepted: "Accepted",
      Rejected: "Rejected",
      Cancelled: "Cancelled",
    };
    const status = statusMap[activeTab];
    return status ? applications.filter((app) => app.status === status) : applications;
  }, [activeTab, applications]);

  const recentApplications = applications.slice(0, 5);

  const filteredJobs = useMemo(() => {
    if (!selectedCategoryId) return jobs;
    return jobs.filter((job: any) => {
      const catRaw = job?.category;
      const catId: string =
        typeof catRaw === "string" ? catRaw : catRaw?.id ? String(catRaw.id) : "";
      return catId === selectedCategoryId;
    });
  }, [jobs, selectedCategoryId]);

  // Loading state
  if (!isClient || (profileLoading && !userProfile)) {
    return (
      <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-2xl w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 py-8 bg-gray-50 min-h-screen">
      <EmployerDashboardHeader
        companyName={userProfile?.company_name}
        industry={userProfile?.industry}
        hasProfile={hasUserProfile()}
        onPostJob={() => setShowJobPostModal(true)}
      />

      <div className="container space-y-8">
        {!hasUserProfile() && <ProfileWarningBanner onSetupNow={() => setShowProfileModal(true)} />}

        <DashboardTabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "Dashboard" && (
          <DashboardOverview
            stats={stats}
            recentApplications={recentApplications}
            companyName={userProfile?.company_name}
            industry={userProfile?.industry}
            onViewAllApplications={() => setActiveTab("All Applications")}
            onUpdateProfile={() => setShowEditModal(true)}
          />
        )}

        {activeTab === "My Jobs" && (
          <MyJobsList
            jobs={filteredJobs}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={setSelectedCategoryId}
            onPostJob={() => setShowJobPostModal(true)}
            onViewJob={handleViewJob}
            onEditJob={handleEditJob}
            onDeleteJob={handleDeleteJob}
          />
        )}

        {[
          "All Applications",
          "Pending",
          "Interview Scheduled",
          "Final Interview",
          "Accepted",
          "Rejected",
          "Cancelled",
        ].includes(activeTab) && (
          <ApplicationsList
            title={activeTab}
            applications={filteredApplications}
            stages={STAGES}
            loading={applicationsLoading}
            onEmailCandidate={(email) => (window.location.href = `mailto:${email}`)}
            onRejectApplication={(app) => {
              setApplicationToReject(app);
              setShowRejectModal(true);
            }}
          />
        )}

        {activeTab === "Settings" && <SettingsView onEditProfile={() => setShowEditModal(true)} />}
      </div>

      {/* Modals */}
      <EmployerProfileForm
        isOpen={showProfileModal || showEditModal}
        onClose={() => {
          setShowProfileModal(false);
          setShowEditModal(false);
        }}
        onSubmit={handleProfileSubmit}
        initialData={userProfile}
        loading={profileLoading}
        isEdit={showEditModal}
      />

      {showJobEditModal && jobToEdit && (
        <JobEditModal
          onClose={() => {
            setShowJobEditModal(false);
            setJobToEdit(null);
          }}
          job={jobToEdit}
          onSuccess={() => {
            if (userProfile?.id) handleFetchJobsByEmployer(userProfile.id);
            setShowJobEditModal(false);
            setJobToEdit(null);
          }}
        />
      )}

      <JobViewModal
        job={selectedJob!}
        isOpen={showJobViewModal}
        onClose={() => setShowJobViewModal(false)}
        onEdit={() => {
          setShowJobViewModal(false);
          if (selectedJob) handleEditJob(selectedJob);
        }}
      />

      <DeleteJobModal
        job={jobToDelete}
        isOpen={showDeleteJobModal}
        onClose={() => setShowDeleteJobModal(false)}
        onConfirm={confirmDeleteJob}
      />

      <RejectApplicationModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={() => {
          // TODO: Implement reject logic
          setShowRejectModal(false);
        }}
        rejectionReason={rejectionReason}
        onReasonChange={setRejectionReason}
      />

      {showJobPostModal && (
        <JobPostingModal
          onClose={() => setShowJobPostModal(false)}
          onSuccess={() => {
            setShowJobPostModal(false);
            if (userProfile?.id) handleFetchJobsByEmployer(userProfile.id);
            toast.success("Job posted successfully!");
          }}
        />
      )}
    </div>
  );
};

export default EmployerDashboardPage;
