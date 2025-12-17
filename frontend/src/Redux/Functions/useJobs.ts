"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Store/Store";
import {
  fetchJobs,
  fetchFeaturedJobs,
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
    featuredJobs,
    currentJob,
    filters,
    pagination,
    loading,
    error,
    successMessage,
  } = useSelector((state: RootState) => state.jobs);

  const { employer: jobEmployer, loading: employerLoading } = useSelector(
    (state: RootState) => state.jobEmployer,
  );

  const handleFetchJobs = useCallback(async (filters?: JobFilters) => {
    const result = await dispatch(fetchJobs(filters));
    return result.payload;
  }, [dispatch]);

  const handleFetchFeaturedJobs = useCallback(async () => {
    const result = await dispatch(fetchFeaturedJobs());
    return result.payload;
  }, [dispatch]);

  const handleFetchJobById = useCallback(async (jobId: string) => {
    const result = await dispatch(fetchJobById(jobId));
    return result.payload;
  }, [dispatch]);

  const handleCreateJob = useCallback(async (jobData: CreateJobData) => {
    const result = await dispatch(createJob(jobData));
    return result.payload;
  }, [dispatch]);

  const handleUpdateJob = useCallback(async (jobId: string, data: UpdateJobData) => {
    const result = await dispatch(updateJob({ jobId, data }));
    return result.payload;
  }, [dispatch]);

  const handleDeleteJob = useCallback(async (jobId: string) => {
    const result = await dispatch(deleteJob(jobId));
    return result.payload;
  }, [dispatch]);

  const handleUpdateJobStatus = useCallback(async (jobId: string, status: JobStatus) => {
    const result = await dispatch(updateJobStatus({ jobId, status }));
    return result.payload;
  }, [dispatch]);

  const handleFetchJobsByEmployer = useCallback(async (employerId: string) => {
    const result = await dispatch(fetchJobsByEmployer(employerId));
    return result.payload;
  }, [dispatch]);

  const handleFetchJobsByCategory = useCallback(async (categoryId: string) => {
    const result = await dispatch(fetchJobsByCategory(categoryId));
    return result.payload;
  }, [dispatch]);

  const handleSetFilters = useCallback((newFilters: JobFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const handleSetPagination = useCallback((page: number, limit?: number) => {
    dispatch(setPagination({ page, limit }));
  }, [dispatch]);

  const handleFetchJobEmployer = useCallback(async (jobId: string) => {
    const result = await dispatch(fetchJobEmployer(jobId));
    return result.payload;
  }, [dispatch]);

  const handleClearState = useCallback(() => {
    dispatch(clearState());
  }, [dispatch]);

  const handleClearCurrentJob = useCallback(() => {
    dispatch(clearCurrentJob());
  }, [dispatch]);

  const getJobById = (jobId: string) => {
    return jobs.find((job) => job.id === jobId);
  };

  const getJobsByStatus = (status: JobStatus) => {
    return jobs.filter((job) => job.status === status);
  };

  const getJobsByCategory = (categoryId: string) => {
    return jobs.filter((job) => job.category === categoryId);
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
    jobs,
    featuredJobs,
    currentJob,
    jobEmployer,
    filters,
    pagination,
    loading,
    employerLoading,
    error,
    successMessage,
    handleFetchJobs,
    handleFetchFeaturedJobs,
    handleFetchJobById,
    handleCreateJob,
    handleUpdateJob,
    handleDeleteJob,
    handleUpdateJobStatus,
    handleFetchJobsByEmployer,
    handleFetchJobsByCategory,
    handleSetFilters,
    handleClearFilters,
    handleSetPagination,
    handleFetchJobEmployer,
    handleClearState,
    handleClearCurrentJob,
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