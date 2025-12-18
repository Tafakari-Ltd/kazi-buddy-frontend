import React from "react";
import {
  Mail,
  CheckCircle,
  Ban,
  Calendar,
  Phone,
  Briefcase,
} from "lucide-react";
import { Application, ApplicationStage } from "@/types/job.types";
import { getStatusBadgeClass, getStageProgress } from "./employerDashboardUtils";

interface ApplicationCardProps {
  application: Application;
  stages: ApplicationStage[];
  onEmail: (email: string) => void;
  onAdvance?: () => void;
  onReject?: () => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  stages,
  onEmail,
  onAdvance,
  onReject,
}) => {
  const showActions =
    application.status !== "Rejected" &&
    application.status !== "Accepted" &&
    application.status !== "Cancelled";

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-[#800000]/30 hover:shadow-md transition-all group">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#800000] transition">
              {application.applicantName}
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(application.status)}`}
            >
              {application.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Applied for:{" "}
            <span className="font-medium text-gray-900">
              {application.jobTitle}
            </span>
          </p>

          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
              <Calendar className="w-3 h-3" />{" "}
              {new Date(application.appliedDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
              <Phone className="w-3 h-3" /> {application.phone}
            </span>
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
              <Briefcase className="w-3 h-3" /> {application.experience}
            </span>
          </div>
        </div>

        <div className="flex md:flex-col items-end justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => onEmail(application.email)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded border border-gray-200"
              title="Email Candidate"
            >
              <Mail className="w-4 h-4" />
            </button>
            {showActions && (
              <>
                {onAdvance && (
                  <button
                    onClick={onAdvance}
                    className="p-2 text-green-600 hover:bg-green-50 rounded border border-gray-200"
                    title="Advance Application"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                {onReject && (
                  <button
                    onClick={onReject}
                    className="p-2 text-red-600 hover:bg-red-50 rounded border border-gray-200"
                    title="Reject Application"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Stage: {application.stage}</span>
          <span>{Math.round(getStageProgress(application.stage, stages))}% Complete</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-[#800000] h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${getStageProgress(application.stage, stages)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
