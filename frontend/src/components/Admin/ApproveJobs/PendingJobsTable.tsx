"use client";
import React from "react";
import { Calendar, DollarSign, MapPin, Users, Building2, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";

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
  admin_approved?: boolean;
  start_date?: string;
  end_date?: string;
  max_applicants?: number;
  employer: {
    company_name: string;
    user: {
      full_name: string;
      email: string;
    };
  };
  category: {
    name: string;
  };
}

interface PendingJobsTableProps {
  jobs: PendingJobInterface[];
  onView: (job: PendingJobInterface) => void;
  onApprove: (job: PendingJobInterface) => void;
  onReject: (job: PendingJobInterface) => void;
  processingJobId: string | null;
  processingAction: "approve" | "reject" | null;
}

const PendingJobsTable: React.FC<PendingJobsTableProps> = ({
  jobs,
  onView,
  onApprove,
  onReject,
  processingJobId,
  processingAction,
}) => {
  const formatCurrency = (value: string | number) => {
    const n = typeof value === "string" ? Number(value) : value;
    if (!n || Number.isNaN(n)) return "N/A";
    return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
  };

  const formatDate = (value: string | undefined) => {
    if (!value) return "Not specified";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
  };

  const getStatusBadge = (status: string) => {
    // In the pending jobs table, "active" status means it's waiting for approval but user set it to active
    if (status === 'active') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">Pending</span>;
    }
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Active</span>;
      case 'paused':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">Paused</span>;
      case 'draft':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Draft</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
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
            {jobs.map((job, idx) => {
              const isApproving = processingJobId === job.id && processingAction === "approve";
              const isRejecting = processingJobId === job.id && processingAction === "reject";
              const isBusy = isApproving || isRejecting;

              return (
                <tr key={job.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-900 line-clamp-1">{job.title}</span>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(job.start_date)}</span>
                        <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> Max {job.max_applicants ?? 0}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-gray-900">{job.employer?.company_name || "Unknown"}</span>
                      <span className="text-xs text-gray-500">{job.employer?.user?.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      <Building2 className="h-3 w-3" /> {job.category?.name || "Uncategorised"}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-700">
                      <MapPin className="h-3 w-3" /> {job.location}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-800">
                      <DollarSign className="h-3 w-3" /> {formatCurrency(job.budget_min)} - {formatCurrency(job.budget_max)}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-2 items-start">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 font-medium text-xs border border-yellow-200">
                           <AlertCircle className="w-3 h-3" /> Awaiting Approval
                        </span>
                        {getStatusBadge(job.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-center">
                    <div className="flex flex-col md:flex-row gap-2 justify-center">
                      <button onClick={() => onView(job)} className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        <Eye className="h-3 w-3" /> View
                      </button>
                      <button onClick={() => onApprove(job)} disabled={isBusy} className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400">
                        {isApproving ? <span className="animate-spin h-3 w-3 border-b-2 border-white rounded-full" /> : <CheckCircle className="h-3 w-3" />}
                        {isApproving ? "" : "Approve"}
                      </button>
                      <button onClick={() => onReject(job)} disabled={isBusy} className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded-md text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-60">
                        {isRejecting ? <span className="animate-spin h-3 w-3 border-b-2 border-red-700 rounded-full" /> : <XCircle className="h-3 w-3" />}
                        {isRejecting ? "" : "Reject"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingJobsTable;