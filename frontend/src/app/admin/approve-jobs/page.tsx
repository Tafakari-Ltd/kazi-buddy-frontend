"use client";
import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/component/Authentication/ProtectedRoute";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Briefcase } from "lucide-react";
import PendingJobsTable from "@/components/Admin/ApproveJobs/PendingJobsTable";
import ApproveJobModal from "@/components/Admin/ApproveJobs/ApproveJobModal";

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
  start_date?: string;
  end_date?: string;
  max_applicants?: number;
  estimated_hours?: number;
  employer: {
    id: string;
    company_name: string;
    user: {
      id: string;
      full_name: string;
      email: string;
    };
  };
  category: {
    id: string;
    name: string;
  };
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

  const fetchPendingJobs = async () => {
    try {
      setLoadingJobs(true);
      setError(null);
      const resp: any = await api.get("/adminpanel/jobs/pending/");
      let jobs: PendingJob[] = [];
      if (Array.isArray(resp)) jobs = resp;
      else if (Array.isArray(resp.data)) jobs = resp.data;
      else if (Array.isArray(resp.results)) jobs = resp.results;
      
      setPendingJobs(jobs);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to fetch pending jobs";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleApproveJob = async (job: any) => { 
    if (!job.id) return;
    try {
      setProcessingJobId(job.id);
      setProcessingAction("approve");
      await api.post(`/adminpanel/jobs/${job.id}/approve/`);
      toast.success(`Job "${job.title}" approved successfully`);
      
      if (showJobModal) setShowJobModal(false);
      await fetchPendingJobs();
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve job");
    } finally {
      setProcessingJobId(null);
      setProcessingAction(null);
    }
  };

  const handleRejectJob = async (job: any) => {
    if (!job.id) return;
    try {
      setProcessingJobId(job.id);
      setProcessingAction("reject");
      await api.patch(`/jobs/${job.id}/`, { status: "cancelled" });
      toast.success(`Job "${job.title}" rejected`);
      
      if (showJobModal) setShowJobModal(false);
      await fetchPendingJobs();
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject job");
    } finally {
      setProcessingJobId(null);
      setProcessingAction(null);
    }
  };

  const openModal = (job: PendingJob) => {
    setSelectedJob(job);
    setShowJobModal(true);
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
              <p className="text-gray-600">Review jobs awaiting admin approval</p>
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
            </div>
          ) : (
            <PendingJobsTable 
              jobs={pendingJobs} 
              onView={openModal} 
              onApprove={handleApproveJob} 
              onReject={handleRejectJob}
              processingJobId={processingJobId}
              processingAction={processingAction}
            />
          )}

          <ApproveJobModal
            isOpen={showJobModal}
            onClose={() => setShowJobModal(false)}
            job={selectedJob}
            onApprove={handleApproveJob}
            onReject={handleRejectJob}
            processingId={processingJobId}
            processingAction={processingAction}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ApproveJobsPage;