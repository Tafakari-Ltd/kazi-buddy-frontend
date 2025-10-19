import { AppDispatch, RootState } from "@/Redux/Store/Store";
import {
  fetchJobSkills,
  fetchJobSkillById,
  createJobSkill,
  updateJobSkill,
  deleteJobSkill,
  clearJobSkills,
  clearCurrentJobSkill,
  clearState,
  setCurrentJobSkill,
} from "@/Redux/Features/jobSkillsSlice";
import { CreateJobSkillData, UpdateJobSkillData, JobSkill, SkillLevel } from "@/types/job.types";

export class JobSkillsService {
  constructor(private dispatch: AppDispatch) {}

  // Fetch all job skills
  async fetchAll() {
    return await this.dispatch(fetchJobSkills());
  }

  // Fetch job skill by ID
  async fetchById(skillId: string) {
    return await this.dispatch(fetchJobSkillById(skillId));
  }

  // Create new job skill for a job
  async create(jobId: string, skillData: CreateJobSkillData) {
    return await this.dispatch(createJobSkill({ jobId, data: skillData }));
  }

  // Update existing job skill
  async update(skillId: string, updateData: UpdateJobSkillData) {
    return await this.dispatch(updateJobSkill({ skillId, data: updateData }));
  }

  // Delete job skill
  async delete(skillId: string) {
    return await this.dispatch(deleteJobSkill(skillId));
  }

  // Clear all job skills from state
  clearAll() {
    this.dispatch(clearJobSkills());
  }

  // Clear current job skill from state
  clearCurrent() {
    this.dispatch(clearCurrentJobSkill());
  }

  // Clear error and success messages
  clearMessages() {
    this.dispatch(clearState());
  }

  // Set current job skill
  setCurrent(skill: JobSkill) {
    this.dispatch(setCurrentJobSkill(skill));
  }

  // Helper method to create skill data with validation
  createSkillData(
    skill: string,
    experienceLevel: SkillLevel,
    isRequired: boolean = false
  ): CreateJobSkillData {
    return {
      skill: skill.trim(),
      experience_level: experienceLevel,
      is_required: isRequired,
    };
  }

  // Helper method to create update data
  createUpdateData(
    skill?: string,
    experienceLevel?: SkillLevel,
    isRequired?: boolean
  ): UpdateJobSkillData {
    const updateData: UpdateJobSkillData = {};

    if (skill !== undefined) {
      updateData.skill = skill.trim();
    }
    if (experienceLevel !== undefined) {
      updateData.experience_level = experienceLevel;
    }
    if (isRequired !== undefined) {
      updateData.is_required = isRequired;
    }

    return updateData;
  }
}

// Selector helpers
export const getJobSkillsState = (state: RootState) => state.jobSkills;
export const getJobSkills = (state: RootState) => state.jobSkills.jobSkills;
export const getCurrentJobSkill = (state: RootState) => state.jobSkills.currentJobSkill;
export const getJobSkillsLoading = (state: RootState) => state.jobSkills.loading;
export const getJobSkillsError = (state: RootState) => state.jobSkills.error;
export const getJobSkillsSuccess = (state: RootState) => state.jobSkills.successMessage;

// Utility functions
export const validateSkillData = (data: CreateJobSkillData): string[] => {
  const errors: string[] = [];

  if (!data.skill || data.skill.trim().length === 0) {
    errors.push("Skill name is required");
  }

  if (data.skill && data.skill.trim().length > 100) {
    errors.push("Skill name must be 100 characters or less");
  }

  if (!Object.values(SkillLevel).includes(data.experience_level)) {
    errors.push("Valid experience level is required");
  }

  return errors;
};

export const formatSkillForDisplay = (skill: JobSkill): string => {
  const levelText = skill.experience_level.charAt(0).toUpperCase() + 
    skill.experience_level.slice(1).toLowerCase();
  const requiredText = skill.is_required ? "(Required)" : "(Optional)";
  return `${skill.skill} - ${levelText} ${requiredText}`;
};

// Hook for easier usage in components
export const createJobSkillsService = (dispatch: AppDispatch) => {
  return new JobSkillsService(dispatch);
};