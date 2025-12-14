"use client";
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, User, MapPin, DollarSign, Calendar } from "lucide-react";
import { WorkerProfile, VERIFICATION_STATUS_OPTIONS } from "@/types/worker.types";
import { JobApplicationWithDetails, ApplicationStatus } from "@/types/jobApplication.types";
import { JobApplicationApi } from "@/services/jobApplicationApi";
import api from "@/lib/axios";
import ApplicationStatusBadge from "./ApplicationStatusBadge";

interface WorkerListRowProps {
  profile: WorkerProfile;
  isOpen: boolean;
  onToggle: () => void;
  onViewApplication: (app: JobApplicationWithDetails) => void;
  onUpdateStatus: (id: string, status: ApplicationStatus, workerId: string) => void;
  processingIds: Set<string>;
}

const WorkerListRow: React.FC<WorkerListRowProps> = ({
  profile,
  isOpen,
  onToggle,
  onViewApplication,
  onUpdateStatus,
  processingIds,
}) => {
  const [applications, setApplications] = useState<JobApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const formatCurrency = (amount?: unknown) => {
    if (amount === null || amount === undefined) return "N/A";
    const n = typeof amount === "string" ? Number(amount) : (amount as number);
    return isNaN(n) ? "N/A" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  };

  const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A";

  const getVerificationColor = (status: string) =>
    VERIFICATION_STATUS_OPTIONS.find((opt) => opt.value === status)?.color || "text-gray-600 bg-gray-100";

  // Fetch applications when row is opened
  useEffect(() => {
    if (isOpen && !loaded && !loading) {
      fetchApplications();
    }
  }, [isOpen]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch raw applications
      const resp = await JobApplicationApi.getAllApplications({
        ordering: "-applied_at",
        expand: "job_details,worker_details,employer_details",
      });
      
      const allApps = resp.applications as unknown as JobApplicationWithDetails[];
      
      // 2. Filter for this worker
      const workerApps = allApps.filter((app) => {
        const workerId = typeof app.worker === "string" ? app.worker : app.worker?.id;
        return workerId === profile.id || app.worker_details?.id === profile.id;
      });

      // 3. Enrich with job details if missing (manual fetch)
      const enrichedApps = await Promise.all(
        workerApps.map(async (app) => {
          if (!app.job_details && app.job && typeof app.job === "string") {
            try {
              const jobRes = await api.get(`/jobs/${app.job}/`);
              return { ...app, job_details: jobRes.data || jobRes };
            } catch (e) {
              return app;
            }
          }
          return app;
        })
      );

      setApplications(enrichedApps);
      setLoaded(true);
    } catch (e: any) {
      setError(e?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  return (
    <li>
      <button
        onClick={onToggle}
        className="w-full text-left px-6 py-4 hover:bg-gray-50 flex items-start justify-between gap-3 transition-colors border-b border-gray-100 last:border-0"
      >
        <div className="flex items-start gap-3">
          <div className="pt-1 text-gray-500">
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <User className="text-red-900" size={18} />
              <span className="font-semibold text-gray-900">
                {typeof profile.user === "string" ? `Worker ID: ${profile.user}` : profile.user?.full_name || `Worker #${profile.id}`}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getVerificationColor(profile.verification_status)}`}>
                {VERIFICATION_STATUS_OPTIONS.find((opt) => opt.value === profile.verification_status)?.label || profile.verification_status}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-600 flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1"><MapPin size={14} /> {profile.location_text}</span>
              <span className="inline-flex items-center gap-1"><DollarSign size={14} /> {formatCurrency(profile.hourly_rate)}/hr</span>
              <span>Exp: {profile.years_experience} yrs</span>
              <span className={`font-medium ${profile.is_available ? "text-green-600" : "text-red-600"}`}>
                {profile.is_available ? "Available" : "Busy"}
              </span>
            </div>
            {profile.bio && <div className="mt-1 text-xs text-gray-500 line-clamp-1 italic">{profile.bio}</div>}
          </div>
        </div>
        <div className="text-xs text-gray-500">Created: {new Date(profile.created_at).toLocaleDateString()}</div>
      </button>

      {isOpen && (
        <div className="px-10 pb-5 pt-2 bg-gray-50/50 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Job Applications</h4>
          
          {loading ? (
            <div className="py-2 text-gray-500 text-sm animate-pulse">Loading applications...</div>
          ) : error ? (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</div>
          ) : applications.length === 0 ? (
            <div className="text-gray-500 text-sm italic">No job applications found for this worker.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {applications.map((app) => (
                <div key={app.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-gray-900 truncate pr-2 flex-1">
                      {(typeof app.job !== "string" ? app.job?.title : undefined) || app.job_details?.title || "Unknown Job"}
                    </h5>
                    <ApplicationStatusBadge status={app.status} />
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2">
                    {(typeof app.job !== "string" ? app.job?.employer?.company_name : undefined) || app.employer_details?.company_name || "Unknown Company"}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><DollarSign size={12} /> Proposed: {formatCurrency(app.proposed_rate)}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> Applied: {formatDate(app.applied_at)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      {app.status === "pending" || app.status === "reviewed" ? (
                        <>
                          <ActionBtn 
                            label="Accept" 
                            color="green" 
                            onClick={() => onUpdateStatus(app.id, "accepted", profile.id)} 
                            disabled={processingIds.has(app.id)} 
                          />
                          <ActionBtn 
                            label="Reject" 
                            color="red" 
                            onClick={() => onUpdateStatus(app.id, "rejected", profile.id)} 
                            disabled={processingIds.has(app.id)} 
                          />
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">Action complete</span>
                      )}
                    </div>
                    <button onClick={() => onViewApplication(app)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
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
};

const ActionBtn = ({ label, color, onClick, disabled }: any) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    disabled={disabled}
    className={`text-xs px-2 py-1 rounded border transition-colors ${
      color === 'green' 
        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
    } disabled:opacity-50`}
  >
    {disabled ? "..." : label}
  </button>
);

export default React.memo(WorkerListRow);