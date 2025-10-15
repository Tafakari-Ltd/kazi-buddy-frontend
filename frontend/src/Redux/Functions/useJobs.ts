"use client";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Store/Store";
import {
  fetchJobs,
  fetchJobById,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  fetchJobsByEmployer,
  fetchJobsByCategory,
  clearState,
  clearCurrentJob,
  setFilters,
  clearFilters,
  setPagination,
} from "../Features/jobsSlice";
import { fetchJobSkills } from "../Features/jobs/jobSkillsSlice";
import { fetchJobEmployer } from "../Features/jobs/jobEmployerSlice";
import {
  CreateJobData,
  UpdateJobData,
  JobFilters,
  JobStatus,
} from "@/types/job.types";

export const useJobs = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const {
    jobs,
    currentJob,
    filters,
    pagination,
    loading,
    error,
    successMessage,
  } = useSelector((state: RootState) => state.jobs);

  const { skills: jobSkills, loading: skillsLoading } = useSelector(
    (state: RootState) => state.jobSkills
  );

  const { employer: jobEmployer, loading: employerLoading } = useSelector(
    (state: RootState) => state.jobEmployer
  );

  // Jobs CRUD operations
  const handleFetchJobs = async (filters?: JobFilters) => {
    const result = await dispatch(fetchJobs(filters));
    return result.payload;
  };

  const handleFetchJobById = async (jobId: string) => {
    const result = await dispatch(fetchJobById(jobId));
    return result.payload;
  };

  const handleCreateJob = async (jobData: CreateJobData) => {
    const result = await dispatch(createJob(jobData));
    return result.payload;
  };

  const handleUpdateJob = async (jobId: string, data: UpdateJobData) => {
    const result = await dispatch(updateJob({ jobId, data }));
    return result.payload;
  };

  const handleDeleteJob = async (jobId: string) => {
    const result = await dispatch(deleteJob(jobId));
    return result.payload;
  };

  const handleUpdateJobStatus = async (jobId: string, status: JobStatus) => {
    const result = await dispatch(updateJobStatus({ jobId, status }));
    return result.payload;
  };

  // Filtering and search operations
  const handleFetchJobsByEmployer = async (employerId: string) => {
    const result = await dispatch(fetchJobsByEmployer(employerId));
    return result.payload;
  };

  const handleFetchJobsByCategory = async (categoryId: string) => {
    const result = await dispatch(fetchJobsByCategory(categoryId));
    return result.payload;
  };

  const handleSetFilters = (newFilters: JobFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleSetPagination = (page: number, limit?: number) => {
    dispatch(setPagination({ page, limit }));
  };

  // Additional data operations
  const handleFetchJobSkills = async (jobId: string) => {
    const result = await dispatch(fetchJobSkills(jobId));
    return result.payload;
  };

  const handleFetchJobEmployer = async (jobId: string) => {
    const result = await dispatch(fetchJobEmployer(jobId));
    return result.payload;
  };

  // State management
  const handleClearState = () => {
    dispatch(clearState());
  };

  const handleClearCurrentJob = () => {
    dispatch(clearCurrentJob());
  };

  // Utility functions
  const getJobById = (jobId: string) => {
    return jobs.find(job => job.id === jobId);
  };

  const getJobsByStatus = (status: JobStatus) => {
    return jobs.filter(job => job.status === status);
  };

  const getJobsByCategory = (categoryId: string) => {
    return jobs.filter(job => job.category === categoryId);
  };

  const getTotalJobs = () => {
    return pagination.total;
  };

  const getCurrentPage = () => {
    return pagination.page;
  };

  const getTotalPages = () => {
    return pagination.total_pages;
  };

  const isFirstPage = () => {
    return pagination.page === 1;
  };

  const isLastPage = () => {
    return pagination.page === pagination.total_pages;
  };

  return {
    // State
    jobs,
    currentJob,
    jobSkills,
    jobEmployer,
    filters,
    pagination,
    loading,
    skillsLoading,
    employerLoading,
    error,
    successMessage,

    // CRUD operations
    handleFetchJobs,
    handleFetchJobById,
    handleCreateJob,
    handleUpdateJob,
    handleDeleteJob,
    handleUpdateJobStatus,

    // Filtering and search
    handleFetchJobsByEmployer,
    handleFetchJobsByCategory,
    handleSetFilters,
    handleClearFilters,
    handleSetPagination,

    // Additional data
    handleFetchJobSkills,
    handleFetchJobEmployer,

    // State management
    handleClearState,
    handleClearCurrentJob,

    // Utility functions
    getJobById,
    getJobsByStatus,
    getJobsByCategory,
    getTotalJobs,
    getCurrentPage,
    getTotalPages,
    isFirstPage,
    isLastPage,
  };
};