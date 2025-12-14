"use client";
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Building, MapPin, DollarSign, Calendar, CheckCircle, X } from "lucide-react";
import { EmployerProfile } from "@/types/employer.types";
import { Job, JOB_STATUS_OPTIONS } from "@/types/job.types";
import api from "@/lib/axios";

interface EmployerListRowProps {
  profile: EmployerProfile;
  isOpen: boolean;
  onToggle: () => void;
  onViewJob: (job: Job) => void;
  onJobStatusChange: (jobId: string, status: string, employerId: string) => Promise<void>;
  processingJobIds: Set<string>;
  pendingJobIds: Set<string>;
}

const EmployerListRow: React.FC<EmployerListRowProps> = ({
  profile,
  isOpen,
  onToggle,
  onViewJob,
  onJobStatusChange,
  processingJobIds,
  pendingJobIds,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const formatCurrency = (amount: any) => {
    const n = Number(amount);
    return isNaN(n) ? "N/A" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  };

  const getStatusColor = (status: string) => JOB_STATUS_OPTIONS.find((opt) => opt.value === status)?.color || "text-gray-600 bg-gray-100";

  // Fetch jobs only when the row is expanded
  useEffect(() => {
    if (isOpen && !loaded && !loading) {
      fetchJobs();
    }
  }, [isOpen]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get(`/jobs/employers/?employer_id=${profile.id}`);
      const data = resp && (resp as any).data ? (resp as any).data : Array.isArray(resp) ? resp : [];
      setJobs(data as Job[]);
      setLoaded(true);
    } catch (e: any) {
      setError(e?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  // Local handler to update job status in the list instantly
  const handleLocalStatusChange = async (jobId: string, status: string) => {
    await onJobStatusChange(jobId, status, profile.id);
    // Optimistically update the local list to reflect changes
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: status as any } : j));
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
              <Building className="text-red-900" size={18} />
              <span className="font-semibold text-gray-900">{profile.company_name}</span>
            </div>
            <div className="mt-1 text-sm text-gray-600 flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1"><MapPin size={14} /> {profile.location}</span>
              <span className="inline-flex items-center gap-1">Industry: {profile.industry}</span>
              <span className="inline-flex items-center gap-1">Type: {profile.business_type}</span>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Created: {new Date(profile.created_at).toLocaleDateString()}
        </div>
      </button>

      {isOpen && (
        <div className="px-10 pb-5 pt-2 bg-gray-50/50 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Jobs Posted</h4>
          
          {loading ? (
            <div className="py-2 text-gray-500 text-sm animate-pulse">Loading jobs...</div>
          ) : error ? (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</div>
          ) : jobs.length === 0 ? (
            <div className="text-gray-500 text-sm italic">No jobs posted by this employer.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 truncate pr-2 flex-1">{job.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(job.status)}`}>
                      {JOB_STATUS_OPTIONS.find((opt) => opt.value === job.status)?.label || job.status}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{job.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="inline-flex items-center gap-1">
                      <DollarSign size={12} /> {formatCurrency((job as any).budget_min)} - {formatCurrency((job as any).budget_max)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} /> {new Date(job.start_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      {(job.status === "draft" || job.status === "paused") && (
                        <>
                          <ActionBtn 
                            label="Approve" 
                            icon={<CheckCircle className="w-3 h-3" />}
                            color="green" 
                            onClick={() => handleLocalStatusChange(job.id, "active")} // Usually involves API specific for approval, handled in parent
                            disabled={processingJobIds.has(job.id)} 
                          />
                          <ActionBtn 
                            label="Reject" 
                            icon={<X className="w-3 h-3" />}
                            color="red" 
                            onClick={() => handleLocalStatusChange(job.id, "cancelled")} 
                            disabled={processingJobIds.has(job.id)} 
                          />
                        </>
                      )}
                    </div>
                    <button onClick={() => onViewJob(job)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                      View Job
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

const ActionBtn = ({ label, icon, color, onClick, disabled }: any) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    disabled={disabled}
    className={`text-xs px-2 py-1 rounded border transition-colors flex items-center gap-1 ${
      color === 'green' 
        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
    } disabled:opacity-50`}
  >
    {disabled ? "..." : <>{icon} {label}</>}
  </button>
);

export default React.memo(EmployerListRow);