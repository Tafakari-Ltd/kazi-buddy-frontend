"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Briefcase, FileText, Building2, BriefcaseIcon, ArrowRight, TrendingUp, PlayCircle, Clock, Pause, Ban, CheckCircle, XCircle, Star } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/Redux/Store/Store";
import { approveUser } from "@/Redux/Features/authSlice";
import { JobApplicationApi } from "@/services/jobApplicationApi";
import api from "@/lib/axios";
import { toast } from "sonner";
import ProtectedRoute from "@/component/Authentication/ProtectedRoute";
import DashboardStatCard from "@/components/Admin/Dashboard/DashboardStatCard";
import PendingApprovalsAlert from "@/components/Admin/Dashboard/PendingApprovalsAlert";
import CategorySummaryWidget, { CategorySummary } from "@/components/Admin/Dashboard/CategorySummaryWidget";
import RecentActivityList, { PendingUser } from "@/components/Admin/Dashboard/RecentActivityList";
import CreateCategoryModal from "@/components/Admin/Categories/CreateCategoryModal";

// Types
interface DashboardStats {
  totalWorkers: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  totalCategories: number;
  pendingUsers: number;
  pendingJobs: number;
  pendingApplications: number;
  reviewedApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  activeJobs: number;
  draftJobs: number;
  pausedJobs: number;
  closedJobs: number;
  cancelledJobs: number;
}

const getPendingUserId = (user: PendingUser): string | undefined => {
  return user.id || user.user_id || user.uuid;
};

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [stats, setStats] = useState<DashboardStats>({
    totalWorkers: 0, totalEmployers: 0, totalJobs: 0, totalApplications: 0, totalCategories: 0,
    pendingUsers: 0, pendingJobs: 0, pendingApplications: 0,
    reviewedApplications: 0, acceptedApplications: 0, rejectedApplications: 0,
    activeJobs: 0, draftJobs: 0, pausedJobs: 0, closedJobs: 0, cancelledJobs: 0,
  });

  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>([]);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const normalizeList = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get("/workers/profiles/list/"),
        api.get("/employers/employer-profiles/"),
        api.get("/adminpanel/admin/jobs/"), 
        JobApplicationApi.getAllApplications({}),
        api.get("/adminpanel/users/pending/"),
        api.get("/adminpanel/jobs/pending/"),
        api.get("/jobs/categories/"),
      ]);

      const getResult = (result: PromiseSettledResult<any>) => result.status === "fulfilled" ? result.value : null;

      const workersResp = getResult(results[0]);
      const employersResp = getResult(results[1]);
      const jobsResp = getResult(results[2]);
      const applicationsResp = getResult(results[3]);
      const pendingUsersResp = getResult(results[4]);
      const pendingJobsResp = getResult(results[5]);
      const categoriesResp = getResult(results[6]);

      const workers = normalizeList(workersResp);
      const employers = normalizeList(employersResp);
      const jobs = Array.isArray(jobsResp) ? jobsResp : (jobsResp as any)?.data || normalizeList(jobsResp);
      const applications = (applicationsResp as any)?.applications || [];
      const pendingUsersList = normalizeList(pendingUsersResp) as PendingUser[];
      const pendingJobsList = normalizeList(pendingJobsResp);
      const categories = normalizeList(categoriesResp) as { id: string; name: string }[];

      const pendingApplicationsList = applications.filter((app: any) => app.status === "pending");
      const reviewedApplicationsList = applications.filter((app: any) => app.status === "reviewed");
      const acceptedApplicationsList = applications.filter((app: any) => app.status === "accepted");
      const rejectedApplicationsList = applications.filter((app: any) => app.status === "rejected");

      const activeJobs = jobs.filter((j: any) => j.status === "active").length;
      const draftJobs = jobs.filter((j: any) => j.status === "draft").length;
      const pausedJobs = jobs.filter((j: any) => j.status === "paused").length;
      const closedJobs = jobs.filter((j: any) => j.status === "closed").length;
      const cancelledJobs = jobs.filter((j: any) => j.status === "cancelled").length;

      const jobsByCategory: Record<string, number> = {};
      jobs.forEach((job: any) => {
        const cat = job.category;
        const catId = typeof cat === "string" ? cat : cat?.id;
        if (!catId) return;
        jobsByCategory[catId] = (jobsByCategory[catId] || 0) + 1;
      });

      const categorySummariesData: CategorySummary[] = categories.map((cat) => ({
        id: cat.id, name: cat.name, jobsCount: jobsByCategory[cat.id] || 0,
      })).sort((a, b) => b.jobsCount - a.jobsCount || a.name.localeCompare(b.name));

      setStats({
        totalWorkers: (workersResp as any)?.pagination?.total ?? workers.length,
        totalEmployers: (employersResp as any)?.pagination?.total ?? employers.length,
        totalJobs: jobs.length,
        totalApplications: applications.length,
        totalCategories: categories.length,
        pendingUsers: pendingUsersList.length,
        pendingJobs: pendingJobsList.length,
        pendingApplications: pendingApplicationsList.length,
        reviewedApplications: reviewedApplicationsList.length,
        acceptedApplications: acceptedApplicationsList.length,
        rejectedApplications: rejectedApplicationsList.length,
        activeJobs, draftJobs, pausedJobs, closedJobs, cancelledJobs,
      });

      setCategorySummaries(categorySummariesData);
      setPendingUsers(pendingUsersList.slice(0, 3));
    } catch (error: any) {
      console.error("Failed to load admin dashboard", error);
      toast.error(error?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (user: PendingUser) => {
    const userId = getPendingUserId(user);
    if (!userId) {
      toast.error("Could not determine user id for approval.");
      return;
    }

    try {
      setApprovingId(userId);
      const approvalData = {
        username: user.username,
        phone_number: user.phone_number,
        email: user.email,
        full_name: user.full_name,
        password: "",
        user_type: user.user_type,
      };

      const resultAction = await dispatch(approveUser({ userId, data: approvalData }));

      if (approveUser.fulfilled.match(resultAction)) {
        toast.success(`${user.full_name} approved successfully!`);
        await fetchDashboardData();
      } else if (approveUser.rejected.match(resultAction)) {
        toast.error(resultAction.payload || "Failed to approve user");
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred while approving the user");
    } finally {
      setApprovingId(null);
    }
  };

  const handleCreateCategory = async (name: string, description: string) => {
    try {
      setCreatingCategory(true);
      await api.post("/jobs/categories/create/", {
        name: name.trim(),
        description: description.trim(),
      });
      toast.success("Category created successfully");
      setShowCreateCategoryModal(false);
      await fetchDashboardData();
      router.push("/admin/categories");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create category");
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
        <div className="container space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin dashboard</h1>
              <p className="text-gray-600 mt-2 max-w-xl">
                A single place to see what is happening in the system and what needs your attention.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => router.push("/admin/workers/all")} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Users className="h-4 w-4" /> View workers
              </button>
              <button onClick={() => router.push("/admin/employers/all")} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Building2 className="h-4 w-4" /> View employers
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200" />)}
              </div>
              <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
                <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
              </div>
            </div>
          ) : (
            <>
              {/* Alert */}
              <PendingApprovalsAlert 
                pendingUsers={stats.pendingUsers}
                pendingJobs={stats.pendingJobs}
                pendingApplications={stats.pendingApplications}
              />

              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                <DashboardStatCard title="Total workers" value={stats.totalWorkers} icon={<Users className="h-5 w-5 text-blue-700" />} color="blue" />
                <DashboardStatCard title="Total employers" value={stats.totalEmployers} icon={<Building2 className="h-5 w-5 text-indigo-700" />} color="indigo" delay={0.05} />
                <DashboardStatCard title="Total jobs" value={stats.totalJobs} icon={<Briefcase className="h-5 w-5 text-green-700" />} color="green" delay={0.1} />
                <DashboardStatCard title="Job applications" value={stats.totalApplications} icon={<FileText className="h-5 w-5 text-purple-700" />} color="purple" delay={0.15} />
                <DashboardStatCard title="Job categories" value={stats.totalCategories} icon={<BriefcaseIcon className="h-5 w-5 text-orange-700" />} color="orange" delay={0.2} />
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Jobs Overview */}
                <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">Jobs overview</h2>
                      <p className="text-xs text-gray-500">Breakdown of jobs by status</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100"><Briefcase className="h-4 w-4 text-gray-700" /></div>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2"><dt className="flex items-center gap-2 text-green-900"><PlayCircle className="h-4 w-4" /> Active</dt><dd className="font-semibold text-green-900">{stats.activeJobs}</dd></div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"><dt className="flex items-center gap-2 text-gray-900"><Clock className="h-4 w-4" /> Draft</dt><dd className="font-semibold text-gray-900">{stats.draftJobs}</dd></div>
                    <div className="flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2"><dt className="flex items-center gap-2 text-orange-900"><Pause className="h-4 w-4" /> Paused</dt><dd className="font-semibold text-orange-900">{stats.pausedJobs}</dd></div>
                    <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2"><dt className="flex items-center gap-2 text-red-900"><Ban className="h-4 w-4" /> Closed/Cancelled</dt><dd className="font-semibold text-red-900">{stats.closedJobs + stats.cancelledJobs}</dd></div>
                  </dl>
                  <button onClick={() => router.push("/admin/jobs/analytics")} className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-gray-900">View analytics <TrendingUp className="h-3.5 w-3.5" /></button>
                </div>

                <CategorySummaryWidget 
                  categories={categorySummaries}
                  onCreateCategory={() => setShowCreateCategoryModal(true)}
                />

                {/* Applications Overview */}
                <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">Applications overview</h2>
                      <p className="text-xs text-gray-500">Status of all applications</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100"><FileText className="h-4 w-4 text-gray-700" /></div>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between rounded-lg bg-yellow-50 px-3 py-2"><dt className="flex items-center gap-2 text-yellow-900"><Clock className="h-4 w-4" /> Pending</dt><dd className="font-semibold text-yellow-900">{stats.pendingApplications}</dd></div>
                    <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2"><dt className="flex items-center gap-2 text-blue-900"><Star className="h-4 w-4" /> In review</dt><dd className="font-semibold text-blue-900">{stats.reviewedApplications}</dd></div>
                    <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2"><dt className="flex items-center gap-2 text-green-900"><CheckCircle className="h-4 w-4" /> Accepted</dt><dd className="font-semibold text-green-900">{stats.acceptedApplications}</dd></div>
                    <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2"><dt className="flex items-center gap-2 text-red-900"><XCircle className="h-4 w-4" /> Rejected</dt><dd className="font-semibold text-red-900">{stats.rejectedApplications}</dd></div>
                  </dl>
                  <button onClick={() => router.push("/admin/applications")} className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-gray-900">Open management <ArrowRight className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              {/* Pending Users List */}
              <RecentActivityList 
                users={pendingUsers} 
                onApprove={handleApproveUser} 
                approvingId={approvingId} 
              />
            </>
          )}
        </div>

        <CreateCategoryModal 
          isOpen={showCreateCategoryModal} 
          onClose={() => setShowCreateCategoryModal(false)}
          onSubmit={handleCreateCategory}
          loading={creatingCategory}
        />
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;