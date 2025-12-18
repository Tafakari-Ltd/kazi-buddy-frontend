import React from "react";
import { Users, Search } from "lucide-react";
import { Application, ApplicationStage } from "@/types/job.types";
import ApplicationCard from "./ApplicationCard";

interface ApplicationsListProps {
  title: string;
  applications: Application[];
  stages: ApplicationStage[];
  loading: boolean;
  onEmailCandidate: (email: string) => void;
  onAdvanceApplication?: (application: Application) => void;
  onRejectApplication?: (application: Application) => void;
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({
  title,
  applications,
  stages,
  loading,
  onEmailCandidate,
  onAdvanceApplication,
  onRejectApplication,
}) => {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden min-h-[500px]">
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" /> {title}
        </h2>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">{applications.length}</span>
          <span>applications</span>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800000] mx-auto mb-4"></div>
            <p className="text-gray-500">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No applications found
            </h3>
            <p className="text-gray-500">
              No {title.toLowerCase()} applications at this time.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                stages={stages}
                onEmail={onEmailCandidate}
                onAdvance={
                  onAdvanceApplication ? () => onAdvanceApplication(app) : undefined
                }
                onReject={
                  onRejectApplication ? () => onRejectApplication(app) : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsList;
