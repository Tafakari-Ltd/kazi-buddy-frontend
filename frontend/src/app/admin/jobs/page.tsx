"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useJobs } from "@/Redux/Functions/useJobs";
import { useCategories } from "@/Redux/Functions/useCategories";
import { RootState } from "@/Redux/Store/Store";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  AlertCircle, 
  Filter,
  Search,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  MoreVertical,
  Play,
  Pause,
  X,
  Briefcase,
  Save,
  Building,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  JobStatus, 
  JobType, 
  UrgencyLevel, 
  PaymentType, 
  Job,
  CreateJobData,
  JobFormErrors,
  JobVisibility,
  JOB_STATUS_OPTIONS,
  JOB_TYPE_OPTIONS,
  URGENCY_LEVEL_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  VISIBILITY_OPTIONS
} from "@/types/job.types";
import { useSearchParams } from "next/navigation";

const JobsManagementPage = () => {
  const searchParams = useSearchParams();
  const statusParam = searchParams?.get('status') as JobStatus | null;

  const {
    jobs,
    loading,
    error,
    successMessage,
    pagination,
    filters,
    handleFetchJobs,
    handleDeleteJob,
    handleUpdateJobStatus,
    handleCreateJob,
    handleSetFilters,
    handleClearState,
  } = useJobs();

  const { categories, handleFetchCategories } = useCategories();
  
  // Get auth state for employer ID
  const { user, userId, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [jobToView, setJobToView] = useState<Job | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create job form state
  const [createFormData, setCreateFormData] = useState<Partial<CreateJobData>>({
    title: "",
    description: "",
    category: "",
    location: "",
    location_text: "",
    job_type: JobType.FULL_TIME,
    urgency_level: UrgencyLevel.MEDIUM,
    budget_min: 0,
    budget_max: 0,
    payment_type: PaymentType.FIXED,
    start_date: "",
    end_date: "",
    estimated_hours: 0,
    max_applicants: 5,
    status: JobStatus.DRAFT,
    visibility: JobVisibility.PUBLIC,
  });
  
  const [createFormErrors, setCreateFormErrors] = useState<JobFormErrors>({});
  const [localFilters, setLocalFilters] = useState({
    status: statusParam || "",
    category: "",
    job_type: "" as JobType | "",
    payment_type: "" as PaymentType | "",
    urgency_level: "" as UrgencyLevel | "",
    location: "",
  });

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    handleFetchJobs();
    handleFetchCategories();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    // Build the filters object with proper types
    const processedFilters: any = {
      page: 1,
      limit: 10,
    };

    // Add non-empty values
    if (debouncedSearch.trim()) {
      processedFilters.search_query = debouncedSearch;
    }
    
    if (localFilters.status && localFilters.status !== '') {
      processedFilters.status = localFilters.status;
    }
    
    if (localFilters.category && localFilters.category !== '') {
      processedFilters.category = localFilters.category;
    }
    
    if (localFilters.job_type !== '') {
      processedFilters.job_type = localFilters.job_type;
    }
    
    if (localFilters.payment_type !== '') {
      processedFilters.payment_type = localFilters.payment_type;
    }
    
    if (localFilters.urgency_level !== '') {
      processedFilters.urgency_level = localFilters.urgency_level;
    }
    
    if (localFilters.location && localFilters.location.trim() !== '') {
      processedFilters.location = localFilters.location;
    }

    handleSetFilters(processedFilters);
    handleFetchJobs(processedFilters);
  }, [localFilters, debouncedSearch]);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        handleClearState();
      }, 3000);
    }
  }, [successMessage, handleClearState]);

  const handleDeleteClick = (jobId: string) => {
    setJobToDelete(jobId);
    setShowDeleteModal(true);
  };

  const handleViewClick = (job: Job) => {
    setJobToView(job);
    setShowViewModal(true);
  };

  const confirmDelete = async () => {
    if (jobToDelete) {
      await handleDeleteJob(jobToDelete);
      setShowDeleteModal(false);
      setJobToDelete(null);
      handleFetchJobs();
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    await handleUpdateJobStatus(jobId, newStatus);
    handleFetchJobs();
  };

  const clearFilters = () => {
    setLocalFilters({
      status: "",
      category: "",
      job_type: "" as JobType | "",
      payment_type: "" as PaymentType | "",
      urgency_level: "" as UrgencyLevel | "",
      location: "",
    });
    setSearchQuery("");
  };

  const getStatusColor = (status: JobStatus) => {
    const option = JOB_STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.color || 'text-gray-600 bg-gray-100';
  };

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    const option = URGENCY_LEVEL_OPTIONS.find(opt => opt.value === urgency);
    return option?.color || 'text-gray-600 bg-gray-100';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  // Create job form functions
  const validateCreateForm = (): boolean => {
    const errors: JobFormErrors = {};

    if (!createFormData.title?.trim()) {
      errors.title = "Job title is required";
    }

    if (!createFormData.description?.trim()) {
      errors.description = "Job description is required";
    } else if (createFormData.description.length < 50) {
      errors.description = "Description must be at least 50 characters";
    }

    if (!createFormData.category) {
      errors.category = "Please select a category";
    }

    if (!createFormData.location?.trim()) {
      errors.location = "Job location is required";
    }

    if (!createFormData.budget_min || createFormData.budget_min <= 0) {
      errors.budget_min = "Minimum budget is required";
    }

    if (!createFormData.budget_max || createFormData.budget_max <= 0) {
      errors.budget_max = "Maximum budget is required";
    }

    if (createFormData.budget_min && createFormData.budget_max && createFormData.budget_min >= createFormData.budget_max) {
      errors.budget_max = "Maximum budget must be greater than minimum";
    }

    if (!createFormData.start_date) {
      errors.start_date = "Start date is required";
    }

    if (!createFormData.end_date) {
      errors.end_date = "End date is required";
    }

    if (createFormData.start_date && createFormData.end_date && new Date(createFormData.start_date) >= new Date(createFormData.end_date)) {
      errors.end_date = "End date must be after start date";
    }

    if (!createFormData.estimated_hours || createFormData.estimated_hours <= 0) {
      errors.estimated_hours = "Estimated hours is required";
    }

    if (!createFormData.max_applicants || createFormData.max_applicants <= 0) {
      errors.max_applicants = "Max applicants is required";
    }

    setCreateFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submission started with data:", createFormData);
    
    if (!validateCreateForm()) {
      console.log("Form validation failed");
      return;
    }

    // Check if user is authenticated and get employer ID
    if (!isAuthenticated || !userId) {
      console.error("User not authenticated");
      return;
    }

    // Use the authenticated user's ID as the employer ID
    const employerId = userId;

    const jobData: CreateJobData = {
      ...createFormData,
      employer: employerId,
    } as CreateJobData;

    console.log("Creating job with data:", jobData);
    console.log("User info:", { user, userId, isAuthenticated });

    const result = await handleCreateJob(jobData);
    
    console.log("Job creation result:", result);
    
    if (result && !error) {
      console.log("Job created successfully");
      setShowCreateModal(false);
      resetCreateForm();
      handleFetchJobs(); // Refresh the jobs list
    } else {
      console.log("Job creation failed", error);
      
    }
  };

  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    if (type === 'number') {
      processedValue = parseFloat(value) || 0;
    }

    setCreateFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear error for this field when user starts typing
    if (createFormErrors[name as keyof JobFormErrors]) {
      setCreateFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const resetCreateForm = () => {
    setCreateFormData({
      title: "",
      description: "",
      category: "",
      location: "",
      location_text: "",
      job_type: JobType.FULL_TIME,
      urgency_level: UrgencyLevel.MEDIUM,
      budget_min: 0,
      budget_max: 0,
      payment_type: PaymentType.FIXED,
      start_date: "",
      end_date: "",
      estimated_hours: 0,
      max_applicants: 5,
      status: JobStatus.DRAFT,
      visibility: JobVisibility.PUBLIC,
    });
    setCreateFormErrors({});
  };

  const openCreateModal = () => {
    resetCreateForm();
    setShowCreateModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs Management</h1>
          <p className="text-gray-600 mt-2">Manage all job postings and their details</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Post New Job
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search jobs by title, description, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            {Object.values(localFilters).some(v => v) && (
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                {Object.values(localFilters).filter(v => v).length}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              <select
                value={localFilters.status}
                onChange={(e) => setLocalFilters({...localFilters, status: e.target.value as JobStatus})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Statuses</option>
                {JOB_STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <select
                value={localFilters.category}
                onChange={(e) => setLocalFilters({...localFilters, category: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>

              <select
                value={localFilters.job_type}
                onChange={(e) => setLocalFilters({...localFilters, job_type: e.target.value as JobType})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Types</option>
                {JOB_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <select
                value={localFilters.payment_type}
                onChange={(e) => setLocalFilters({...localFilters, payment_type: e.target.value as PaymentType})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Payment Types</option>
                {PAYMENT_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <select
                value={localFilters.urgency_level}
                onChange={(e) => setLocalFilters({...localFilters, urgency_level: e.target.value as UrgencyLevel})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Urgency</option>
                {URGENCY_LEVEL_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading jobs...</p>
        </div>
      )}

      {/* Jobs Grid/List */}
      {!loading && (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Briefcase className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">
                {Object.values(localFilters).some(v => v) || searchQuery
                  ? "Try adjusting your filters or search query"
                  : "Get started by creating your first job posting"
                }
              </p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First Job
              </button>
            </div>
          ) : (
            <>
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {job.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                              {JOB_STATUS_OPTIONS.find(opt => opt.value === job.status)?.label}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency_level)}`}>
                              {URGENCY_LEVEL_OPTIONS.find(opt => opt.value === job.urgency_level)?.label}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {job.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {formatCurrency(job.budget_min)} - {formatCurrency(job.budget_max)}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(job.start_date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {job.max_applicants} max applicants
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewClick(job)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`/admin/jobs/edit/${job.id}`}
                            className="text-yellow-600 hover:text-yellow-900 p-2 rounded-lg hover:bg-yellow-50 transition-colors"
                            title="Edit Job"
                          >
                            <Edit2 className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDeleteClick(job.id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          {/* Status Toggle */}
                          {job.status === 'active' ? (
                            <button
                              onClick={() => handleStatusChange(job.id, JobStatus.PAUSED)}
                              className="text-orange-600 hover:text-orange-900 p-2 rounded-lg hover:bg-orange-50 transition-colors"
                              title="Pause Job"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          ) : job.status === 'paused' ? (
                            <button
                              onClick={() => handleStatusChange(job.id, JobStatus.ACTIVE)}
                              className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                              title="Activate Job"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} jobs
                  </p>
                  <div className="flex items-center space-x-2">
                    {/* Add pagination controls here */}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 max-w-md w-full"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Job</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Are you sure you want to delete this job? This action cannot be undone and will remove all applications and related data.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg font-medium"
                >
                  Delete Job
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Job Modal - We'll create this next */}
      {/* View Job Modal */}
      <AnimatePresence>
        {showViewModal && jobToView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{jobToView.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(jobToView.status)}`}>
                      {JOB_STATUS_OPTIONS.find(opt => opt.value === jobToView.status)?.label}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(jobToView.urgency_level)}`}>
                      {URGENCY_LEVEL_OPTIONS.find(opt => opt.value === jobToView.urgency_level)?.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Job Description</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {jobToView.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Job Type</h5>
                      <p className="text-gray-600">
                        {JOB_TYPE_OPTIONS.find(opt => opt.value === jobToView.job_type)?.label}
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Payment Type</h5>
                      <p className="text-gray-600">
                        {PAYMENT_TYPE_OPTIONS.find(opt => opt.value === jobToView.payment_type)?.label}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">Budget</h5>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(jobToView.budget_min)} - {formatCurrency(jobToView.budget_max)}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Estimated {jobToView.estimated_hours} hours
                    </p>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Details</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="text-gray-900">{getCategoryName(jobToView.category)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="text-gray-900">{jobToView.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="text-gray-900">{formatDate(jobToView.start_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="text-gray-900">{formatDate(jobToView.end_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Applicants:</span>
                        <span className="text-gray-900">{jobToView.max_applicants}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
                <a
                  href={`/admin/jobs/edit/${jobToView.id}`}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 inline-flex items-center gap-2 transition-all shadow-lg font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Job
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Job Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Create New Job</h3>
                  <p className="text-sm text-gray-500">Fill in the details to post a new job</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Job Title */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={createFormData.title || ''}
                      onChange={handleCreateFormChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                        createFormErrors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Enter job title (e.g., Senior React Developer)"
                    />
                    {createFormErrors.title && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {createFormErrors.title}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={createFormData.category || ''}
                      onChange={handleCreateFormChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                        createFormErrors.category ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    {createFormErrors.category && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {createFormErrors.category}
                      </p>
                    )}
                  </div>

                  {/* Job Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Job Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="job_type"
                      value={createFormData.job_type || JobType.FULL_TIME}
                      onChange={handleCreateFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-gray-300 transition-all"
                    >
                      {JOB_TYPE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={createFormData.location || ''}
                      onChange={handleCreateFormChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                        createFormErrors.location ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Enter job location"
                    />
                    {createFormErrors.location && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {createFormErrors.location}
                      </p>
                    )}
                  </div>

                  {/* Location Text */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location Description
                    </label>
                    <input
                      type="text"
                      name="location_text"
                      value={createFormData.location_text || ''}
                      onChange={handleCreateFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-gray-300 transition-all"
                      placeholder="Additional location details (optional)"
                    />
                  </div>

                  {/* Budget Min */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Minimum Budget ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="budget_min"
                      value={createFormData.budget_min || ''}
                      onChange={handleCreateFormChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                        createFormErrors.budget_min ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {createFormErrors.budget_min && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {createFormErrors.budget_min}
                      </p>
                    )}
                  </div>

                  {/* Budget Max */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Maximum Budget ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="budget_max"
                      value={createFormData.budget_max || ''}
                      onChange={handleCreateFormChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                        createFormErrors.budget_max ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {createFormErrors.budget_max && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {createFormErrors.budget_max}
                      </p>
                    )}
                  </div>

                  {/* Payment Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Type
                    </label>
                    <select
                      name="payment_type"
                      value={createFormData.payment_type || PaymentType.FIXED}
                      onChange={handleCreateFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-gray-300 transition-all"
                    >
                      {PAYMENT_TYPE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Urgency Level */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Urgency Level
                    </label>
                    <select
                      name="urgency_level"
                      value={createFormData.urgency_level || UrgencyLevel.MEDIUM}
                      onChange={handleCreateFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-gray-300 transition-all"
                    >
                      {URGENCY_LEVEL_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={createFormData.start_date || ''}
                      onChange={handleCreateFormChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                        createFormErrors.start_date ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    />
                    {createFormErrors.start_date && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {createFormErrors.start_date}
                      </p>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={createFormData.end_date || ''}
                      onChange={handleCreateFormChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                        createFormErrors.end_date ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    />
                    {createFormErrors.end_date && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {createFormErrors.end_date}
                      </p>
                    )}
                  </div>

                  {/* Estimated Hours */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estimated Hours <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="estimated_hours"
                      value={createFormData.estimated_hours || ''}
                      onChange={handleCreateFormChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                        createFormErrors.estimated_hours ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {createFormErrors.estimated_hours && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {createFormErrors.estimated_hours}
                      </p>
                    )}
                  </div>

                  {/* Max Applicants */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Max Applicants <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="max_applicants"
                      value={createFormData.max_applicants || ''}
                      onChange={handleCreateFormChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                        createFormErrors.max_applicants ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="5"
                      min="1"
                    />
                    {createFormErrors.max_applicants && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {createFormErrors.max_applicants}
                      </p>
                    )}
                  </div>
                </div>

                {/* Job Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows={6}
                    value={createFormData.description || ''}
                    onChange={handleCreateFormChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none ${
                      createFormErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Provide a detailed description of the job, requirements, and what you're looking for..."
                  />
                  {createFormErrors.description && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {createFormErrors.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Minimum 50 characters required</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end pt-6 mt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg transition-all shadow-lg font-medium"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {loading ? "Creating Job..." : "Create Job"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobsManagementPage;