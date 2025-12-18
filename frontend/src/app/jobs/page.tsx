"use client";
import { Clock, Locate, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/Redux/Store/Store";
import { openJobModal } from "@/Redux/Features/ApplyJobSlice";
import { useJobs } from "@/Redux/Functions/useJobs";
import { useCategories } from "@/Redux/Functions/useCategories";
import { Job } from "@/types/job.types";

const JobListPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading, handleFetchJobs, handleFetchJobsByCategory } =
    useJobs();
  const { categories, handleFetchCategories } = useCategories();

  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");

  useEffect(() => {
    handleFetchCategories();
    handleFetchJobs();
  }, []);

  useEffect(() => {
    if (activeCategoryId === "all") {
      handleFetchJobs();
    } else if (activeCategoryId) {
      handleFetchJobsByCategory(activeCategoryId);
    }
  }, [activeCategoryId]);

  const visibleJobs: Job[] = useMemo(() => jobs, [jobs]);

  const handleApply = () => {
    dispatch(openJobModal());
  };

  return (
    <div className="mx-auto px-6 md:px-12 py-12">
      <h1 className="text-4xl font-bold text-[#800000] mb-6 container">Jobs</h1>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-10 container">
        <button
          onClick={() => setActiveCategoryId("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategoryId === "all"
              ? "bg-[#800000] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategoryId === cat.id
                ? "bg-[#800000] text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-12 container">
        {loading && visibleJobs.length === 0 && (
          <p className="text-gray-600 col-span-full">Loading jobs...</p>
        )}
        {!loading && visibleJobs.length === 0 && (
          <p className="text-gray-600 col-span-full">No jobs found.</p>
        )}
        {visibleJobs.map((job) => (
          <div
            key={job.id}
            className="rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white hover:shadow-md transition-shadow"
          >
            <div className="p-5 space-y-3">
              <h4 className="text-lg font-bold text-[#800000]">{job.title}</h4>
              <p className="text-gray-600 text-sm line-clamp-3">
                {job.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Locate className="w-4 h-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {job.job_type.replace("_", " ")}
                </span>
                <span className="font-medium text-[#800000]">
                  {job.budget_min
                    ? `KSh ${job.budget_min.toLocaleString()}`
                    : "—"}
                  {job.budget_max
                    ? ` - KSh ${job.budget_max.toLocaleString()}`
                    : ""}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleApply}
                  className="flex-1 bg-gradient-to-r from-[#800000] to-[#600000] text-white px-4 py-2 rounded-sm text-sm font-semibold hover:opacity-90"
                >
                  Apply Now
                </button>
                <a
                  href={`/admin/jobs?status=${job.status}`}
                  className="flex items-center gap-1 text-[#800000] px-3 py-2 border border-[#800000] rounded-sm text-sm"
                >
                  View <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobListPage;
