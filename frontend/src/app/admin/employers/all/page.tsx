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
 Calendar,
 X,
 Users,
 Briefcase,
 CheckCircle,
 Clock,
} from "lucide-react";
import ProtectedRoute from "@/component/Authentication/ProtectedRoute";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { motion, AnimatePresence } from "framer-motion";
import {
 fetchEmployerProfiles,
} from "@/Redux/Features/employerProfilesSlice";
import api from "@/lib/axios";
import { EmployerProfile } from "@/types/employer.types";
import { Job, JOB_STATUS_OPTIONS, URGENCY_LEVEL_OPTIONS } from "@/types/job.types";

// Local cache for jobs per employer to avoid mutating global jobs store
type EmployerJobsCache = Record<string, { jobs: Job[]; loading: boolean; error: string | null; loaded: boolean }>;

const AllEmployersAdministration: React.FC = () => {
 const dispatch = useDispatch<AppDispatch>();
 const { profiles, loading, error, pagination } = useSelector((state: RootState) => state.employerProfiles);

 const [searchTerm, setSearchTerm] = useState("");
 const [expanded, setExpanded] = useState<Record<string, boolean>>({});
 const [employerJobs, setEmployerJobs] = useState<EmployerJobsCache>({});
 // Default to viewing employers and their jobs first
 const [viewMode, setViewMode] = useState<'by_employer' | 'by_status'>('by_employer');
 const [jobStatusFilter, setJobStatusFilter] = useState<'all' | string>('all');
 const [allJobs, setAllJobs] = useState<Job[]>([]);
 const [loadingAllJobs, setLoadingAllJobs] = useState(false);
 const [processingJobIds, setProcessingJobIds] = useState<Set<string>>(new Set());
 const [pendingJobIds, setPendingJobIds] = useState<Set<string>>(new Set());

 // Local job view modal state
 const [showJobViewModal, setShowJobViewModal] = useState(false);
 const [jobToView, setJobToView] = useState<Job | null>(null);
 const openViewJob = (job: Job) => { setJobToView(job); setShowJobViewModal(true); };
 const closeViewJob = () => { setShowJobViewModal(false); setJobToView(null); };

 const formatCurrency = (amount?: unknown) => {
 if (amount === null || amount === undefined) return 'N/A';
 const n = typeof amount === 'string' ? Number(amount) : (amount as number);
 if (Number.isNaN(n)) return 'N/A';
 return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
 };
 const formatDate = (dateString?: string) => dateString
 ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
 : 'Not specified';

 const getStatusColor = (status: string) => {
 const option = JOB_STATUS_OPTIONS.find(opt => opt.value === status);
 return option?.color || 'text-gray-600 bg-gray-100';
 };
 const getUrgencyColor = (urgency: string) => {
 const option = URGENCY_LEVEL_OPTIONS.find(opt => opt.value === urgency);
 return option?.color || 'text-gray-600 bg-gray-100';
 };

 // Initial fetch
 useEffect(() => {
 dispatch(fetchEmployerProfiles());
 if (viewMode === 'by_status') {
 fetchAllJobs();
 }
 fetchPendingJobs();
 }, [dispatch, viewMode]);

 // Fetch all jobs for status-based view
 const fetchAllJobs = async () => {
 setLoadingAllJobs(true);
 try {
 const resp = await api.get('/jobs/');
 const data = (resp && (resp as any).data) ? (resp as any).data : Array.isArray(resp) ? resp : [];
 setAllJobs(data as Job[]);
 } catch (e: any) {
 console.error('Failed to fetch all jobs:', e);
 } finally {
 setLoadingAllJobs(false);
 }
 };

 // Fetch IDs of jobs currently awaiting admin approval
 const fetchPendingJobs = async () => {
 try {
 const resp = await api.get('/adminpanel/jobs/pending/');
 const raw = (resp && (resp as any).data) ? (resp as any).data : Array.isArray(resp) ? resp : [];
 const ids = new Set<string>((raw as any[]).map(j => j.id).filter(Boolean));
 setPendingJobIds(ids);
 } catch (e: any) {
 console.error('Failed to fetch pending admin jobs:', e);
 }
 };

 // Handle job status update (generic status changes like reject)
 const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
 try {
 setProcessingJobIds(prev => new Set([...prev, jobId]));
 
 await api.patch(`/jobs/${jobId}/`, { status: newStatus });

 // Update all jobs list
 setAllJobs(prev => prev.map(job => 
 job.id === jobId ? { ...job, status: newStatus as any } : job
 ));

 // Update employer jobs cache
 setEmployerJobs(prev => {
 const next = { ...prev };
 Object.keys(next).forEach(employerId => {
 next[employerId] = {
 ...next[employerId],
 jobs: next[employerId].jobs.map(job => 
 job.id === jobId ? { ...job, status: newStatus as any } : job
 )
 };
 });
 return next;
 });

 // Update modal if viewing this job
 if (jobToView?.id === jobId) {
 setJobToView(prev => prev ? { ...prev, status: newStatus as any } : null);
 }

 // Once status changes (e.g. to cancelled), treat it as no longer pending approval
 setPendingJobIds(prev => {
 const next = new Set(prev);
 next.delete(jobId);
 return next;
 });
 
 } catch (e: any) {
 console.error('Error updating job status:', e);
 } finally {
 setProcessingJobIds(prev => {
 const newSet = new Set(prev);
 newSet.delete(jobId);
 return newSet;
 });
 }
 };

 const handleApproveJob = async (jobId: string) => {
 try {
 setProcessingJobIds(prev => new Set([...prev, jobId]));

 // Call adminpanel approve endpoint so admin_approved is set to true
 const resp = await api.post(`/adminpanel/jobs/${jobId}/approve/`);
 const wrapper = resp as any;
 const updatedJob = (wrapper && wrapper.data) ? wrapper.data : wrapper;

 // Update all jobs list
 setAllJobs(prev => prev.map(job => 
 job.id === jobId
 ? { ...job, ...updatedJob }
 : job
 ));

 // Update employer jobs cache
 setEmployerJobs(prev => {
 const next = { ...prev };
 Object.keys(next).forEach(employerId => {
 next[employerId] = {
 ...next[employerId],
 jobs: next[employerId].jobs.map(job => 
 job.id === jobId ? { ...job, ...updatedJob } : job
 )
 };
 });
 return next;
 });

 // Update modal if viewing this job
 if (jobToView?.id === jobId) {
 setJobToView(prev => prev ? { ...prev, ...updatedJob } : null);
 }

 
 setPendingJobIds(prev => {
 const next = new Set(prev);
 next.delete(jobId);
 return next;
 });
 } catch (e: any) {
 console.error('Error approving job:', e);
 } finally {
 setProcessingJobIds(prev => {
 const newSet = new Set(prev);
 newSet.delete(jobId);
 return newSet;
 });
 }
 };

 const handleRejectJob = (jobId: string) => {
 handleUpdateJobStatus(jobId, 'cancelled');
 };

 // Filter jobs by status
 const filteredJobs = useMemo(() => {
 if (jobStatusFilter === 'all') return allJobs;
 return allJobs.filter(job => job.status === jobStatusFilter);
 }, [allJobs, jobStatusFilter]);

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
 <div className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4 font-bold text-center">
 👥 YOU ARE ON: EMPLOYERS PAGE (Route: /admin/employers/all)
 </div>
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
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
 
 {/* View Mode Toggle */}
 <div className="flex gap-2 mt-4 border-t pt-4">
 <button
 onClick={() => setViewMode('by_status')}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
 viewMode === 'by_status'
 ? 'bg-red-600 text-white'
 : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
 }`}
 >
 View by Job Status
 </button>
 <button
 onClick={() => setViewMode('by_employer')}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
 viewMode === 'by_employer'
 ? 'bg-red-600 text-white'
 : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
 }`}
 >
 View by Employer
 </button>
 </div>
 
 {/* Job Status Filters (shown in by_status mode) */}
 {viewMode === 'by_status' && (
 <div className="flex gap-2 mt-3 flex-wrap">
 <button
 onClick={() => setJobStatusFilter('all')}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
 jobStatusFilter === 'all'
 ? 'bg-gray-700 text-white'
 : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
 }`}
 >
 All Jobs ({allJobs.length})
 </button>
 <button
 onClick={() => setJobStatusFilter('draft')}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
 jobStatusFilter === 'draft'
 ? 'bg-gray-600 text-white'
 : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
 }`}
 >
 Draft ({allJobs.filter(j => j.status === 'draft').length})
 </button>
 <button
 onClick={() => setJobStatusFilter('active')}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
 jobStatusFilter === 'active'
 ? 'bg-green-600 text-white'
 : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
 }`}
 >
 Active ({allJobs.filter(j => j.status === 'active').length})
 </button>
 <button
 onClick={() => setJobStatusFilter('paused')}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
 jobStatusFilter === 'paused'
 ? 'bg-yellow-600 text-white'
 : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
 }`}
 >
 Paused ({allJobs.filter(j => j.status === 'paused').length})
 </button>
 <button
 onClick={() => setJobStatusFilter('closed')}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
 jobStatusFilter === 'closed'
 ? 'bg-red-600 text-white'
 : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
 }`}
 >
 Closed ({allJobs.filter(j => j.status === 'closed').length})
 </button>
 <button
 onClick={() => setJobStatusFilter('cancelled')}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
 jobStatusFilter === 'cancelled'
 ? 'bg-gray-600 text-white'
 : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
 }`}
 >
 Cancelled ({allJobs.filter(j => j.status === 'cancelled').length})
 </button>
 </div>
 )}
 </div>

 {/* Jobs by Status View */}
 {viewMode === 'by_status' && (
 <div className="bg-white shadow-sm border border-gray-200 overflow-hidden rounded-md">
 {loadingAllJobs ? (
 <div className="p-6 text-gray-600">Loading jobs...</div>
 ) : filteredJobs.length === 0 ? (
 <div className="p-6 text-gray-600">No jobs found.</div>
 ) : (
 <div className="divide-y divide-gray-200">
 {filteredJobs.map((job) => (
 <div key={job.id} className="p-6 hover:bg-gray-50">
 <div className="flex items-start justify-between mb-4">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-2">
 <Briefcase className="text-red-900" size={18} />
 <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
 <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(job.status)}`}>
 {JOB_STATUS_OPTIONS.find(opt => opt.value === job.status)?.label || job.status}
 </span>
 <span className={`text-xs px-2 py-0.5 rounded-full ${getUrgencyColor(job.urgency_level)}`}>
 {URGENCY_LEVEL_OPTIONS.find(opt => opt.value === job.urgency_level)?.label || job.urgency_level}
 </span>
 </div>
 
 <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>
 
 <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
 <span className="flex items-center gap-1">
 <DollarSign className="w-4 h-4" />
 {formatCurrency(job.budget_min)} - {formatCurrency(job.budget_max)}
 </span>
 <span className="flex items-center gap-1">
 <MapPin className="w-4 h-4" />
 {job.location}
 </span>
 <span className="flex items-center gap-1">
 <Calendar className="w-4 h-4" />
 Start: {formatDate(job.start_date)}
 </span>
 <span className="flex items-center gap-1">
 <Users className="w-4 h-4" />
 Max Applicants: {job.max_applicants}
 </span>
 </div>
 </div>
 </div>
 
 <div className="flex items-center justify-between mt-3">
 <div className="flex items-center gap-2">
 {(job.status === 'draft' || job.status === 'paused') && (
 <>
 <button
 onClick={() => handleApproveJob(job.id)}
 disabled={processingJobIds.has(job.id)}
 className="text-sm bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
 >
 {processingJobIds.has(job.id) ? '...' : (
 <>
 <CheckCircle className="w-4 h-4" />
 Approve & Activate
 </>
 )}
 </button>
 <button
 onClick={() => handleRejectJob(job.id)}
 disabled={processingJobIds.has(job.id)}
 className="text-sm bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
 >
 {processingJobIds.has(job.id) ? '...' : (
 <>
 <X className="w-4 h-4" />
 Reject
 </>
 )}
 </button>
 </>
 )}
 {pendingJobIds.has(job.id) && (
 <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
 <Clock className="w-3 h-3" />
 Awaiting Admin Approval
 </span>
 )}
 {!pendingJobIds.has(job.id) && job.status === 'active' && (
 <span className="text-sm text-green-600 flex items-center gap-1">
 <CheckCircle className="w-4 h-4" />
 Approved & Active
 </span>
 )}
 </div>
 <button
 onClick={() => openViewJob(job)}
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

 {/* Employers List (by employer view) */}
 {viewMode === 'by_employer' && (
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
 <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(job.status)}`}>
 {JOB_STATUS_OPTIONS.find(opt => opt.value === job.status)?.label || job.status}
 </span>
 </div>
 <p className="text-sm text-gray-600 line-clamp-2 mb-2">{job.description}</p>
 <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
 <span className="inline-flex items-center gap-1"><DollarSign size={14} />{formatCurrency((job as any).budget_min)} - {formatCurrency((job as any).budget_max)}</span>
 <span className="inline-flex items-center gap-1"><MapPin size={14} />{job.location}</span>
 <span className="inline-flex items-center gap-1"><Calendar size={14} />{new Date(job.start_date).toLocaleDateString()}</span>
 </div>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-1">
 {(job.status === 'draft' || job.status === 'paused') && (
 <>
 <button
 onClick={(e) => {
 e.stopPropagation();
 handleApproveJob(job.id);
 }}
 disabled={processingJobIds.has(job.id)}
 className="text-xs bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 px-2 py-1 rounded transition-colors"
 title="Approve & Activate Job"
 >
 {processingJobIds.has(job.id) ? '...' : 'Approve'}
 </button>
 <button
 onClick={(e) => {
 e.stopPropagation();
 handleRejectJob(job.id);
 }}
 disabled={processingJobIds.has(job.id)}
 className="text-xs bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 px-2 py-1 rounded transition-colors"
 title="Reject Job"
 >
 {processingJobIds.has(job.id) ? '...' : 'Reject'}
 </button>
 </>
 )}
 </div>
 <button
 onClick={() => openViewJob(job)}
 className="text-blue-600 hover:text-blue-800 text-sm font-medium"
 >
 View job
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
 )}

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

 {/* View Job Modal */}
 <AnimatePresence>
 {showJobViewModal && jobToView && (
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
 <h3 className="text-2xl font-bold text-gray-900 mb-2">{jobToView.title}</h3>
 <div className="flex items-center gap-2">
 <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(jobToView.status)}`}>
 {JOB_STATUS_OPTIONS.find(opt => opt.value === jobToView.status)?.label || jobToView.status}
 </span>
 <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(jobToView.urgency_level)}`}>
 {URGENCY_LEVEL_OPTIONS.find(opt => opt.value === jobToView.urgency_level)?.label || jobToView.urgency_level}
 </span>
 </div>
 </div>
 <button
 onClick={closeViewJob}
 className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2 space-y-6">
 <div>
 <h4 className="font-semibold text-gray-900 mb-3">Job Description</h4>
 <div className="bg-gray-50 p-4 rounded-lg">
 <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
 {jobToView.description}
 </p>
 </div>
 </div>
 </div>

 <div className="space-y-6">
 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg">
 <h5 className="font-semibold text-gray-900 mb-3">Budget</h5>
 <p className="text-2xl font-bold text-blue-900">
 {formatCurrency((jobToView as any).budget_min)} - {formatCurrency((jobToView as any).budget_max)}
 </p>
 <p className="text-sm text-blue-700 mt-1">
 Estimated {jobToView.estimated_hours} hours
 </p>
 </div>

 <div>
 <h5 className="font-semibold text-gray-900 mb-3">Details</h5>
 <div className="space-y-2 text-sm">
 <div className="flex justify-between">
 <span className="text-gray-600">Location:</span>
 <span className="text-gray-900">{jobToView.location}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-600">Start Date:</span>
 <span className="text-gray-900">{formatDate(jobToView.start_date)}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-600">End Date:</span>
 <span className="text-gray-900">{formatDate(jobToView.end_date)}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-600">Max Applicants:</span>
 <span className="text-gray-900">{jobToView.max_applicants}</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
 <button
 onClick={closeViewJob}
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

export default AllEmployersAdministration;