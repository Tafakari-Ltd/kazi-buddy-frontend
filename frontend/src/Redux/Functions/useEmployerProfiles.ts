import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Store/Store";
import {
  fetchEmployerProfiles,
  fetchEmployerProfileById,
  fetchUserEmployerProfile,
  createEmployerProfile,
  updateEmployerProfile,
  clearEmployerProfiles,
  clearEmployerProfileState,
  clearCurrentProfile,
  clearUserProfile,
  setFilters,
  clearFilters,
  setPagination,
} from "../Features/employerProfilesSlice";
import {
  EmployerProfileFilters,
  CreateEmployerProfileData,
  UpdateEmployerProfileData,
} from "@/types/employer.types";

export const useEmployerProfiles = () => {
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
  } = useSelector((state: RootState) => state.employerProfiles);

  // Fetch all employer profiles with optional filters
  const handleFetchEmployerProfiles = useCallback(
    (filters?: EmployerProfileFilters) => {
      return dispatch(fetchEmployerProfiles(filters));
    },
    [dispatch]
  );

  // Fetch single employer profile by ID
  const handleFetchEmployerProfileById = useCallback(
    (profileId: string) => {
      return dispatch(fetchEmployerProfileById(profileId));
    },
    [dispatch]
  );

  // Fetch current user's employer profile
  const handleFetchUserEmployerProfile = useCallback(
    (userId: string) => {
      return dispatch(fetchUserEmployerProfile(userId));
    },
    [dispatch]
  );

  // Create new employer profile
  const handleCreateEmployerProfile = useCallback(
    (profileData: CreateEmployerProfileData) => {
      return dispatch(createEmployerProfile(profileData));
    },
    [dispatch]
  );

  // Update employer profile
  const handleUpdateEmployerProfile = useCallback(
    (profileId: string, data: UpdateEmployerProfileData) => {
      return dispatch(updateEmployerProfile({ profileId, data }));
    },
    [dispatch]
  );

  // Clear all profiles from state
  const handleClearEmployerProfiles = useCallback(() => {
    dispatch(clearEmployerProfiles());
  }, [dispatch]);

  // Clear error and success messages
  const handleClearState = useCallback(() => {
    dispatch(clearEmployerProfileState());
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
    (newFilters: EmployerProfileFilters) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
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
    [dispatch]
  );

  // Helper function to get profile by ID from current profiles
  const getProfileById = useCallback(
    (profileId: string) => {
      return profiles.find((profile) => profile.id === profileId) || null;
    },
    [profiles]
  );

  // Helper function to check if user has a profile
  const hasUserProfile = useCallback(() => {
    return userProfile !== null;
  }, [userProfile]);

  // Helper function to check if profile is verified
  const isProfileVerified = useCallback(
    (profileId?: string) => {
      const profile = profileId ? getProfileById(profileId) : userProfile;
      return profile?.verification_status === 'verified';
    },
    [getProfileById, userProfile]
  );

  // Helper function to check if profile is pending
  const isProfilePending = useCallback(
    (profileId?: string) => {
      const profile = profileId ? getProfileById(profileId) : userProfile;
      return profile?.verification_status === 'pending';
    },
    [getProfileById, userProfile]
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
    handleFetchEmployerProfiles,
    handleFetchEmployerProfileById,
    handleFetchUserEmployerProfile,
    handleCreateEmployerProfile,
    handleUpdateEmployerProfile,
    handleClearEmployerProfiles,
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
  };
};