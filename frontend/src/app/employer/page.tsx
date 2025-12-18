"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  Ban, CheckCircle, Mail, ArrowRight, Calendar, Phone, Users,
  AlertCircle, Briefcase, Shield, Building, MessageSquare, Home,
  Plus, FileText, Clock, XCircle, Star, Search, UserSearch, Edit2,
  Trash2, Eye, MoreVertical, MapPin, DollarSign, Pause, Play, Filter
} from "lucide-react";

// Components
import UploadNew from "@/component/UploadNew/UploadNew";
import EmployerProfileForm from "@/components/Employer/EmployerProfileForm";
import EmployerHeader from "@/components/Employer/EmployerHeader";
import DashboardStatCard from "@/components/Admin/Dashboard/DashboardStatCard";
import JobEditModal from "@/component/JobEditModal/JobEditModal";
import JobPostingModal from "@/component/JobPostingModal/JobPostingModal";

// Hooks & Utils
import { JobApplicationApi } from "@/services/jobApplicationApi";
import { useEmployerProfiles } from "@/Redux/Functions/useEmployerProfiles";
import { useJobs } from "@/Redux/Functions/useJobs"; 
import { RootState, AppDispatch } from "@/Redux/Store/Store";
import { Application, ApplicationStage, ApplicationStatus, Job, JobStatus } from "@/types/job.types";
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
  "Settings"
];

const STAGES: ApplicationStage[] = [
  "Application Review", "Phone Interview", "Technical Assessment", 
  "In-Person Interview", "Reference Check", "Offer Extended", "Completed",
];

const EmployerDashboardPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
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

  const { 
    jobs, 
    handleFetchJobsByEmployer 
  } = useJobs();

  const { categories, handleFetchCategories } = useCategories();

  // Local State
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [applicationToReject, setApplicationToReject] = useState<Application | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Job Management State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobViewModal, setShowJobViewModal] = useState(false);
  const [showJobEditModal, setShowJobEditModal] = useState(false);
  const [showJobPostModal, setShowJobPostModal] = useState(false);
  const [showDeleteJobModal, setShowDeleteJobModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  useEffect(() => { 
    setIsClient(true); 
    handleFetchCategories();
  }, []);

  // Handle URL Params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const postParam = searchParams?.get("postjob");
      setPostjob(postParam || null);
      if (postParam === "1") setActiveTab("Manage Jobs");
    }
  }, [searchParams]);

  // Fetch Profile & Data
  useEffect(() => {
    if (currentUserId && isAuthenticated) {
      handleFetchUserEmployerProfile(currentUserId);
    }
  }, [currentUserId, isAuthenticated, handleFetchUserEmployerProfile]);

  useEffect(() => {
    if (userProfile?.id) {
      fetchEmployerApplications();
      handleFetchJobsByEmployer(userProfile.id);
    }
  }, [userProfile, handleFetchJobsByEmployer]);

  useEffect(() => {
    if (postjob === "1" && !hasUserProfile()) {
      toast.error("Please complete your employer profile first");
      setShowProfileModal(true);
    }
  }, [postjob, hasUserProfile]);

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
      case "cancelled": return "Cancelled";
      case "final_interview": return "Final Interview";
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

  const handleProfileSubmit = async (data: any) => {
    if (showProfileModal) await handleCreateEmployerProfile(data);
    else if (userProfile?.id) await handleUpdateEmployerProfile(userProfile.id, data);
  };

  // Job Management Handlers
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
        if (userProfile?.id) {
          handleFetchJobsByEmployer(userProfile.id);
        }
      } else {
        toast.error("Failed to delete job");
      }
      setShowDeleteJobModal(false);
      setJobToDelete(null);
    }
  };

  const handleStatusToggle = async (job: Job) => {
    const newStatus: JobStatus = job.status === JobStatus.ACTIVE ? JobStatus.PAUSED : JobStatus.ACTIVE;
    const result = await dispatch(updateJobStatus({ jobId: job.id, status: newStatus }));

    if (updateJobStatus.fulfilled.match(result)) {
      toast.success(`Job ${newStatus === "active" ? "activated" : "paused"} successfully`);
      if (userProfile?.id) {
        handleFetchJobsByEmployer(userProfile.id);
      }
    } else {
      toast.error("Failed to update job status");
    }
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.ACTIVE: return "bg-green-100 text-green-800";
      case JobStatus.PAUSED: return "bg-yellow-100 text-yellow-800";
      case JobStatus.CLOSED: return "bg-gray-100 text-gray-800";
      case JobStatus.FILLED: return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return `KSh ${amount.toLocaleString()}`;
  };

  // --- Computed Stats ---
  const stats = useMemo(() => {
    return {
      totalApplications: applications.length,
      pending: applications.filter(a => a.status === "Pending").length,
      interviews: applications.filter(a => ["Interview Scheduled", "Final Interview"].includes(a.status)).length,
      hired: applications.filter(a => a.status === "Accepted").length,
      rejected: applications.filter(a => a.status === "Rejected").length,
      cancelled: applications.filter(a => a.status === "Cancelled").length,
      activeJobs: jobs.length
    };
  }, [applications, jobs]);

  // --- Filtered Lists ---
  const filteredApplications = useMemo(() => {
    switch (activeTab) {
      case "All Applications":
        return applications;
      case "Pending":
        return applications.filter(app => app.status === "Pending");
      case "Interview Scheduled":
        return applications.filter(app => app.status === "Interview Scheduled");
      case "Final Interview":
        return applications.filter(app => app.status === "Final Interview");
      case "Accepted":
        return applications.filter(app => app.status === "Accepted");
      case "Rejected":
        return applications.filter(app => app.status === "Rejected");
      case "Cancelled":
        return applications.filter(app => app.status === "Cancelled");
      default:
        return applications;
    }
  }, [activeTab, applications]);

  const recentApplications = applications.slice(0, 5);

  // Filter jobs by selected category
  const filteredJobs = useMemo(() => {
    if (!selectedCategoryId) return jobs;
    return jobs.filter((job: any) => {
      const catRaw = job?.category;
      const catId: string = typeof catRaw === "string" ? catRaw : catRaw?.id ? String(catRaw.id) : "";
      return catId === selectedCategoryId;
    });
  }, [jobs, selectedCategoryId]);

  const getDetailedStatus = (status: JobStatus) => {
  switch (status) {
    case JobStatus.ACTIVE:
      return { label: "Approved & Live", color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3 h-3" /> };
    case JobStatus.PAUSED:
      return { label: "Awaiting Admin Approval", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3 h-3" /> };
    case JobStatus.CANCELLED:
      return { label: "Rejected by Admin", color: "bg-red-100 text-red-700", icon: <XCircle className="w-3 h-3" /> };
    default:
      return { label: status.replace("_", " "), color: "bg-gray-100 text-gray-700", icon: <AlertCircle className="w-3 h-3" /> };
  }
};

  const getStatusBadgeClass = (status: ApplicationStatus) => {
    switch (status) {
      case "Rejected": return "bg-red-100 text-red-800";
      case "Accepted": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Interview Scheduled": return "bg-blue-100 text-blue-800";
      case "Final Interview": return "bg-purple-100 text-purple-800";
      case "Cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStageProgress = (stage: ApplicationStage) => ((STAGES.indexOf(stage) + 1) / STAGES.length) * 100;

  if (!isClient || (profileLoading && !userProfile)) {
    return (
      <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-2xl w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 py-8 bg-gray-50 min-h-screen">
      
      {/* Top Navigation Bar */}
      <div className="container mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="text-gray-500 hover:text-gray-900 transition flex items-center gap-2">
            <Home className="w-4 h-4" /> Home
          </button>
          <div className="h-4 w-[1px] bg-gray-300"></div>
          <div>
            {hasUserProfile() && userProfile ? (
              <>
                <h1 className="text-xl font-bold text-gray-800">{userProfile.company_name}</h1>
                {userProfile.industry && (
                  <p className="text-sm text-gray-500">{userProfile.industry}</p>
                )}
              </>
            ) : (
              <h1 className="text-xl font-bold text-gray-800">Employer Portal</h1>
            )}
          </div>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <button 
            onClick={() => router.push("/workers")} 
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm transition"
          >
            <UserSearch className="w-4 h-4" /> Find Workers
          </button>
          <button 
            onClick={() => router.push("/messages")} 
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm transition"
          >
            <MessageSquare className="w-4 h-4" /> Messages
          </button>
          <button 
            onClick={() => setShowJobPostModal(true)} 
            className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2 rounded-lg hover:bg-[#600000] shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Post a Job
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container space-y-8">
        
        {/* Profile Warning */}
        {!hasUserProfile() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-bold text-yellow-800">Complete Your Profile</h3>
                <p className="text-sm text-yellow-700">You need a profile to post jobs and manage applications.</p>
              </div>
            </div>
            <button onClick={() => setShowProfileModal(true)} className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700">
              Setup Now
            </button>
          </div>
        )}

        {/* Dashboard Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-t-lg font-medium text-sm transition-all relative whitespace-nowrap ${
                activeTab === tab 
                  ? "text-[#800000] bg-white border-x border-t border-gray-200 -mb-[1px] z-10" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
              }`}
            >
              {tab}
              {activeTab === tab && <div className="absolute top-0 left-0 w-full h-0.5 bg-[#800000] rounded-t-lg"></div>}
            </button>
          ))}
        </div>

        {/* --- DASHBOARD VIEW --- */}
        {activeTab === "Dashboard" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardStatCard title="Total Applications" value={stats.totalApplications} icon={<FileText className="h-5 w-5 text-blue-700" />} color="blue" />
              <DashboardStatCard title="Interviews Scheduled" value={stats.interviews} icon={<Users className="h-5 w-5 text-purple-700" />} color="purple" delay={0.1} />
              <DashboardStatCard title="Hired Candidates" value={stats.hired} icon={<CheckCircle className="h-5 w-5 text-green-700" />} color="green" delay={0.2} />
              <DashboardStatCard title="Active Jobs" value={stats.activeJobs} icon={<Briefcase className="h-5 w-5 text-orange-700" />} color="orange" delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity / Applications */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" /> Recent Applications
                  </h3>
                  <button onClick={() => setActiveTab("All Applications")} className="text-sm text-[#800000] hover:underline flex items-center gap-1">
                    View All <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                {recentApplications.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500">No applications yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentApplications.map(app => (
                      <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white hover:shadow-md transition cursor-pointer" onClick={() => setActiveTab("All Applications")}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {app.applicantName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{app.applicantName}</h4>
                            <p className="text-xs text-gray-500">{app.jobTitle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(app.status)}`}>
                            {app.status}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">{new Date(app.appliedDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
                
     
              {/* Quick Actions & Profile Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    
                    <button onClick={() => router.push("/employer/manage/jobs")} className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-[#800000] hover:text-white transition group">
                      <div className="bg-white p-2 rounded shadow-sm group-hover:text-[#800000]"><Briefcase className="w-4 h-4" /></div>
                      <span className="font-medium">Manage Jobs</span>
                    </button>
                    <button onClick={() => router.push("/workers")} className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-green-600 hover:text-white transition group">
                      <div className="bg-white p-2 rounded shadow-sm group-hover:text-green-600"><UserSearch className="w-4 h-4" /></div>
                      <span className="font-medium">Find Workers</span>
                    </button>
                    <button onClick={() => setShowEditModal(true)} className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-blue-600 hover:text-white transition group">
                      <div className="bg-white p-2 rounded shadow-sm group-hover:text-blue-600"><Shield className="w-4 h-4" /></div>
                      <span className="font-medium">Update Profile</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#800000] to-[#5a0000] rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-1">{userProfile?.company_name || "Company Profile"}</h3>
                    <p className="text-red-100 text-sm mb-4">{userProfile?.industry || "Industry not set"}</p>
                    <div className="flex gap-4 text-xs font-medium text-red-100">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-white">{stats.activeJobs}</span>
                        <span>Active Jobs</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-white">{stats.hired}</span>
                        <span>Hires</span>
                      </div>
                    </div>
                  </div>
                  <Briefcase className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MY JOBS VIEW --- */}
{activeTab === "My Jobs" && (
  <div className="bg-white shadow-sm rounded-xl overflow-hidden min-h-[500px]">
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-gray-500" /> My Job Postings
        </h2>
        <button 
          onClick={() => setShowJobPostModal(true)}
          className="text-sm bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          + Post New Job
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter by Category:
        </label>
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {selectedCategoryId && (
          <span className="text-sm text-gray-600 font-medium">
            ({filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'})
          </span>
        )}
      </div>
    </div>

    <div className="p-6">
      {filteredJobs.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium">
            {selectedCategoryId ? "No jobs in this category" : "No jobs posted yet"}
          </h3>
          <p className="text-gray-500">
            {selectedCategoryId 
              ? "Try selecting a different category or clear the filter." 
              : "Post your first job to start receiving applications."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => {
            const status = getDetailedStatus(job.status);
            return (
              <div key={job.id} className="p-5 rounded-xl hover:shadow-md transition bg-white group shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-800 transition mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm items-center mb-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {typeof job.category === "string" 
                          ? categories.find(c => c.id === job.category)?.name || "Uncategorized"
                          : job.category?.name || "Uncategorized"}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500"><MapPin className="w-3 h-3" /> {job.location}</span>
                      <span className="flex items-center gap-1 text-gray-500"><DollarSign className="w-3 h-3" /> {job.budget_min.toLocaleString()} - {job.budget_max.toLocaleString()}</span>
                    </div>
                    {job.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {job.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleViewJob(job)} className="p-2 text-gray-500 hover:bg-gray-100 rounded" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEditJob(job)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteJob(job)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
                
                {/* Status Message for Users */}
                <div className="mt-4 p-3 rounded-lg bg-gray-50 text-xs text-gray-600">
                  {job.status === JobStatus.ACTIVE ? (
                    "Your job is live! Workers can now see and apply to this position."
                  ) : job.status === JobStatus.PAUSED ? (
                    "An administrator is currently reviewing your job posting. This usually takes 12-24 hours."
                  ) : job.status === JobStatus.CANCELLED ? (
                    "This posting did not meet our guidelines. Please edit and resubmit or contact support."
                  ) : (
                    "Current status: " + job.status
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
)}

        {/* --- APPLICATIONS VIEWS (All, Pending, Interview Scheduled, etc.) --- */}
        {["All Applications", "Pending", "Interview Scheduled", "Final Interview", "Accepted", "Rejected", "Cancelled"].includes(activeTab) && (
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden min-h-[500px]">
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" /> {activeTab}
              </h2>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{filteredApplications.length}</span> 
                <span>applications</span>
              </div>
            </div>

            <div className="p-6">
              {applicationsLoading ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800000] mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading applications...</p>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-20">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
                  <p className="text-gray-500">No {activeTab.toLowerCase()} applications at this time.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredApplications.map((app) => (
                    <div key={app.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-[#800000]/30 hover:shadow-md transition-all group">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#800000] transition">{app.applicantName}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(app.status)}`}>{app.status}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">Applied for: <span className="font-medium text-gray-900">{app.jobTitle}</span></p>
                          
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Calendar className="w-3 h-3" /> {new Date(app.appliedDate).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Phone className="w-3 h-3" /> {app.phone}</span>
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Briefcase className="w-3 h-3" /> {app.experience}</span>
                          </div>
                        </div>

                        <div className="flex md:flex-col items-end justify-between gap-2">
                          <div className="flex gap-2">
                            <button onClick={() => window.location.href = `mailto:${app.email}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded border border-gray-200" title="Email Candidate"><Mail className="w-4 h-4" /></button>
                            {app.status !== "Rejected" && app.status !== "Accepted" && app.status !== "Cancelled" && (
                              <>
                                <button className="p-2 text-green-600 hover:bg-green-50 rounded border border-gray-200" title="Advance Application"><CheckCircle className="w-4 h-4" /></button>
                                <button onClick={() => { setApplicationToReject(app); setShowRejectModal(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded border border-gray-200" title="Reject Application"><Ban className="w-4 h-4" /></button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Stage: {app.stage}</span>
                          <span>{Math.round(getStageProgress(app.stage))}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-[#800000] h-1.5 rounded-full transition-all duration-500" style={{ width: `${getStageProgress(app.stage)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- SETTINGS VIEW --- */}
        {activeTab === "Settings" && (
          <div className="bg-white border border-gray-200 shadow-sm p-12 rounded-xl text-center min-h-[400px] flex flex-col items-center justify-center">
            <Shield className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Account Settings</h3>
            <p className="text-gray-500 mb-6">Manage your account preferences, notifications, and security settings.</p>
            <button onClick={() => setShowEditModal(true)} className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50">
              Edit Employer Profile
            </button>
          </div>
        )}

      </div>

      {/* Modals */}
      <EmployerProfileForm 
        isOpen={showProfileModal || showEditModal}
        onClose={() => { setShowProfileModal(false); setShowEditModal(false); }}
        onSubmit={handleProfileSubmit}
        initialData={userProfile}
        loading={profileLoading}
        isEdit={showEditModal}
      />

      {/* Job Edit Modal */}
      {showJobEditModal && jobToEdit && (
        <JobEditModal
          onClose={() => {
            setShowJobEditModal(false);
            setJobToEdit(null);
          }}
          job={jobToEdit}
          onSuccess={() => {
            if (userProfile?.id) {
              handleFetchJobsByEmployer(userProfile.id);
            }
            setShowJobEditModal(false);
            setJobToEdit(null);
          }}
        />
      )}

      {/* Job View Modal */}
      {showJobViewModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl my-8">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-xl text-gray-900">{selectedJob.title}</h3>
              <button onClick={() => setShowJobViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 text-sm">
                <span className={`px-3 py-1 rounded-full font-medium ${getStatusColor(selectedJob.status)}`}>
                  {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-4 h-4" /> {selectedJob.location}
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <DollarSign className="w-4 h-4" /> {formatCurrency(selectedJob.budget_min)} - {formatCurrency(selectedJob.budget_max)}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
              </div>

              {(selectedJob as any).requirements && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                  <p className="text-gray-600 whitespace-pre-line">{(selectedJob as any).requirements}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <span className="text-sm text-gray-500">Job Type</span>
                  <p className="font-medium text-gray-900">{selectedJob.job_type.replace("_", " ").toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Max Applicants</span>
                  <p className="font-medium text-gray-900">{selectedJob.max_applicants || "Unlimited"}</p>
                </div>
                {selectedJob.estimated_hours && (
                  <div>
                    <span className="text-sm text-gray-500">Estimated Hours</span>
                    <p className="font-medium text-gray-900">{selectedJob.estimated_hours} hours</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-500">Posted</span>
                  <p className="font-medium text-gray-900">
                    {selectedJob.created_at ? new Date(selectedJob.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button 
                onClick={() => setShowJobViewModal(false)} 
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowJobViewModal(false);
                  handleEditJob(selectedJob);
                }} 
                className="px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000]"
              >
                Edit Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Job Confirmation Modal */}
      {showDeleteJobModal && jobToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Delete Job Posting</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Are you sure you want to delete <span className="font-semibold">"{jobToDelete.title}"</span>?
            </p>
            <p className="text-sm text-red-600 mb-4">
              This action cannot be undone. All applications for this job will remain but the job posting will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteJobModal(false)} 
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteJob}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Reject Application</h3>
            <p className="text-sm text-gray-500 mb-4">Are you sure you want to reject this candidate? They will be notified.</p>
            <textarea 
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32 focus:ring-2 focus:ring-red-500 outline-none resize-none" 
              placeholder="Optional: Provide a reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700">Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Reject Candidate</button>
            </div>
          </div>
        </div>
      )}

      {/* Job Posting Modal */}
      {showJobPostModal && (
        <JobPostingModal 
          onClose={() => setShowJobPostModal(false)}
          onSuccess={() => {
            setShowJobPostModal(false);
            // Refresh jobs list after successful creation
            if (userProfile?.id) {
              handleFetchJobsByEmployer(userProfile.id);
            }
            toast.success("Job posted successfully!");
          }}
        />
      )}
    </div>
  );
};

export default EmployerDashboardPage;
