"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/component/Authentication/ProtectedRoute";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface PendingJobEmployerUser {
  id: string;
  full_name: string;
  email: string;
}

interface PendingJobEmployer {
  id: string;
  company_name: string;
  user: PendingJobEmployerUser;
}

interface PendingJobCategory {
  id: string;
  name: string;
}

interface PendingJob {
  id: string;
  title: string;
  description: string;
  location: string;
  job_type: string;
  urgency_level: string;
  budget_min: string | number;
  budget_max: string | number;
  status: string;
  visibility: string;
  admin_approved?: boolean;
  created_at: string;
  // Optional fields that may be present on the pending jobs endpoint
  start_date?: string;
  end_date?: string;
  max_applicants?: number;
  estimated_hours?: number;
  employer: PendingJobEmployer;
  category: PendingJobCategory;
}

const ApproveJobsPage: React.FC = () => {
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<"approve" | "reject" | null>(null);
  const [selectedJob, setSelectedJob] = useState<PendingJob | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const parseJobsResponse = (resp: any): PendingJob[] => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp as PendingJob[];
    if (Array.isArray(resp.data)) return resp.data as PendingJob[];
    if (Array.isArray(resp.results)) return resp.results as PendingJob[];
    return [];
  };

  const fetchPendingJobs = async () => {
    try {
      setLoadingJobs(true);
      setError(null);

      // Admin endpoint for jobs awaiting approval
      const resp = await api.get("/adminpanel/jobs/pending/");
      const jobs = parseJobsResponse(resp);
      setPendingJobs(jobs);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to fetch pending jobs";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingJobs(false);
    }
  };

  const formatCurrency = (value: string | number) => {
    const n = typeof value === "string" ? Number(value) : value;
    if (!n || Number.isNaN(n)) return "N/A";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(n);
  };

  const formatDate = (value: string) => {
    if (!value) return "Not specified";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleApproveJob = async (job: PendingJob) => {
    try {
      if (!job.id) {
        toast.error("Could not determine job id for approval.");
        return;
      }

      setProcessingJobId(job.id);
      setProcessingAction("approve");

      // Admin approve endpoint
      await api.post(`/adminpanel/jobs/${job.id}/approve/`);

      toast.success(`Job \"${job.title}\" approved successfully`);
      await fetchPendingJobs();
    } catch (err: any) {
      const msg = err?.message || "Failed to approve job";
      toast.error(msg);
    } finally {
      setProcessingJobId(null);
      setProcessingAction(null);
    }
  };

  const handleRejectJob = async (job: PendingJob) => {
    try {
      if (!job.id) {
        toast.error("Could not determine job id for rejection.");
        return;
      }

      setProcessingJobId(job.id);
      setProcessingAction("reject");

      // No dedicated reject endpoint was provided, so we mark as cancelled
      await api.patch(`/jobs/${job.id}/`, { status: "cancelled" });

      toast.success(`Job \"${job.title}\" rejected`);
      await fetchPendingJobs();
    } catch (err: any) {
      const msg = err?.message || "Failed to reject job";
      toast.error(msg);
    } finally {
      setProcessingJobId(null);
      setProcessingAction(null);
    }
  };

  const handleViewJob = (job: PendingJob) => {
    if (!job.id) return;
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const closeJobModal = () => {
    setShowJobModal(false);
    setSelectedJob(null);
  };

  const isProcessing = (job: PendingJob, action: "approve" | "reject") => {
    return processingJobId === job.id && processingAction === action;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Briefcase className="h-7 w-7 text-blue-700" />
                Approve Jobs
              </h1>
              <p className="text-gray-600">
                Review and approve or reject jobs that are awaiting admin approval
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {loadingJobs ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg text-gray-600">Loading pending jobs...</div>
            </div>
          ) : pendingJobs.length === 0 ? (
            <div className="p-8 bg-white rounded-lg border border-gray-200 text-center">
              <p className="text-gray-600 mb-2">No jobs are currently awaiting admin approval.</p>
              <p className="text-sm text-gray-500">
                Once employers submit jobs that require approval, they will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Job</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Employer</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Category</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Location</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Budget</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingJobs.map((job, idx) => (
                      <tr
                        key={job.id}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        {/* Job Info */}
                        <td className="px-6 py-4 align-top">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 line-clamp-1">
                                {job.title}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(job.start_date as any)}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Max {job.max_applicants ?? 0} applicants
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Employer */}
                        <td className="px-6 py-4 align-top">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-gray-900">
                              {job.employer?.company_name || "Unknown company"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {job.employer?.user?.full_name} · {job.employer?.user?.email}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 align-top">
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                            <Building2 className="h-3 w-3" />
                            {job.category?.name || "Uncategorised"}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4 align-top">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-700">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                        </td>

                        {/* Budget */}
                        <td className="px-6 py-4 align-top">
                          <div className="flex flex-col gap-1 text-xs text-gray-800">
                            <span className="inline-flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(job.budget_min)} - {formatCurrency(job.budget_max)}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 align-top">
                          <div className="flex flex-col gap-1 text-xs">
                            <span className="inline-flex px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                              Awaiting Admin Approval
                            </span>
                            <span className="inline-flex px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                              {job.status}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 align-top text-center">
                          <div className="flex flex-col md:flex-row gap-2 justify-center">
                            <button
                              onClick={() => handleViewJob(job)}
                              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </button>
                            <button
                              onClick={() => handleApproveJob(job)}
                              disabled={isProcessing(job, "approve")}
                              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                            >
                              {isProcessing(job, "approve") ? (
                                <>
                                  <span className="animate-spin h-3 w-3 border-b-2 border-white rounded-full" />
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  Approve
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleRejectJob(job)}
                              disabled={isProcessing(job, "reject")}
                              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded-md text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-60"
                            >
                              {isProcessing(job, "reject") ? (
                                <>
                                  <span className="animate-spin h-3 w-3 border-b-2 border-red-700 rounded-full" />
                                  Rejecting...
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3" />
                                  Reject
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Job Detail Modal */}
          <AnimatePresence>
            {showJobModal && selectedJob && (
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
                  className="bg-white rounded-xl shadow-2xl border max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex justify-between items-start p-6 border-b">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedJob.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-4 h-4" />
                          Awaiting Admin Approval
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                          {selectedJob.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={closeJobModal}
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Job Description</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {selectedJob.description}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Employer</h4>
                        <div className="bg-gray-50 p-4 rounded-lg flex flex-col gap-1 text-sm text-gray-700">
                          <span className="font-medium">
                            {selectedJob.employer?.company_name || "Unknown company"}
                          </span>
                          <span>
                            {selectedJob.employer?.user?.full_name} · {selectedJob.employer?.user?.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <h5 className="font-semibold text-gray-900 mb-3">Budget</h5>
                        <p className="text-2xl font-bold text-blue-900">
                          {formatCurrency(selectedJob.budget_min)} - {formatCurrency(selectedJob.budget_max)}
                        </p>
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">Details</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="text-gray-900 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {selectedJob.location}
                            </span>
                          </div>
                          {selectedJob.start_date && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Start Date:</span>
                              <span className="text-gray-900">{formatDate(selectedJob.start_date)}</span>
                            </div>
                          )}
                          {selectedJob.end_date && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">End Date:</span>
                              <span className="text-gray-900">{formatDate(selectedJob.end_date)}</span>
                            </div>
                          )}
                          {typeof selectedJob.max_applicants === "number" && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Max Applicants:</span>
                              <span className="text-gray-900">{selectedJob.max_applicants}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end mt-4 px-6 pb-6">
                    <button
                      onClick={closeJobModal}
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
      </div>
    </ProtectedRoute>
  );
};

export default ApproveJobsPage;
