import React from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  ArrowRight,
  Briefcase,
  UserSearch,
  Shield,
  FileText,
  Users,
  CheckCircle,
} from "lucide-react";
import DashboardStatCard from "@/components/Admin/Dashboard/DashboardStatCard";
import { Application } from "@/types/job.types";
import { getStatusBadgeClass } from "./employerDashboardUtils";

interface DashboardStats {
  totalApplications: number;
  pending: number;
  interviews: number;
  hired: number;
  rejected: number;
  cancelled: number;
  activeJobs: number;
}

interface DashboardOverviewProps {
  stats: DashboardStats;
  recentApplications: Application[];
  companyName?: string;
  industry?: string;
  onViewAllApplications: () => void;
  onUpdateProfile: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  recentApplications,
  companyName,
  industry,
  onViewAllApplications,
  onUpdateProfile,
}) => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={<FileText className="h-5 w-5 text-blue-700" />}
          color="blue"
        />
        <DashboardStatCard
          title="Interviews Scheduled"
          value={stats.interviews}
          icon={<Users className="h-5 w-5 text-purple-700" />}
          color="purple"
          delay={0.1}
        />
        <DashboardStatCard
          title="Hired Candidates"
          value={stats.hired}
          icon={<CheckCircle className="h-5 w-5 text-green-700" />}
          color="green"
          delay={0.2}
        />
        <DashboardStatCard
          title="Active Jobs"
          value={stats.activeJobs}
          icon={<Briefcase className="h-5 w-5 text-orange-700" />}
          color="orange"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity / Applications */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" /> Recent Applications
            </h3>
            <button
              onClick={onViewAllApplications}
              className="text-sm text-[#800000] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {recentApplications.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No applications yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white hover:shadow-md transition cursor-pointer"
                  onClick={onViewAllApplications}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                      {app.applicantName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {app.applicantName}
                      </h4>
                      <p className="text-xs text-gray-500">{app.jobTitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(app.status)}`}
                    >
                      {app.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(app.appliedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Profile Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/employer/manage/jobs")}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-[#800000] hover:text-white transition group"
              >
                <div className="bg-white p-2 rounded shadow-sm group-hover:text-[#800000]">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="font-medium">Manage Jobs</span>
              </button>
              <button
                onClick={() => router.push("/workers")}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-green-600 hover:text-white transition group"
              >
                <div className="bg-white p-2 rounded shadow-sm group-hover:text-green-600">
                  <UserSearch className="w-4 h-4" />
                </div>
                <span className="font-medium">Find Workers</span>
              </button>
              <button
                onClick={onUpdateProfile}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-blue-600 hover:text-white transition group"
              >
                <div className="bg-white p-2 rounded shadow-sm group-hover:text-blue-600">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-medium">Update Profile</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#800000] to-[#5a0000] rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-1">
                {companyName || "Company Profile"}
              </h3>
              <p className="text-red-100 text-sm mb-4">
                {industry || "Industry not set"}
              </p>
              <div className="flex gap-4 text-xs font-medium text-red-100">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">
                    {stats.activeJobs}
                  </span>
                  <span>Active Jobs</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">
                    {stats.hired}
                  </span>
                  <span>Hires</span>
                </div>
              </div>
            </div>
            <Briefcase className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
