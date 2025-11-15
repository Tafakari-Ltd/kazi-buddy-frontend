"use client";
import { Clock, Heart, Locate, Star, Sparkles, ArrowRight, Award } from "lucide-react";
import React, { useState, useMemo, useCallback, useEffect } from "react";

import { openJobDescription } from "@/Redux/Features/JobDescriptionSlice";
import { openJobModal } from "@/Redux/Features/ApplyJobSlice";
import { fetchUserWorkerProfile } from "@/Redux/Features/workerProfilesSlice";

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

  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hoveredJob, setHoveredJob] = useState<string | null>(null);
  
  // Local state for featured jobs to avoid Redux conflict with HotJobs
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 6,
    total_pages: 0,
  });

  const jobsPerPage = 6;

  // Fetch featured jobs from backend on component mount
  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', currentPage.toString());
        queryParams.append('limit', jobsPerPage.toString());
        queryParams.append('status', 'approved');
        queryParams.append('urgency_level', 'urgent'); // Featured jobs are urgent jobs
        
        const response = await api.get(`/jobs/?${queryParams.toString()}`);
        
        if (response.data) {
          setJobs(response.data);
        } else if (Array.isArray(response)) {
          setJobs(response);
        }
        
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } catch (error) {
        console.error('Error fetching featured jobs:', error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedJobs();
  }, [currentPage]);

  const totalJobs = pagination.total;
  const totalPages = pagination.total_pages;
  const paginatedJobs = jobs;


  const paginationInfo = useMemo(() => {
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    return {
      start: indexOfFirstJob + 1,
      end: indexOfLastJob > totalJobs ? totalJobs : indexOfLastJob,
      total: totalJobs
    };
  }, [currentPage, jobsPerPage, totalJobs]);

  // Handlers
  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  const handleApply = useCallback(
    async (jobTitle: string, jobId: string, jobData: Job) => {
      // Check if user is authenticated
      if (!isAuthenticated) {
        // Redirect to login page with return URL
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
          sessionStorage.setItem('pendingJobApplication', jobId);
          window.location.href = '/auth/login';
        }
        return;
      }
      
      // Check if user has a worker profile
      if (!userProfile && userId) {
        // Try to fetch user's worker profile
        try {
          const result = await dispatch(fetchUserWorkerProfile(userId)).unwrap();
          
          if (!result) {
            // No worker profile exists, redirect to create one
            toast.info("Please create a worker profile to apply for jobs");
            router.push('/worker');
            return;
          }
        } catch (error) {
          // Error fetching profile, redirect to create one
          toast.info("Please create a worker profile to apply for jobs");
          router.push('/worker');
          return;
        }
      }
      
      // User has a worker profile, open the application modal with job data
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
      console.log(`Applied for featured job: ${jobTitle} (ID: ${jobId})`);
    },
    [dispatch, isAuthenticated, userProfile, userId, router]
  );

  const handleJobDescription = useCallback(
    (job: Job) => {
      // Transform the job data to match the expected format
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

  // Generate page numbers for pagination
  const getPageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
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
    <div className="mx-auto px-6 md:px-12 py-12 bg-gradient-to-b from-amber-50 to-white container">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-[#800000] to-amber-600 rounded-sm shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-4xl font-extrabold text-[#800000] flex items-center gap-2">
            Featured Jobs
            <Award className="w-8 h-8 text-amber-500" />
          </h3>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Hand-picked premium opportunities from top employers. These exclusive positions 
          offer exceptional benefits and career growth potential.
        </p>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-sm">
            <Star className="w-4 h-4 text-amber-600" />
            Premium Selection
          </span>
          <span>•</span>
          <span className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#800000]" />
            Top Employers
          </span>
        </div>
      </div>

      {/* Featured Jobs Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg">No featured jobs available at the moment. Check back later!</p>
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
            {/* Featured Badge */}
            <div className="absolute top-3 left-3 z-10">
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-sm text-xs font-bold shadow-lg">
                <Star className="w-3 h-3" />
                FEATURED
              </div>
            </div>

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
              
              {/* Overlay gradient for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              
              {/* Favorite Button */}
              <button
                onClick={(e) => toggleFavorite(job.id, e)}
                aria-label="Toggle favorite"
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
                  {job.job_type}
                </span>
              </div>

              {/* Priority indicator */}
              <div className="absolute bottom-3 right-3">
                <div className="flex items-center gap-1 bg-white/90 text-[#800000] px-2 py-1 rounded-sm text-xs font-bold">
                  <Sparkles className="w-3 h-3" />
                  #{index + 1}
                </div>
              </div>
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
                  <span className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 px-3 py-1 rounded-sm text-xs font-semibold border border-amber-300">
                    Premium
                  </span>
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
                  <span className="relative z-10">Apply Now - Featured</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:animate-pulse"></div>
                </button>
              </div>

              {/* Featured Benefits */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>Premium benefits • Fast-track application • Priority review</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Enhanced Pagination */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-gradient-to-r from-white to-amber-50 rounded-sm shadow-lg p-6 border-2 border-amber-100">
        <div className="mb-4 lg:mb-0">
          <p className="text-gray-600 font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Showing <span className="font-bold text-[#800000]">{paginationInfo.start}</span> - 
            <span className="font-bold text-[#800000]"> {paginationInfo.end}</span> of 
            <span className="font-bold text-[#800000]"> {paginationInfo.total}</span> featured jobs
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
    </div>
  );
};

export default Featured;