"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus, Edit, Trash2, Filter } from "lucide-react";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { useJobs } from "@/Redux/Functions/useJobs";
import {
  getJobSkills,
  getJobSkillsLoading,
  getJobSkillsError,
  createJobSkillsService,
} from "@/services/jobSkillsService";
import { SkillLevel, SKILL_LEVEL_OPTIONS, JobSkill } from "@/types/job.types";
import { toast } from "sonner";

const SkillsManagementPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const jobSkillsService = createJobSkillsService(dispatch);
  const { jobs, handleFetchJobs } = useJobs();

  const allSkills = useSelector(getJobSkills);
  const loading = useSelector(getJobSkillsLoading);
  const error = useSelector(getJobSkillsError);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<SkillLevel | "">("");
  const [filterRequired, setFilterRequired] = useState<"all" | "required" | "optional">("all");
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  // Load jobs and skills on mount
  useEffect(() => {
    handleFetchJobs();
    jobSkillsService.fetchAll();
  }, []);

  // Filter skills based on search and filters
  const filteredSkills = allSkills.filter((skill) => {
    const matchesSearch = skill.skill.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = !filterLevel || skill.experience_level === filterLevel;
    const matchesRequired =
      filterRequired === "all" ||
      (filterRequired === "required" && skill.is_required) ||
      (filterRequired === "optional" && !skill.is_required);
    const matchesJob = !selectedJobId || skill.job_id === selectedJobId;

    return matchesSearch && matchesLevel && matchesRequired && matchesJob;
  });

  // Get job title by ID
  const getJobTitle = (jobId?: string) => {
    if (!jobId) return "Unknown Job";
    const job = jobs.find((j) => j.id === jobId);
    return job?.title || "Unknown Job";
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      try {
        await jobSkillsService.delete(skillId);
        toast.success("Skill deleted successfully");
      } catch (error) {
        toast.error("Failed to delete skill");
      }
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterLevel("");
    setFilterRequired("all");
    setSelectedJobId("");
  };

  const getSkillLevelColor = (level: SkillLevel) => {
    switch (level) {
      case SkillLevel.EXPERT:
        return "bg-purple-100 text-purple-800";
      case SkillLevel.ADVANCED:
        return "bg-blue-100 text-blue-800";
      case SkillLevel.INTERMEDIATE:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Skills Management</h1>
              <p className="text-gray-600 mt-2">
                Manage all job skills across the platform
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Total Skills: {filteredSkills.length}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Experience Level Filter */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as SkillLevel | "")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Levels</option>
              {SKILL_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Required Filter */}
            <select
              value={filterRequired}
              onChange={(e) => setFilterRequired(e.target.value as "all" | "required" | "optional")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Skills</option>
              <option value="required">Required Only</option>
              <option value="optional">Optional Only</option>
            </select>

            {/* Job Filter */}
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Skills List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading skills...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <p>Error loading skills: {error}</p>
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No skills found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skill Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Required
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSkills.map((skill) => (
                    <tr key={skill.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{skill.skill}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSkillLevelColor(
                            skill.experience_level
                          )}`}
                        >
                          {skill.experience_level.charAt(0).toUpperCase() +
                            skill.experience_level.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {skill.is_required ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Optional
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getJobTitle(skill.job_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDeleteSkill(skill.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                            title="Delete Skill"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsManagementPage;