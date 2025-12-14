"use client";
import React from "react";
import { Search, Filter } from "lucide-react";

interface EmployerFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: "by_employer" | "by_status";
  setViewMode: (mode: "by_employer" | "by_status") => void;
  jobStatusFilter: string;
  setJobStatusFilter: (status: string) => void;
  expandAll?: () => void;
  collapseAll?: () => void;
  stats?: {
    all: number;
    draft: number;
    active: number;
    paused: number;
    closed: number;
    cancelled: number;
  };
}

const EmployerFilters: React.FC<EmployerFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  jobStatusFilter,
  setJobStatusFilter,
  expandAll,
  collapseAll,
  stats,
}) => {
  return (
    <div className="bg-white border border-gray-200 p-6 mb-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold text-gray-800">Employers Administration</h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by company, industry, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-red-800 outline-none transition-all"
            />
          </div>
          {viewMode === "by_employer" && expandAll && collapseAll && (
            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Expand all
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
              >
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
            viewMode === "by_status"
              ? "bg-red-600 text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          View by Job Status
        </button>
        <button
          onClick={() => setViewMode("by_employer")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            viewMode === "by_employer"
              ? "bg-red-600 text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          View by Employer
        </button>
      </div>

      {/* Job Status Filters */}
      {viewMode === "by_status" && stats && (
        <div className="flex gap-2 mt-3 flex-wrap animate-in fade-in slide-in-from-top-2 duration-300">
          <FilterButton
            active={jobStatusFilter === "all"}
            onClick={() => setJobStatusFilter("all")}
            label={`All Jobs (${stats.all})`}
            colorClass="bg-gray-700"
          />
          <FilterButton
            active={jobStatusFilter === "draft"}
            onClick={() => setJobStatusFilter("draft")}
            label={`Draft (${stats.draft})`}
            colorClass="bg-gray-600"
          />
          <FilterButton
            active={jobStatusFilter === "active"}
            onClick={() => setJobStatusFilter("active")}
            label={`Active (${stats.active})`}
            colorClass="bg-green-600"
          />
          <FilterButton
            active={jobStatusFilter === "paused"}
            onClick={() => setJobStatusFilter("paused")}
            label={`Paused (${stats.paused})`}
            colorClass="bg-yellow-600"
          />
          <FilterButton
            active={jobStatusFilter === "closed"}
            onClick={() => setJobStatusFilter("closed")}
            label={`Closed (${stats.closed})`}
            colorClass="bg-red-600"
          />
          <FilterButton
            active={jobStatusFilter === "cancelled"}
            onClick={() => setJobStatusFilter("cancelled")}
            label={`Cancelled (${stats.cancelled})`}
            colorClass="bg-gray-500"
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

export default EmployerFilters;