"use client";
import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, UserCheck, BriefcaseIcon, FileCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface PendingApprovalsAlertProps {
  pendingUsers: number;
  pendingJobs: number;
  pendingApplications: number;
}

const PendingApprovalsAlert: React.FC<PendingApprovalsAlertProps> = ({
  pendingUsers,
  pendingJobs,
  pendingApplications,
}) => {
  const router = useRouter();
  const totalItems = pendingUsers + pendingJobs + pendingApplications;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 rounded-xl border border-yellow-300 bg-yellow-50 p-4 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
          <AlertCircle className="h-5 w-5 text-yellow-700" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-yellow-900">
            Items requiring your approval
          </h2>
          <p className="mt-1 text-sm text-yellow-900">
            {totalItems === 0 ? (
              "Everything is up to date."
            ) : (
              <>
                There are <strong>{pendingUsers}</strong> users,
                <strong className="mx-1">{pendingJobs}</strong> jobs and
                <strong className="mx-1">{pendingApplications}</strong>
                job applications waiting for your review.
              </>
            )}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => router.push("/admin/approve-users")}
          className="inline-flex items-center gap-2 rounded-lg bg-yellow-700 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-800 transition-colors"
        >
          <UserCheck className="h-4 w-4" />
          Review users
        </button>
        <button
          onClick={() => router.push("/admin/approve-jobs")}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-yellow-900 ring-1 ring-inset ring-yellow-300 hover:bg-yellow-100 transition-colors"
        >
          <BriefcaseIcon className="h-4 w-4" />
          Review jobs
        </button>
        <button
          onClick={() => router.push("/admin/applications")}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-yellow-900 ring-1 ring-inset ring-yellow-300 hover:bg-yellow-100 transition-colors"
        >
          <FileCheck className="h-4 w-4" />
          Review applications
        </button>
      </div>
    </motion.div>
  );
};

export default PendingApprovalsAlert;