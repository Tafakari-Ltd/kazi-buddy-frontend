"use client";
import {
  Clock,
  Heart,
  Locate,
  Star,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import React, { useState, useMemo, useCallback } from "react";

import { jobs } from "./Jobs";

import { AppDispatch } from "@/Redux/Store/Store";
import { openJobModal } from "@/Redux/Features/ApplyJobSlice";
import { useDispatch } from "react-redux";
import { openJobDescription } from "@/Redux/Features/JobDescriptionSlice";

// Types
interface Job {
  id: number;
  title: string;
  jobType: string;
  category: string;
  location: string;
  rate: string;
  description: string;
  image: string;
  colorFilter: string;
}

const HotJobs = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [hoveredJob, setHoveredJob] = useState<number | null>(null);

  const jobsPerPage = 12;
  const totalJobs = jobs.length;
  const totalPages = Math.ceil(totalJobs / jobsPerPage);

  const paginatedJobs = useMemo(() => {
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    return jobs.slice(indexOfFirstJob, indexOfLastJob);
  }, [currentPage, jobsPerPage]);

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
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [totalPages]
  );

  const handleApply = useCallback(
    (jobTitle: string, jobId: number) => {
      dispatch(openJobModal());
      console.log(`Applied for job: ${jobTitle} (ID: ${jobId})`);
    },
    [dispatch]
  );

  const handleJobDescription = useCallback(
    (job: Job) => {
      dispatch(
        openJobDescription({
          ...job,
          id: String(job.id),
        })
      );
    },
    [dispatch]
  );

  const toggleFavorite = useCallback((jobId: number, e: React.MouseEvent) => {
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

  return (
    <div className="mx-auto px-6 md:px-12 py-12 bg-gradient-to-b from-gray-50 to-white container">
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
          Discover exciting opportunities that match your skills and career
          goals. Start your journey with us today.
        </p>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            {totalJobs} Active Jobs
          </span>
          <span>•</span>
          <span>Updated Daily</span>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mb-12">
        {paginatedJobs.map((job) => (
          <div
            key={job.id}
            className="relative rounded-sm overflow-hidden shadow-lg group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white"
            onMouseEnter={() => setHoveredJob(job.id)}
            onMouseLeave={() => setHoveredJob(null)}
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={job.image}
                alt={job.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div
                className={`absolute inset-0 ${
                  job.colorFilter
                } mix-blend-multiply transition-opacity duration-300 ${
                  hoveredJob === job.id ? "opacity-60" : "opacity-80"
                }`}
              />
              <button
                onClick={(e) => toggleFavorite(job.id, e)}
                aria-label="Toggle favorite"
                className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorites.has(job.id)
                      ? "fill-red-500 text-red-500"
                      : "text-white hover:text-red-300"
                  }`}
                />
              </button>
              <div className="absolute top-3 left-3">
                <span className="bg-[#800000] text-white px-3 py-1 rounded-sm text-xs font-semibold shadow-lg">
                  {job.jobType}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-xl font-bold text-[#800000] mb-3 line-clamp-2 group-hover:text-[#600000] transition-colors">
                {job.title}
              </h4>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                {job.description}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="p-1 bg-green-100 rounded">
                    <Locate className="w-3 h-3 text-green-700" />
                  </div>
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="p-1 bg-blue-100 rounded">
                    <Clock className="w-3 h-3 text-blue-700" />
                  </div>
                  <span className="font-semibold text-[#800000]">
                    {job.rate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {job.category}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleJobDescription(job)}
                  className="w-full flex items-center justify-center gap-2 text-[#800000] hover:text-white hover:bg-gradient-to-r hover:from-[#800000] hover:to-[#600000] border-2 border-[#800000] px-4 py-2 rounded-sm text-sm font-bold transition-all duration-200 group/btn"
                >
                  View Details
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
                <button
                  onClick={() => handleApply(job.title, job.id)}
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

      {/* Pagination */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white rounded-sm p-6 border border-gray-200">
        <div className="mb-4 lg:mb-0 text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-[#800000]">
            {paginationInfo.start}
          </span>{" "}
          -
          <span className="font-semibold text-[#800000]">
            {" "}
            {paginationInfo.end}
          </span>{" "}
          of
          <span className="font-semibold text-[#800000]">
            {" "}
            {paginationInfo.total}
          </span>{" "}
          jobs
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>
          {getPageNumbers.map((num, idx) => (
            <button
              key={idx}
              onClick={() => typeof num === "number" && handlePageChange(num)}
              disabled={num === "..."}
              className={`px-3 py-1 rounded text-sm font-medium ${
                num === currentPage
                  ? "bg-[#800000] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotJobs;
