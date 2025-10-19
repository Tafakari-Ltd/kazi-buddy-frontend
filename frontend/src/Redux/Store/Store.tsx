import { configureStore } from "@reduxjs/toolkit";

import searchSlice from "../Features/SearchSlice";
import sidebarSlice from "../Features/SidebarSlice";
import applyJobSlice from "../Features/ApplyJobSlice";
import adminSidebarSlice from "../Features/AdminSIdebarSlice";
import moreJobDescriptionSlice from "../Features/JobDescriptionSlice";
import authSlice from "../Features/authSlice";
import workerSlice from "../Features/WorkersSlice";
import categoriesSlice from "../Features/jobs/jobsCategories/jobCategories";
import profileSlice from "../Features/profileSlice";
import jobsSlice from "../Features/jobsSlice";
import jobEmployerSlice from "../Features/jobs/jobEmployerSlice";
import employerProfilesSlice from "../Features/employerProfilesSlice";
import jobSkillsSlice from "../Features/jobSkillsSlice";

import { authMiddleware } from "../middleware/authMiddleware";

export const store = configureStore({
  reducer: {
    search: searchSlice.reducer,
    sidebar: sidebarSlice.reducer,
    applyJob: applyJobSlice.reducer,
    adminSidebar: adminSidebarSlice.reducer,
    moreDescription: moreJobDescriptionSlice.reducer,
    auth: authSlice.reducer,
    worker: workerSlice.reducer,
    categories: categoriesSlice.reducer,
    profile: profileSlice.reducer,
    jobs: jobsSlice.reducer,
    jobEmployer: jobEmployerSlice.reducer,
    employerProfiles: employerProfilesSlice.reducer,
    jobSkills: jobSkillsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

// ✅ Inferred types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;