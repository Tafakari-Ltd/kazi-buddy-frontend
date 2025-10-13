"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Edit2, Trash2, Eye, MoreVertical, Calendar, MapPin, DollarSign, Users, Clock, Plus } from 'lucide-react';
import JobEditModal from '@/component/JobEditModal/JobEditModal';
import { toast } from 'sonner';
import { AppDispatch, RootState } from '@/Redux/Store/Store';
import { useCategories } from '@/Redux/Functions/useCategories';
import { fetchJobsByEmployer, deleteJob, updateJobStatus } from '@/Redux/Features/jobsSlice';
import { Job, JobStatus } from '@/types/job.types';
import { useEmployerProfiles } from '@/Redux/Functions/useEmployerProfiles';
import JobPostingModal from '@/component/JobPostingModal/JobPostingModal';

const EmployerJobsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading, error } = useSelector((state: RootState) => state.jobs);
  const { user, userId } = useSelector((state: RootState) => state.auth);
  
  // Get employer profile information
  const { userProfile, handleFetchUserEmployerProfile } = useEmployerProfiles();

  // Categories for display/filter
  const { categories, handleFetchCategories } = useCategories();
  
  // Get the actual user ID 
  const currentUserId = userId || user?.user_id || user?.id;
  
  // Get the employer profile ID (this is what should be used for job operations)
  const employerProfileId = userProfile?.id;
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
    // Fetch categories for labels/filter
    handleFetchCategories();
    // Set a timeout to force show content even if loading takes too long
    const timeout = setTimeout(() => {
      setLoadingTimeout(true);
    }, 2000); 
    
    return () => clearTimeout(timeout);
  }, []);

  // Simplified loading effect
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isClient || !currentUserId || initialLoadComplete) return;
      
      try {
        console.log('Loading initial data for user:', currentUserId);
        // Fetch employer profile first
        await handleFetchUserEmployerProfile(currentUserId);
        // Set load complete to prevent further loading
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setInitialLoadComplete(true); 
      }
    };

    loadInitialData();
  }, [isClient, currentUserId, initialLoadComplete, handleFetchUserEmployerProfile]);

  // Fetch jobs when employer profile becomes available
  useEffect(() => {
    if (employerProfileId && initialLoadComplete) {
      console.log('Fetching jobs for employer profile ID:', employerProfileId);
      dispatch(fetchJobsByEmployer(employerProfileId));
    }
  }, [employerProfileId, initialLoadComplete, dispatch]);
  
  // Log error if jobs fetch fails
  useEffect(() => {
    if (error) {
      console.error('Jobs fetch error:', error);
      toast.error(`Error loading jobs: ${error}`);
    }
  }, [error]);

  const handleViewJob = useCallback((job: Job) => {
    setSelectedJob(job);
    setShowViewModal(true);
  }, []);

  const handleDeleteJob = useCallback((job: Job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  }, []);

const handleEditJob = useCallback((job: Job) => {
    setJobToEdit(job);
    setShowEditModal(true);
  }, []);

  const handleCreateJob = useCallback(() => {
    if (!employerProfileId) {
      toast.error('Please complete your employer profile first');
      return;
    }
    setShowCreateModal(true);
  }, [employerProfileId]);

  const handleCreateModalClose = useCallback(() => {
    setShowCreateModal(false);
    // Refresh the jobs list to show newly created jobs
    if (employerProfileId) {
      dispatch(fetchJobsByEmployer(employerProfileId));
    }
  }, [dispatch, employerProfileId]);

  const confirmDelete = useCallback(async () => {
    if (jobToDelete) {
      const result = await dispatch(deleteJob(jobToDelete.id));
      if (deleteJob.fulfilled.match(result)) {
        toast.success('Job deleted successfully');
        if (employerProfileId) {
          dispatch(fetchJobsByEmployer(employerProfileId)); // Refresh the list
        }
      } else {
        toast.error('Failed to delete job');
      }
      setShowDeleteModal(false);
      setJobToDelete(null);
    }
  }, [jobToDelete, dispatch, employerProfileId]);

  const handleStatusToggle = useCallback(async (job: Job) => {
    const newStatus: JobStatus = job.status === JobStatus.ACTIVE ? JobStatus.PAUSED : JobStatus.ACTIVE;
    const result = await dispatch(updateJobStatus({ jobId: job.id, status: newStatus }));
    
    if (updateJobStatus.fulfilled.match(result)) {
      toast.success(`Job ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
      if (employerProfileId) {
        dispatch(fetchJobsByEmployer(employerProfileId)); // Refresh the list
      }
    } else {
      toast.error('Failed to update job status');
    }
  }, [dispatch, employerProfileId]);

  const getStatusColor = useCallback((status: JobStatus) => {
    switch (status) {
      case JobStatus.ACTIVE: return 'bg-green-100 text-green-800';
      case JobStatus.PAUSED: return 'bg-yellow-100 text-yellow-800';
      case JobStatus.CLOSED: return 'bg-gray-100 text-gray-800';
      case JobStatus.FILLED: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  const formatCurrency = useCallback((amount?: number) => {
    if (!amount) return 'N/A';
    return `KSh ${amount.toLocaleString()}`;
  }, []);

  // More aggressive loading state - only show loading on first render or until timeout
  const isInitialLoading = !isClient && !loadingTimeout;
  
  
  const shouldShowContent = isClient || loadingTimeout;
  
  // Filter jobs by selected category (client-side)
  const filteredJobs = useMemo(() => {
    if (!selectedCategoryId) return jobs;
    return jobs.filter(j => j.category === selectedCategoryId);
  }, [jobs, selectedCategoryId]);

  // Group filtered jobs by category
  const groupedByCategory = useMemo(() => {
    if (!filteredJobs || filteredJobs.length === 0) return [] as { categoryId: string; categoryName: string; jobs: Job[] }[];
    const map = new Map<string, { categoryId: string; categoryName: string; jobs: Job[] }>();
    filteredJobs.forEach((j: any) => {
      const catRaw = j?.category;
      const catId: string = typeof catRaw === 'string' 
        ? catRaw 
        : (catRaw?.id ? String(catRaw.id) : 'uncategorized');
      const catName: string = (typeof catRaw === 'object' && catRaw?.name)
        ? catRaw.name
        : (categories.find((c) => c.id === catId)?.name || 'Uncategorized');
      if (!map.has(catId)) {
        map.set(catId, { categoryId: catId, categoryName: catName, jobs: [] });
      }
      map.get(catId)!.jobs.push(j as Job);
    });
    return Array.from(map.values()).sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }, [filteredJobs, categories]);

  // Memoize the job content to prevent unnecessary re-renders
  const jobsContent = useMemo(() => {
    const list = filteredJobs;
    if (list.length === 0) {
      return (
        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg container">
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {!employerProfileId ? 'Complete your employer profile first' : 'No jobs posted yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {!employerProfileId 
                ? 'You need to complete your employer profile before you can manage jobs' 
                : 'Create your first job posting to start finding candidates'
              }
            </p>
            {!employerProfileId ? (
              <a 
                href="/employer?postjob=1" 
                className="inline-flex items-center px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Complete Profile
              </a>
            ) : (
              <button
                onClick={handleCreateJob}
                className="inline-flex items-center px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Job Posting
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="container">
        <div className="space-y-6">
          {groupedByCategory.map((section) => (
            <div key={section.categoryId} className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-3 border-b bg-gray-50 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-800">{section.categoryName}</h2>
                <span className="text-xs text-gray-500">{section.jobs.length} job{section.jobs.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="p-6 grid gap-4">
                {section.jobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Created: {job.created_at ? formatDate(job.created_at) : 'N/A'}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {job.location}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" />
                                {formatCurrency(job.budget_min)} - {formatCurrency(job.budget_max)}
                              </span>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewJob(job)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditJob(job)}
                                className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Edit Job"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusToggle(job)}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                  job.status === JobStatus.ACTIVE 
                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                              >
                                {job.status === JobStatus.ACTIVE ? 'Pause' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete Job"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            Max applicants: {job.max_applicants || 'Unlimited'}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {job.job_type.replace('_', ' ').charAt(0).toUpperCase() + job.job_type.replace('_', ' ').slice(1)}
                          </span>
                          {job.estimated_hours && (
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Est. {job.estimated_hours} hours
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [jobs, employerProfileId, getStatusColor, formatDate, formatCurrency, handleViewJob, handleStatusToggle, handleDeleteJob, handleCreateJob, filteredJobs, groupedByCategory]);
  
  if (isInitialLoading) {
    return (
      <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
      {/* Header - Always visible */}
      <div className="container mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-red-800">My Job Postings</h1>
            <p className="text-gray-600 mt-2">Manage your posted jobs and track applications</p>
          </div>
          <button
            onClick={handleCreateJob}
            className="flex items-center gap-2 bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create Job Posting
          </button>
        </div>

        {/* Category Filter */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs Content - Show loading within content area if needed */}
      {loading && jobs.length === 0 ? (
        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg container">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      ) : (
        jobsContent
      )}

      {/* View Job Modal */}
      {showViewModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedJob.title}</h4>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedJob.status)}`}>
                  {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-gray-900">{selectedJob.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <p className="text-gray-900 capitalize">{selectedJob.job_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                  <p className="text-gray-900">{formatCurrency(selectedJob.budget_min)} - {formatCurrency(selectedJob.budget_max)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                  <p className="text-gray-900 capitalize">{selectedJob.payment_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <p className="text-gray-900">{selectedJob.start_date ? formatDate(selectedJob.start_date) : 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <p className="text-gray-900">{selectedJob.end_date ? formatDate(selectedJob.end_date) : 'Not specified'}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedJob.description}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                  <p className="text-gray-900 capitalize">{selectedJob.urgency_level}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                  <p className="text-gray-900">{selectedJob.estimated_hours || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Applicants</label>
                  <p className="text-gray-900">{selectedJob.max_applicants || 'Unlimited'}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && jobToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Job</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{jobToDelete.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Job Creation Modal */}
      {showCreateModal && (
        <JobPostingModal 
          onClose={handleCreateModalClose} 
          onSuccess={handleCreateModalClose}
        />
      )}

      {/* Job Edit Modal */}
      {showEditModal && jobToEdit && (
        <JobEditModal
          job={jobToEdit}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            if (employerProfileId) {
              dispatch(fetchJobsByEmployer(employerProfileId));
            }
          }}
        />
      )}
    </div>
  );
};

export default EmployerJobsPage;
