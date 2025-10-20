'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMyApplications } from '../../Redux/Functions/jobs';
import JobApplicationList from '../../components/JobApplication/JobApplicationList';
import { toast } from 'sonner';

export default function MyApplicationsPage() {
  const router = useRouter();
  const {
    applications,
    isLoading,
    apiError,
    fetchApplications,
    updateApplicationById,
    deleteApplicationById
  } = useMyApplications();

  const handleView = (applicationId: string) => {
    router.push(`/applications/${applicationId}`);
  };

  const handleUpdate = (applicationId: string) => {
    // Navigate to edit page or open modal
    router.push(`/applications/${applicationId}/edit`);
  };

  const handleDelete = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw/delete this application?')) {
      return;
    }

    try {
      await deleteApplicationById(applicationId).unwrap();
      toast.success('Application removed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove application');
    }
  };

  const handleFilter = (filters: any) => {
    fetchApplications(filters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
              <p className="text-sm text-gray-600 mt-1">
                Track and manage your job applications
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/jobs')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Browse Jobs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.status === 'accepted').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.status === 'reviewed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <JobApplicationList
          applications={applications}
          loading={isLoading}
          error={apiError}
          onView={handleView}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onFilter={handleFilter}
          showJobDetails={true}
          showWorkerDetails={false}
          emptyMessage="You haven't applied to any jobs yet"
        />
      </div>
    </div>
  );
}