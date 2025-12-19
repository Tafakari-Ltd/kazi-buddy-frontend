"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProtectedRoute from "@/component/Authentication/ProtectedRoute";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { fetchEmployerProfiles } from "@/Redux/Features/employerProfilesSlice";
import api from "@/lib/axios";
import { Job, JOB_STATUS_OPTIONS, URGENCY_LEVEL_OPTIONS } from "@/types/job.types";
import { Briefcase, CheckCircle, Clock, MapPin, DollarSign, Calendar, X, Users } from "lucide-react";

// Components
import EmployerFilters from "@/components/Admin/Employers/EmployerFilters";
import EmployerListRow from "@/components/Admin/Employers/EmployerListRow";
import JobPreviewModal from "@/components/Admin/Employers/JobPreviewModal";

const AllEmployersAdministration: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profiles, loading, error, pagination } = useSelector(
    (state: RootState) => state.employerProfiles,
  );

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"by_employer" | "by_status">("by_employer");
  const [jobStatusFilter, setJobStatusFilter] = useState<"all" | string>("all");
  
  // Data States
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loadingAllJobs, setLoadingAllJobs] = useState(false);
  const [processingJobIds, setProcessingJobIds] = useState<Set<string>>(new Set());
  const [pendingJobIds, setPendingJobIds] = useState<Set<string>>(new Set());

  // Modal State
  const [jobToView, setJobToView] = useState<Job | null>(null);

  // Helper Functions
  const formatCurrency = (n: any) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(Number(n) || 0);
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const getStatusColor = (s: string) => JOB_STATUS_OPTIONS.find((o) => o.value === s)?.color || "text-gray-600 bg-gray-100";
  const getUrgencyColor = (u: string) => URGENCY_LEVEL_OPTIONS.find((o) => o.value === u)?.color || "text-gray-600 bg-gray-100";

  // Initial Fetch
  useEffect(() => {
    dispatch(fetchEmployerProfiles());
    fetchPendingJobs();
  }, [dispatch]);

  useEffect(() => {
    if (viewMode === "by_status") {
      fetchAllJobs();
    }
  }, [viewMode]);

  const fetchAllJobs = async () => {
    setLoadingAllJobs(true);
    try {
      const resp = await api.get("/jobs/");
      const data = resp && (resp as any).data ? (resp as any).data : Array.isArray(resp) ? resp : [];
      setAllJobs(data as Job[]);
    } catch (e) {
      console.error("Failed to fetch jobs", e);
    } finally {
      setLoadingAllJobs(false);
    }
  };

  const fetchPendingJobs = async () => {
    try {
      const resp = await api.get("/adminpanel/jobs/pending/");
      const raw = resp && (resp as any).data ? (resp as any).data : Array.isArray(resp) ? resp : [];
      const ids = new Set<string>((raw as any[]).map((j) => j.id).filter(Boolean));
      setPendingJobIds(ids);
    } catch (e) {
      console.error("Failed to fetch pending jobs", e);
    }
  };

  // Actions
  const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      setProcessingJobIds((prev) => new Set([...prev, jobId]));
      
      if (newStatus === 'active' && pendingJobIds.has(jobId)) {
        
        await api.post(`/adminpanel/jobs/${jobId}/approve/`);
      } else {
      
        await api.post(`/jobs/${jobId}/status/`, { status: newStatus });
      }

      setAllJobs((prev) => prev.map((job) => job.id === jobId ? { ...job, status: newStatus as any } : job));
      
      
      setPendingJobIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });

      if (jobToView?.id === jobId) {
        setJobToView(prev => prev ? { ...prev, status: newStatus as any } : null);
      }

    } catch (e) {
      console.error("Error updating job", e);
    } finally {
      setProcessingJobIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };


  const filteredProfiles = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return profiles.filter(p => 
      p.company_name.toLowerCase().includes(q) || 
      p.industry.toLowerCase().includes(q) || 
      p.location.toLowerCase().includes(q)
    );
  }, [profiles, searchTerm]);

  const filteredJobs = useMemo(() => {
    if (jobStatusFilter === "all") return allJobs;
    return allJobs.filter((j) => j.status === jobStatusFilter);
  }, [allJobs, jobStatusFilter]);

 
  const jobStats = useMemo(() => ({
    all: allJobs.length,
    draft: allJobs.filter(j => j.status === 'draft').length,
    active: allJobs.filter(j => j.status === 'active').length,
    paused: allJobs.filter(j => j.status === 'paused').length,
    closed: allJobs.filter(j => j.status === 'closed').length,
    cancelled: allJobs.filter(j => j.status === 'cancelled').length,
  }), [allJobs]);

  const expandAll = () => {
    const next = { ...expanded };
    filteredProfiles.forEach(p => next[p.id] = true);
    setExpanded(next);
  };

  const collapseAll = () => setExpanded({});

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto container">
          <EmployerFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            setViewMode={setViewMode}
            jobStatusFilter={jobStatusFilter}
            setJobStatusFilter={setJobStatusFilter}
            expandAll={expandAll}
            collapseAll={collapseAll}
            stats={jobStats}
          />

          {error && <div className="mb-4 text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">{error}</div>}

          {/* VIEW: BY EMPLOYER */}
          {viewMode === "by_employer" && (
            <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading employers...</div>
              ) : filteredProfiles.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No employers found.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredProfiles.map((profile) => (
                    <EmployerListRow
                      key={profile.id}
                      profile={profile}
                      isOpen={!!expanded[profile.id]}
                      onToggle={() => setExpanded(prev => ({ ...prev, [profile.id]: !prev[profile.id] }))}
                      onViewJob={(job) => setJobToView(job)}
                      onJobStatusChange={handleUpdateJobStatus}
                      processingJobIds={processingJobIds}
                      pendingJobIds={pendingJobIds}
                    />
                  ))}
                </ul>
              )}
              
              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                  <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.total_pages}</span>
                  <div className="flex gap-2">
                    <button 
                      disabled={pagination.page <= 1} 
                      onClick={() => dispatch(fetchEmployerProfiles({ page: pagination.page - 1 }))}
                      className="px-3 py-1 border rounded bg-white disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <button 
                      disabled={pagination.page >= pagination.total_pages} 
                      onClick={() => dispatch(fetchEmployerProfiles({ page: pagination.page + 1 }))}
                      className="px-3 py-1 border rounded bg-white disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: BY JOB STATUS */}
          {viewMode === "by_status" && (
            <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">
              {loadingAllJobs ? (
                <div className="p-8 text-center text-gray-500">Loading jobs...</div>
              ) : filteredJobs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No jobs found in this category.</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="p-6 hover:bg-gray-50 group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Briefcase className="text-red-900" size={18} />
                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(job.status)}`}>
                              {JOB_STATUS_OPTIONS.find((opt) => opt.value === job.status)?.label || job.status}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getUrgencyColor(job.urgency_level)}`}>
                              {URGENCY_LEVEL_OPTIONS.find((opt) => opt.value === job.urgency_level)?.label || job.urgency_level}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {formatCurrency((job as any).budget_min)} - {formatCurrency((job as any).budget_max)}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Start: {formatDate(job.start_date)}</span>
                            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Max: {job.max_applicants}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          {(job.status === "draft" || job.status === "paused") && (
                            <>
                              <button onClick={() => handleUpdateJobStatus(job.id, "active")} disabled={processingJobIds.has(job.id)} className="text-sm bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                                {processingJobIds.has(job.id) ? "..." : <><CheckCircle className="w-4 h-4" /> Approve & Activate</>}
                              </button>
                              <button onClick={() => handleUpdateJobStatus(job.id, "cancelled")} disabled={processingJobIds.has(job.id)} className="text-sm bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                                {processingJobIds.has(job.id) ? "..." : <><X className="w-4 h-4" /> Reject</>}
                              </button>
                            </>
                          )}
                          {pendingJobIds.has(job.id) && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="w-3 h-3" /> Awaiting Admin Approval</span>
                          )}
                          {!pendingJobIds.has(job.id) && job.status === "active" && (
                            <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Approved & Active</span>
                          )}
                        </div>
                        <button onClick={() => setJobToView(job)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <JobPreviewModal isOpen={!!jobToView} onClose={() => setJobToView(null)} job={jobToView} />
      </div>
    </ProtectedRoute>
  );
};

export default AllEmployersAdministration;