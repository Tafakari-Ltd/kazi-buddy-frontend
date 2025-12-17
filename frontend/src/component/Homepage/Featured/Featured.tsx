"use client";
import { Clock, Heart, Locate, Star, Sparkles, ArrowRight, Award, FilterX } from "lucide-react";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

import { openJobDescription } from "@/Redux/Features/JobDescriptionSlice";
import { openJobModal, setSelectedJob } from "@/Redux/Features/ApplyJobSlice"; 
import { fetchUserWorkerProfile } from "@/Redux/Features/workerProfilesSlice";
import { clearFilters } from "@/Redux/Features/jobsSlice";
import { useJobs } from "@/Redux/Functions/useJobs";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { Job } from "@/types/job.types";

const Featured = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { isAuthenticated, userId } = useSelector((state: RootState) => state.auth);
  const { userProfile } = useSelector((state: RootState) => state.workerProfiles);
  
  const { 
    featuredJobs, 
    jobs: filteredJobs, 
    filters, 
    handleFetchFeaturedJobs, 
    handleFetchJobs,
    pagination,
    loading: jobsLoading 
  } = useJobs();

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hoveredJob, setHoveredJob] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const isFiltering = useMemo(() => {
    return !!(filters.category || filters.search_query || filters.location || filters.job_type);
  }, [filters]);

  useEffect(() => {
    handleFetchFeaturedJobs();
  }, [handleFetchFeaturedJobs]);

  useEffect(() => {
    if (isFiltering) {
      handleFetchJobs({ ...filters, page: currentPage, limit: 12, status: 'active' as any });
    }
  }, [isFiltering, filters, currentPage, handleFetchJobs]);

  const displayJobs = isFiltering ? filteredJobs : featuredJobs;
  const loading = isFiltering ? jobsLoading : (featuredJobs.length === 0 && jobsLoading); 

  const jobsPerPage = 10;
  const totalJobs = isFiltering ? pagination.total : featuredJobs.length;
  const totalPages = isFiltering ? pagination.total_pages : Math.ceil(totalJobs / jobsPerPage);

  const paginatedFeaturedJobs = useMemo(() => {
    if (isFiltering) return filteredJobs;
    const startIndex = (currentPage - 1) * jobsPerPage;
    return featuredJobs.slice(startIndex, startIndex + jobsPerPage);
  }, [isFiltering, filteredJobs, featuredJobs, currentPage]);

  const paginationInfo = useMemo(() => {
    if (displayJobs.length === 0) return { start: 0, end: 0, total: 0 };
    
    if (isFiltering) {
       const start = ((pagination.page - 1) * pagination.limit) + 1;
       const end = Math.min(start + pagination.limit - 1, pagination.total);
       return { start, end, total: pagination.total };
    } else {
       const start = ((currentPage - 1) * jobsPerPage) + 1;
       const end = Math.min(start + jobsPerPage - 1, featuredJobs.length);
       return { start, end, total: featuredJobs.length };
    }
  }, [isFiltering, displayJobs.length, pagination, currentPage, featuredJobs.length]);

  const dispatchJobDescription = useCallback((job: Job) => {
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
  }, [dispatch]);

  const handleApply = useCallback(
    async (jobTitle: string, jobId: string, jobData: Job) => {
      if (!isAuthenticated) {
        const currentPath = window.location.pathname === '/' ? '/' : window.location.pathname;
        const returnUrl = `${currentPath}?applyJobId=${jobId}`;
        router.push(`/auth/login?returnTo=${encodeURIComponent(returnUrl)}`);
        return;
      }
      
      if (userId && !userProfile) {
        try {
           const result = await dispatch(fetchUserWorkerProfile(userId)).unwrap();
           if (!result) {
             toast.info("Please create a worker profile");
             router.push('/worker');
             return;
           }
        } catch {
           toast.info("Please create a worker profile");
           router.push('/worker');
           return;
        }
      }
      
      dispatchJobDescription(jobData);
      dispatch(setSelectedJob({ id: jobId, title: jobTitle }));
      dispatch(openJobModal());
    },
    [dispatch, isAuthenticated, userProfile, userId, router, dispatchJobDescription]
  );

  useEffect(() => {
    const applyJobIdParam = searchParams.get("applyJobId");

    const handleRedirectApply = async () => {
      if (applyJobIdParam && isAuthenticated && !loading && displayJobs.length > 0) {
        const jobId = applyJobIdParam;
        const jobToApply = displayJobs.find((j) => String(j.id) === jobId);

        if (jobToApply) {
           if (userId && !userProfile) {
              try {
                 const result = await dispatch(fetchUserWorkerProfile(userId)).unwrap();
                 if (!result) {
                    toast.info("Please create a worker profile");
                    router.push("/worker");
                    return;
                 }
              } catch {
                 toast.info("Please create a worker profile");
                 router.push("/worker");
                 return;
              }
           }

           toast.success("Welcome back! Continue with your application");
           document.getElementById(`featured-job-${jobId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
           dispatchJobDescription(jobToApply);
           dispatch(setSelectedJob({ id: jobToApply.id, title: jobToApply.title }));
           dispatch(openJobModal());
           router.replace(window.location.pathname, { scroll: false });
        }
      }
    };
    handleRedirectApply();
  }, [searchParams, isAuthenticated, dispatch, router, displayJobs, loading, userId, userProfile, dispatchJobDescription]);

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setCurrentPage(1);
    toast.success("Filters cleared");
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFavorite = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(jobId)) newFavorites.delete(jobId);
      else newFavorites.add(jobId);
      return newFavorites;
    });
  };

  return (
    <div id="jobs-section" className="mx-auto px-6 md:px-12 py-12 bg-gradient-to-b from-amber-50 to-white container">
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
                Clear Filters & Show Featured
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
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
             Explore our hand-picked <strong>featured opportunities</strong>.
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
        </div>
      ) : displayJobs.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-lg font-medium">No jobs found.</p>
          {isFiltering && (
            <button 
              onClick={handleClearFilters}
              className="mt-4 px-6 py-2 bg-[#800000] text-white rounded-sm hover:bg-[#600000] transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {paginatedFeaturedJobs.map((job, index) => (
          <div
            key={job.id}
            id={`featured-job-${job.id}`} 
            className="relative rounded-sm overflow-hidden shadow-lg group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white border-2 border-transparent hover:border-amber-200"
            onMouseEnter={() => setHoveredJob(job.id)}
            onMouseLeave={() => setHoveredJob(null)}
          >
            {!isFiltering && (
              <div className="absolute top-3 left-3 z-10">
                <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-sm text-xs font-bold shadow-lg">
                  <Star className="w-3 h-3" />
                  FEATURED
                </div>
              </div>
            )}

            <div className="relative h-48 overflow-hidden">
              <img
                src={(job as any).job_image || "https://images.pexels.com/photos/4239016/pexels-photo-4239016.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                alt={job.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-br from-[#800000]/60 to-gray-900/60 mix-blend-multiply transition-opacity duration-300 ${hoveredJob === job.id ? 'opacity-50' : 'opacity-70'}`} />
              
              <button
                onClick={(e) => toggleFavorite(job.id, e)}
                className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-sm transition-all duration-200 hover:bg-white/30 z-10"
              >
                <Heart className={`w-5 h-5 ${favorites.has(job.id) ? 'fill-red-500 text-red-500' : 'text-white hover:text-red-300'}`} />
              </button>

              <div className="absolute bottom-3 left-3">
                <span className="bg-[#800000] text-white px-3 py-1 rounded-sm text-xs font-semibold shadow-lg">
                  {job.job_type.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-xl font-bold text-[#800000] mb-3 line-clamp-2 group-hover:text-[#600000]">
                {job.title}
              </h4>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {job.description}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Locate className="w-3 h-3 text-green-700" />
                  <span>{(job as any).location_address || job.location_text || job.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-3 h-3 text-blue-700" />
                  <span className="font-bold text-[#800000]">
                    {job.budget_min && job.budget_max ? `KSh ${job.budget_min} - ${job.budget_max}` : 'Negotiable'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => dispatchJobDescription(job)}
                  className="w-full border-2 border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white px-4 py-2 rounded-sm text-sm font-bold transition-all"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleApply(job.title, job.id, job)}
                  className="w-full bg-gradient-to-r from-[#800000] to-amber-600 text-white px-4 py-2 rounded-sm text-sm font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {totalJobs > 0 && (
        <div className="flex justify-between items-center bg-white p-4 border rounded-sm">
           <span>Page {currentPage} of {totalPages || 1}</span>
           <div className="flex gap-2">
             <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="px-4 py-2 border rounded-sm disabled:opacity-50">Prev</button>
             <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="px-4 py-2 border rounded-sm disabled:opacity-50">Next</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Featured;