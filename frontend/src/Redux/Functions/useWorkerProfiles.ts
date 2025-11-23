import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Store/Store";
import {
  fetchWorkerProfiles,
  fetchWorkerProfileById,
  fetchUserWorkerProfile,
  createWorkerProfile,
  updateWorkerProfile,
  clearWorkerProfiles,
  clearWorkerProfileState,
  clearCurrentProfile,
  clearUserProfile,
  setFilters,
  clearFilters,
  setPagination,
} from "../Features/workerProfilesSlice";
import {
  WorkerProfileFilters,
  CreateWorkerProfileData,
  UpdateWorkerProfileData,
  isWorkerCurrentlyAvailable,
} from "@/types/worker.types";

export const useWorkerProfiles = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    profiles,
    currentProfile,
    userProfile,
    loading,
    error,
    successMessage,
    filters,
    pagination,
  } = useSelector((state: RootState) => state.workerProfiles);

  // Fetch all worker profiles with optional filters
  const handleFetchWorkerProfiles = useCallback(
    (filters?: WorkerProfileFilters) => {
      return dispatch(fetchWorkerProfiles(filters));
    },
    [dispatch],
  );

  // Fetch single worker profile by ID
  const handleFetchWorkerProfileById = useCallback(
    (profileId: string) => {
      return dispatch(fetchWorkerProfileById(profileId));
    },
    [dispatch],
  );

  // Fetch current user's worker profile
  const handleFetchUserWorkerProfile = useCallback(
    (userId: string) => {
      return dispatch(fetchUserWorkerProfile(userId));
    },
    [dispatch],
  );

  // Create new worker profile
  const handleCreateWorkerProfile = useCallback(
    (profileData: CreateWorkerProfileData) => {
      return dispatch(createWorkerProfile(profileData));
    },
    [dispatch],
  );

  // Update worker profile
  const handleUpdateWorkerProfile = useCallback(
    (profileId: string, data: UpdateWorkerProfileData) => {
      return dispatch(updateWorkerProfile({ profileId, data }));
    },
    [dispatch],
  );

  // Clear all profiles from state
  const handleClearWorkerProfiles = useCallback(() => {
    dispatch(clearWorkerProfiles());
  }, [dispatch]);

  // Clear error and success messages
  const handleClearState = useCallback(() => {
    dispatch(clearWorkerProfileState());
  }, [dispatch]);

  // Clear current profile
  const handleClearCurrentProfile = useCallback(() => {
    dispatch(clearCurrentProfile());
  }, [dispatch]);

  // Clear user profile
  const handleClearUserProfile = useCallback(() => {
    dispatch(clearUserProfile());
  }, [dispatch]);

  // Set filters
  const handleSetFilters = useCallback(
    (newFilters: WorkerProfileFilters) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch],
  );

  // Clear filters
  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Set pagination
  const handleSetPagination = useCallback(
    (page: number, limit?: number) => {
      dispatch(setPagination({ page, limit }));
    },
    [dispatch],
  );

  // Helper function to get profile by ID from current profiles
  const getProfileById = useCallback(
    (profileId: string) => {
      return profiles.find((profile) => profile.id === profileId) || null;
    },
    [profiles],
  );

  // Helper function to check if user has a profile
  const hasUserProfile = useCallback(() => {
    return userProfile !== null;
  }, [userProfile]);

  // Helper function to check if profile is verified
  const isProfileVerified = useCallback(
    (profileId?: string) => {
      const profile = profileId ? getProfileById(profileId) : userProfile;
      return profile?.verification_status === "verified";
    },
    [getProfileById, userProfile],
  );

  // Helper function to check if profile is pending
  const isProfilePending = useCallback(
    (profileId?: string) => {
      const profile = profileId ? getProfileById(profileId) : userProfile;
      return profile?.verification_status === "pending";
    },
    [getProfileById, userProfile],
  );

  // Helper function to check if worker is currently available
  const isCurrentlyAvailable = useCallback(
    (profileId?: string) => {
      const profile = profileId ? getProfileById(profileId) : userProfile;
      return profile ? isWorkerCurrentlyAvailable(profile) : false;
    },
    [getProfileById, userProfile],
  );

  // Helper function to get available workers only
  const getAvailableWorkers = useCallback(() => {
    return profiles.filter((profile) => profile.is_available);
  }, [profiles]);

  // Helper function to get workers by location
  const getWorkersByLocation = useCallback(
    (location: string) => {
      return profiles.filter((profile) =>
        profile.location.toLowerCase().includes(location.toLowerCase()),
      );
    },
    [profiles],
  );

  // Helper function to get workers by experience level
  const getWorkersByExperience = useCallback(
    (minExperience: number, maxExperience?: number) => {
      return profiles.filter((profile) => {
        const experience = profile.years_experience;
        return maxExperience
          ? experience >= minExperience && experience <= maxExperience
          : experience >= minExperience;
      });
    },
    [profiles],
  );

  // Helper function to get workers by hourly rate range
  const getWorkersByHourlyRate = useCallback(
    (minRate: number, maxRate?: number) => {
      return profiles.filter((profile) => {
        const rate = parseFloat(profile.hourly_rate);
        return maxRate ? rate >= minRate && rate <= maxRate : rate >= minRate;
      });
    },
    [profiles],
  );

  // Helper function to search workers by bio/skills
  const searchWorkers = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return profiles.filter(
        (profile) =>
          profile.bio.toLowerCase().includes(lowerQuery) ||
          profile.location.toLowerCase().includes(lowerQuery) ||
          profile.location_text.toLowerCase().includes(lowerQuery),
      );
    },
    [profiles],
  );

  return {
    // State
    profiles,
    currentProfile,
    userProfile,
    loading,
    error,
    successMessage,
    filters,
    pagination,

    // Actions
    handleFetchWorkerProfiles,
    handleFetchWorkerProfileById,
    handleFetchUserWorkerProfile,
    handleCreateWorkerProfile,
    handleUpdateWorkerProfile,
    handleClearWorkerProfiles,
    handleClearState,
    handleClearCurrentProfile,
    handleClearUserProfile,
    handleSetFilters,
    handleClearFilters,
    handleSetPagination,

    // Helper functions
    getProfileById,
    hasUserProfile,
    isProfileVerified,
    isProfilePending,
    isCurrentlyAvailable,
    getAvailableWorkers,
    getWorkersByLocation,
    getWorkersByExperience,
    getWorkersByHourlyRate,
    searchWorkers,
  };
};
