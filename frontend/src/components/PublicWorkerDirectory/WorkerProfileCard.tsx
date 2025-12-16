"use client";

import React from "react";
import {
  MapPin,
  Clock,
  DollarSign,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Star,
  Badge,
} from "lucide-react";
import {
  WorkerProfile,
  VerificationStatus,
  formatAvailabilitySchedule,
  isWorkerCurrentlyAvailable,
} from "@/types/worker.types";

interface WorkerProfileCardProps {
  profile: WorkerProfile;
  onViewProfile?: (profileId: string) => void;
  onContactWorker?: (profile: WorkerProfile) => void;
  showActions?: boolean;
  className?: string;
}

const WorkerProfileCard: React.FC<WorkerProfileCardProps> = ({
  profile,
  onViewProfile,
  onContactWorker,
  showActions = true,
  className = "",
}) => {
  const getVerificationIcon = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case VerificationStatus.REJECTED:
        return <XCircle className="w-4 h-4 text-red-600" />;
      case VerificationStatus.SUSPENDED:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getVerificationColor = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return "bg-green-100 text-green-800";
      case VerificationStatus.REJECTED:
        return "bg-red-100 text-red-800";
      case VerificationStatus.SUSPENDED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getAvailabilityStatus = () => {
    if (!profile.is_available) {
      return { text: "Not Available", color: "bg-gray-100 text-gray-800" };
    }

    const isCurrentlyAvailable = isWorkerCurrentlyAvailable(profile);
    return isCurrentlyAvailable
      ? { text: "Available Now", color: "bg-green-100 text-green-800" }
      : { text: "Available", color: "bg-blue-100 text-blue-800" };
  };

  const availabilityStatus = getAvailabilityStatus();
  const completionColor =
    profile.profile_completion_percentage >= 80
      ? "text-green-600"
      : profile.profile_completion_percentage >= 60
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${className}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Worker #{profile.id.substring(0, 8)}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getVerificationColor(profile.verification_status)}`}
              >
                {getVerificationIcon(profile.verification_status)}
                {profile.verification_status.charAt(0).toUpperCase() +
                  profile.verification_status.slice(1)}
              </span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${availabilityStatus.color}`}
              >
                {availabilityStatus.text}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="text-right">
          <div className={`text-sm font-medium ${completionColor}`}>
            {profile.profile_completion_percentage}% Complete
          </div>
          <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
            <div
              className={`h-2 rounded-full transition-all ${
                profile.profile_completion_percentage >= 80
                  ? "bg-green-500"
                  : profile.profile_completion_percentage >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${profile.profile_completion_percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm line-clamp-3">
          {profile.bio || "No bio available"}
        </p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <div>
            <div className="font-medium">{profile.location}</div>
            {profile.location_text && (
              <div className="text-xs text-gray-500">
                {profile.location_text}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Badge className="w-4 h-4" />
          <div>
            <div className="font-medium">{profile.years_experience} years</div>
            <div className="text-xs text-gray-500">Experience</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="w-4 h-4" />
          <div>
            <div className="font-medium">${profile.hourly_rate}/hr</div>
            <div className="text-xs text-gray-500">Hourly rate</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <div>
            <div className="font-medium text-xs">
              {formatAvailabilitySchedule(profile.availability_schedule)}
            </div>
            <div className="text-xs text-gray-500">Schedule</div>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
        <span>
          Created: {new Date(profile.created_at).toLocaleDateString()}
        </span>
        <span>
          Updated: {new Date(profile.updated_at).toLocaleDateString()}
        </span>
      </div>

      {/* Admin Notes (if any) */}
      {profile.admin_notes && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Admin Note
            </span>
          </div>
          <p className="text-sm text-yellow-700">{profile.admin_notes}</p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-3">
          {onViewProfile && (
            <button
              onClick={() => onViewProfile(profile.id)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              View Profile
            </button>
          )}
          {onContactWorker && profile.is_available && (
            <button
              onClick={() => onContactWorker(profile)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Contact Worker
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkerProfileCard;
