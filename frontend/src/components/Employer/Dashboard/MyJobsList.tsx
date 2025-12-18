import React from "react";
import { Briefcase, Filter } from "lucide-react";
import { Job } from "@/types/job.types";
import JobCard from "./JobCard";

interface MyJobsListProps {
  jobs: Job[];
  categories: Array<{ id: string; name: string }>;
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  onPostJob: () => void;
  onViewJob: (job: Job) => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (job: Job) => void;
}

const MyJobsList: React.FC<MyJobsListProps> = ({
  jobs,
  categories,
  selectedCategoryId,
  onCategoryChange,
  onPostJob,
  onViewJob,
  onEditJob,
  onDeleteJob,
}) => {
  return (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden min-h-[500px]">
      <div className="p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-gray-500" /> My Job Postings
          </h2>
          <button
            onClick={onPostJob}
            className="text-sm bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            + Post New Job
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter by Category:
          </label>
          <select
            value={selectedCategoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {selectedCategoryId && (
            <span className="text-sm text-gray-600 font-medium">
              ({jobs.length} {jobs.length === 1 ? "job" : "jobs"})
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium">
              {selectedCategoryId ? "No jobs in this category" : "No jobs posted yet"}
            </h3>
            <p className="text-gray-500">
              {selectedCategoryId
                ? "Try selecting a different category or clear the filter."
                : "Post your first job to start receiving applications."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                categories={categories}
                onView={onViewJob}
                onEdit={onEditJob}
                onDelete={onDeleteJob}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobsList;
