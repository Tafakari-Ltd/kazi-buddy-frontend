"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Badge,
  Star,
} from "lucide-react";

import { RootState } from "@/Redux/Store/Store";
import { useWorkerProfiles } from "@/Redux/Functions/useWorkerProfiles";
import {
  WorkerProfile,
  VerificationStatus,
  formatAvailabilitySchedule,
  isWorkerCurrentlyAvailable,
} from "@/types/worker.types";

const WorkerProfilePage = () => {
  const router = useRouter();
  const params = useParams();
  const profileId = params?.id as string;

  // Auth state
  const authState = useSelector((state: RootState) => state.auth || {});
  const { user, isAuthenticated } = authState;

  // Worker profiles hook
  const {
    currentProfile,
    loading,
    error,
    handleFetchWorkerProfileById,
    handleClearState,
  } = useWorkerProfiles();

  // Local state
  const [isClient, setIsClient] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch worker profile on mount
  useEffect(() => {
    if (isClient && profileId) {
      handleFetchWorkerProfileById(profileId);
    }
  }, [isClient, profileId, handleFetchWorkerProfileById]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(
        typeof error === "string" ? error : "Failed to load worker profile",
      );
      handleClearState();
    }
  }, [error, handleClearState]);

  const getVerificationIcon = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case VerificationStatus.REJECTED:
        return <XCircle className="w-5 h-5 text-red-600" />;
      case VerificationStatus.SUSPENDED:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getVerificationColor = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return "bg-green-100 text-green-800 border-green-200";
      case VerificationStatus.REJECTED:
        return "bg-red-100 text-red-800 border-red-200";
      case VerificationStatus.SUSPENDED:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getAvailabilityStatus = (profile: WorkerProfile) => {
    if (!profile.is_available) {
      return { text: "Not Available", color: "bg-gray-100 text-gray-800" };
    }

    const isCurrentlyAvailable = isWorkerCurrentlyAvailable(profile);
    return isCurrentlyAvailable
      ? { text: "Available Now", color: "bg-green-100 text-green-800" }
      : { text: "Available", color: "bg-blue-100 text-blue-800" };
  };

  const handleContactWorker = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to contact this worker");
      router.push("/auth/login");
      return;
    }

    setShowContactModal(true);
  };

  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}?subject=Job Opportunity via KaziBuddy`;
    setShowContactModal(false);
  };

  // Show loading state during SSR or initial client load
  if (!isClient || loading) {
    return (
      <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="bg-white rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Worker Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The worker profile you're looking for doesn't exist or has been
            removed.
          </p>
          <button
            onClick={() => router.push("/workers")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Browse Workers
          </button>
        </div>
      </div>
    );
  }

  const availabilityStatus = getAvailabilityStatus(currentProfile);
  const completionColor =
    currentProfile.profile_completion_percentage >= 80
      ? "text-green-600"
      : currentProfile.profile_completion_percentage >= 60
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <div className="container mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workers
        </button>
      </div>

      <div className="container max-w-4xl mx-auto">
        {/* Main Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-red-600" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Worker #{currentProfile.id.substring(0, 8)}
                    </h1>

                    {/* Status Badges */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getVerificationColor(currentProfile.verification_status)}`}
                      >
                        {getVerificationIcon(
                          currentProfile.verification_status,
                        )}
                        {currentProfile.verification_status
                          .charAt(0)
                          .toUpperCase() +
                          currentProfile.verification_status.slice(1)}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${availabilityStatus.color}`}
                      >
                        {availabilityStatus.text}
                      </span>
                      <span
                        className={`text-sm font-medium ${completionColor}`}
                      >
                        {currentProfile.profile_completion_percentage}% Complete
                      </span>
                    </div>

                    {/* Key Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {currentProfile.location}
                          </div>
                          {currentProfile.location_text && (
                            <div className="text-xs">
                              {currentProfile.location_text}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <div>
                          <div className="font-medium text-gray-900">
                            ${currentProfile.hourly_rate}/hr
                          </div>
                          <div className="text-xs">Hourly rate</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Badge className="w-4 h-4" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {currentProfile.years_experience} years
                          </div>
                          <div className="text-xs">Experience</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Button */}
                  {currentProfile.is_available && (
                    <div className="flex-shrink-0">
                      <button
                        onClick={handleContactWorker}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Contact Worker
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed">
              {currentProfile.bio || "No bio available"}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Availability Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Availability Schedule
            </h3>
            <div className="text-gray-700">
              {formatAvailabilitySchedule(currentProfile.availability_schedule)}
            </div>
            {Object.keys(currentProfile.availability_schedule).length === 0 && (
              <p className="text-gray-500 italic">No schedule set</p>
            )}
          </div>

          {/* Profile Stats Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Profile Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Member since:</span>
                <span className="font-medium">
                  {new Date(currentProfile.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last updated:</span>
                <span className="font-medium">
                  {new Date(currentProfile.updated_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profile completion:</span>
                <span className={`font-medium ${completionColor}`}>
                  {currentProfile.profile_completion_percentage}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Verification:</span>
                <span className="flex items-center gap-1">
                  {getVerificationIcon(currentProfile.verification_status)}
                  <span className="font-medium capitalize">
                    {currentProfile.verification_status}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Notes (if any) */}
        {currentProfile.admin_notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">
                  Admin Note
                </h3>
                <p className="text-yellow-700">{currentProfile.admin_notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contact CTA */}
        {!currentProfile.is_available && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Worker Not Currently Available
            </h3>
            <p className="text-gray-600">
              This worker is not currently available for new projects.
            </p>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Worker
            </h3>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold">
                    Worker #{currentProfile.id.substring(0, 8)}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {currentProfile.location}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Experience:</span>
                  <span className="font-medium">
                    {currentProfile.years_experience} years
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hourly Rate:</span>
                  <span className="font-medium">
                    ${currentProfile.hourly_rate}/hr
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Options */}
            <div className="space-y-3">
              <button
                onClick={() => handleSendEmail("worker@example.com")}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Send Email
              </button>

              <button
                onClick={() => {
                  toast.info("Phone contact feature coming soon!");
                }}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Request Phone Call
              </button>
            </div>

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerProfilePage;
