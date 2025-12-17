"use client";
import {
  Clock,
  Heart,
  Locate,
  Star,
  Briefcase,
  ArrowRight,
  Search,
  X,
} from "lucide-react";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { openJobModal, setSelectedJob } from "@/Redux/Features/ApplyJobSlice";
import { openJobDescription } from "@/Redux/Features/JobDescriptionSlice";
import { useJobs } from "@/Redux/Functions/useJobs";
import { fetchUserWorkerProfile } from "@/Redux/Features/workerProfilesSlice";
import { clearFilters } from "@/Redux/Features/jobsSlice";
import { Job } from "@/types/job.types";
import { JobDetails } from "@/types/jobApplication.types";

const HotJobs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { jobs, loading, handleFetchJobs, pagination } = useJobs();
  const { isAuthenticated, userId } = useSelector((state: RootState) => state.auth);
  const { userProfile } = useSelector((state: RootState) => state.workerProfiles);
  const searchFilters = useSelector((state: RootState) => state.jobs.filters);

  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hoveredJob, setHoveredJob] = useState<string | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);

  const jobsPerPage = 9;

  useEffect(() => {
    dispatch(clearFilters());
    setIsInitialMount(false);
  }, [dispatch]);

  useEffect(() => {
    if (!isInitialMount) {
      setCurrentPage(1);
    }
  }, [
    searchFilters.search_query,
    searchFilters.location,
    searchFilters.category,
    searchFilters.job_type,
    isInitialMount
  ]);

  useEffect(() => {
    const filters = {
      ...searchFilters,
      page: currentPage,
      limit: jobsPerPage,
      status: "active" as any, 
    };
    handleFetchJobs(filters);
  }, [currentPage, searchFilters, handleFetchJobs]); 

  const totalJobs = pagination.total;
  const totalPages = pagination.total_pages;
  const paginatedJobs = jobs; 

  const hasActiveFilters =
    searchFilters.search_query ||
    searchFilters.location ||
    searchFilters.category ||
    searchFilters.job_type;

  const formatJobType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    toast.info("Filters cleared");
  };

  const paginationInfo = useMemo(() => {
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    return {
      start: indexOfFirstJob + 1,
      end: indexOfLastJob > totalJobs ? totalJobs : indexOfLastJob,
      total: totalJobs,
    };
  }, [currentPage, jobsPerPage, totalJobs]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
      const section = document.getElementById("jobs-section");
      if (section) section.scrollIntoView({ behavior: "smooth" });
    },
    [totalPages],
  );

  const getPageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  }, [currentPage, totalPages]);

  const dispatchJobDescription = useCallback((job: Job) => {
    dispatch(
      openJobDescription({
        id: String(job.id),
        title: job.title,
        jobType: job.job_type,
        category: typeof job.category === "string" ? job.category : (job.category as any)?.name || "General",
        location: (job as any).location_address || job.location_text || job.location || "Not specified",
        rate: job.budget_min && job.budget_max ? `KSh ${job.budget_min.toLocaleString()} - ${job.budget_max.toLocaleString()}` : "Negotiable",
        description: job.description,
        image: (job as any).job_image || "",
      } as any)
    );
  }, [dispatch]);

  const handleApply = useCallback(
    async (jobTitle: string, jobId: string, jobData: Job) => {
      if (!isAuthenticated) {
        const returnUrl = `/?applyJobId=${jobId}`;
        router.push(`/auth/login?returnTo=${encodeURIComponent(returnUrl)}`);
        return;
      }

      if (userId && !userProfile) {
          try {
              const result = await dispatch(fetchUserWorkerProfile(userId)).unwrap();
              if (!result) {
                  toast.info("Please create a worker profile to apply for jobs");
                  router.push("/worker");
                  return;
              }
          } catch (error) {
              toast.info("Please create a worker profile to apply for jobs");
              router.push("/worker");
              return;
          }
      }
      
      dispatchJobDescription(jobData);
      dispatch(setSelectedJob(jobData as unknown as JobDetails));
      dispatch(openJobModal());
    },
    [dispatch, isAuthenticated, router, userId, userProfile, dispatchJobDescription]
  );

  useEffect(() => {
    const applyJobIdParam = searchParams.get("applyJobId");
    const handleRedirectApply = async () => {
        if (applyJobIdParam && isAuthenticated && jobs.length > 0 && !loading) {
            const jobId = applyJobIdParam;
            const jobToApply = jobs.find((j) => String(j.id) === jobId);

            if (jobToApply) {
                if (userId && !userProfile) {
                     try {
                        const result = await dispatch(fetchUserWorkerProfile(userId)).unwrap();
                        if (!result) {
                            toast.info("Please create a worker profile to continue application");
                            router.push("/worker");
                            return;
                        }
                     } catch {
                        toast.info("Please create a worker profile to continue application");
                        router.push("/worker");
                        return;
                     }
                }
                toast.success("Welcome back! Continue with your application");
                const cardElement = document.getElementById(`job-card-${jobId}`);
                if (cardElement) {
                    cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                dispatchJobDescription(jobToApply);
                dispatch(setSelectedJob(jobToApply as unknown as JobDetails));
                dispatch(openJobModal());
                router.replace("/", { scroll: false });
            }
        }
    };
    handleRedirectApply();
  }, [searchParams, isAuthenticated, dispatch, router, jobs, loading, userId, userProfile, dispatchJobDescription]);

  const handleViewDetails = useCallback(
    (job: Job) => {
      dispatchJobDescription(job);
    },
    [dispatchJobDescription],
  );

  const toggleFavorite = useCallback((jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(jobId)) {
        newFavorites.delete(jobId);
      } else {
        newFavorites.add(jobId);
      }
      return newFavorites;
    });
  }, []);

  return (
    <div id="jobs-section" className="mx-auto px-6 md:px-12 bg-gradient-to-b from-gray-50 to-white container ">
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-[#800000] to-amber-600 rounded-sm shadow-lg">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-4xl font-extrabold text-[#800000] flex items-center gap-2">
            Available Jobs
          </h3>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Discover exciting opportunities that match your skills and career goals. Start your journey with us today.
        </p>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            {totalJobs} Active Jobs
          </span>
          <span>•</span>
          <span>Updated Daily</span>
        </div>

        {hasActiveFilters && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-medium text-gray-600">Active filters:</span>
            {searchFilters.search_query && (
              <span className="inline-flex items-center gap-1 bg-[#800000] text-white px-3 py-1 rounded-full text-sm">
                <Search className="w-3 h-3" />
                {searchFilters.search_query}
              </span>
            )}
            {searchFilters.location && (
              <span className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                <Locate className="w-3 h-3" />
                {searchFilters.location}
              </span>
            )}
            {searchFilters.category && (
              <span className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                <Briefcase className="w-3 h-3" />
                Category
              </span>
            )}
            {searchFilters.job_type && (
              <span className="inline-flex items-center gap-1 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                <Clock className="w-3 h-3" />
                {formatJobType(searchFilters.job_type)}
              </span>
            )}
            <button onClick={handleClearFilters} className="inline-flex items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-full text-sm font-medium transition-colors">
              <X className="w-3 h-3" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 max-w-2xl mx-auto">
          {hasActiveFilters ? (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Jobs Found</h3>
                <p className="text-gray-600 text-lg mb-6">We couldn't find any jobs matching your search criteria.</p>
              </div>
              <button onClick={handleClearFilters} className="inline-flex items-center gap-2 bg-[#800000] hover:bg-[#600000] text-white px-6 py-3 rounded-lg font-medium transition-colors">
                <X className="w-4 h-4" /> Clear All Filters & Show All Jobs
              </button>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Jobs Available</h3>
              <p className="text-gray-600 text-lg">There are currently no approved jobs. Check back soon for new opportunities!</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mb-12">
          {paginatedJobs.map((job) => (
            <div
              key={job.id}
              id={`job-card-${job.id}`}
              className="relative rounded-sm overflow-hidden shadow-lg group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white"
              onMouseEnter={() => setHoveredJob(job.id)}
              onMouseLeave={() => setHoveredJob(null)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={(job as any).job_image || "https://images.pexels.com/photos/4239016/pexels-photo-4239016.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                  alt={job.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-br from-[#800000]/60 to-gray-900/60 mix-blend-multiply transition-opacity duration-300 ${hoveredJob === job.id ? "opacity-60" : "opacity-80"}`} />
                <button onClick={(e) => toggleFavorite(job.id, e)} aria-label="Toggle favorite" className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30">
                  <Heart className={`w-5 h-5 ${favorites.has(job.id) ? "fill-red-500 text-red-500" : "text-white hover:text-red-300"}`} />
                </button>
                <div className="absolute top-3 left-3">
                  <span className="bg-[#800000] text-white px-3 py-1 rounded-sm text-xs font-semibold shadow-lg">
                    {formatJobType(job.job_type)}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-xl font-bold text-[#800000] mb-3 line-clamp-2 group-hover:text-[#600000] transition-colors">{job.title}</h4>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{job.description}</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="p-1 bg-green-100 rounded"><Locate className="w-3 h-3 text-green-700" /></div>
                    <span>{job.location_text || job.location || "Not specified"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="p-1 bg-blue-100 rounded"><Clock className="w-3 h-3 text-blue-700" /></div>
                    <span className="font-semibold text-[#800000]">{job.budget_min && job.budget_max ? `KSh ${job.budget_min.toLocaleString()} - ${job.budget_max.toLocaleString()}` : "Negotiable"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">{typeof job.category === "string" ? job.category : (job.category as any)?.name || "General"}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <button onClick={() => handleViewDetails(job)} className="w-full flex items-center justify-center gap-2 text-[#800000] hover:text-white hover:bg-gradient-to-r hover:from-[#800000] hover:to-[#600000] border-2 border-[#800000] px-4 py-2 rounded-sm text-sm font-bold transition-all duration-200 group/btn">
                    View Details <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                  <button onClick={() => handleApply(job.title, job.id, job)} className="w-full bg-gradient-to-r from-[#800000] via-[#600000] to-amber-600 text-white px-4 py-2 rounded-sm text-sm font-bold hover:from-[#600000] hover:via-[#400000] hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 relative overflow-hidden">
                    <span className="relative z-10">Apply Now</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:animate-pulse"></div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-center bg-white rounded-sm p-6 border border-gray-200">
        <div className="mb-4 lg:mb-0 text-sm text-gray-600">
          Showing <span className="font-semibold text-[#800000]">{paginationInfo.start}</span> - <span className="font-semibold text-[#800000]">{paginationInfo.end}</span> of <span className="font-semibold text-[#800000]">{paginationInfo.total}</span> jobs
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded border text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50">Previous</button>
          {getPageNumbers.map((num, idx) => (
            <button key={idx} onClick={() => typeof num === "number" && handlePageChange(num)} disabled={num === "..."} className={`px-3 py-1 rounded text-sm font-medium ${num === currentPage ? "bg-[#800000] text-white" : "text-gray-600 hover:bg-gray-100"}`}>{num}</button>
          ))}
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded border text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default HotJobs;