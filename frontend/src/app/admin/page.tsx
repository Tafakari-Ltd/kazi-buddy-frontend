  "use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
 Users,
 Briefcase,
 FileText,
 Building2,
 AlertCircle,
 CheckCircle,
 Clock,
 XCircle,
 TrendingUp,
 ArrowRight,
 UserCheck,
 BriefcaseIcon,
 FileCheck,
 Pause,
 PlayCircle,
 Ban,
 Eye,
 Star,
 Plus,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/Redux/Store/Store";
import { approveUser } from "@/Redux/Features/authSlice";
import { JobApplicationApi } from "@/services/jobApplicationApi";
import api from "@/lib/axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ProtectedRoute from "@/component/Authentication/ProtectedRoute";

interface PendingUser {
 id?: string;
 user_id?: string;
 uuid?: string;
 username: string;
 email: string;
 full_name: string;
 phone_number: string;
 user_type: string;
 created_at: string;
}

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

interface CategorySummary {
 id: string;
 name: string;
 jobsCount: number;
}

const getPendingUserId = (user: PendingUser): string | undefined => {
 return user.id || user.user_id || user.uuid;
};

const AdminDashboard: React.FC = () => {
 const router = useRouter();
 const dispatch = useDispatch<AppDispatch>();

 const [stats, setStats] = useState<DashboardStats>({
 totalWorkers: 0,
 totalEmployers: 0,
 totalJobs: 0,
 totalApplications: 0,
 totalCategories: 0,
 pendingUsers: 0,
 pendingJobs: 0,
 pendingApplications: 0,
 reviewedApplications: 0,
 acceptedApplications: 0,
 rejectedApplications: 0,
 activeJobs: 0,
 draftJobs: 0,
 pausedJobs: 0,
 closedJobs: 0,
 cancelledJobs: 0,
 });

 const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
 const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>([]);
 const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
 const [newCategoryName, setNewCategoryName] = useState("");
 const [newCategoryDescription, setNewCategoryDescription] = useState("");
 const [creatingCategory, setCreatingCategory] = useState(false);
 const [createCategoryErrors, setCreateCategoryErrors] = useState<{
 name?: string;
 description?: string;
 }>({});
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

 // Fetch all data in parallel so the dashboard loads quickly
 const [
 workersResp,
 employersResp,
 jobsResp,
 applicationsResp,
 pendingUsersResp,
 pendingJobsResp,
 categoriesResp,
 ] = await Promise.all([
 api.get("/workers/profiles/list/"),
 api.get("/employers/employer-profiles/"),
 api.get("/adminpanel/admin/jobs/"),
 JobApplicationApi.getAllApplications({}),
 api.get("/adminpanel/users/pending/"),
 api.get("/adminpanel/jobs/pending/"),
 api.get("/jobs/categories/"),
 ]);

 const workers = normalizeList(workersResp);
 const employers = normalizeList(employersResp);

 // Jobs from adminpanel so we see approval status as well
 const jobs = Array.isArray(jobsResp)
 ? jobsResp
 : (jobsResp as any)?.data || normalizeList(jobsResp);

 const applications = (applicationsResp as any)?.applications || [];

 const pendingUsersList = normalizeList(pendingUsersResp) as PendingUser[];
 const pendingJobsList = normalizeList(pendingJobsResp);
 const categories = normalizeList(categoriesResp) as { id: string; name: string }[];

 const pendingApplicationsList = applications.filter(
 (app: any) => app.status === "pending"
 );
 const reviewedApplicationsList = applications.filter(
 (app: any) => app.status === "reviewed"
 );
 const acceptedApplicationsList = applications.filter(
 (app: any) => app.status === "accepted"
 );
 const rejectedApplicationsList = applications.filter(
 (app: any) => app.status === "rejected"
 );

 const activeJobs = jobs.filter((j: any) => j.status === "active").length;
 const draftJobs = jobs.filter((j: any) => j.status === "draft").length;
 const pausedJobs = jobs.filter((j: any) => j.status === "paused").length;
 const closedJobs = jobs.filter((j: any) => j.status === "closed").length;
 const cancelledJobs = jobs.filter(
 (j: any) => j.status === "cancelled"
 ).length;

 // Build category summaries (jobs per category)
 const jobsByCategory: Record<string, number> = {};
 jobs.forEach((job: any) => {
 const cat = job.category;
 // cat can be an id or an object
 const catId = typeof cat === "string" ? cat : cat?.id;
 if (!catId) return;
 jobsByCategory[catId] = (jobsByCategory[catId] || 0) + 1;
 });

 const categorySummariesData: CategorySummary[] = categories
 .map((cat) => ({
 id: cat.id,
 name: cat.name,
 jobsCount: jobsByCategory[cat.id] || 0,
 }))
 .sort((a, b) => b.jobsCount - a.jobsCount || a.name.localeCompare(b.name));

 setStats({
 totalWorkers: (workersResp as any)?.pagination?.total ?? workers.length,
 totalEmployers:
 (employersResp as any)?.pagination?.total ?? employers.length,
 totalJobs: jobs.length,
 totalApplications: applications.length,
 totalCategories: categories.length,
 pendingUsers: pendingUsersList.length,
 pendingJobs: pendingJobsList.length,
 pendingApplications: pendingApplicationsList.length,
 reviewedApplications: reviewedApplicationsList.length,
 acceptedApplications: acceptedApplicationsList.length,
 rejectedApplications: rejectedApplicationsList.length,
 activeJobs,
 draftJobs,
 pausedJobs,
 closedJobs,
 cancelledJobs,
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

 const resultAction = await dispatch(
 approveUser({ userId, data: approvalData })
 );

 if (approveUser.fulfilled.match(resultAction)) {
 toast.success(`${user.full_name} approved successfully!`);
 await fetchDashboardData();
 } else if (approveUser.rejected.match(resultAction)) {
 toast.error(resultAction.payload || "Failed to approve user");
 }
 } catch (err: any) {
 toast.error(
 err?.message || "An error occurred while approving the user"
 );
 } finally {
 setApprovingId(null);
 }
 };

 const totalApprovalItems =
 stats.pendingUsers + stats.pendingJobs + stats.pendingApplications;

 const validateNewCategory = () => {
 const errors: { name?: string; description?: string } = {};

 if (!newCategoryName.trim()) {
 errors.name = "Category name is required";
 } else if (newCategoryName.trim().length < 2) {
 errors.name = "Category name must be at least 2 characters";
 }

 if (!newCategoryDescription.trim()) {
 errors.description = "Description is required";
 } else if (newCategoryDescription.trim().length < 10) {
 errors.description = "Description must be at least 10 characters";
 }

 setCreateCategoryErrors(errors);
 return Object.keys(errors).length === 0;
 };

 const handleCreateCategoryFromDashboard = async (
 e: React.FormEvent<HTMLFormElement>
 ) => {
 e.preventDefault();
 if (!validateNewCategory()) return;

 try {
 setCreatingCategory(true);
 await api.post("/jobs/categories/create/", {
 name: newCategoryName.trim(),
 description: newCategoryDescription.trim(),
 });

 toast.success("Category created successfully");
 setShowCreateCategoryModal(false);
 setNewCategoryName("");
 setNewCategoryDescription("");
 setCreateCategoryErrors({});

 // Refresh dashboard stats and top categories
 await fetchDashboardData();

 // After creating from the dashboard, take the admin to full categories management
 router.push("/admin/categories");
 } catch (error: any) {
 toast.error(
 error?.message || "Failed to create category. Please try again."
 );
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
 A single place to see what is happening in the system and what
 needs your attention.
 </p>
 </div>
 <div className="flex flex-wrap gap-3">
 <button
 onClick={() => router.push("/admin/workers/all")}
 className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
 >
 <Users className="h-4 w-4" />
 View workers
 </button>
 <button
 onClick={() => router.push("/admin/employers/all")}
 className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
 >
 <Building2 className="h-4 w-4" />
 View employers
 </button>
 </div>
 </div>

 {/* Loading state */}
 {loading ? (
 <div className="space-y-6">
 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
 {Array.from({ length: 4 }).map((_, idx) => (
 <div
 key={idx}
 className="h-28 animate-pulse rounded-xl bg-gray-200"
 />
 ))}
 </div>
 <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
 <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
 <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
 </div>
 </div>
 ) : (
 <>
 {/* Alert for items requiring approval */}
 <motion.div
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex flex-col gap-4 rounded-xl border border-yellow-300 bg-yellow-50 p-4 md:flex-row md:items-center md:justify-between"
 >
 <div className="flex items-start gap-3">
 <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
 <AlertCircle className="h-5 w-5 text-yellow-700" />
 </div>
 <div>
 <h2 className="text-sm font-semibold text-yellow-900">
 Items requiring your approval
 </h2>
 <p className="mt-1 text-sm text-yellow-900">
 {totalApprovalItems === 0 ? (
 "Everything is up to date."
 ) : (
 <>
 There are <strong>{stats.pendingUsers}</strong> users,
 <strong className="mx-1">{stats.pendingJobs}</strong> jobs
 and
 <strong className="mx-1">
 {stats.pendingApplications}
 </strong>
 job applications waiting for your review.
 </>
 )}
 </p>
 </div>
 </div>
 <div className="flex flex-wrap gap-2">
 <button
 onClick={() => router.push("/admin/approve-users")}
 className="inline-flex items-center gap-2 rounded-lg bg-yellow-700 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-800"
 >
 <UserCheck className="h-4 w-4" />
 Review users
 </button>
 <button
 onClick={() => router.push("/admin/approve-jobs")}
 className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-yellow-900 ring-1 ring-inset ring-yellow-300 hover:bg-yellow-100"
 >
 <BriefcaseIcon className="h-4 w-4" />
 Review jobs
 </button>
 <button
 onClick={() => router.push("/admin/applications")}
 className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-yellow-900 ring-1 ring-inset ring-yellow-300 hover:bg-yellow-100"
 >
 <FileCheck className="h-4 w-4" />
 Review applications
 </button>
 </div>
 </motion.div>

 {/* Top-level metrics */}
 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
 <motion.div
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-200"
 >
 <div>
 <p className="text-sm text-gray-500">Total workers</p>
 <p className="mt-1 text-2xl font-bold text-gray-900">
 {stats.totalWorkers}
 </p>
 </div>
 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
 <Users className="h-5 w-5 text-blue-700" />
 </div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.05 }}
 className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-200"
 >
 <div>
 <p className="text-sm text-gray-500">Total employers</p>
 <p className="mt-1 text-2xl font-bold text-gray-900">
 {stats.totalEmployers}
 </p>
 </div>
 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
 <Building2 className="h-5 w-5 text-indigo-700" />
 </div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-200"
 >
 <div>
 <p className="text-sm text-gray-500">Total jobs</p>
 <p className="mt-1 text-2xl font-bold text-gray-900">
 {stats.totalJobs}
 </p>
 </div>
 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
 <Briefcase className="h-5 w-5 text-green-700" />
 </div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.15 }}
 className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-200"
 >
 <div>
 <p className="text-sm text-gray-500">Job applications</p>
 <p className="mt-1 text-2xl font-bold text-gray-900">
 {stats.totalApplications}
 </p>
 </div>
 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
 <FileText className="h-5 w-5 text-purple-700" />
 </div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-200"
 >
 <div>
 <p className="text-sm text-gray-500">Job categories</p>
 <p className="mt-1 text-2xl font-bold text-gray-900">
 {stats.totalCategories}
 </p>
 </div>
 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
 <BriefcaseIcon className="h-5 w-5 text-orange-700" />
 </div>
 </motion.div>
 </div>

 {/* Approval shortcuts */}
 <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
 <div className="flex flex-col justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-200">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-semibold text-gray-800">
 Review pending users
 </p>
 <p className="mt-1 text-sm text-gray-600">
{stats.pendingUsers === 0
 ? "No users are waiting for approval."
 : `${stats.pendingUsers} user${
 stats.pendingUsers > 1 ? "s" : ""
 } waiting for approval.`}
 </p>
 </div>
 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
 <UserCheck className="h-5 w-5 text-blue-700" />
 </div>
 </div>
 <button
 onClick={() => router.push("/admin/approve-users")}
 className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
 >
 Go to user approvals
 <ArrowRight className="h-4 w-4" />
 </button>
 </div>

 <div className="flex flex-col justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-200">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-semibold text-gray-800">
 Review pending jobs
 </p>
 <p className="mt-1 text-sm text-gray-600">
{stats.pendingJobs === 0
 ? "No jobs are waiting for approval."
 : `${stats.pendingJobs} job${
 stats.pendingJobs > 1 ? "s" : ""
 } waiting for approval.`}
 </p>
 </div>
 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
 <BriefcaseIcon className="h-5 w-5 text-green-700" />
 </div>
 </div>
 <button
 onClick={() => router.push("/admin/approve-jobs")}
 className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-900"
 >
 Go to job approvals
 <ArrowRight className="h-4 w-4" />
 </button>
 </div>

 <div className="flex flex-col justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-200">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-semibold text-gray-800">
 Review job applications
 </p>
 <p className="mt-1 text-sm text-gray-600">
{stats.pendingApplications === 0
 ? "No job applications are waiting for review."
 : `${stats.pendingApplications} application${
 stats.pendingApplications > 1 ? "s" : ""
 } waiting for review.`}
 </p>
 </div>
 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
 <FileCheck className="h-5 w-5 text-purple-700" />
 </div>
 </div>
 <button
 onClick={() => router.push("/admin/applications")}
 className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900"
 >
 Go to applications
 <ArrowRight className="h-4 w-4" />
 </button>
 </div>
 </div>

 {/* Summary: jobs, categories & applications */}
 <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
 <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
 <div className="mb-4 flex items-center justify-between">
 <div>
 <h2 className="text-sm font-semibold text-gray-900">
 Jobs overview
 </h2>
 <p className="text-xs text-gray-500">
 Breakdown of jobs by status
 </p>
 </div>
 <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
 <Briefcase className="h-4 w-4 text-gray-700" />
 </div>
 </div>
 <dl className="grid grid-cols-2 gap-3 text-sm">
 <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
 <dt className="flex items-center gap-2 text-green-900">
 <PlayCircle className="h-4 w-4" /> Active
 </dt>
 <dd className="font-semibold text-green-900">
 {stats.activeJobs}
 </dd>
 </div>
 <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
 <dt className="flex items-center gap-2 text-gray-900">
 <Clock className="h-4 w-4" /> Draft
 </dt>
 <dd className="font-semibold text-gray-900">
 {stats.draftJobs}
 </dd>
 </div>
 <div className="flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2">
 <dt className="flex items-center gap-2 text-orange-900">
 <Pause className="h-4 w-4" /> Paused
 </dt>
 <dd className="font-semibold text-orange-900">
 {stats.pausedJobs}
 </dd>
 </div>
 <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
 <dt className="flex items-center gap-2 text-red-900">
 <Ban className="h-4 w-4" /> Closed / cancelled
 </dt>
 <dd className="font-semibold text-red-900">
 {stats.closedJobs + stats.cancelledJobs}
 </dd>
 </div>
 </dl>
 <button
 onClick={() => router.push("/admin/jobs/analytics")}
 className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-gray-900"
 >
 View detailed job analytics
 <TrendingUp className="h-3.5 w-3.5" />
 </button>
 </div>

 <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
 <div className="mb-4 flex items-center justify-between">
 <div>
 <h2 className="text-sm font-semibold text-gray-900">
 Top categories
 </h2>
 <p className="text-xs text-gray-500">
 Categories with the most jobs (up to 5)
 </p>
 </div>
 <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
 <BriefcaseIcon className="h-4 w-4 text-gray-700" />
 </div>
 </div>
 {categorySummaries.length === 0 ? (
 <p className="text-sm text-gray-600">
 No categories have been created yet.
 </p>
 ) : (
 <dl className="space-y-2 text-sm max-h-52 overflow-y-auto pr-1">
 {categorySummaries.slice(0, 5).map((cat) => (
 <div
 key={cat.id}
 className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
 >
 <dt className="text-gray-900 truncate pr-2">
 {cat.name}
 </dt>
 <dd className="text-xs font-medium text-gray-700">
 {cat.jobsCount} job{cat.jobsCount === 1 ? "" : "s"}
 </dd>
 </div>
 ))}
 </dl>
 )}
 <div className="mt-4 flex flex-wrap gap-2">
 <button
 onClick={() => router.push("/admin/categories")}
 className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
 >
 <ArrowRight className="h-3.5 w-3.5" />
 Manage categories
 </button>
 <button
 onClick={() => setShowCreateCategoryModal(true)}
 className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
 >
 <Plus className="h-3.5 w-3.5" />
 Create category
 </button>
 </div>
 </div>

 <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
 <div className="mb-4 flex items-center justify-between">
 <div>
 <h2 className="text-sm font-semibold text-gray-900">
 Applications overview
 </h2>
 <p className="text-xs text-gray-500">
 Status of all job applications
 </p>
 </div>
 <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
 <FileText className="h-4 w-4 text-gray-700" />
 </div>
 </div>
 <dl className="grid grid-cols-2 gap-3 text-sm">
 <div className="flex items-center justify-between rounded-lg bg-yellow-50 px-3 py-2">
 <dt className="flex items-center gap-2 text-yellow-900">
 <Clock className="h-4 w-4" /> Pending
 </dt>
 <dd className="font-semibold text-yellow-900">
 {stats.pendingApplications}
 </dd>
 </div>
 <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
 <dt className="flex items-center gap-2 text-blue-900">
 <Star className="h-4 w-4" /> In review
 </dt>
 <dd className="font-semibold text-blue-900">
 {stats.reviewedApplications}
 </dd>
 </div>
 <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
 <dt className="flex items-center gap-2 text-green-900">
 <CheckCircle className="h-4 w-4" /> Accepted
 </dt>
 <dd className="font-semibold text-green-900">
 {stats.acceptedApplications}
 </dd>
 </div>
 <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
 <dt className="flex items-center gap-2 text-red-900">
 <XCircle className="h-4 w-4" /> Rejected
 </dt>
 <dd className="font-semibold text-red-900">
 {stats.rejectedApplications}
 </dd>
 </div>
 </dl>
 <button
 onClick={() => router.push("/admin/applications")}
 className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-gray-900"
 >
 Open applications management
 <ArrowRight className="h-3.5 w-3.5" />
 </button>
 </div>
 </div>

 {/* Top pending users */}
 <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
 <div className="mb-4 flex items-center justify-between">
 <div>
 <h2 className="text-sm font-semibold text-gray-900">
 Top pending users
 </h2>
 <p className="text-xs text-gray-500">
 The newest users who are waiting for approval.
 </p>
 </div>
 <button
 onClick={() => router.push("/admin/approve-users")}
 className="inline-flex items-center gap-2 text-xs font-medium text-blue-700 hover:text-blue-900"
 >
 View all pending users
 <ArrowRight className="h-3.5 w-3.5" />
 </button>
 </div>

 {pendingUsers.length === 0 ? (
 <p className="text-sm text-gray-600">
 There are currently no users waiting for approval.
 </p>
 ) : (
 <ul className="divide-y divide-gray-100">
 {pendingUsers.map((user, idx) => (
 <li
 key={getPendingUserId(user) || `${user.email}-${idx}`}
 className="flex items-center justify-between py-3"
 >
 <div>
 <p className="text-sm font-medium text-gray-900">
 {user.full_name}
 </p>
 <p className="text-xs text-gray-500">
 {user.email} · {user.phone_number}
 </p>
 <p className="mt-1 text-xs text-gray-500">
 {user.user_type} · Registered on{" "}
 {new Date(user.created_at).toLocaleDateString()}
 </p>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={() => router.push("/admin/approve-users")}
 className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
 >
 <Eye className="h-3.5 w-3.5" />
 Review
 </button>
 <button
 onClick={() => handleApproveUser(user)}
 disabled={approvingId === getPendingUserId(user)}
 className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:bg-gray-300"
 >
 {approvingId === getPendingUserId(user) ? (
 <>
 <span className="h-3 w-3 animate-spin rounded-full border-b-2 border-white" />
 Approving...
 </>
 ) : (
 <>
 <CheckCircle className="h-3.5 w-3.5" />
 Approve
 </>
 )}
 </button>
 </div>
 </li>
 ))}
 </ul>
 )}
 </div>
 </>
 )}
 </div>

 {/* Create Category Modal (Dashboard) */}
 {showCreateCategoryModal && (
 <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
 <motion.div
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.9, opacity: 0 }}
 className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto"
 >
 <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
 <div>
 <h3 className="text-2xl font-bold text-gray-900 mb-1">
 Create job category
 </h3>
 <p className="text-sm text-gray-500">
 Add a new category for jobs without leaving the dashboard.
 </p>
 </div>
 <button
 onClick={() => {
 setShowCreateCategoryModal(false);
 setCreateCategoryErrors({});
 }}
 className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
 >
 <XCircle className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleCreateCategoryFromDashboard} className="space-y-6">
 <div>
 <label className="block text-sm font-semibold text-gray-700 mb-2">
 Category name <span className="text-red-500">*</span>
 </label>
 <input
 type="text"
 value={newCategoryName}
 onChange={(e) => setNewCategoryName(e.target.value)}
 className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
 createCategoryErrors.name
 ? "border-red-300 bg-red-50"
 : "border-gray-200 hover:border-gray-300"
 }`}
 placeholder="e.g. Cleaning, Plumbing, Electrical"
 />
 {createCategoryErrors.name && (
 <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
 <AlertCircle className="w-4 h-4" />
 {createCategoryErrors.name}
 </p>
 )}
 </div>

 <div>
 <label className="block text-sm font-semibold text-gray-700 mb-2">
 Description <span className="text-red-500">*</span>
 </label>
 <textarea
 rows={4}
 value={newCategoryDescription}
 onChange={(e) => setNewCategoryDescription(e.target.value)}
 className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none ${
 createCategoryErrors.description
 ? "border-red-300 bg-red-50"
 : "border-gray-200 hover:border-gray-300"
 }`}
 placeholder="Describe the type of work in this category so employers and workers understand when to use it."
 />
 {createCategoryErrors.description && (
 <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
 <AlertCircle className="w-4 h-4" />
 {createCategoryErrors.description}
 </p>
 )}
 </div>

 <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
 <button
 type="button"
 onClick={() => {
 setShowCreateCategoryModal(false);
 setCreateCategoryErrors({});
 }}
 className="px-5 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={creatingCategory}
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
 >
 {creatingCategory ? (
 <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
 ) : (
 <Plus className="h-4 w-4" />
 )}
 {creatingCategory ? "Creating..." : "Create category"}
 </button>
 </div>
 </form>
 </motion.div>
 </div>
 )}
 </div>
 </ProtectedRoute>
 );
};

export default AdminDashboard;