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

  FileCheck,
  Pause,
  PlayCircle,
  Ban,
  Eye,
  Star
} from "lucide-react";
import { motion } from "framer-motion";

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

// Mock API calls (replace with your actual API)
const mockFetchWorkers = async () => ({ length: 145 });
const mockFetchEmployers = async () => ({ length: 67 });
const mockFetchJobs = async () => ([
  { status: 'active', admin_approved: true },
  { status: 'active', admin_approved: true },
  { status: 'draft', admin_approved: true },
  { status: 'paused', admin_approved: true },
  { status: 'active', admin_approved: false },
  { status: 'active', admin_approved: false },
  { status: 'closed', admin_approved: true },
  { status: 'cancelled', admin_approved: true },
]);
const mockFetchApplications = async () => ([
  { status: 'pending' },
  { status: 'pending' },
  { status: 'pending' },
  { status: 'reviewed' },
  { status: 'accepted' },
  { status: 'accepted' },
  { status: 'rejected' },
]);
const mockFetchPendingUsers = async () => ([
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    full_name: 'John Doe',
    phone_number: '+254712345678',
    user_type: 'worker',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    full_name: 'Jane Smith',
    phone_number: '+254723456789',
    user_type: 'employer',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    username: 'bob_wilson',
    email: 'bob@example.com',
    full_name: 'Bob Wilson',
    phone_number: '+254734567890',
    user_type: 'worker',
    created_at: new Date().toISOString()
  },
]);

const AdminDashboard = () => {
  const router = useRouter();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkers: 0,
    totalEmployers: 0,
    totalJobs: 0,
    totalApplications: 0,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        workersResponse,
        employersResponse,
        jobsResponse,
        applicationsResponse,
        pendingUsersResponse
      ] = await Promise.all([
        mockFetchWorkers(),
        mockFetchEmployers(),
        mockFetchJobs(),
        mockFetchApplications(),
        mockFetchPendingUsers()
      ]);

      const jobs = Array.isArray(jobsResponse) ? jobsResponse : [];
      const applications = Array.isArray(applicationsResponse) ? applicationsResponse : [];
      const users = Array.isArray(pendingUsersResponse) ? pendingUsersResponse : [];

      setStats({
        totalWorkers: workersResponse.length,
        totalEmployers: employersResponse.length,
        totalJobs: jobs.length,
        totalApplications: applications.length,
        pendingUsers: users.length,
        pendingJobs: jobs.filter((j: any) => j.admin_approved === false).length,
        pendingApplications: applications.filter((a: any) => a.status === 'pending').length,
        reviewedApplications: applications.filter((a: any) => a.status === 'reviewed').length,
        acceptedApplications: applications.filter((a: any) => a.status === 'accepted').length,
        rejectedApplications: applications.filter((a: any) => a.status === 'rejected').length,
        activeJobs: jobs.filter((j: any) => j.status === 'active' && j.admin_approved !== false).length,
        draftJobs: jobs.filter((j: any) => j.status === 'draft').length,
        pausedJobs: jobs.filter((j: any) => j.status === 'paused').length,
        closedJobs: jobs.filter((j: any) => j.status === 'closed').length,
        cancelledJobs: jobs.filter((j: any) => j.status === 'cancelled').length,
      });

      setPendingUsers(users.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    console.log('Approving user:', userId);
    await fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of platform activity and pending approvals</p>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Review Users Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-all"
            onClick={() => router.push('/admin/users/approve')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <UserCheck className="h-6 w-6" />
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                {stats.pendingUsers} pending
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Review Users</h3>
            <p className="text-blue-100 mb-4 text-sm">Approve or reject new user registrations</p>
            <div className="flex items-center text-sm font-medium">
              <span>View all users</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </motion.div>

          {/* Review Jobs Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-all"
            onClick={() => router.push('/admin/jobs/approve')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                {stats.pendingJobs} pending
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Review Jobs</h3>
            <p className="text-purple-100 mb-4 text-sm">Approve or reject job postings awaiting review</p>
            <div className="flex items-center text-sm font-medium">
              <span>View all jobs</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </motion.div>

          {/* Review Applications Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-all"
            onClick={() => router.push('/admin/applications')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <FileCheck className="h-6 w-6" />
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                {stats.pendingApplications} pending
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Review Applications</h3>
            <p className="text-green-100 mb-4 text-sm">Manage job applications and responses</p>
            <div className="flex items-center text-sm font-medium">
              <span>View all applications</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </motion.div>
        </div>

        {/* Platform Statistics */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalWorkers}</span>
              </div>
              <p className="text-sm text-gray-600">Total Workers</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalEmployers}</span>
              </div>
              <p className="text-sm text-gray-600">Total Employers</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalJobs}</span>
              </div>
              <p className="text-sm text-gray-600">Total Jobs</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-8 w-8 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalApplications}</span>
              </div>
              <p className="text-sm text-gray-600">Total Applications</p>
            </div>
          </div>
        </div>

        {/* Job Status Breakdown */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Job Status Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
              <PlayCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
              <p className="text-xs text-gray-600">Active</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
              <Clock className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.draftJobs}</p>
              <p className="text-xs text-gray-600">Draft</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
              <Pause className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.pausedJobs}</p>
              <p className="text-xs text-gray-600">Paused</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
              <CheckCircle className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.closedJobs}</p>
              <p className="text-xs text-gray-600">Closed</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
              <Ban className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.cancelledJobs}</p>
              <p className="text-xs text-gray-600">Cancelled</p>
            </div>
          </div>
        </div>

        {/* Top 3 Pending Users */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Pending Users</h2>
            <button
              onClick={() => router.push('/admin/users/approve')}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {pendingUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No pending users to approve</p>
              </div>
            ) : (
              <div className="divide-y">
                {pendingUsers.map((user) => (
                  <div key={user.id || user.email} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.user_type === 'employer' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.user_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{user.email}</span>
                          <span>{user.phone_number}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleApproveUser(user.id || user.email)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Application Statistics */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Application Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <Clock className="h-8 w-8 text-yellow-600 mb-3" />
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <Eye className="h-8 w-8 text-blue-600 mb-3" />
              <p className="text-2xl font-bold text-gray-900">{stats.reviewedApplications}</p>
              <p className="text-sm text-gray-600">Reviewed</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <CheckCircle className="h-8 w-8 text-green-600 mb-3" />
              <p className="text-2xl font-bold text-gray-900">{stats.acceptedApplications}</p>
              <p className="text-sm text-gray-600">Accepted</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <XCircle className="h-8 w-8 text-red-600 mb-3" />
              <p className="text-2xl font-bold text-gray-900">{stats.rejectedApplications}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/admin/categories')}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Manage Categories</p>
                  <p className="text-sm text-gray-600">Add or edit job categories</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={() => router.push('/admin/analytics')}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">View Analytics</p>
                  <p className="text-sm text-gray-600">Detailed platform insights</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );


export default AdminDashboard;