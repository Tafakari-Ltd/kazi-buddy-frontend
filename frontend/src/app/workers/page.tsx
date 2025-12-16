"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Users, Search, Filter, Mail, Phone, MapPin } from "lucide-react";

import { RootState } from "@/Redux/Store/Store";
import { useWorkerProfiles } from "@/Redux/Functions/useWorkerProfiles";
import WorkerProfilesList from "@/components/PublicWorkerDirectory/WorkerProfilesList";
import { WorkerProfile, WorkerProfileFilters } from "@/types/worker.types";

const WorkersListingPage = () => {
  const router = useRouter();

  // Auth state
  const authState = useSelector((state: RootState) => state.auth || {});
  const { user, isAuthenticated } = authState;

  // Worker profiles hook
  const {
    profiles,
    loading,
    error,
    handleFetchWorkerProfiles,
    handleClearState,
  } = useWorkerProfiles();

  // Local state
  const [isClient, setIsClient] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(
    null,
  );

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch workers on mount
  useEffect(() => {
    if (isClient) {
      handleFetchWorkerProfiles();
    }
  }, [isClient, handleFetchWorkerProfiles]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(typeof error === "string" ? error : "Failed to load workers");
      handleClearState();
    }
  }, [error, handleClearState]);

  const handleFilterChange = (filters: WorkerProfileFilters) => {
    console.log("Applying filters:", filters);
    handleFetchWorkerProfiles(filters);
  };

  const handleViewProfile = (profileId: string) => {
    router.push(`/workers/${profileId}`);
  };

  const handleContactWorker = (profile: WorkerProfile) => {
    if (!isAuthenticated) {
      toast.error("Please log in to contact workers");
      router.push("/auth/login");
      return;
    }

    setSelectedWorker(profile);
    setShowContactModal(true);
  };

  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}?subject=Job Opportunity via KaziBuddy`;
    setShowContactModal(false);
  };

  const handleRefresh = () => {
    handleFetchWorkerProfiles();
  };

  // Show loading state during SSR or initial client load
  if (!isClient) {
    return (
      <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="container mb-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-red-800 mb-4">
            Find Skilled Workers
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Connect with verified workers in your area. Browse profiles, check
            availability, and hire the right person for your project.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <Users className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {profiles.length}
              </div>
              <div className="text-sm text-gray-600">Available Workers</div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {new Set(profiles.map((p) => p.location)).size}
              </div>
              <div className="text-sm text-gray-600">Cities Covered</div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <Search className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {
                  profiles.filter((p) => p.verification_status === "verified")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">Verified Workers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Workers List */}
      <div className="container">
        <WorkerProfilesList
          profiles={profiles}
          loading={loading}
          onFilterChange={handleFilterChange}
          onViewProfile={handleViewProfile}
          onContactWorker={handleContactWorker}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Contact Worker Modal */}
      {showContactModal && selectedWorker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Worker
            </h3>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold">
                    Worker #{selectedWorker.id.substring(0, 8)}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedWorker.location}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Experience:</span>
                  <span className="font-medium">
                    {selectedWorker.years_experience} years
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hourly Rate:</span>
                  <span className="font-medium">
                    ${selectedWorker.hourly_rate}/hr
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Availability:</span>
                  <span
                    className={`font-medium ${
                      selectedWorker.is_available
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {selectedWorker.is_available
                      ? "Available"
                      : "Not Available"}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Options */}
            <div className="space-y-3">
              <button
                onClick={() => handleSendEmail("worker@example.com")} // In real app, get from user data
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Send Email
              </button>

              <button
                onClick={() => {
                  // In real app, implement phone contact functionality
                  toast.info("Phone contact feature coming soon!");
                }}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Worker
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

export default WorkersListingPage;
