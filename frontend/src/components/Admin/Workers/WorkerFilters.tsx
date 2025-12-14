"use client";
import React from "react";
import { Search } from "lucide-react";
import { ApplicationStatus } from "@/types/jobApplication.types";

interface WorkerFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: "by_worker" | "by_status";
  setViewMode: (mode: "by_worker" | "by_status") => void;
  expandAll?: () => void;
  collapseAll?: () => void;
  applicationFilter: "all" | ApplicationStatus;
  setApplicationFilter: (status: "all" | ApplicationStatus) => void;
  stats?: {
    all: number;
    pending: number;
    reviewed: number;
    accepted: number;
    rejected: number;
  };
}

const WorkerFilters: React.FC<WorkerFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  expandAll,
  collapseAll,
  applicationFilter,
  setApplicationFilter,
  stats,
}) => {
  return (
    <div className="bg-white border border-gray-200 p-6 mb-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold text-gray-800">Workers Administration</h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by location, skills, rate, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-all outline-none"
            />
          </div>
          {viewMode === "by_worker" && expandAll && collapseAll && (
            <div className="flex items-center gap-2">
              <button onClick={expandAll} className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors">
                Expand all
              </button>
              <button onClick={collapseAll} className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors">
                Collapse all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 mt-4 border-t pt-4">
        <button
          onClick={() => setViewMode("by_status")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            viewMode === "by_status" ? "bg-red-600 text-white shadow-md" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          View by Application Status
        </button>
        <button
          onClick={() => setViewMode("by_worker")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            viewMode === "by_worker" ? "bg-red-600 text-white shadow-md" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          View by Worker
        </button>
      </div>

      {/* Application Status Filters */}
      {viewMode === "by_status" && stats && (
        <div className="flex gap-2 mt-3 flex-wrap animate-in fade-in slide-in-from-top-2 duration-300">
          <FilterButton
            active={applicationFilter === "all"}
            onClick={() => setApplicationFilter("all")}
            label={`All (${stats.all})`}
            colorClass="bg-gray-700"
          />
          <FilterButton
            active={applicationFilter === "pending"}
            onClick={() => setApplicationFilter("pending")}
            label={`Pending (${stats.pending})`}
            colorClass="bg-yellow-600"
          />
          <FilterButton
            active={applicationFilter === "reviewed"}
            onClick={() => setApplicationFilter("reviewed")}
            label={`Reviewed (${stats.reviewed})`}
            colorClass="bg-blue-600"
          />
          <FilterButton
            active={applicationFilter === "accepted"}
            onClick={() => setApplicationFilter("accepted")}
            label={`Accepted (${stats.accepted})`}
            colorClass="bg-green-600"
          />
          <FilterButton
            active={applicationFilter === "rejected"}
            onClick={() => setApplicationFilter("rejected")}
            label={`Rejected (${stats.rejected})`}
            colorClass="bg-red-600"
          />
        </div>
      )}
    </div>
  );
};

const FilterButton = ({ active, onClick, label, colorClass }: { active: boolean; onClick: () => void; label: string; colorClass: string }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
      active ? `${colorClass} text-white shadow-md` : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
    }`}
  >
    {label}
  </button>
);

export default WorkerFilters;