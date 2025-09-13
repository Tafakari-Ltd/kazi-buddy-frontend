"use client";
import { Clock, Heart, Locate, ArrowRight } from "lucide-react";
import { useState } from "react";

import { jobs } from "@/component/Homepage/HotJobs/Jobs";

import { useDispatch } from "react-redux";

import { AppDispatch } from "@/Redux/Store/Store";

import { openJobModal } from "@/Redux/Features/ApplyJobSlice";

import { openJobDescription } from "@/Redux/Features/JobDescriptionSlice";

const categories = [
  "Cleaning & House Help",
  "Driving & Delivery",
  "Construction Work",
  "Shop Attendant",
  "Farm Work",
  "Cooking & Kitchen Help",
  "Security Guard",
  "Laundry & Dry Cleaning",
];

const JobListPage = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredJob, setHoveredJob] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const filteredJobs =
    activeCategory === "All"
      ? jobs
      : jobs.filter((job) => job.category === activeCategory);

  const handleApply = (jobTitle: string, jobId: number) => {
    dispatch(openJobModal());
  };

  const handleJobDescription = (job: any) => {
    dispatch(openJobDescription(job));
  };

  const toggleFavorite = (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(jobId)) {
      newFavorites.delete(jobId);
    } else {
      newFavorites.add(jobId);
    }
    setFavorites(newFavorites);
  };

  return (
    <div className="mx-auto px-6 md:px-12 py-12">
      <h1 className="text-4xl font-bold text-[#800000] mb-6 container">All Jobs</h1>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-10 container">
        {/* Add 'All' button */}
        <button
          onClick={() => setActiveCategory("All")}
          className={`px-4 py-[0.1rem] rounded-sm text-sm font-medium border transition ${activeCategory === "All"
              ? "bg-[#800000] text-white"
              : "border-gray-400 text-gray-700 hover:bg-gray-100"
            }`}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-sm text-sm font-medium border transition ${activeCategory === category
                ? "bg-[#800000] text-white"
                : "border-gray-400 text-gray-700 hover:bg-gray-100"
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-[1rem] md:grid-cols-3 lg:grid-cols-4 mb-12 container">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
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
                  className={`absolute inset-0 ${job.colorFilter
                    } mix-blend-multiply transition-opacity duration-300 ${hoveredJob === job.id ? "opacity-60" : "opacity-80"
                    }`}
                />
                <button
                  onClick={(e) => toggleFavorite(job.id, e)}
                  aria-label="Toggle favorite"
                  className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-sm hover:bg-white/30"
                >
                  <Heart
                    className={`w-5 h-5 ${favorites.has(job.id)
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
                    <div className="p-1 bg-green-100 rounded-sm">
                      <Locate className="w-3 h-3 text-green-700" />
                    </div>
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="p-1 bg-blue-100 rounded-sm">
                      <Clock className="w-3 h-3 text-blue-700" />
                    </div>
                    <span className="font-semibold text-[#800000]">
                      {job.rate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-sm text-xs font-medium">
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
          ))
        ) : (
          <p className="text-gray-600 col-span-full">No jobs found.</p>
        )}
      </div>

      {/* Pagination Placeholder */}
      <div className="flex flex-col justify-between items-center text-sm text-gray-600 border-t pt-4">
        <p>
          Showing {filteredJobs.length} of {jobs.length} jobs
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-sm border border-gray-400 hover:bg-gray-100">
            Prev
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className="px-3 py-1 rounded-sm border border-gray-400 hover:bg-gray-100"
            >
              {page}
            </button>
          ))}
          <button className="px-3 py-1 rounded-sm border border-gray-400 hover:bg-gray-100">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobListPage;