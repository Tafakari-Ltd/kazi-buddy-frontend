"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProtectedRoute from "@/component/Authentication/ProtectedRoute";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { fetchWorkerProfiles } from "@/Redux/Features/workerProfilesSlice";
import api from "@/lib/axios";
import { JobApplicationApi } from "@/services/jobApplicationApi";
import { JobApplicationWithDetails, ApplicationStatus } from "@/types/jobApplication.types";

// Import Components
import WorkerFilters from "@/components/Admin/Workers/WorkerFilters";
import WorkerListRow from "@/components/Admin/Workers/WorkerListRow";
import ApplicationViewModal from "@/components/Admin/Workers/ApplicationViewModal";
import ApplicationStatusBadge from "@/components/Admin/Workers/ApplicationStatusBadge";
import { User, Briefcase, Calendar, DollarSign } from "lucide-react";

const AllWorkersAdministration: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profiles, loading, error, pagination } = useSelector((state: RootState) => state.workerProfiles);

  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"by_worker" | "by_status">("by_worker");
  const [applicationFilter, setApplicationFilter] = useState<"all" | ApplicationStatus>("all");
  
  // States for "By Status" view
  const [allApplications, setAllApplications] = useState<JobApplicationWithDetails[]>([]);
  const [loadingAllApps, setLoadingAllApps] = useState(false);

  // Modal State
  const [applicationToView, setApplicationToView] = useState<JobApplicationWithDetails | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Initial Fetch
  useEffect(() => {
    dispatch(fetchWorkerProfiles());
  }, [dispatch]);

  // Fetch all applications if switching to status view
  useEffect(() => {
    if (viewMode === "by_status") {
      fetchAllApplications();
    }
  }, [viewMode]);

  const fetchAllApplications = async () => {
    setLoadingAllApps(true);
    try {
      const resp = await JobApplicationApi.getAllApplications({
        ordering: "-applied_at",
        expand: "job_details,worker_details,employer_details",
      });
      // We also need to enrich them if job_details are missing, similar to the row logic
      // For brevity in this controller, assume logic is similar or API provides it via expand
      setAllApplications(resp.applications as unknown as JobApplicationWithDetails[]);
    } catch (e) {
      console.error("Failed to fetch applications", e);
    } finally {
      setLoadingAllApps(false);
    }
  };

  const handleUpdateStatus = async (appId: string, status: ApplicationStatus, workerId: string) => {
    try {
      setProcessingIds(prev => new Set([...prev, appId]));
      await JobApplicationApi.updateApplication(appId, { status });
      
      // Update local state for "by_status" view
      setAllApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      
      // Update modal if open
      if (applicationToView?.id === appId) {
        setApplicationToView(prev => prev ? { ...prev, status } : null);
      }

      // Note: WorkerListRow manages its own state, so it will need to re-fetch or we force a re-render.
      // Since we don't share state down to rows (they fetch themselves), the easiest way to reflect change 
      // in the row is to toggle it close/open or for the row to listen to a context. 
      // Given the architecture, the user might need to refresh the row (toggle) to see the status change there 
      // if we don't lift state up. However, for admin actions, usually the modal is primary.
      
    } catch (error) {
      console.error("Status update failed", error);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(appId);
        return next;
      });
    }
  };

  // Filter Logic
  const filteredProfiles = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return profiles.filter(p => 
      p.location_text.toLowerCase().includes(q) || 
      p.user?.full_name?.toLowerCase().includes(q) ||
      p.verification_status.includes(q)
    );
  }, [profiles, searchTerm]);

  const filteredApplications = useMemo(() => {
    if (applicationFilter === "all") return allApplications;
    return allApplications.filter(a => a.status === applicationFilter);
  }, [allApplications, applicationFilter]);

  // Stats for the filter buttons
  const appStats = useMemo(() => ({
    all: allApplications.length,
    pending: allApplications.filter(a => a.status === 'pending').length,
    reviewed: allApplications.filter(a => a.status === 'reviewed').length,
    accepted: allApplications.filter(a => a.status === 'accepted').length,
    rejected: allApplications.filter(a => a.status === 'rejected').length,
  }), [allApplications]);

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
          <WorkerFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            setViewMode={setViewMode}
            expandAll={expandAll}
            collapseAll={collapseAll}
            applicationFilter={applicationFilter}
            setApplicationFilter={setApplicationFilter}
            stats={appStats}
          />

          {error && <div className="mb-4 text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">{error}</div>}

          {/* LIST VIEW: BY WORKER */}
          {viewMode === "by_worker" && (
            <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading workers...</div>
              ) : filteredProfiles.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No workers found matching your search.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredProfiles.map(profile => (
                    <WorkerListRow
                      key={profile.id}
                      profile={profile}
                      isOpen={!!expanded[profile.id]}
                      onToggle={() => setExpanded(prev => ({ ...prev, [profile.id]: !prev[profile.id] }))}
                      onViewApplication={(app) => setApplicationToView(app)}
                      onUpdateStatus={handleUpdateStatus}
                      processingIds={processingIds}
                    />
                  ))}
                </ul>
              )}
              {/* Simple Pagination Control */}
              {pagination.total_pages > 1 && (
                <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                  <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.total_pages}</span>
                  <div className="flex gap-2">
                    <button 
                      disabled={pagination.page <= 1} 
                      onClick={() => dispatch(fetchWorkerProfiles({ page: pagination.page - 1 }))}
                      className="px-3 py-1 border rounded bg-white disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <button 
                      disabled={pagination.page >= pagination.total_pages} 
                      onClick={() => dispatch(fetchWorkerProfiles({ page: pagination.page + 1 }))}
                      className="px-3 py-1 border rounded bg-white disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LIST VIEW: BY STATUS */}
          {viewMode === "by_status" && (
            <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">
              {loadingAllApps ? (
                <div className="p-8 text-center text-gray-500">Loading all applications...</div>
              ) : filteredApplications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No applications found in this category.</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredApplications.map(app => (
                    <div key={app.id} className="p-4 hover:bg-gray-50 flex items-center justify-between group">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {typeof app.worker === 'string' ? app.worker_details?.full_name : app.worker?.user?.full_name || "Unknown"}
                          </span>
                          <ApplicationStatusBadge status={app.status} />
                        </div>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {typeof app.job !== 'string' ? app.job?.title : app.job_details?.title}</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {app.proposed_rate}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(app.applied_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setApplicationToView(app)}
                        className="text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <ApplicationViewModal
          isOpen={!!applicationToView}
          application={applicationToView}
          onClose={() => setApplicationToView(null)}
          onUpdateStatus={handleUpdateStatus}
          processingIds={processingIds}
        />
      </div>
    </ProtectedRoute>
  );
};

export default AllWorkersAdministration;