'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useApplicationDetails } from '../../../../Redux/Functions/jobs';
import JobApplicationApi from '../../../../services/jobApplicationApi';
import { toast } from 'sonner';

export default function EditApplicationPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.applicationId as string;

  const {
    application,
    isLoading,
    apiError,
    updateDetails
  } = useApplicationDetails(applicationId);

  // Form state
  const [formData, setFormData] = useState({
    cover_letter: '',
    proposed_rate: 0,
    availability_start: '',
    worker_notes: ''
  });
  
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when application loads
  useEffect(() => {
    if (application) {
      setFormData({
        cover_letter: application.cover_letter || '',
        proposed_rate: parseFloat(application.proposed_rate) || 0,
        availability_start: application.availability_start || '',
        worker_notes: application.worker_notes || ''
      });
    }
  }, [application]);

  const handleBack = () => {
    router.push(`/applications/${applicationId}`);
  };

  const validateForm = (): boolean => {
    const validation = JobApplicationApi.validateApplicationData(formData as any);
    
    if (!validation.isValid) {
      setLocalErrors(validation.errors);
      return false;
    }

    setLocalErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await updateDetails?.(formData);
      toast.success('Application updated successfully');
      router.push(`/applications/${applicationId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update application');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate character counts
  const coverLetterCount = formData.cover_letter?.length || 0;
  const workerNotesCount = formData.worker_notes?.length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
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

  // Check if application can be edited
  if (application.status !== 'pending') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Cannot edit application</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This application has already been {application.status} and cannot be edited.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleBack}
                className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
              >
                View Application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Edit Application</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Update your application details
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-6 space-y-6">
            
            {/* Cover Letter */}
            <div>
              <label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter *
              </label>
              <div className="relative">
                <textarea
                  id="cover_letter"
                  rows={6}
                  value={formData.cover_letter}
                  onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
                    localErrors.cover_letter ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Explain why you're the perfect fit for this job. Highlight your relevant experience and skills..."
                  maxLength={2000}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-1">
                  {coverLetterCount}/2000
                </div>
              </div>
              {localErrors.cover_letter && (
                <p className="mt-1 text-sm text-red-600">{localErrors.cover_letter}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Minimum 50 characters. Be specific about your experience and why you're interested in this project.
              </p>
            </div>

            {/* Proposed Rate */}
            <div>
              <label htmlFor="proposed_rate" className="block text-sm font-medium text-gray-700 mb-2">
                Proposed Rate ($) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="proposed_rate"
                  min="1"
                  max="10000"
                  step="0.01"
                  value={formData.proposed_rate || ''}
                  onChange={(e) => setFormData({ ...formData, proposed_rate: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    localErrors.proposed_rate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your rate"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
              </div>
              {localErrors.proposed_rate && (
                <p className="mt-1 text-sm text-red-600">{localErrors.proposed_rate}</p>
              )}
            </div>

            {/* Availability Start Date */}
            <div>
              <label htmlFor="availability_start" className="block text-sm font-medium text-gray-700 mb-2">
                Available to Start *
              </label>
              <input
                type="date"
                id="availability_start"
                value={formData.availability_start}
                onChange={(e) => setFormData({ ...formData, availability_start: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  localErrors.availability_start ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {localErrors.availability_start && (
                <p className="mt-1 text-sm text-red-600">{localErrors.availability_start}</p>
              )}
            </div>

            {/* Worker Notes */}
            <div>
              <label htmlFor="worker_notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <div className="relative">
                <textarea
                  id="worker_notes"
                  rows={3}
                  value={formData.worker_notes || ''}
                  onChange={(e) => setFormData({ ...formData, worker_notes: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
                    localErrors.worker_notes ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Any additional information you'd like to share (optional)..."
                  maxLength={1000}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-1">
                  {workerNotesCount}/1000
                </div>
              </div>
              {localErrors.worker_notes && (
                <p className="mt-1 text-sm text-red-600">{localErrors.worker_notes}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Optional: Share any questions or additional details about your approach.
              </p>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </div>
              ) : (
                'Update Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}