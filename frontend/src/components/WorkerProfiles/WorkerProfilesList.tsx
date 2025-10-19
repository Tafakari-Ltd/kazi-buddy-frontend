"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  RefreshCw,
  ChevronDown,
  X
} from "lucide-react";
import WorkerProfileCard from "./WorkerProfileCard";
import { 
  WorkerProfile, 
  WorkerProfileFilters,
  LOCATION_OPTIONS,
  VerificationStatus 
} from "@/types/worker.types";

interface WorkerProfilesListProps {
  profiles: WorkerProfile[];
  loading?: boolean;
  onFilterChange?: (filters: WorkerProfileFilters) => void;
  onViewProfile?: (profileId: string) => void;
  onContactWorker?: (profile: WorkerProfile) => void;
  onRefresh?: () => void;
  className?: string;
}

const WorkerProfilesList: React.FC<WorkerProfilesListProps> = ({
  profiles,
  loading = false,
  onFilterChange,
  onViewProfile,
  onContactWorker,
  onRefresh,
  className = "",
}) => {
  const [filters, setFilters] = useState<WorkerProfileFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFilterChange = (newFilters: Partial<WorkerProfileFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    handleFilterChange({ search_query: query || undefined });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
    onFilterChange?.({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof WorkerProfileFilters] !== undefined && 
    filters[key as keyof WorkerProfileFilters] !== ""
  );

  const getFilteredProfiles = () => {
    if (!searchQuery) return profiles;
    
    const query = searchQuery.toLowerCase();
    return profiles.filter(profile => 
      profile.bio.toLowerCase().includes(query) ||
      profile.location.toLowerCase().includes(query) ||
      profile.location_text.toLowerCase().includes(query)
    );
  };

  const filteredProfiles = getFilteredProfiles();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filter Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search workers by skills, location..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              hasActiveFilters
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {Object.keys(filters).length}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filter Workers</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={filters.location || ""}
                onChange={(e) => handleFilterChange({ location: e.target.value || undefined })}
              >
                <option value="">All locations</option>
                {LOCATION_OPTIONS.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Users className="w-4 h-4 inline mr-1" />
                Min Experience
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={filters.min_experience || ""}
                onChange={(e) => handleFilterChange({ 
                  min_experience: e.target.value ? parseInt(e.target.value) : undefined 
                })}
              >
                <option value="">Any experience</option>
                <option value="0">Entry level</option>
                <option value="1">1+ years</option>
                <option value="3">3+ years</option>
                <option value="5">5+ years</option>
                <option value="10">10+ years</option>
              </select>
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Max Hourly Rate
              </label>
              <input
                type="number"
                step="0.50"
                min="0"
                placeholder="50.00"
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={filters.max_hourly_rate || ""}
                onChange={(e) => handleFilterChange({ 
                  max_hourly_rate: e.target.value || undefined 
                })}
              />
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Availability
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={filters.is_available !== undefined ? filters.is_available.toString() : ""}
                onChange={(e) => handleFilterChange({ 
                  is_available: e.target.value ? e.target.value === "true" : undefined 
                })}
              >
                <option value="">All workers</option>
                <option value="true">Available only</option>
                <option value="false">Not available</option>
              </select>
            </div>

            {/* Verification Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Status
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={filters.verification_status || ""}
                onChange={(e) => handleFilterChange({ 
                  verification_status: e.target.value as VerificationStatus || undefined 
                })}
              >
                <option value="">All statuses</option>
                <option value={VerificationStatus.VERIFIED}>Verified</option>
                <option value={VerificationStatus.PENDING}>Pending</option>
                <option value={VerificationStatus.REJECTED}>Rejected</option>
                <option value={VerificationStatus.SUSPENDED}>Suspended</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {loading ? (
            "Loading workers..."
          ) : (
            `${filteredProfiles.length} worker${filteredProfiles.length !== 1 ? 's' : ''} found`
          )}
        </p>
        
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            <div className="flex flex-wrap gap-1">
              {Object.entries(filters).map(([key, value]) => {
                if (value === undefined || value === "") return null;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                  >
                    {key}: {value.toString()}
                    <button
                      onClick={() => handleFilterChange({ [key]: undefined })}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Workers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No workers found</h3>
          <p className="text-gray-600 mb-4">
            {hasActiveFilters
              ? "Try adjusting your filters to see more results."
              : "There are no workers available at the moment."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <WorkerProfileCard
              key={profile.id}
              profile={profile}
              onViewProfile={onViewProfile}
              onContactWorker={onContactWorker}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerProfilesList;