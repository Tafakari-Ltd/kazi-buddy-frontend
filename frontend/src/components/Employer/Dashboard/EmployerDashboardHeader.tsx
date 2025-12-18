import React from "react";
import { useRouter } from "next/navigation";
import { Home, UserSearch, MessageSquare, Plus } from "lucide-react";

interface EmployerDashboardHeaderProps {
  companyName?: string;
  industry?: string;
  hasProfile: boolean;
  onPostJob: () => void;
}

const EmployerDashboardHeader: React.FC<EmployerDashboardHeaderProps> = ({
  companyName,
  industry,
  hasProfile,
  onPostJob,
}) => {
  const router = useRouter();

  return (
    <div className="container mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/")}
          className="text-gray-500 hover:text-gray-900 transition flex items-center gap-2"
        >
          <Home className="w-4 h-4" /> Home
        </button>
        <div className="h-4 w-[1px] bg-gray-300"></div>
        <div>
          {hasProfile && companyName ? (
            <>
              <h1 className="text-xl font-bold text-gray-800">{companyName}</h1>
              {industry && <p className="text-sm text-gray-500">{industry}</p>}
            </>
          ) : (
            <h1 className="text-xl font-bold text-gray-800">Employer Portal</h1>
          )}
        </div>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={() => router.push("/workers")}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm transition"
        >
          <UserSearch className="w-4 h-4" /> Find Workers
        </button>
        <button
          onClick={() => router.push("/messages")}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm transition"
        >
          <MessageSquare className="w-4 h-4" /> Messages
        </button>
        <button
          onClick={onPostJob}
          className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2 rounded-lg hover:bg-[#600000] shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Post a Job
        </button>
      </div>
    </div>
  );
};

export default EmployerDashboardHeader;
