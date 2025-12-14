"use client";
import React from "react";
import { MapPin, Building, Plus, Edit } from "lucide-react";
import { VerificationStatus } from "@/types/employer.types";

interface EmployerHeaderProps {
  profile: any;
  hasProfile: boolean;
  onOpenProfileModal: () => void;
  onOpenEditModal: () => void;
}

const EmployerHeader: React.FC<EmployerHeaderProps> = ({
  profile,
  hasProfile,
  onOpenProfileModal,
  onOpenEditModal,
}) => {
  const getVerificationStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED: return "bg-green-100 text-green-800 border-green-200";
      case VerificationStatus.PENDING: return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case VerificationStatus.REJECTED: return "bg-red-100 text-red-800 border-red-200";
      case VerificationStatus.SUSPENDED: return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {profile?.company_name || "Employer Dashboard"}
          </h1>
          {profile ? (
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getVerificationStatusColor(profile.verification_status)}`}>
                {profile.verification_status.charAt(0).toUpperCase() + profile.verification_status.slice(1)}
              </span>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm bg-gray-50 px-3 py-1 rounded-lg">
                <MapPin className="w-4 h-4 text-red-600" />
                {profile.location}
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm bg-gray-50 px-3 py-1 rounded-lg">
                <Building className="w-4 h-4 text-blue-600" />
                {profile.industry}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 mt-2">Create your profile to start posting jobs.</p>
          )}
        </div>

        {!hasProfile ? (
          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 bg-red-800 text-white px-5 py-2.5 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-800/20 font-medium"
          >
            <Plus className="w-4 h-4" />
            Complete Profile
          </button>
        ) : (
          <button
            onClick={onOpenEditModal}
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployerHeader;