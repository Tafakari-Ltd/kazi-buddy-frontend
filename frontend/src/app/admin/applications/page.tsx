// File: src/app/admin/applications/page.tsx

"use client";
import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  DollarSign,
  Eye,
  AlertCircle,
  Search,
  Users,
  Building,
  MapPin,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { JobApplicationApi } from "@/services/jobApplicationApi";
import {
  JobApplicationWithDetails,
  ApplicationStatus,
  ApplicationListResponse,
} from "@/types/jobApplication.types";

const AdminApplicationsPage = () => {
  const [applications, setApplications] = useState<JobApplicationWithDetails[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "accepted">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // UI States for Modals
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplicationWithDetails | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Rejection Logic State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const response: ApplicationListResponse =
        await JobApplicationApi.getAllApplications({
          ordering: "-applied_at",
          expand: "job_details,worker_details,employer_details",
        });

      setApplications(
        response.applications as unknown as JobApplicationWithDetails[],
      );
    } catch (err: any) {
      setError(err.message || "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "accepted" | "rejected",
    notes?: string,
  ) => {
    try {
      setProcessingIds((prev) => new Set([...prev, id]));

      await JobApplicationApi.adminChangeStatus(id, status, notes);

      setApplications((prev) =>
        prev.map((app) =>
          app.id === id
            ? {
                ...app,
                status: status,
                responded_at: new Date().toISOString(),
                employer_notes: notes || app.employer_notes,
              }
            : app,
        ),
      );
      if (selectedApplication?.id === id) {
        setSelectedApplication((prev) =>
          prev
            ? {
                ...prev,
                status,
                employer_notes: notes || prev.employer_notes,
              }
            : null,
        );
        if (status === "rejected") setShowDetailModal(false);
      }

      toast.success(`Application ${status} successfully`);

      // Clear rejection state
      setRejectingId(null);
      setRejectionReason("");
    } catch (err: any) {
      toast.error(err.message || `Failed to ${status} application`);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const initiateRejection = (id: string) => {
    setRejectingId(id);
    setRejectionReason("");
  };

  const filteredApplications = applications.filter((app) => {
    const statusMatch = filter === "all" || app.status === filter;

    const workerName =
      (typeof app.worker !== "string"
        ? app.worker?.user?.full_name
        : undefined) ||
      app.worker_details?.full_name ||
      "";
    const jobTitle =
      (typeof app.job !== "string" ? app.job?.title : undefined) ||
      app.job_details?.title ||
      "";
    const companyName =
      (typeof app.job !== "string"
        ? app.job?.employer?.company_name
        : undefined) ||
      app.employer_details?.company_name ||
      "";

    const searchMatch =
      searchQuery === "" ||
      workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyName.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && searchMatch;
  });

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: string | number) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(typeof amount === "string" ? parseFloat(amount) : amount);
  };

  const pendingCount = applications.filter(
    (app) => app.status === "pending",
  ).length;
  const acceptedCount = applications.filter(
    (app) => app.status === "accepted",
  ).length;

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="grid grid-cols-1 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Job Applications Management
        </h1>
        <p className="text-gray-600 mt-2">
          Review and manage all job applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <div className="flex-shrink-0">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <div className="flex-shrink-0">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Accepted</p>
            <p className="text-2xl font-bold text-gray-900">{acceptedCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <div className="flex-shrink-0">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">
              Total Applications
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {applications.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by worker name, job title, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {(["all", "pending", "accepted"] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                  filter === filterType
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {filterType}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-6">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No applications found
            </h3>
            <p className="text-gray-600">
              {searchQuery || filter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Applications will appear here when workers apply for jobs"}
            </p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div
              key={application.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {(typeof application.worker !== "string"
                          ? application.worker?.user?.full_name
                          : undefined) ||
                          application.worker_details?.full_name ||
                          "Unknown Worker"}
                      </h3>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}
                      >
                        {getStatusIcon(application.status)}
                        {application.status.charAt(0).toUpperCase() +
                          application.status.slice(1)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {(typeof application.job !== "string"
                          ? application.job?.title
                          : undefined) ||
                          application.job_details?.title ||
                          "Unknown Job"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {(typeof application.job !== "string"
                          ? application.job?.employer?.company_name
                          : undefined) ||
                          application.employer_details?.company_name ||
                          "Unknown Company"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied: {formatDate(application.applied_at)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Proposed: {formatCurrency(application.proposed_rate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Available:{" "}
                        {new Date(
                          application.availability_start,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedApplication(application);
                        setShowDetailModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {application.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusChange(application.id, "accepted")
                          }
                          disabled={processingIds.has(application.id)}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          {processingIds.has(application.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() => initiateRejection(application.id)}
                          disabled={processingIds.has(application.id)}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          {processingIds.has(application.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Cover Letter
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                    {application.cover_letter}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Application Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedApplication && (
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
              className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start p-6 border-b sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Application from{" "}
                    {(typeof selectedApplication.worker !== "string"
                      ? selectedApplication.worker?.user?.full_name
                      : undefined) ||
                      selectedApplication.worker_details?.full_name ||
                      "Unknown Worker"}
                  </h3>
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}
                  >
                    {getStatusIcon(selectedApplication.status)}
                    {selectedApplication.status.charAt(0).toUpperCase() +
                      selectedApplication.status.slice(1)}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Cover Letter
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedApplication.cover_letter}
                      </p>
                    </div>
                  </div>

                  {(selectedApplication.worker_notes ||
                    selectedApplication.employer_notes) && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        {selectedApplication.employer_notes
                          ? "Rejection Reason / Notes"
                          : "Additional Notes"}
                      </h4>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                        <p className="text-gray-800 leading-relaxed">
                          {selectedApplication.employer_notes ||
                            selectedApplication.worker_notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Job Details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Job Details
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">
                        {selectedApplication.job_details?.title}
                      </h5>
                      <p className="text-blue-800 text-sm mb-2">
                        {selectedApplication.employer_details?.company_name}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-blue-700">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {selectedApplication.job_details?.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {selectedApplication.job_details?.budget_min} -{" "}
                          {selectedApplication.job_details?.budget_max}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Application Info
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Proposed Rate:</span>
                        <span className="font-medium">
                          {formatCurrency(selectedApplication.proposed_rate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available From:</span>
                        <span className="font-medium">
                          {new Date(
                            selectedApplication.availability_start,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Applied:</span>
                        <span className="font-medium">
                          {formatDate(selectedApplication.applied_at)}
                        </span>
                      </div>
                      {selectedApplication.responded_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Responded:</span>
                          <span className="font-medium">
                            {formatDate(selectedApplication.responded_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Worker Info
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">
                        {selectedApplication.worker_details?.full_name}
                      </p>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Mail className="w-4 h-4" />
                        {selectedApplication.worker_details?.email}
                      </div>
                      {selectedApplication.worker_details?.phone_number && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {selectedApplication.worker_details.phone_number}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons in Modal */}
                  {selectedApplication.status === "pending" && (
                    <div className="space-y-2 pt-4 border-t">
                      <button
                        onClick={() =>
                          handleStatusChange(selectedApplication.id, "accepted")
                        }
                        disabled={processingIds.has(selectedApplication.id)}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept Application
                      </button>
                      <button
                        onClick={() => {
                          setShowDetailModal(false); 
                          initiateRejection(selectedApplication.id); 
                        }}
                        disabled={processingIds.has(selectedApplication.id)}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4" />
                        Reject Application
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rejection Note Modal */}
      <AnimatePresence>
        {rejectingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-bold text-red-600 mb-2">
                Reject Application
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Please provide a reason for rejection (optional but
                recommended). This will be sent to the applicant.
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 h-32 mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                placeholder="e.g. Unfortunately, the job has been filled or your skills do not match the requirements..."
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setRejectingId(null);
                    setRejectionReason("");
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleStatusChange(rejectingId, "rejected", rejectionReason)
                  }
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminApplicationsPage;
