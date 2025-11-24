"use client";
import { Clock, Heart, Locate, Star, Sparkles, ArrowRight, Award, FilterX } from "lucide-react";
import React, { useState, useMemo, useCallback, useEffect } from "react";

import { openJobDescription } from "@/Redux/Features/JobDescriptionSlice";
import { openJobModal } from "@/Redux/Features/ApplyJobSlice";
import { fetchUserWorkerProfile } from "@/Redux/Features/workerProfilesSlice";
import { setFilters, clearFilters } from "@/Redux/Features/jobsSlice";

import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { Job } from "@/types/job.types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

const Featured = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isAuthenticated, userId } = useSelector((state: RootState) => state.auth);
  const { userProfile } = useSelector((state: RootState) => state.workerProfiles);
  
  const { filters } = useSelector((state: RootState) => state.jobs);

  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hoveredJob, setHoveredJob] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 0,
  });

  // Store the IDs of the actual top paying jobs
  const [topPayingJobIds, setTopPayingJobIds] = useState<Set<string>>(new Set());

  const jobsPerPage = 10;

  const isFiltering = useMemo(() => {
    return !!(filters.category || filters.search_query || filters.location || filters.job_type);
  }, [filters]);

  // 1. One-time check to identify the Top 10 Paying Jobs in the system
  useEffect(() => {
    const identifyTopPayingJobs = async () => {
      try {
        // Fetch a pool of approved jobs to calculate rankings
        const response = await api.get('/jobs/?status=approved&limit=50');
        let allJobs: Job[] = [];
        if (response.data) allJobs = response.data;
        else if (Array.isArray(response)) allJobs = response;

        // Sort High -> Low
        const sorted = allJobs.sort((a, b) => (b.budget_max || 0) - (a.budget_max || 0));
        // Take top 10
        const top10 = sorted.slice(0, 10);
        // Store IDs
        setTopPayingJobIds(new Set(top10.map(j => j.id)));
      } catch (e) {
        console.error("Error identifying top paying jobs", e);
      }
    };
    identifyTopPayingJobs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [isFiltering, filters]);

  useEffect(() => {
    let isActive = true; 

    const fetchJobs = async () => {
      setLoading(true);
      if (isFiltering) setJobs([]); 

      try {
        const queryParams = new URLSearchParams();
        let endpoint = '/jobs/';
        
        queryParams.append('status', 'approved');
        queryParams.append('page', currentPage.toString());

        if (isFiltering) {
          if (filters.category) {
            endpoint = `/jobs/category/${filters.category}/filter/`;
          }
          if (filters.search_query) queryParams.append('search_query', filters.search_query);
          if (filters.location) queryParams.append('location', filters.location);
          if (filters.job_type) queryParams.append('job_type', filters.job_type);
          queryParams.append('limit', '12'); 
        } else {
          queryParams.append('limit', '50'); 
        }
        
        const url = `${endpoint}?${queryParams.toString()}`;
        const response = await api.get(url);
        
        if (!isActive) return;

        let fetchedJobs: Job[] = [];
        if (response.data) {
          fetchedJobs = response.data;
        } else if (Array.isArray(response)) {
          fetchedJobs = response;
        }

        if (isFiltering) {
          setJobs(fetchedJobs);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        } else {
          const topPayingJobs = fetchedJobs.sort((a, b) => {
            const budgetA = a.budget_max || 0;
            const budgetB = b.budget_max || 0;
            return budgetB - budgetA;
          });

          setJobs(topPayingJobs.slice(0, jobsPerPage));
          
          if (response.pagination) {
            setPagination({
               ...response.pagination,
               limit: jobsPerPage, 
               total: topPayingJobs.length 
            });
          }
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        if (isActive) setJobs([]);
      } finally {
        if (isActive) setLoading(false);
      }
    };
    
    fetchJobs();

    return () => {
      isActive = false;
    };
  }, [currentPage, filters, isFiltering]);

  const handleClearFilters = () => {
    dispatch(clearFilters());
    toast.success("Filters cleared");
  };

  const totalJobs = pagination.total;
  const totalPages = isFiltering ? pagination.total_pages : Math.ceil(totalJobs / jobsPerPage);
  const paginatedJobs = jobs;

  const paginationInfo = useMemo(() => {
    if (isFiltering) {
      if (jobs.length === 0) return { start: 0, end: 0, total: 0 };
      const start = (currentPage - 1) * (pagination.limit || 12) + 1;
      const end = Math.min(start + jobs.length - 1, pagination.total);
      return { start, end, total: pagination.total };
    }
    
    if (jobs.length === 0) return { start: 0, end: 0, total: 0 };
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    return {
      start: indexOfFirstJob + 1,
      end: indexOfLastJob > totalJobs ? totalJobs : indexOfLastJob,
      total: totalJobs
    };
  }, [currentPage, jobsPerPage, totalJobs, isFiltering, pagination, jobs.length]);

  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const jobsSection = document.getElementById('jobs-section');
    if (jobsSection) {
      jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [totalPages]);

  const handleApply = useCallback(
    async (jobTitle: string, jobId: string, jobData: Job) => {
      if (!isAuthenticated) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
          sessionStorage.setItem('pendingJobApplication', jobId);
          window.location.href = '/auth/login';
        }
        return;
      }
      
      if (!userProfile && userId) {
        try {
          const result = await dispatch(fetchUserWorkerProfile(userId)).unwrap();
          if (!result) {
            toast.info("Please create a worker profile to apply for jobs");
            router.push('/worker');
            return;
          }
        } catch (error) {
          toast.info("Please create a worker profile to apply for jobs");
          router.push('/worker');
          return;
        }
      }
      
      dispatch(openJobDescription({
        id: String(jobData.id),
        title: jobData.title,
        jobType: jobData.job_type,
        category: typeof jobData.category === 'string' ? jobData.category : (jobData.category as any)?.name || 'General',
        location: (jobData as any).location_address || jobData.location_text || jobData.location || 'Not specified',
        rate: jobData.budget_min && jobData.budget_max ? `KSh ${jobData.budget_min} - ${jobData.budget_max}` : 'Negotiable',
        description: jobData.description,
        image: (jobData as any).job_image || '',
      } as any));
      
      dispatch(openJobModal());
    },
    [dispatch, isAuthenticated, userProfile, userId, router]
  );

  const handleJobDescription = useCallback(
    (job: Job) => {
      dispatch(
        openJobDescription({
          id: String(job.id),
          title: job.title,
          jobType: job.job_type,
          category: typeof job.category === 'string' ? job.category : (job.category as any)?.name || 'General',
          location: (job as any).location_address || job.location_text || job.location || 'Not specified',
          rate: job.budget_min && job.budget_max ? `KSh ${job.budget_min} - ${job.budget_max}` : 'Negotiable',
          description: job.description,
          image: (job as any).job_image || '',
        } as any)
      );
    },
    [dispatch]
  );

  const toggleFavorite = useCallback((jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(jobId)) {
        newFavorites.delete(jobId);
      } else {
        newFavorites.add(jobId);
      }
      return newFavorites;
    });
  }, []);

  const getPageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div id="jobs-section" className="mx-auto px-6 md:px-12 py-12 bg-gradient-to-b from-amber-50 to-white container">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          {isFiltering ? (
            <div className="flex flex-col items-center">
              <div className="p-3 bg-blue-600 rounded-sm shadow-lg mb-2">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 flex items-center gap-2">
                {filters.category ? 'Category Results' : 'Search Results'}
              </h3>
              <button 
                onClick={handleClearFilters}
                className="mt-3 flex items-center gap-2 text-red-600 font-medium hover:underline"
              >
                <FilterX className="w-4 h-4" />
                Clear Filters & Show Top Paying
              </button>
            </div>
          ) : (
            <>
              <div className="p-3 bg-gradient-to-r from-[#800000] to-amber-600 rounded-sm shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-extrabold text-[#800000] flex items-center gap-2">
                Featured Jobs
                <Award className="w-8 h-8 text-amber-500" />
              </h3>
            </>
          )}
        </div>
        
        {!isFiltering && (
          <>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explore our <strong>top 10 highest paying jobs</strong>. These exclusive positions offer the most competitive rates in the market.
            </p>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-sm">
                <Star className="w-4 h-4 text-amber-600" />
                Highest Pay First
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#800000]" />
                Top Employers
              </span>
            </div>
          </>
        )}
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-lg font-medium">No jobs found.</p>
          <p className="text-gray-500 text-sm mt-2">
            {isFiltering 
              ? "Try adjusting your search or filters to find what you're looking for." 
              : "Check back later for new opportunities."}
          </p>
          {isFiltering && (
            <button 
              onClick={handleClearFilters}
              className="mt-4 px-6 py-2 bg-[#800000] text-white rounded-sm hover:bg-[#600000] transition-colors"
            >
              View All Jobs
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {paginatedJobs.map((job, index) => (
          <div
            key={job.id}
            className="relative rounded-sm overflow-hidden shadow-lg group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white border-2 border-transparent hover:border-amber-200"
            onMouseEnter={() => setHoveredJob(job.id)}
            onMouseLeave={() => setHoveredJob(null)}
          >
            {/* FEATURED BADGE LOGIC */}
            {/* Show badge if the job ID is in our identified top 10 list */}
            {topPayingJobIds.has(job.id) && (
              <div className="absolute top-3 left-3 z-10">
                <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-sm text-xs font-bold shadow-lg">
                  <Star className="w-3 h-3" />
                  TOP PAYING
                </div>
              </div>
            )}

            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={(job as any).job_image || "https://images.pexels.com/photos/4239016/pexels-photo-4239016.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                alt={job.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-br from-[#800000]/60 to-gray-900/60 mix-blend-multiply transition-opacity duration-300 ${
                  hoveredJob === job.id ? 'opacity-50' : 'opacity-70'
                }`}
                aria-hidden="true"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              
              {/* Favorite Button */}
              <button
                onClick={(e) => toggleFavorite(job.id, e)}
                className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-sm transition-all duration-200 hover:bg-white/30 z-10"
              >
                <Heart 
                  className={`w-5 h-5 transition-colors duration-200 ${
                    favorites.has(job.id) 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-white hover:text-red-300'
                  }`} 
                />
              </button>

              {/* Job Type Badge */}
              <div className="absolute bottom-3 left-3">
                <span className="bg-[#800000] text-white px-3 py-1 rounded-sm text-xs font-semibold shadow-lg">
                  {job.job_type.replace('_', ' ')}
                </span>
              </div>

              {/* Priority indicator */}
              {/* Only show numbering if we are in the default/featured mode */}
              {!isFiltering && (
                <div className="absolute bottom-3 right-3">
                  <div className="flex items-center gap-1 bg-white/90 text-[#800000] px-2 py-1 rounded-sm text-xs font-bold shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    #{index + 1}
                  </div>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-6">
              <h4 className="text-xl font-bold text-[#800000] mb-3 line-clamp-2 group-hover:text-[#600000] transition-colors">
                {job.title}
              </h4>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                {job.description}
              </p>

              {/* Job Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="p-1 bg-green-100 rounded-sm">
                    <Locate className="w-3 h-3 text-green-700" />
                  </div>
                  <span>{(job as any).location_address || job.location_text || job.location || 'Not specified'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="p-1 bg-blue-100 rounded-sm">
                    <Clock className="w-3 h-3 text-blue-700" />
                  </div>
                  <span className="font-bold text-[#800000] text-base">
                    {job.budget_min && job.budget_max ? `KSh ${job.budget_min} - ${job.budget_max}` : 'Negotiable'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1 rounded-sm text-xs font-semibold border border-green-300">
                    {typeof job.category === 'string' ? job.category : (job.category as any)?.name || 'General'}
                  </span>
                  {/* Show Top Paying text in details if applicable */}
                  {topPayingJobIds.has(job.id) && (
                    <span className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 px-3 py-1 rounded-sm text-xs font-semibold border border-amber-300">
                      Top Paying
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleJobDescription(job)}
                  className="w-full flex items-center justify-center gap-2 text-[#800000] hover:text-white hover:bg-gradient-to-r hover:from-[#800000] hover:to-[#600000] border-2 border-[#800000] px-4 py-2 rounded-sm text-sm font-bold transition-all duration-200 group/btn"
                >
                  View Details
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>

                <button
                  onClick={() => handleApply(job.title, job.id, job)}
                  className="w-full bg-gradient-to-r from-[#800000] via-[#600000] to-amber-600 text-white px-4 py-2 rounded-sm text-sm font-bold hover:from-[#600000] hover:via-[#400000] hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 relative overflow-hidden"
                >
                  <span className="relative z-10">Apply Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:animate-pulse"></div>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Pagination */}
      {totalJobs > 0 && (
        <div className="flex flex-col lg:flex-row justify-between items-center bg-gradient-to-r from-white to-amber-50 rounded-sm shadow-lg p-6 border-2 border-amber-100">
          <div className="mb-4 lg:mb-0">
            <p className="text-gray-600 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Showing <span className="font-bold text-[#800000]">{paginationInfo.start}</span> - 
              <span className="font-bold text-[#800000]"> {paginationInfo.end}</span> of 
              <span className="font-bold text-[#800000]"> {paginationInfo.total}</span> jobs
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm border-2 transition-all duration-200 ${
                currentPage === 1 
                  ? "opacity-50 cursor-not-allowed border-gray-300 text-gray-400" 
                  : "border-[#800000] text-[#800000] hover:bg-gradient-to-r hover:from-[#800000] hover:to-[#600000] hover:text-white"
              }`}
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers.map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className="px-3 py-2 text-gray-400">...</span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(page as number)}
                      className={`px-3 py-2 rounded-sm transition-all duration-200 ${
                        currentPage === page
                          ? "bg-gradient-to-r from-[#800000] to-[#600000] text-white shadow-lg border-2 border-[#800000]"
                          : "border-2 border-gray-300 text-gray-600 hover:border-[#800000] hover:text-[#800000] hover:bg-amber-50"
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm border-2 transition-all duration-200 ${
                currentPage === totalPages 
                  ? "opacity-50 cursor-not-allowed border-gray-300 text-gray-400" 
                  : "border-[#800000] text-[#800000] hover:bg-gradient-to-r hover:from-[#800000] hover:to-[#600000] hover:text-white"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Featured;