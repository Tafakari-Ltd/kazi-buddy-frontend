"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, MapPin, Clock, CheckCircle } from "lucide-react";

interface PendingJobInterface {
  id: string;
  title: string;
  description: string;
  location: string;
  job_type: string;
  urgency_level: string;
  budget_min: string | number;
  budget_max: string | number;
  status: string;
  start_date?: string;
  end_date?: string;
  max_applicants?: number;
  estimated_hours?: number;
  employer: {
    company_name: string;
    user: {
      full_name: string;
      email: string;
    };
  };
}

interface ApproveJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: PendingJobInterface | null;
  onApprove: (job: PendingJobInterface) => void;
  onReject: (job: PendingJobInterface) => void;
  processingId: string | null;
  processingAction: "approve" | "reject" | null;
}

const ApproveJobModal: React.FC<ApproveJobModalProps> = ({
  isOpen,
  onClose,
  job,
  onApprove,
  onReject,
  processingId,
  processingAction,
}) => {
  if (!job) return null;

  const formatCurrency = (value: string | number) => {
    const n = typeof value === "string" ? Number(value) : value;
    if (!n || Number.isNaN(n)) return "N/A";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(n);
  };

  const formatDate = (value: string | undefined) => {
    if (!value) return "Not specified";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isApproving = processingId === job.id && processingAction === "approve";
  const isRejecting = processingId === job.id && processingAction === "reject";

  return (
    <AnimatePresence>
      {isOpen && (
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-4 h-4" />
                    Awaiting Admin Approval
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                    {job.status}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Job Description</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Employer</h4>
                  <div className="bg-gray-50 p-4 rounded-lg flex flex-col gap-1 text-sm text-gray-700">
                    <span className="font-medium">{job.employer?.company_name || "Unknown company"}</span>
                    <span>{job.employer?.user?.full_name} · {job.employer?.user?.email}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-3">Budget</h5>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(job.budget_min)} - {formatCurrency(job.budget_max)}
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Details</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="text-gray-900 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                    </div>
                    {job.start_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="text-gray-900">{formatDate(job.start_date)}</span>
                      </div>
                    )}
                    {job.end_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="text-gray-900">{formatDate(job.end_date)}</span>
                      </div>
                    )}
                    {typeof job.max_applicants === "number" && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Applicants:</span>
                        <span className="text-gray-900">{job.max_applicants}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-4 px-6 pb-6 border-t pt-4">
              <button onClick={onClose} className="px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                Cancel
              </button>
              <button
                onClick={() => onReject(job)}
                disabled={isApproving || isRejecting}
                className="px-6 py-2.5 text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
              >
                {isRejecting ? "Rejecting..." : "Reject Job"}
              </button>
              <button
                onClick={() => onApprove(job)}
                disabled={isApproving || isRejecting}
                className="flex items-center gap-2 px-6 py-2.5 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {isApproving ? <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"/> : <CheckCircle className="w-4 h-4"/>}
                {isApproving ? "Approving..." : "Approve Job"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApproveJobModal;