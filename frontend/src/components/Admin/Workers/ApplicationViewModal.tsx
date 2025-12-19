"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, DollarSign, Briefcase, CheckCircle, AlertCircle, Star } from "lucide-react";
import { JobApplicationWithDetails, ApplicationStatus } from "@/types/jobApplication.types";
import ApplicationStatusBadge from "./ApplicationStatusBadge";

interface ApplicationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplicationWithDetails | null;
  onUpdateStatus: (id: string, status: ApplicationStatus, workerId: string) => void;
  processingIds: Set<string>;
}

const ApplicationViewModal: React.FC<ApplicationViewModalProps> = ({
  isOpen,
  onClose,
  application,
  onUpdateStatus,
  processingIds,
}) => {
  if (!application) return null;

  const formatCurrency = (n: any) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(Number(n) || 0);
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const getWorkerId = () => {
    return typeof application.worker === "string" ? application.worker : application.worker_details?.id || "";
  };

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
            className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Job Application Details</h3>
                <ApplicationStatusBadge status={application.status} />
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Cover Letter</h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100">
                    {application.cover_letter}
                  </div>
                </div>

                {application.worker_notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Worker Notes</h4>
                    <div className="bg-yellow-50 p-4 rounded-lg text-gray-700 border border-yellow-100">
                      {application.worker_notes}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="text-blue-900" size={18} />
                    <h5 className="font-medium text-blue-900">
                      {(typeof application.job !== "string" ? application.job?.title : undefined) || application.job_details?.title || "Unknown Job"}
                    </h5>
                  </div>
                  <p className="text-blue-800 text-sm mb-2">
                    {(typeof application.job !== "string" ? application.job?.employer?.company_name : undefined) || application.employer_details?.company_name}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-blue-700">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {(typeof application.job !== "string" ? application.job?.location : undefined) || application.job_details?.location}</span>
                    <span className="flex items-center gap-1"><DollarSign size={14} /> {formatCurrency((typeof application.job !== "string" ? application.job?.budget_min : undefined) || application.job_details?.budget_min)} - {formatCurrency((typeof application.job !== "string" ? application.job?.budget_max : undefined) || application.job_details?.budget_max)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2">Proposed Rate</h5>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(application.proposed_rate)}</p>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Timeline</h5>
                  <div className="space-y-2 text-sm border-l-2 border-gray-200 pl-4">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs">Applied</span>
                      <span className="text-gray-900 font-medium">{formatDate(application.applied_at)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs">Available From</span>
                      <span className="text-gray-900 font-medium">{formatDate(application.availability_start)}</span>
                    </div>
                  </div>
                </div>

                {application.worker_details && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Applicant</h5>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                        {application.worker_details.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{application.worker_details.full_name}</p>
                        <p className="text-xs text-gray-500">{application.worker_details.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
              {(application.status === "pending" || application.status === "reviewed") && (
                <>
                  <button
                    onClick={() => onUpdateStatus(application.id, "reviewed", getWorkerId())}
                    disabled={processingIds.has(application.id)}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                  >
                    {processingIds.has(application.id) ? "..." : <Star className="w-4 h-4" />} Review
                  </button>
                  <button
                    onClick={() => onUpdateStatus(application.id, "accepted", getWorkerId())}
                    disabled={processingIds.has(application.id)}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                  >
                    {processingIds.has(application.id) ? "..." : <CheckCircle className="w-4 h-4" />} Accept
                  </button>
                  <button
                    onClick={() => onUpdateStatus(application.id, "rejected", getWorkerId())}
                    disabled={processingIds.has(application.id)}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                  >
                    {processingIds.has(application.id) ? "..." : <AlertCircle className="w-4 h-4" />} Reject
                  </button>
                </>
              )}
              <button onClick={onClose} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApplicationViewModal;