"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  ChevronDown,
  ChevronRight,
  MapPin,
  User,
  DollarSign,
  Calendar,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Briefcase
} from "lucide-react";
import ProtectedRoute from "@/component/Authentication/ProtectedRoute";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchWorkerProfiles,
} from "@/Redux/Features/workerProfilesSlice";
import api from "@/lib/axios";
import { WorkerProfile, VERIFICATION_STATUS_OPTIONS } from "@/types/worker.types";
import { JobApplicationWithDetails, ApplicationStatus } from "@/types/jobApplication.types";
import { JobApplicationApi } from "@/services/jobApplicationApi";

// Local cache for applications per worker to avoid mutating global state
type WorkerApplicationsCache = Record<string, { 
  applications: JobApplicationWithDetails[]; 
  loading: boolean; 
  error: string | null; 
  loaded: boolean; 
}>;

const AllWorkersAdministration: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profiles, loading, error, pagination } = useSelector((state: RootState) => state.workerProfiles);

  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [workerApplications, setWorkerApplications] = useState<WorkerApplicationsCache>({});

  // Local application view modal state
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationToView, setApplicationToView] = useState<JobApplicationWithDetails | null>(null);
  const [processingApplicationIds, setProcessingApplicationIds] = useState<Set<string>>(new Set());
  const openViewApplication = (application: JobApplicationWithDetails) => { 
    setApplicationToView(application); 
    setShowApplicationModal(true); 
  };
  const closeViewApplication = () => { 
    setShowApplicationModal(false); 
    setApplicationToView(null); 
  };

  // Helper function to enrich applications with job details
  const enrichApplicationsWithJobDetails = async (applications: JobApplicationWithDetails[]) => {
    const enrichedApps = [...applications];
    const jobCache = new Map();
    
    for (let i = 0; i < enrichedApps.length; i++) {
      const app = enrichedApps[i];
      if (!app.job_details && app.job) {
        try {
          // Check cache first
          if (jobCache.has(app.job)) {
            enrichedApps[i] = { ...app, job_details: jobCache.get(app.job) };
          } else {
            // Fetch job details
            const jobResponse = await api.get(`/jobs/${app.job}/`);
            const jobDetails = jobResponse.data || jobResponse;
            jobCache.set(app.job, jobDetails);
            enrichedApps[i] = { ...app, job_details: jobDetails };
          }
        } catch (error) {
          console.warn(`Failed to fetch job details for job ${app.job}:`, error);
          
        }
      }
    }
    
    return enrichedApps;
  };

  // Admin application management functions
  const handleUpdateApplicationStatus = async (applicationId: string, status: ApplicationStatus, workerId: string) => {
    try {
      setProcessingApplicationIds(prev => new Set([...prev, applicationId]));
      
      await JobApplicationApi.updateApplication(applicationId, { status });

      // Update local cache for this worker
      setWorkerApplications(prev => ({
        ...prev,
        [workerId]: {
          ...prev[workerId],
          applications: prev[workerId]?.applications.map(app => 
            app.id === applicationId 
              ? { ...app, status, responded_at: new Date().toISOString() }
              : app
          ) || []
        }
      }));

      
      if (applicationToView?.id === applicationId) {
        setApplicationToView(prev => prev ? {
          ...prev,
          status,
          responded_at: new Date().toISOString()
        } : null);
      }
      
    } catch (e: any) {
      console.error('Error updating application status:', e);
      
    } finally {
      setProcessingApplicationIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  const handleApproveApplication = (applicationId: string, workerId: string) => {
    handleUpdateApplicationStatus(applicationId, 'accepted', workerId);
  };

  const handleRejectApplication = (applicationId: string, workerId: string) => {
    handleUpdateApplicationStatus(applicationId, 'rejected', workerId);
  };

  const handleMoveToReviewed = (applicationId: string, workerId: string) => {
    handleUpdateApplicationStatus(applicationId, 'reviewed', workerId);
  };

  const formatCurrency = (amount?: unknown) => {
    if (amount === null || amount === undefined) return 'N/A';
    const n = typeof amount === 'string' ? Number(amount) : (amount as number);
    if (Number.isNaN(n)) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  };

  const formatDate = (dateString?: string) => dateString
    ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Not specified';

  const getVerificationColor = (status: string) => {
    const option = VERIFICATION_STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.color || 'text-gray-600 bg-gray-100';
  };

  const getApplicationStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'accepted':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'reviewed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getApplicationStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'accepted':
        return <CheckCircle className="w-3 h-3" />;
      case 'rejected':
        return <AlertCircle className="w-3 h-3" />;
      case 'reviewed':
        return <Star className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  // Initial fetch
  useEffect(() => {
    dispatch(fetchWorkerProfiles());
  }, [dispatch]);

  // Filter profiles client-side by search (location, bio, hourly_rate)
  const filteredProfiles = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) =>
      p.location_text.toLowerCase().includes(q) ||
      p.bio.toLowerCase().includes(q) ||
      p.hourly_rate.toString().includes(q) ||
      p.verification_status.toLowerCase().includes(q)
    );
  }, [profiles, searchTerm]);

  const toggleExpand = async (profile: WorkerProfile) => {
    const id = profile.id;
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    
    if (!expanded[id] && !workerApplications[id]?.loaded) {
      setWorkerApplications((prev) => ({
        ...prev,
        [id]: { applications: [], loading: true, error: null, loaded: false },
      }));
      try {
       
        const resp = await JobApplicationApi.getAllApplications({ 
          ordering: '-applied_at',
          expand: 'job_details,worker_details,employer_details'
        });
        const allApps = resp.applications as JobApplicationWithDetails[];
        
       
        if (allApps && allApps.length > 0) {
          console.log('API Response - First application structure:', allApps[0]);
          console.log('Job details exists?', !!allApps[0].job_details);
          console.log('Job details:', allApps[0].job_details);
        }
        
        const filteredData = (allApps || []).filter((app) => app.worker === id || app.worker_details?.id === id);
        
        // Enrich applications with missing job details
        const enrichedData = await enrichApplicationsWithJobDetails(filteredData);
        
        setWorkerApplications((prev) => ({
          ...prev,
          [id]: { applications: enrichedData, loading: false, error: null, loaded: true },
        }));
      } catch (e: any) {
        setWorkerApplications((prev) => ({
          ...prev,
          [id]: { applications: [], loading: false, error: e?.message || "Failed to load applications", loaded: true },
        }));
      }
    }
  };

  const handlePageChange = async (page: number) => {
    await dispatch(fetchWorkerProfiles({ page, limit: pagination.limit }));
  };

  const expandAll = async () => {
    const ids = filteredProfiles.map((p) => p.id);
    // Open all rows
    setExpanded((prev) => {
      const next = { ...prev };
      ids.forEach((id) => (next[id] = true));
      return next;
    });

    // Determine which workers need fetching
    const toFetch = ids.filter((id) => !workerApplications[id]?.loaded);
    if (toFetch.length === 0) return;

    setWorkerApplications((prev) => {
      const next = { ...prev } as WorkerApplicationsCache;
      toFetch.forEach((id) => {
        next[id] = { applications: [], loading: true, error: null, loaded: false };
      });
      return next;
    });

    try {
      // Fetch all applications once and distribute to workers
      const resp = await JobApplicationApi.getAllApplications({ 
        ordering: '-applied_at',
        expand: 'job_details,worker_details,employer_details'
      });
      const allApps = resp.applications as JobApplicationWithDetails[];
      
      // Debug: Log the structure for expandAll
      if (allApps && allApps.length > 0) {
        console.log('ExpandAll - First application structure:', allApps[0]);
        console.log('ExpandAll - Job details:', allApps[0].job_details);
      }
      
      // Enrich all applications with job details first
      const enrichedAllApps = await enrichApplicationsWithJobDetails(allApps || []);
      
      setWorkerApplications((prev) => {
        const next = { ...prev } as WorkerApplicationsCache;
        toFetch.forEach((id) => {
          const data = enrichedAllApps.filter((app) => app.worker === id || app.worker_details?.id === id);
          next[id] = { applications: data, loading: false, error: null, loaded: true };
        });
        return next;
      });
    } catch (e: any) {
      setWorkerApplications((prev) => {
        const next = { ...prev } as WorkerApplicationsCache;
        toFetch.forEach((id) => {
          next[id] = { applications: [], loading: false, error: e?.message || 'Failed to load applications', loaded: true };
        });
        return next;
      });
    }
  };

  const collapseAll = () => {
    const ids = filteredProfiles.map((p) => p.id);
    setExpanded((prev) => {
      const next = { ...prev };
      ids.forEach((id) => (next[id] = false));
      return next;
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto container">
          {/* Header */}
          <div className="bg-white border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h1 className="text-xl font-bold text-gray-800">Workers Administration</h1>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by location, skills, rate, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-red-800"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={expandAll}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Expand all
                  </button>
                  <button
                    onClick={collapseAll}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Collapse all
                  </button>
                </div>
              </div>
            </div>
            {error && (
              <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
            )}
          </div>

          {/* Workers List */}
          <div className="bg-white shadow-sm border border-gray-200 overflow-hidden rounded-md">
            {loading ? (
              <div className="p-6 text-gray-600">Loading workers...</div>
            ) : filteredProfiles.length === 0 ? (
              <div className="p-6 text-gray-600">No workers found.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredProfiles.map((profile) => {
                  const isOpen = !!expanded[profile.id];
                  const cache = workerApplications[profile.id];
                  return (
                    <li key={profile.id}>
                      {/* Row */}
                      <button
                        onClick={() => toggleExpand(profile)}
                        className="w-full text-left px-6 py-4 hover:bg-gray-50 flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="pt-1 text-gray-500">
                            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <User className="text-red-900" size={18} />
                              <span className="font-semibold text-gray-900">Worker #{profile.id}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getVerificationColor(profile.verification_status)}`}>
                                {VERIFICATION_STATUS_OPTIONS.find(opt => opt.value === profile.verification_status)?.label || profile.verification_status}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-600 flex flex-wrap items-center gap-4">
                              <span className="inline-flex items-center gap-1"><MapPin size={14} /> {profile.location_text}</span>
                              <span className="inline-flex items-center gap-1"><DollarSign size={14} /> {formatCurrency(profile.hourly_rate)}/hr</span>
                              <span className="inline-flex items-center gap-1">Experience: {profile.years_experience} years</span>
                              <span className={`inline-flex items-center gap-1 ${profile.is_available ? 'text-green-600' : 'text-red-600'}`}>
                                {profile.is_available ? 'Available' : 'Not Available'}
                              </span>
                            </div>
                            {profile.bio && (
                              <div className="mt-1 text-xs text-gray-500 line-clamp-2">{profile.bio}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">Created: {new Date(profile.created_at).toLocaleDateString()}</div>
                      </button>

                      {/* Collapsible content */}
                      {isOpen && (
                        <div className="px-10 pb-5">
                          {/* Job Applications for this worker */}
                          <div className="mt-1 mb-3 text-sm font-medium text-gray-700">Job Applications</div>
                          {cache?.loading ? (
                            <div className="text-gray-600">Loading applications...</div>
                          ) : cache?.error ? (
                            <div className="text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm">{cache.error}</div>
                          ) : (cache?.applications?.length || 0) === 0 ? (
                            <div className="text-gray-600">No job applications from this worker.</div>
                          ) : (
                            <div className="grid md:grid-cols-2 gap-3">
                              {cache.applications.map((application) => (
                                <div key={application.id} className="border border-gray-200 rounded p-4">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-gray-900 truncate pr-2">
                                      {application.job_details?.title || 
                                       (application.job ? `Job ID: ${application.job}` : 'Unknown Job')}
                                    </h4>
                                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getApplicationStatusColor(application.status)}`}>
                                      {getApplicationStatusIcon(application.status)}
                                      {application.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-2">
                                    {application.employer_details?.company_name || 'Unknown Company'}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                                    <span className="inline-flex items-center gap-1">
                                      <DollarSign size={12} />
                                      Proposed: {formatCurrency(application.proposed_rate)}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                      <Calendar size={12} />
                                      Applied: {formatDate(application.applied_at)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      {application.status === 'pending' && (
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleMoveToReviewed(application.id, profile.id);
                                            }}
                                            disabled={processingApplicationIds.has(application.id)}
                                            className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 px-2 py-1 rounded transition-colors"
                                            title="Mark as Reviewed"
                                          >
                                            {processingApplicationIds.has(application.id) ? '...' : 'Review'}
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleApproveApplication(application.id, profile.id);
                                            }}
                                            disabled={processingApplicationIds.has(application.id)}
                                            className="text-xs bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 px-2 py-1 rounded transition-colors"
                                            title="Accept Application"
                                          >
                                            {processingApplicationIds.has(application.id) ? '...' : 'Accept'}
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRejectApplication(application.id, profile.id);
                                            }}
                                            disabled={processingApplicationIds.has(application.id)}
                                            className="text-xs bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 px-2 py-1 rounded transition-colors"
                                            title="Reject Application"
                                          >
                                            {processingApplicationIds.has(application.id) ? '...' : 'Reject'}
                                          </button>
                                        </>
                                      )}
                                      {application.status === 'reviewed' && (
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleApproveApplication(application.id, profile.id);
                                            }}
                                            disabled={processingApplicationIds.has(application.id)}
                                            className="text-xs bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 px-2 py-1 rounded transition-colors"
                                            title="Accept Application"
                                          >
                                            {processingApplicationIds.has(application.id) ? '...' : 'Accept'}
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRejectApplication(application.id, profile.id);
                                            }}
                                            disabled={processingApplicationIds.has(application.id)}
                                            className="text-xs bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 px-2 py-1 rounded transition-colors"
                                            title="Reject Application"
                                          >
                                            {processingApplicationIds.has(application.id) ? '...' : 'Reject'}
                                          </button>
                                        </>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => openViewApplication(application)}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                      View Details
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} workers
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="px-3 py-1.5 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.total_pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="px-3 py-1.5 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Application Modal */}
        <AnimatePresence>
          {showApplicationModal && applicationToView && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto"
              >
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Job Application Details</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getApplicationStatusColor(applicationToView.status)}`}>
                        {getApplicationStatusIcon(applicationToView.status)}
                        {applicationToView.status.charAt(0).toUpperCase() + applicationToView.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeViewApplication}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Cover Letter</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {applicationToView.cover_letter}
                        </p>
                      </div>
                    </div>

                    {applicationToView.worker_notes && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Worker Notes</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 leading-relaxed">
                            {applicationToView.worker_notes}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Job Details */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Job Applied For</h4>
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="text-blue-900" size={18} />
                          <h5 className="font-medium text-blue-900">
                            {applicationToView.job_details?.title || 
                             (applicationToView.job ? `Job ID: ${applicationToView.job}` : 'Unknown Job')}
                          </h5>
                        </div>
                        <p className="text-blue-800 text-sm mb-2">
                          {applicationToView.employer_details?.company_name || 'Unknown Company'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-blue-700">
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={14} />
                            {applicationToView.job_details?.location}
                          </span>
                          {applicationToView.job_details?.budget_min && applicationToView.job_details?.budget_max && (
                            <span className="inline-flex items-center gap-1">
                              <DollarSign size={14} />
                              {formatCurrency(applicationToView.job_details.budget_min)} - {formatCurrency(applicationToView.job_details.budget_max)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-3">Proposed Rate</h5>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(applicationToView.proposed_rate)}
                      </p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">Application Details</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Applied Date:</span>
                          <span className="text-gray-900">{formatDate(applicationToView.applied_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Available From:</span>
                          <span className="text-gray-900">{formatDate(applicationToView.availability_start)}</span>
                        </div>
                        {applicationToView.responded_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Responded:</span>
                            <span className="text-gray-900">{formatDate(applicationToView.responded_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">Worker Details</h5>
                      <div className="space-y-2 text-sm">
                        {applicationToView.worker_details?.full_name && (
                          <p className="font-medium">{applicationToView.worker_details.full_name}</p>
                        )}
                        {applicationToView.worker_details?.email && (
                          <p className="text-gray-600">{applicationToView.worker_details.email}</p>
                        )}
                        {applicationToView.worker_details?.phone_number && (
                          <p className="text-gray-600">{applicationToView.worker_details.phone_number}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-between mt-8 pt-6 border-t border-gray-200">
                  <div className="flex gap-2">
                    {applicationToView.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            const workerId = profiles.find(p => 
                              p.user === applicationToView.worker || 
                              p.id === applicationToView.worker_details?.id
                            )?.id;
                            if (workerId) handleMoveToReviewed(applicationToView.id, workerId);
                          }}
                          disabled={processingApplicationIds.has(applicationToView.id)}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          {processingApplicationIds.has(applicationToView.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                          Mark as Reviewed
                        </button>
                        <button
                          onClick={() => {
                            const workerId = profiles.find(p => 
                              p.user === applicationToView.worker || 
                              p.id === applicationToView.worker_details?.id
                            )?.id;
                            if (workerId) handleApproveApplication(applicationToView.id, workerId);
                          }}
                          disabled={processingApplicationIds.has(applicationToView.id)}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          {processingApplicationIds.has(applicationToView.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Accept Application
                        </button>
                        <button
                          onClick={() => {
                            const workerId = profiles.find(p => 
                              p.user === applicationToView.worker || 
                              p.id === applicationToView.worker_details?.id
                            )?.id;
                            if (workerId) handleRejectApplication(applicationToView.id, workerId);
                          }}
                          disabled={processingApplicationIds.has(applicationToView.id)}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          {processingApplicationIds.has(applicationToView.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          Reject Application
                        </button>
                      </>
                    )}
                    {applicationToView.status === 'reviewed' && (
                      <>
                        <button
                          onClick={() => {
                            const workerId = profiles.find(p => 
                              p.user === applicationToView.worker || 
                              p.id === applicationToView.worker_details?.id
                            )?.id;
                            if (workerId) handleApproveApplication(applicationToView.id, workerId);
                          }}
                          disabled={processingApplicationIds.has(applicationToView.id)}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          {processingApplicationIds.has(applicationToView.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Accept Application
                        </button>
                        <button
                          onClick={() => {
                            const workerId = profiles.find(p => 
                              p.user === applicationToView.worker || 
                              p.id === applicationToView.worker_details?.id
                            )?.id;
                            if (workerId) handleRejectApplication(applicationToView.id, workerId);
                          }}
                          disabled={processingApplicationIds.has(applicationToView.id)}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          {processingApplicationIds.has(applicationToView.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          Reject Application
                        </button>
                      </>
                    )}
                    {(applicationToView.status === 'accepted' || applicationToView.status === 'rejected') && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Application {applicationToView.status === 'accepted' ? 'accepted' : 'rejected'}
                        {applicationToView.responded_at && (
                          <span className="ml-2">on {formatDate(applicationToView.responded_at)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={closeViewApplication}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
};

export default AllWorkersAdministration;