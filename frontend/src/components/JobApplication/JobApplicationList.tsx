'use client';

import React, { useState } from 'react';
import { JobApplicationWithDetails, ApplicationStatus, ApplicationQueryParams } from '../../types/jobApplication.types';
import JobApplicationCard from './JobApplicationCard';

interface JobApplicationListProps {
  applications: JobApplicationWithDetails[];
  loading?: boolean;
  error?: string | null;
  onView?: (applicationId: string) => void;
  onUpdate?: (applicationId: string) => void;
  onDelete?: (applicationId: string) => void;
  onFilter?: (filters: ApplicationQueryParams) => void;
  showJobDetails?: boolean;
  showWorkerDetails?: boolean;
  showFilters?: boolean;
  emptyMessage?: string;
  className?: string;
}

const statusOptions: { value: ApplicationStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Under Review' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' }
];

export const JobApplicationList: React.FC<JobApplicationListProps> = ({
  applications,
  loading = false,
  error = null,
  onView,
  onUpdate,
  onDelete,
  onFilter,
  showJobDetails = true,
  showWorkerDetails = false,
  showFilters = true,
  emptyMessage = "No applications found",
  className = ''
}) => {
  const [filters, setFilters] = useState<ApplicationQueryParams>({
    status: [],
    search: '',
    ordering: '-applied_at'
  });

  const handleFilterChange = (newFilters: Partial<ApplicationQueryParams>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilter?.(updatedFilters);
  };

  const handleStatusFilter = (status: ApplicationStatus) => {
    const currentStatus = filters.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status];
    
    handleFilterChange({ status: newStatus });
  };

  const handleSearchChange = (search: string) => {
    handleFilterChange({ search });
  };

  const handleSortChange = (ordering: string) => {
    handleFilterChange({ ordering });
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: [],
      search: '',
      ordering: '-applied_at'
    };
    setFilters(clearedFilters);
    onFilter?.(clearedFilters);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="flex space-x-4">
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading applications</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    value={filters.search || ''}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by job title, company, or notes..."
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div className="sm:w-48">
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort by
                </label>
                <select
                  id="sort"
                  value={filters.ordering || '-applied_at'}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="-applied_at">Newest First</option>
                  <option value="applied_at">Oldest First</option>
                  <option value="-proposed_rate">Highest Rate</option>
                  <option value="proposed_rate">Lowest Rate</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>

            {/* Status Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(({ value, label }) => {
                  const isActive = filters.status?.includes(value);
                  return (
                    <button
                      key={value}
                      onClick={() => handleStatusFilter(value)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        isActive
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clear Filters */}
            {(filters.search || filters.status?.length || filters.ordering !== '-applied_at') && (
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Header */}
      {applications.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {applications.length} application{applications.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Applications Grid */}
      {applications.length > 0 ? (
        <div className="grid gap-4 md:gap-6">
          {applications.map((application) => (
            <JobApplicationCard
              key={application.id}
              application={application}
              onView={onView}
              onUpdate={onUpdate}
              onDelete={onDelete}
              showJobDetails={showJobDetails}
              showWorkerDetails={showWorkerDetails}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <div className="mx-auto max-w-md">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {emptyMessage}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {filters.search || filters.status?.length
                ? "Try adjusting your filters to see more results."
                : "Applications you submit will appear here."
              }
            </p>
            {(filters.search || filters.status?.length) && (
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicationList;