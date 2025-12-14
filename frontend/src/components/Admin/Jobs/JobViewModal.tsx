"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit2 } from "lucide-react";
import { Job, JOB_STATUS_OPTIONS, JOB_TYPE_OPTIONS, URGENCY_LEVEL_OPTIONS, PAYMENT_TYPE_OPTIONS } from "@/types/job.types";

interface JobViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  categoryName: string;
  onEdit: (jobId: string) => void;
}

const JobViewModal: React.FC<JobViewModalProps> = ({ isOpen, onClose, job, categoryName, onEdit }) => {
  if (!job) return null;

  const formatCurrency = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const getStatusColor = (status: string) => JOB_STATUS_OPTIONS.find((o) => o.value === status)?.color || "bg-gray-100 text-gray-600";
  const getUrgencyColor = (urgency: string) => URGENCY_LEVEL_OPTIONS.find((o) => o.value === urgency)?.color || "bg-gray-100 text-gray-600";

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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                    {JOB_STATUS_OPTIONS.find((o) => o.value === job.status)?.label}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(job.urgency_level)}`}>
                    {URGENCY_LEVEL_OPTIONS.find((o) => o.value === job.urgency_level)?.label}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Job Description</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Job Type</h5>
                    <p className="text-gray-600">{JOB_TYPE_OPTIONS.find((o) => o.value === job.job_type)?.label}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Payment Type</h5>
                    <p className="text-gray-600">{PAYMENT_TYPE_OPTIONS.find((o) => o.value === job.payment_type)?.label}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-3">Budget</h5>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(job.budget_min)} - {formatCurrency(job.budget_max)}</p>
                  <p className="text-sm text-blue-700 mt-1">Estimated {job.estimated_hours} hours</p>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Details</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Category:</span><span className="text-gray-900">{categoryName}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Location:</span><span className="text-gray-900">{job.location}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Start Date:</span><span className="text-gray-900">{formatDate(job.start_date)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">End Date:</span><span className="text-gray-900">{formatDate(job.end_date)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Max Applicants:</span><span className="text-gray-900">{job.max_applicants}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
              <button onClick={onClose} className="px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium">Close</button>
              <button onClick={() => onEdit(job.id)} className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 inline-flex items-center gap-2 transition-all shadow-lg font-medium">
                <Edit2 className="w-4 h-4" /> Edit Job
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JobViewModal;