
"use client";
import React, { useEffect, useState } from "react";
import {
 Briefcase,
 TrendingUp,
 Clock,
 CheckCircle,
 XCircle,
 Pause,
 PlayCircle,
 Ban,
 AlertCircle,
 ArrowRight,
 Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/component/Authentication/ProtectedRoute";
import api from "@/lib/axios";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface JobAnalytics {
 totalJobs: number;
 activeJobs: number;
 draftJobs: number;
 pausedJobs: number;
 closedJobs: number;
 cancelledJobs: number;
 // Jobs where admin_approved is false (pending admin approval)
 pendingApprovalJobs: number;
 jobsByCategory: Record<string, number>;
 jobsByLocation: Record<string, number>;
 jobsByUrgency: Record<string, number>;
 averageBudget: number;
 totalBudget: number;
}

const JobAnalyticsPage = () => {
 const router = useRouter();
 const [analytics, setAnalytics] = useState<JobAnalytics>({
 totalJobs: 0,
 activeJobs: 0,
 draftJobs: 0,
 pausedJobs: 0,
 closedJobs: 0,
 cancelledJobs: 0,
 pendingApprovalJobs: 0,
 jobsByCategory: {},
 jobsByLocation: {},
 jobsByUrgency: {},
 averageBudget: 0,
 totalBudget: 0,
 });
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 fetchAnalytics();
 }, []);

 const fetchAnalytics = async () => {
 try {
 setLoading(true);
 // Use adminpanel endpoint so analytics include admin-only jobs and approval status
 const response = await api.get('/adminpanel/admin/jobs/');
 const wrapper = response as any;
 const jobs = Array.isArray(wrapper) ? wrapper : wrapper?.data || [];

 // Calculate analytics
 const byCategory: Record<string, number> = {};
 const byLocation: Record<string, number> = {};
 const byUrgency: Record<string, number> = {};
 let totalBudget = 0;
 let budgetCount = 0;

 jobs.forEach((job: any) => {
 // By category
 if (job.category) {
 byCategory[job.category] = (byCategory[job.category] || 0) + 1;
 }

 // By location
 if (job.location) {
 byLocation[job.location] = (byLocation[job.location] || 0) + 1;
 }

 // By urgency
 if (job.urgency_level) {
 byUrgency[job.urgency_level] = (byUrgency[job.urgency_level] || 0) + 1;
 }

 // Budget calculations
 if (job.budget_max) {
 totalBudget += Number(job.budget_max);
 budgetCount++;
 }
 });

 setAnalytics({
 totalJobs: jobs.length,
 activeJobs: jobs.filter((j: any) => j.status === 'active').length,
 draftJobs: jobs.filter((j: any) => j.status === 'draft').length,
 pausedJobs: jobs.filter((j: any) => j.status === 'paused').length,
 closedJobs: jobs.filter((j: any) => j.status === 'closed').length,
 cancelledJobs: jobs.filter((j: any) => j.status === 'cancelled').length,
 pendingApprovalJobs: jobs.filter((j: any) => j.admin_approved === false).length,
 jobsByCategory: byCategory,
 jobsByLocation: byLocation,
 jobsByUrgency: byUrgency,
 averageBudget: budgetCount > 0 ? totalBudget / budgetCount : 0,
 totalBudget: totalBudget,
 });
 } catch (error) {
 console.error('Error fetching analytics:', error);
 toast.error('Failed to load analytics data');
 } finally {
 setLoading(false);
 }
 };

 if (loading) {
 return (
 <ProtectedRoute>
 <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
 <p className="text-gray-600">Loading analytics...</p>
 </div>
 </div>
 </ProtectedRoute>
 );
 }

 // Pending jobs are those awaiting admin approval
 const pendingJobs = analytics.pendingApprovalJobs;
 const activeJobsPercentage = analytics.totalJobs > 0 
 ? ((analytics.activeJobs / analytics.totalJobs) * 100).toFixed(1) 
 : 0;

 return (
 <ProtectedRoute>
 <div className="min-h-screen bg-gray-50 p-6">
 <div className="max-w-7xl mx-auto space-y-8">
 {/* Header */}
 
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Analytics</h1>
 <p className="text-gray-600">Detailed insights into your job postings</p>
 </div>
 <button
 onClick={() => router.push('/admin/jobs')}
 className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
 >
 Manage Jobs
 <ArrowRight className="h-4 w-4" />
 </button>
 </div>

 {/* Status Overview Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {/* Total Jobs */}
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
 >
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600">Total Jobs</p>
 <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalJobs}</p>
 </div>
 <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
 <Briefcase className="h-6 w-6 text-gray-600" />
 </div>
 </div>
 </motion.div>

 {/* Active Jobs */}
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.1 }}
 className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
 >
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600">Active Jobs</p>
 <p className="text-3xl font-bold text-green-600 mt-2">{analytics.activeJobs}</p>
 <p className="text-xs text-gray-500 mt-1">{activeJobsPercentage}% of total</p>
 </div>
 <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
 <PlayCircle className="h-6 w-6 text-green-600" />
 </div>
 </div>
 </motion.div>

 {/* Pending Jobs */}
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.2 }}
 className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
 >
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600">Pending Approval</p>
 <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingJobs}</p>
 <p className="text-xs text-gray-500 mt-1">Jobs awaiting admin approval</p>
 </div>
 <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
 <AlertCircle className="h-6 w-6 text-yellow-600" />
 </div>
 </div>
 </motion.div>
 </div>

 {/* Status Breakdown */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <h2 className="text-xl font-bold text-gray-900 mb-6">Status Distribution</h2>
 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
 <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
 <PlayCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
 <p className="text-2xl font-bold text-green-700">{analytics.activeJobs}</p>
 <p className="text-sm text-gray-600">Active</p>
 </div>
 <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
 <Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
 <p className="text-2xl font-bold text-gray-700">{analytics.draftJobs}</p>
 <p className="text-sm text-gray-600">Draft</p>
 </div>
 <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
 <Pause className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
 <p className="text-2xl font-bold text-yellow-700">{analytics.pausedJobs}</p>
 <p className="text-sm text-gray-600">Paused</p>
 </div>
 <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
 <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
 <p className="text-2xl font-bold text-blue-700">{analytics.closedJobs}</p>
 <p className="text-sm text-gray-600">Closed</p>
 </div>
 <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
 <Ban className="h-8 w-8 text-red-600 mx-auto mb-2" />
 <p className="text-2xl font-bold text-red-700">{analytics.cancelledJobs}</p>
 <p className="text-sm text-gray-600">Cancelled</p>
 </div>
 </div>
 </div>

 {/* Budget Analytics */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <h2 className="text-xl font-bold text-gray-900 mb-6">Budget Overview</h2>
 <div className="space-y-4">
 <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
 <p className="text-sm text-gray-600 mb-1">Total Budget (All Jobs)</p>
 <p className="text-3xl font-bold text-blue-900">
 ${analytics.totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
 </p>
 </div>
 <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
 <p className="text-sm text-gray-600 mb-1">Average Job Budget</p>
 <p className="text-3xl font-bold text-purple-900">
 ${analytics.averageBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
 </p>
 </div>
 </div>
 </div>

 {/* Jobs by Urgency */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <h2 className="text-xl font-bold text-gray-900 mb-6">Jobs by Urgency Level</h2>
 <div className="space-y-3">
 {Object.entries(analytics.jobsByUrgency).length === 0 ? (
 <p className="text-gray-500 text-sm">No urgency data available</p>
 ) : (
 Object.entries(analytics.jobsByUrgency)
 .sort((a, b) => b[1] - a[1])
 .map(([urgency, count]) => (
 <div key={urgency} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
 <div className="flex items-center gap-3">
 <TrendingUp className="h-5 w-5 text-gray-600" />
 <span className="font-medium text-gray-900 capitalize">{urgency}</span>
 </div>
 <span className="text-xl font-bold text-gray-700">{count}</span>
 </div>
 ))
 )}
 </div>
 </div>
 </div>

 {/* Jobs by Location */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <h2 className="text-xl font-bold text-gray-900 mb-6">Top Locations</h2>
 {Object.entries(analytics.jobsByLocation).length === 0 ? (
 <p className="text-gray-500 text-sm">No location data available</p>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {Object.entries(analytics.jobsByLocation)
 .sort((a, b) => b[1] - a[1])
 .slice(0, 6)
 .map(([location, count]) => (
 <div key={location} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
 <span className="font-medium text-gray-900 truncate">{location}</span>
 <span className="text-lg font-bold text-gray-700 ml-2">{count}</span>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Jobs by Category */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <h2 className="text-xl font-bold text-gray-900 mb-6">Jobs by Category</h2>
 {Object.entries(analytics.jobsByCategory).length === 0 ? (
 <p className="text-gray-500 text-sm">No category data available</p>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {Object.entries(analytics.jobsByCategory)
 .sort((a, b) => b[1] - a[1])
 .map(([category, count]) => (
 <div key={category} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
 <div className="flex items-center gap-2">
 <Users className="h-5 w-5 text-gray-600" />
 <span className="font-medium text-gray-900">{category}</span>
 </div>
 <span className="text-lg font-bold text-gray-700">{count}</span>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Action Buttons */}
 <div className="flex gap-4 justify-center">
 <button
 onClick={() => router.push('/admin')}
 className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
 >
 Back to Dashboard
 </button>
 <button
 onClick={() => router.push('/admin/employers/all')}
 className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
 >
 Review Pending Jobs
 <ArrowRight className="h-4 w-4" />
 </button>
 </div>
 </div>
 </div>
 </ProtectedRoute>
 );
};

export default JobAnalyticsPage;