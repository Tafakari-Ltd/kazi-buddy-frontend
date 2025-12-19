"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { useJobs } from "@/Redux/Functions/useJobs";
import { useCategories } from "@/Redux/Functions/useCategories";
import { RootState } from "@/Redux/Store/Store";
import { Plus, AlertCircle, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Job, JobStatus, CreateJobData, JobType, PaymentType, UrgencyLevel } from "@/types/job.types";

// Import new components
import CreateJobModal from "@/components/Admin/Jobs/CreateJobModal";
import JobFilters from "@/components/Admin/Jobs/JobFilters";
import JobCard from "@/components/Admin/Jobs/JobCard";
import JobViewModal from "@/components/Admin/Jobs/JobViewModal";
import DeleteJobModal from "@/components/Admin/Jobs/DeleteJobModal";

const JobsManagementPage = () => {
  const searchParams = useSearchParams();
  const statusParam = searchParams?.get("status") as JobStatus | null;
  const jobIdParam = searchParams?.get("jobId");

  const {
    jobs,
    loading,
    error,
    successMessage,
    pagination,
    handleFetchJobs,
    handleDeleteJob,
    handleUpdateJobStatus,
    handleCreateJob,
    handleSetFilters,
    handleClearState,
  } = useJobs();

  const { categories, handleFetchCategories } = useCategories();
  const { user, userId, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [jobToView, setJobToView] = useState<Job | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [localFilters, setLocalFilters] = useState({
    status: (statusParam || "") as JobStatus | "",
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

  // Initial Fetch
  useEffect(() => {
    handleFetchJobs();
    handleFetchCategories();
  }, []);

  // Open view modal if jobId is in URL
  useEffect(() => {
    if (jobIdParam && !loading && jobs.length > 0) {
      const job = jobs.find((j) => j.id === jobIdParam);
      if (job) {
        setJobToView(job);
        setShowViewModal(true);
      }
    }
  }, [jobIdParam, loading, jobs]);

  // Apply filters
  useEffect(() => {
    const processedFilters: any = { page: 1, limit: 10 };
    if (debouncedSearch.trim()) processedFilters.search_query = debouncedSearch;
    if (localFilters.status) processedFilters.status = localFilters.status;
    if (localFilters.category) processedFilters.category = localFilters.category;
    if (localFilters.job_type) processedFilters.job_type = localFilters.job_type;
    if (localFilters.payment_type) processedFilters.payment_type = localFilters.payment_type;
    if (localFilters.urgency_level) processedFilters.urgency_level = localFilters.urgency_level;
    if (localFilters.location?.trim()) processedFilters.location = localFilters.location;

    handleSetFilters(processedFilters);
    handleFetchJobs(processedFilters);
  }, [localFilters, debouncedSearch]);

  // Success message auto-dismiss
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => handleClearState(), 3000);
    }
  }, [successMessage, handleClearState]);

  // Handlers
  const handleDeleteClick = (jobId: string) => {
    setJobToDelete(jobId);
    setShowDeleteModal(true);
  };

  const handleViewClick = (job: Job) => {
    setJobToView(job);
    setShowViewModal(true);
  };

  const handleEditClick = (jobId: string) => {
    window.location.href = `/admin/jobs/edit/${jobId}`;
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

  const handleJobSubmit = async (data: CreateJobData) => {
    if (!isAuthenticated || !userId) return;
    const jobData = { ...data, employer: userId };
    const result = await handleCreateJob(jobData);
    if (result && !error) {
      setShowCreateModal(false);
      handleFetchJobs();
    }
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

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Unknown Category";
  };

  // Group jobs by category for rendering
  const groupedByCategory = useMemo(() => {
    const map = new Map<string, { categoryId: string; categoryName: string; jobs: Job[] }>();
    
    // Filter locally by category if selected (to be safe, though API handles it)
    const filtered = localFilters.category 
      ? jobs.filter(j => {
          const catId = typeof j.category === "string" ? j.category : (j.category as any)?.id || "";
          return String(catId) === localFilters.category;
        }) 
      : jobs;

    filtered.forEach((j: any) => {
      const catId = typeof j.category === "string" ? j.category : j.category?.id ? String(j.category.id) : "uncategorized";
      const catName = typeof j.category === "object" && j.category?.name ? j.category.name : getCategoryName(catId);
      
      if (!map.has(catId)) {
        map.set(catId, { categoryId: catId, categoryName: catName, jobs: [] });
      }
      map.get(catId)!.jobs.push(j as Job);
    });
    return Array.from(map.values()).sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }, [jobs, categories, localFilters.category]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs Management</h1>
          <p className="text-gray-600 mt-2">Manage all job postings and their details</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg">
          <Plus className="w-4 h-4" /> Post New Job
        </button>
      </div>

      <JobFilters
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={localFilters}
        setFilters={setLocalFilters}
        categories={categories}
        onClear={clearFilters}
      />

      <AnimatePresence>
        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading jobs...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4"><Briefcase className="w-16 h-16 mx-auto" /></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or create a new job.</p>
              <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Plus className="w-4 h-4" /> Create First Job
              </button>
            </div>
          ) : (
            groupedByCategory.map((section) => (
              <div key={section.categoryId} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-3 border-b bg-gray-50 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-800">{section.categoryName}</h2>
                  <span className="text-xs text-gray-500">{section.jobs.length} job{section.jobs.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="p-6 space-y-4">
                  {section.jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      categoryName={section.categoryName}
                      onView={handleViewClick}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <CreateJobModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleJobSubmit}
        categories={categories}
        loading={loading}
      />

      <JobViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        job={jobToView}
        categoryName={jobToView ? getCategoryName(typeof jobToView.category === "string" ? jobToView.category : (jobToView.category as any).id) : ""}
        onEdit={handleEditClick}
      />

      <DeleteJobModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default JobsManagementPage;