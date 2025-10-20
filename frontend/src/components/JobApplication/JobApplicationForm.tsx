'use client';

import React, { useState, useEffect } from 'react';
import { JobDetails } from '../../types/jobApplication.types';
import { useJobApplicationForm, useApplicationMessages } from '../../Redux/Functions/jobs';
import JobApplicationApi from '../../services/jobApplicationApi';
import { toast } from 'sonner';

interface JobApplicationFormProps {
  jobDetails: JobDetails;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const JobApplicationForm: React.FC<JobApplicationFormProps> = ({
  jobDetails,
  onSuccess,
  onCancel,
  className = ''
}) => {
  const {
    formData,
    errors,
    isSubmitting,
    setCoverLetterValue,
    setProposedRateValue,
    setAvailabilityStartValue,
    setWorkerNotesValue,
    setErrors,
    clearErrors,
    submitApplication
  } = useJobApplicationForm();

  const { clearAllMessages } = useApplicationMessages();

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [hasApplied, setHasApplied] = useState(false);

  // Clear any previous messages when component mounts
  useEffect(() => {
    clearAllMessages();
  }, [clearAllMessages]);

  // Check if user has already applied
  useEffect(() => {
    const checkApplicationStatus = async () => {
      try {
        const hasUserApplied = await JobApplicationApi.hasUserApplied(jobDetails.id);
        setHasApplied(hasUserApplied);
      } catch (error) {
        console.error('Error checking application status:', error);
      }
    };

    checkApplicationStatus();
  }, [jobDetails.id]);

  // Set default availability date to job start date
  useEffect(() => {
    if (!formData.availability_start && jobDetails.start_date) {
      setAvailabilityStartValue(jobDetails.start_date);
    }
  }, [jobDetails.start_date, formData.availability_start, setAvailabilityStartValue]);

  const validateForm = (): boolean => {
    const validation = JobApplicationApi.validateApplicationData(formData);
    
    if (!validation.isValid) {
      setLocalErrors(validation.errors);
      setErrors({
        cover_letter: validation.errors.cover_letter ? [validation.errors.cover_letter] : undefined,
        proposed_rate: validation.errors.proposed_rate ? [validation.errors.proposed_rate] : undefined,
        availability_start: validation.errors.availability_start ? [validation.errors.availability_start] : undefined,
        worker_notes: validation.errors.worker_notes ? [validation.errors.worker_notes] : undefined
      });
      return false;
    }

    setLocalErrors({});
    clearErrors();
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasApplied) {
      toast.error('You have already applied for this job');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const result = await submitApplication(jobDetails.id);
      if (result.success) {
        toast.success('Application submitted successfully!');
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to submit application');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    }
  };

  const handleCancel = () => {
    clearErrors();
    setLocalErrors({});
    onCancel?.();
  };

  // Calculate character counts
  const coverLetterCount = formData.cover_letter?.length || 0;
  const workerNotesCount = formData.worker_notes?.length || 0;

  if (hasApplied) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-blue-800">
              You have already applied for this job
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Check your applications dashboard for updates on your application status.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Job Info Header */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{jobDetails.title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Budget:</span> ${jobDetails.budget_min} - ${jobDetails.budget_max}
          </div>
          <div>
            <span className="font-medium">Type:</span> {jobDetails.job_type.replace('_', ' ')}
          </div>
          <div>
            <span className="font-medium">Location:</span> {jobDetails.location_text}
          </div>
        </div>
      </div>

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
            onChange={(e) => setCoverLetterValue(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
              (errors.cover_letter || localErrors.cover_letter) 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300'
            }`}
            placeholder="Explain why you're the perfect fit for this job. Highlight your relevant experience and skills..."
            maxLength={2000}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-1">
            {coverLetterCount}/2000
          </div>
        </div>
        {(errors.cover_letter || localErrors.cover_letter) && (
          <p className="mt-1 text-sm text-red-600">
            {errors.cover_letter?.[0] || localErrors.cover_letter}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Minimum 50 characters. Be specific about your experience and why you're interested in this project.
        </p>
      </div>

      {/* Proposed Rate */}
      <div>
        <label htmlFor="proposed_rate" className="block text-sm font-medium text-gray-700 mb-2">
          Proposed Rate (${jobDetails.payment_type === 'hourly' ? 'per hour' : 'total'}) *
        </label>
        <div className="relative">
          <input
            type="number"
            id="proposed_rate"
            min="1"
            max="10000"
            step="0.01"
            value={formData.proposed_rate || ''}
            onChange={(e) => setProposedRateValue(parseFloat(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              (errors.proposed_rate || localErrors.proposed_rate) 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300'
            }`}
            placeholder="Enter your rate"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
        </div>
        {(errors.proposed_rate || localErrors.proposed_rate) && (
          <p className="mt-1 text-sm text-red-600">
            {errors.proposed_rate?.[0] || localErrors.proposed_rate}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Budget range: ${jobDetails.budget_min} - ${jobDetails.budget_max}
        </p>
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
          onChange={(e) => setAvailabilityStartValue(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            (errors.availability_start || localErrors.availability_start) 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-300'
          }`}
        />
        {(errors.availability_start || localErrors.availability_start) && (
          <p className="mt-1 text-sm text-red-600">
            {errors.availability_start?.[0] || localErrors.availability_start}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Project start date: {new Date(jobDetails.start_date).toLocaleDateString()}
        </p>
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
            onChange={(e) => setWorkerNotesValue(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
              (errors.worker_notes || localErrors.worker_notes) 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300'
            }`}
            placeholder="Any additional information you'd like to share (optional)..."
            maxLength={1000}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-1">
            {workerNotesCount}/1000
          </div>
        </div>
        {(errors.worker_notes || localErrors.worker_notes) && (
          <p className="mt-1 text-sm text-red-600">
            {errors.worker_notes?.[0] || localErrors.worker_notes}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Optional: Share any questions or additional details about your approach.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </div>
          ) : (
            'Submit Application'
          )}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default JobApplicationForm;