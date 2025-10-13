"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  ChevronDown,
  ChevronRight,
  MapPin,
  Building,
  DollarSign,
  Calendar
} from "lucide-react";
import ProtectedRoute from "@/component/Authentication/ProtectedRoute";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import {
  fetchEmployerProfiles,
} from "@/Redux/Features/employerProfilesSlice";
import api from "@/lib/axios";
import { EmployerProfile } from "@/types/employer.types";
import { Job } from "@/types/job.types";

// Local cache for jobs per employer to avoid mutating global jobs store
type EmployerJobsCache = Record<string, { jobs: Job[]; loading: boolean; error: string | null; loaded: boolean }>;

const AllEmployersAdministration: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profiles, loading, error, pagination } = useSelector((state: RootState) => state.employerProfiles);

  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [employerJobs, setEmployerJobs] = useState<EmployerJobsCache>({});

  // Initial fetch
  useEffect(() => {
    dispatch(fetchEmployerProfiles());
  }, [dispatch]);

  // Filter profiles client-side by simple search (company name, industry, location)
  const filteredProfiles = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) =>
      p.company_name.toLowerCase().includes(q) ||
      p.industry.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
  }, [profiles, searchTerm]);

  const toggleExpand = async (profile: EmployerProfile) => {
    const id = profile.id;
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    // If expanding and not yet loaded, fetch this employer's jobs
    if (!expanded[id] && !employerJobs[id]?.loaded) {
      setEmployerJobs((prev) => ({
        ...prev,
        [id]: { jobs: [], loading: true, error: null, loaded: false },
      }));
      try {
        // Call jobs_byEmployer without polluting global jobs store
        const resp = await api.get(`/jobs/employers/?employer_id=${id}`);
        const data = (resp && (resp as any).data) ? (resp as any).data : Array.isArray(resp) ? resp : [];
        setEmployerJobs((prev) => ({
          ...prev,
          [id]: { jobs: data as Job[], loading: false, error: null, loaded: true },
        }));
      } catch (e: any) {
        setEmployerJobs((prev) => ({
          ...prev,
          [id]: { jobs: [], loading: false, error: e?.message || "Failed to load jobs", loaded: true },
        }));
      }
    }
  };

  const handlePageChange = async (page: number) => {
    await dispatch(fetchEmployerProfiles({ page, limit: pagination.limit }));
  };

  const expandAll = async () => {
    const ids = filteredProfiles.map((p) => p.id);
    // Open all rows
    setExpanded((prev) => {
      const next = { ...prev };
      ids.forEach((id) => (next[id] = true));
      return next;
    });

    // Determine which employers need fetching
    const toFetch = ids.filter((id) => !employerJobs[id]?.loaded);
    if (toFetch.length === 0) return;

    setEmployerJobs((prev) => {
      const next = { ...prev } as EmployerJobsCache;
      toFetch.forEach((id) => {
        next[id] = { jobs: [], loading: true, error: null, loaded: false };
      });
      return next;
    });

    try {
      const results = await Promise.all(
        toFetch.map((id) => api.get(`/jobs/employers/?employer_id=${id}`))
      );
      setEmployerJobs((prev) => {
        const next = { ...prev } as EmployerJobsCache;
        results.forEach((resp, idx) => {
          const id = toFetch[idx];
          const data = (resp && (resp as any).data)
            ? (resp as any).data
            : Array.isArray(resp)
              ? (resp as any)
              : [];
          next[id] = { jobs: data as Job[], loading: false, error: null, loaded: true };
        });
        return next;
      });
    } catch (e: any) {
      setEmployerJobs((prev) => {
        const next = { ...prev } as EmployerJobsCache;
        toFetch.forEach((id) => {
          next[id] = { jobs: [], loading: false, error: e?.message || 'Failed to load jobs', loaded: true };
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
              <h1 className="text-xl font-bold text-gray-800">Employers Administration</h1>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by company, industry, or location..."
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

          {/* Employers List */}
          <div className="bg-white shadow-sm border border-gray-200 overflow-hidden rounded-md">
            {loading ? (
              <div className="p-6 text-gray-600">Loading employers...</div>
            ) : filteredProfiles.length === 0 ? (
              <div className="p-6 text-gray-600">No employers found.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredProfiles.map((profile) => {
                  const isOpen = !!expanded[profile.id];
                  const cache = employerJobs[profile.id];
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
                        <div className="text-xs text-gray-500">Created: {new Date(profile.created_at).toLocaleDateString()}</div>
                      </button>

                      {/* Collapsible content */}
                      {isOpen && (
                        <div className="px-10 pb-5">
                          {/* Jobs for this employer */}
                          <div className="mt-1 mb-3 text-sm font-medium text-gray-700">Jobs Posted</div>
                          {cache?.loading ? (
                            <div className="text-gray-600">Loading jobs...</div>
                          ) : cache?.error ? (
                            <div className="text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm">{cache.error}</div>
                          ) : (cache?.jobs?.length || 0) === 0 ? (
                            <div className="text-gray-600">No jobs posted by this employer.</div>
                          ) : (
                            <div className="grid md:grid-cols-2 gap-3">
                              {cache.jobs.map((job) => (
                                <div key={job.id} className="border border-gray-200 rounded p-4">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-gray-900 truncate pr-2">{job.title}</h4>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">{job.status}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{job.description}</p>
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                                    <span className="inline-flex items-center gap-1"><DollarSign size={14} />{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(job.budget_min)} - {new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(job.budget_max)}</span>
                                    <span className="inline-flex items-center gap-1"><MapPin size={14} />{job.location}</span>
                                    <span className="inline-flex items-center gap-1"><Calendar size={14} />{new Date(job.start_date).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center justify-end">
                                    <a
                                      href={`/admin/jobs?jobId=${job.id}`}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                      View job
                                    </a>
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
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} employers
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
      </div>
    </ProtectedRoute>
  );
};

export default AllEmployersAdministration;
