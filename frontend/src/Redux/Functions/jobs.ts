"use client";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Store/Store";
import {
  openJobModal,
  closeJobModal,
  setCoverLetter,
  setProposedRate,
  setAvailabilityStart,
  setWorkerNotes,
  updateFormData,
  resetForm,
  clearForm,
  setFormErrors,
  clearFormErrors,
  setSuccessMessage,
  setApiError,
  clearMessages,
  updateApplicationStatus,
  setPagination,
  applyForJob,
  fetchMyApplications,
  fetchApplicationDetails,
  fetchJobApplications,
  updateApplication,
  deleteApplication,
  fetchApplicationStats,
} from "../Features/ApplyJobSlice";
import {
  JobApplicationRequest,
  ApplicationStatus,
  ApplicationQueryParams,
} from "../../types/jobApplication.types";
import { useCallback, useEffect } from "react";

// Job Application Modal Hook
export const useJobApplicationModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    isModalOpen,
    formData,
    errors,
    isSubmitting,
    apiError,
    successMessage,
  } = useSelector((state: RootState) => ({
    isModalOpen: state.applyJob.isModalOpen,
    formData: state.applyJob.formData,
    errors: state.applyJob.errors,
    isSubmitting: state.applyJob.isSubmitting,
    apiError: state.applyJob.apiError,
    successMessage: state.applyJob.successMessage,
  }));

  const showJobModal = useCallback(() => {
    dispatch(openJobModal());
  }, [dispatch]);

  const hideJobModal = useCallback(() => {
    dispatch(closeJobModal());
  }, [dispatch]);

  const updateForm = useCallback(
    (data: Partial<JobApplicationRequest>) => {
      dispatch(updateFormData(data));
    },
    [dispatch],
  );

  const resetFormData = useCallback(() => {
    dispatch(resetForm());
  }, [dispatch]);

  const clearFormData = useCallback(() => {
    dispatch(clearForm());
  }, [dispatch]);

  return {
    isModalOpen,
    formData,
    errors,
    isSubmitting,
    apiError,
    successMessage,
    showJobModal,
    hideJobModal,
    updateForm,
    resetFormData,
    clearFormData,
  };
};

// Job Application Form Hook
export const useJobApplicationForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { formData, errors, isSubmitting } = useSelector(
    (state: RootState) => ({
      formData: state.applyJob.formData,
      errors: state.applyJob.errors,
      isSubmitting: state.applyJob.isSubmitting,
    }),
  );

  const setCoverLetterValue = useCallback(
    (value: string) => {
      dispatch(setCoverLetter(value));
    },
    [dispatch],
  );

  const setProposedRateValue = useCallback(
    (value: number) => {
      dispatch(setProposedRate(value));
    },
    [dispatch],
  );

  const setAvailabilityStartValue = useCallback(
    (value: string) => {
      dispatch(setAvailabilityStart(value));
    },
    [dispatch],
  );

  const setWorkerNotesValue = useCallback(
    (value: string) => {
      dispatch(setWorkerNotes(value));
    },
    [dispatch],
  );

  const setErrors = useCallback(
    (errors: any) => {
      dispatch(setFormErrors(errors));
    },
    [dispatch],
  );

  const clearErrors = useCallback(() => {
    dispatch(clearFormErrors());
  }, [dispatch]);

  const submitApplication = useCallback(
    async (jobId: string) => {
      try {
        await dispatch(
          applyForJob({ jobId, applicationData: formData }),
        ).unwrap();
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [dispatch, formData],
  );

  return {
    formData,
    errors,
    isSubmitting,
    setCoverLetterValue,
    setProposedRateValue,
    setAvailabilityStartValue,
    setWorkerNotesValue,
    setErrors,
    clearErrors,
    submitApplication,
  };
};

// My Applications Hook
export const useMyApplications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { myApplications, isLoading, apiError, pagination } = useSelector(
    (state: RootState) => ({
      myApplications: state.applyJob.myApplications,
      isLoading: state.applyJob.isLoading,
      apiError: state.applyJob.apiError,
      pagination: state.applyJob.pagination,
    }),
  );

  const fetchApplications = useCallback(
    (params?: ApplicationQueryParams) => {
      dispatch(fetchMyApplications(params));
    },
    [dispatch],
  );

  const updateApplicationById = useCallback(
    (applicationId: string, updateData: any) => {
      return dispatch(updateApplication({ applicationId, updateData }));
    },
    [dispatch],
  );

  const deleteApplicationById = useCallback(
    (applicationId: string) => {
      return dispatch(deleteApplication(applicationId));
    },
    [dispatch],
  );

  // Auto-fetch on mount
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications: myApplications,
    isLoading,
    apiError,
    pagination,
    fetchApplications,
    updateApplicationById,
    deleteApplicationById,
  };
};

// Job Applications (for employers) Hook
export const useJobApplications = (jobId?: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobApplications, isLoading, apiError, stats } = useSelector(
    (state: RootState) => ({
      jobApplications: state.applyJob.jobApplications,
      isLoading: state.applyJob.isLoading,
      apiError: state.applyJob.apiError,
      stats: state.applyJob.stats,
    }),
  );

  const fetchApplications = useCallback(
    (params?: ApplicationQueryParams) => {
      if (jobId) {
        dispatch(fetchJobApplications({ jobId, params }));
      }
    },
    [dispatch, jobId],
  );

  const fetchStats = useCallback(() => {
    if (jobId) {
      dispatch(fetchApplicationStats(jobId));
    }
  }, [dispatch, jobId]);

  const updateApplicationStatus = useCallback(
    (applicationId: string, status: ApplicationStatus) => {
      return dispatch(
        updateApplication({
          applicationId,
          updateData: { status },
        }),
      );
    },
    [dispatch],
  );

  // Auto-fetch on mount and when jobId changes
  useEffect(() => {
    if (jobId) {
      fetchApplications();
      fetchStats();
    }
  }, [fetchApplications, fetchStats, jobId]);

  return {
    applications: jobApplications,
    isLoading,
    apiError,
    stats,
    fetchApplications,
    fetchStats,
    updateApplicationStatus,
  };
};

// Single Application Details Hook
export const useApplicationDetails = (applicationId?: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentApplication, isLoading, apiError } = useSelector(
    (state: RootState) => ({
      currentApplication: state.applyJob.currentApplication,
      isLoading: state.applyJob.isLoading,
      apiError: state.applyJob.apiError,
    }),
  );

  const fetchDetails = useCallback(() => {
    if (applicationId) {
      dispatch(fetchApplicationDetails(applicationId));
    }
  }, [dispatch, applicationId]);

  const updateDetails = useCallback(
    (updateData: any) => {
      if (applicationId) {
        return dispatch(updateApplication({ applicationId, updateData }));
      }
    },
    [dispatch, applicationId],
  );

  // Auto-fetch on mount and when applicationId changes
  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return {
    application: currentApplication,
    isLoading,
    apiError,
    fetchDetails,
    updateDetails,
  };
};

// Messages Hook
export const useApplicationMessages = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { successMessage, apiError } = useSelector((state: RootState) => ({
    successMessage: state.applyJob.successMessage,
    apiError: state.applyJob.apiError,
  }));

  const setSuccess = useCallback(
    (message: string) => {
      dispatch(setSuccessMessage(message));
    },
    [dispatch],
  );

  const setError = useCallback(
    (message: string) => {
      dispatch(setApiError(message));
    },
    [dispatch],
  );

  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  return {
    successMessage,
    apiError,
    setSuccess,
    setError,
    clearAllMessages,
  };
};

// Legacy hook for backward compatibility
export const useShowJobModal = () => {
  const { isModalOpen, showJobModal, hideJobModal } = useJobApplicationModal();
  return { isModalOpen, showJobModal, hideJobModal };
};
