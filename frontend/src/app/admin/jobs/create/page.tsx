"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Info, Users, Briefcase, Plus } from 'lucide-react';
import Link from 'next/link';

const AdminCreateJobPage = () => {
  const router = useRouter();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Job Creation</h1>
        </div>
        <p className="text-gray-600 ml-14">Manage job creation across the platform</p>
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">About Job Creation</h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              In the Kazi Buddy platform, jobs are typically created by employers through their dedicated employer dashboard. 
              As an admin, you can monitor all job creation activities, manage existing jobs, and ensure quality control.
            </p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* View All Jobs */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Manage Existing Jobs</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            View, edit, and manage all jobs posted on the platform. Filter by status, category, and more.
          </p>
          <Link 
            href="/admin/jobs"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm"
          >
            View All Jobs
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>

        {/* Create Job (Admin Override) */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-full">
              <Plus className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Admin Job Creation</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Create a job on behalf of an employer or for administrative purposes.
          </p>
          <button 
            onClick={() => {
              // redirect to the main jobs page with create modal
              router.push('/admin/jobs?create=true');
            }}
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm"
          >
            Create New Job
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-green-600">892</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-purple-600">47</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <Plus className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Job Creation Activity</h3>
        <div className="space-y-3">
          {[
            { title: "House Cleaner Needed", employer: "Jane Smith", time: "2 hours ago", status: "active" },
            { title: "Web Developer Position", employer: "Tech Corp Ltd", time: "5 hours ago", status: "active" },
            { title: "Delivery Driver", employer: "QuickDelivery", time: "1 day ago", status: "paused" },
            { title: "Graphic Designer", employer: "Creative Agency", time: "2 days ago", status: "active" },
          ].map((job, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{job.title}</p>
                <p className="text-sm text-gray-600">by {job.employer} • {job.time}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                job.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">For Employers:</h4>
            <p className="text-gray-600">
              Direct employers to their dashboard at{' '}
              <Link href="/employer" className="text-blue-600 hover:underline">
                /employer
              </Link>{' '}
              where they can create and manage their job postings.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Admin Controls:</h4>
            <p className="text-gray-600">
              Use the main jobs management page to monitor, edit, and moderate all job postings on the platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateJobPage;