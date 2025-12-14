"use client";
import React from "react";
import { CheckCircle, Clock, AlertCircle, Star } from "lucide-react";
import { ApplicationStatus } from "@/types/jobApplication.types";

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return { color: "text-yellow-600 bg-yellow-100", icon: <Clock className="w-3 h-3" /> };
      case "accepted":
        return { color: "text-green-600 bg-green-100", icon: <CheckCircle className="w-3 h-3" /> };
      case "rejected":
        return { color: "text-red-600 bg-red-100", icon: <AlertCircle className="w-3 h-3" /> };
      case "reviewed":
        return { color: "text-blue-600 bg-blue-100", icon: <Star className="w-3 h-3" /> };
      default:
        return { color: "text-gray-600 bg-gray-100", icon: <Clock className="w-3 h-3" /> };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${config.color}`}>
      {config.icon}
      <span className="capitalize">{status}</span>
    </span>
  );
};

export default ApplicationStatusBadge;