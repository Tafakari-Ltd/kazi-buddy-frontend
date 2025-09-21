"use client";
import {
  Ban,
  CheckCircle,
  Mail,
  UploadCloud,
  ArrowRight,
  Calendar,
  Phone,
  AlertCircle,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { dummyApplications } from "@/component/applications/dummyApplications";
import UploadNew from "@/component/UploadNew/UploadNew";
import {
  Application,
  ApplicationStage,
  ApplicationStatus,
} from "@/types/job.types";

import { useRouter } from "next/navigation";


import {
  AppDispatch
} from "@/Redux/Store/Store";





const STATUS_OPTIONS: (
  | ApplicationStatus
  | "All"
  | "Employees Offered Jobs"
  | "Upload Job"
)[] = [
    "All",
    "Pending",
    "Interview Scheduled",
    "Final Interview",
    "Accepted",
    "Rejected",
    "Cancelled",
    "Employees Offered Jobs",
    "Upload Job",
  ];

const STAGES: ApplicationStage[] = [
  "Application Review",
  "Phone Interview",
  "Technical Assessment",
  "In-Person Interview",
  "Reference Check",
  "Offer Extended",
  "Completed",
];

const EmployerApplicationsPage = () => {
  const router = useRouter();

  const [applications, setApplications] =
    useState<Application[]>(dummyApplications);
  const [filter, setFilter] = useState<string>("All");
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [applicationToReject, setApplicationToReject] =
    useState<Application | null>(null);

  const searchParams = useSearchParams();
  const postjob = searchParams.get("postjob");

  useEffect(() => {
    if (postjob === "1" && filter !== "Upload Job") {
      setFilter("Upload Job");
    }
  }, [postjob, filter]);

  const moveToNextStage = (id: number) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const currentStageIndex = STAGES.indexOf(app.stage);
          const nextStageIndex = Math.min(
            currentStageIndex + 1,
            STAGES.length - 1
          );
          const nextStage = STAGES[nextStageIndex];

          let newStatus: ApplicationStatus = app.status;

          if (nextStage === "Phone Interview")
            newStatus = "Interview Scheduled";
          else if (nextStage === "In-Person Interview")
            newStatus = "Final Interview";
          else if (nextStage === "Offer Extended" || nextStage === "Completed")
            newStatus = "Accepted";

          return { ...app, stage: nextStage, status: newStatus };
        }
        return app;
      })
    );
  };



  const handleRejectApplication = () => {
    if (applicationToReject && rejectionReason.trim()) {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationToReject.id
            ? {
              ...app,
              status: "Rejected",
              rejectionReason: rejectionReason.trim(),
            }
            : app
        )
      );
      setShowRejectModal(false);
      setRejectionReason("");
      setApplicationToReject(null);
    }
  };

  const openRejectModal = (application: Application) => {
    setApplicationToReject(application);
    setShowRejectModal(true);
  };

  const respondToApplicant = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const getStageProgress = (stage: ApplicationStage): number => {
    const stageIndex = STAGES.indexOf(stage);
    return ((stageIndex + 1) / STAGES.length) * 100;
  };

  const filteredApplications: Application[] =
    filter === "All"
      ? applications
      : filter === "Employees Offered Jobs"
        ? applications.filter((app) => app.status === "Accepted")
        : filter === "Upload Job"
          ? []
          : applications.filter((app) => app.status === filter);

  const getStatusBadgeClass = (status: ApplicationStatus): string => {
    switch (status) {
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Interview Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Final Interview":
        return "bg-purple-100 text-purple-800";
      case "Cancelled":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-red-800 mb-8 container">
        Manage Job Applications
      </h1>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 flex-wrap container">
        {STATUS_OPTIONS.map((statusOption) => (
          <button
            key={statusOption}
            onClick={() => {
              if (postjob === "1") {
                router.push("/employer");
              }
              setFilter(statusOption);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${filter === statusOption
              ? "bg-red-800 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
          >
            {statusOption === "Employees Offered Jobs" && (
              <Users className="w-4 h-4" />
            )}
            {statusOption === "Upload Job" && (
              <UploadCloud className="w-4 h-4" />
            )}
            {statusOption}
          </button>
        ))}
      </div>

      {/* Upload Job View */}
      {filter === "Upload Job" && (
        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg container">
          <UploadNew />
        </div>
      )}

      {/* Applications List */}
      {filter !== "Upload Job" && (
        <div className="grid gap-6 container">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">
                No applications found for this filter.
              </p>
            </div>
          ) : (
            filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white p-6 shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-red-800 mb-1">
                      {app.applicantName}
                    </h2>
                    <p className="text-gray-700 mb-2">
                      Applied for: <strong>{app.jobTitle}</strong>
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied:{" "}
                        {new Date(app.appliedDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {app.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {app.experience}
                      </span>
                      <span>Availability: {app.availability}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>

                    {app.status !== "Rejected" && app.status !== "Accepted" && (
                      <>
                        <button
                          onClick={() => respondToApplicant(app.email)}
                          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </button>
                        <button
                          onClick={() => moveToNextStage(app.id)}
                          className="text-green-600 hover:underline text-sm flex items-center gap-1"
                          title="Move to next stage"
                        >
                          <ArrowRight className="w-4 h-4" />
                          Next Stage
                        </button>
                        <button
                          onClick={() => openRejectModal(app)}
                          className="text-red-600 hover:underline text-sm flex items-center gap-1"
                          title="Reject Application"
                        >
                          <Ban className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}

                    {app.status === "Rejected" && (
                      <button
                        onClick={() =>
                          alert(
                            `Rejection Reason: ${app.rejectionReason || "N/A"}`
                          )
                        }
                        className="text-red-600 underline text-sm"
                        title="View Rejection Reason"
                      >
                        View Reason
                      </button>
                    )}

                    {app.status === "Accepted" && (
                      <span className="text-green-700 font-semibold text-sm flex items-center gap-1">
                        <CheckCircle className="w-5 h-5" />
                        Hired
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{app.message}</p>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-red-800 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getStageProgress(app.stage)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">Stage: {app.stage}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 container">
          <div className="bg-white p-6 rounded-lg w-full max-w-[700px] shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-red-800">
              Reject Application
            </h3>
            <p className="mb-2 text-gray-700">
              Reason for rejecting{" "}
              <strong>{applicationToReject?.applicantName}</strong>?
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border rounded p-2 mb-4 border-neutral-300"
              rows={15}
              placeholder="Type rejection reason..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setApplicationToReject(null);
                }}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectApplication}
                disabled={!rejectionReason.trim()}
                className={`px-4 py-2 rounded text-white ${rejectionReason.trim()
                  ? "bg-red-800 hover:bg-red-700"
                  : "bg-red-300 cursor-not-allowed"
                  }`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerApplicationsPage;
