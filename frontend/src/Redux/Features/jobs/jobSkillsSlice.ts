// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import api from "@/lib/axios";
// import { JobSkill, JobSkillsResponse } from "@/types/job.types";

// // Types for job skills
// interface JobSkillsState {
//   skills: JobSkill[];
//   loading: boolean;
//   error: string | null;
//   successMessage: string | null;
// }

// interface CreateJobSkillPayload {
//   jobId: string;
//   skill: string;
//   is_required: boolean;
//   experience_level: string;
// }

// interface UpdateJobSkillPayload {
//   skillId: string;
//   experience_level?: string;
//   is_required?: boolean;
// }

// const initialState: JobSkillsState = {
//   skills: [],
//   loading: false,
//   error: null,
//   successMessage: null,
// };

// // List job skills - GET /api/jobs/skills/
// export const listJobSkills = createAsyncThunk<
//   JobSkill[],
//   void,
//   { rejectValue: string }
// >(
//   "jobSkills/listJobSkills",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await api.get('/api/jobs/skills/');
//       return Array.isArray(response) ? response : response.data || [];
//     } catch (error: any) {
//       return rejectWithValue(
//         error?.message || "Failed to fetch job skills"
//       );
//     }
//   }
// );

// // Get job skill details - GET /api/jobs/skills/{id}/
// export const getJobSkillDetails = createAsyncThunk<
//   JobSkill,
//   string,
//   { rejectValue: string }
// >(
//   "jobSkills/getJobSkillDetails",
//   async (skillId, { rejectWithValue }) => {
//     try {
//       const response = await api.get(`/api/jobs/skills/${skillId}/`);
//       return response.data || response;
//     } catch (error: any) {
//       return rejectWithValue(
//         error?.message || "Failed to fetch job skill details"
//       );
//     }
//   }
// );

// // Create job skill - POST /api/jobs/skills/create/{job_id}/
// export const createJobSkill = createAsyncThunk<
//   JobSkill,
//   CreateJobSkillPayload,
//   { rejectValue: string }
// >(
//   "jobSkills/createJobSkill",
//   async ({ jobId, skill, is_required, experience_level }, { rejectWithValue }) => {
//     try {
//       const response = await api.post(`/api/jobs/skills/create/${jobId}/`, {
//         skill,
//         is_required,
//         experience_level,
//       });
//       return response.data || response;
//     } catch (error: any) {
//       return rejectWithValue(
//         error?.message || "Failed to create job skill"
//       );
//     }
//   }
// );

// // Update job skill - PUT /api/jobs/skills/update/{skill_id}/
// export const updateJobSkill = createAsyncThunk<
//   JobSkill,
//   UpdateJobSkillPayload,
//   { rejectValue: string }
// >(
//   "jobSkills/updateJobSkill",
//   async ({ skillId, experience_level, is_required }, { rejectWithValue }) => {
//     try {
//       const updateData: any = {};
//       if (experience_level !== undefined) updateData.experience_level = experience_level;
//       if (is_required !== undefined) updateData.is_required = is_required;
      
//       const response = await api.put(`/api/jobs/skills/update/${skillId}/`, updateData);
//       return response.data || response;
//     } catch (error: any) {
//       return rejectWithValue(
//         error?.message || "Failed to update job skill"
//       );
//     }
//   }
// );

// // Delete job skill - DELETE /api/jobs/skills/delete/{skill_id}/
// export const deleteJobSkill = createAsyncThunk<
//   { message: string; skillId: string },
//   string,
//   { rejectValue: string }
// >(
//   "jobSkills/deleteJobSkill",
//   async (skillId, { rejectWithValue }) => {
//     try {
//       const response = await api.delete(`/api/jobs/skills/delete/${skillId}/`);
//       return { 
//         message: response?.message || "Job skill deleted successfully", 
//         skillId 
//       };
//     } catch (error: any) {
//       return rejectWithValue(
//         error?.message || "Failed to delete job skill"
//       );
//     }
//   }
// );

// // Legacy fetch job skills for backward compatibility
// export const fetchJobSkills = createAsyncThunk<
//   JobSkill[],
//   string,
//   { rejectValue: string }
// >(
//   "jobSkills/fetchJobSkills",
//   async (jobId, { rejectWithValue }) => {
//     try {
//       const response = await api.get(`/jobs/${jobId}/skills/`);
//       return response.data || response;
//     } catch (error: any) {
//       return rejectWithValue(
//         error?.message || "Failed to fetch job skills"
//       );
//     }
//   }
// );

// const jobSkillsSlice = createSlice({
//   name: "jobSkills",
//   initialState,
//   reducers: {
//     clearJobSkills: (state) => {
//       state.skills = [];
//       state.error = null;
//     },
//     clearSkillsState: (state) => {
//       state.error = null;
//       state.successMessage = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // List job skills
//       .addCase(listJobSkills.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(listJobSkills.fulfilled, (state, action) => {
//         state.loading = false;
//         state.skills = Array.isArray(action.payload) ? action.payload : [];
//       })
//       .addCase(listJobSkills.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       })
      
//       // Get job skill details
//       .addCase(getJobSkillDetails.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getJobSkillDetails.fulfilled, (state, action) => {
//         state.loading = false;
//         // Update the skill in the list if it exists
//         const index = state.skills.findIndex(skill => skill.id === action.payload.id);
//         if (index !== -1) {
//           state.skills[index] = action.payload;
//         }
//       })
//       .addCase(getJobSkillDetails.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       })
      
//       // Create job skill
//       .addCase(createJobSkill.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(createJobSkill.fulfilled, (state, action) => {
//         state.loading = false;
//         state.skills.push(action.payload);
//         state.successMessage = "Job skill created successfully";
//       })
//       .addCase(createJobSkill.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       })
      
//       // Update job skill
//       .addCase(updateJobSkill.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateJobSkill.fulfilled, (state, action) => {
//         state.loading = false;
//         const index = state.skills.findIndex(skill => skill.id === action.payload.id);
//         if (index !== -1) {
//           state.skills[index] = action.payload;
//         }
//         state.successMessage = "Job skill updated successfully";
//       })
//       .addCase(updateJobSkill.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       })
      
//       // Delete job skill
//       .addCase(deleteJobSkill.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(deleteJobSkill.fulfilled, (state, action) => {
//         state.loading = false;
//         state.skills = state.skills.filter(skill => skill.id !== action.payload.skillId);
//         state.successMessage = action.payload.message;
//       })
//       .addCase(deleteJobSkill.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       })
      
//       // Legacy fetch job skills
//       .addCase(fetchJobSkills.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchJobSkills.fulfilled, (state, action) => {
//         state.loading = false;
//         state.skills = Array.isArray(action.payload) ? action.payload : [];
//       })
//       .addCase(fetchJobSkills.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

// export const { clearJobSkills, clearSkillsState } = jobSkillsSlice.actions;
// export default jobSkillsSlice;