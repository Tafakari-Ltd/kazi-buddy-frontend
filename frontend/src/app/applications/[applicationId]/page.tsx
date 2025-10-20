'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useApplicationDetails } from '../../../Redux/Functions/jobs';
import { toast } from 'sonner';

export default function ApplicationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.applicationId as string;

  const {
    application,
    isLoading,
    apiError,
    updateDetails
  } = useApplicationDetails(applicationId);

  const handleEdit = () => {
    router.push(`/applications/${applicationId}/edit`);
  };

  const handleBack = () => {
    router.back();
  };

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      // Implement withdraw logic here
      toast.success('Application withdrawn successfully');
      router.push('/applications');
    } catch (error: any) {
      toast.error(error.message || 'Failed to withdraw application');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading application</h3>
                <p className="text-sm text-red-700 mt-1">{apiError}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleBack}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Application not found</h3>
                <p className="text-sm text-yellow-700 mt-1">The application you're looking for doesn't exist or has been removed.</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleBack}
                className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Applied on {new Date(application.applied_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
              {application.status === 'pending' && (
                <>
                  <button
                    onClick={handleEdit}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleWithdraw}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Withdraw
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Application Overview */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Application Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Proposed Rate</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">${application.proposed_rate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Available to Start</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(application.availability_start).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Cover Letter</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{application.cover_letter}</p>
            </div>
          </div>

          {/* Worker Notes */}
          {application.worker_notes && (
            <div className="px-6 py-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{application.worker_notes}</p>
            </div>
          )}

          {/* Employer Notes */}
          {application.employer_notes && (
            <div className="px-6 py-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Employer Notes</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 whitespace-pre-wrap">{application.employer_notes}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="px-6 py-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                  <p className="text-sm text-gray-600">{new Date(application.applied_at).toLocaleString()}</p>
                </div>
              </div>
              
              {application.reviewed_at && (
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Application Reviewed</p>
                    <p className="text-sm text-gray-600">{new Date(application.reviewed_at).toLocaleString()}</p>
                  </div>
                </div>
              )}
              
              {application.responded_at && (
                <div className="flex items-center">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full ${application.status === 'accepted' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Response Received</p>
                    <p className="text-sm text-gray-600">{new Date(application.responded_at).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}