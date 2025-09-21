import { configureStore } from "@reduxjs/toolkit";

import searchSlice from "../Features/SearchSlice";
import sidebarSlice from "../Features/SidebarSlice";
import applyJobSlice from "../Features/ApplyJobSlice";
import adminSidebarSlice from "../Features/AdminSIdebarSlice";
import moreJobDescriptionSlice from "../Features/JobDescriptionSlice";
import authSlice from "../Features/authSlice";

import { authMiddleware } from "../middleware/authMiddleware";
import workerSlice from "../Features/WorkersSlice";

import categorySlice from "../Features/jobs/jobsCategories/jobCategories";

export const store = configureStore({
  reducer: {
    search: searchSlice.reducer,
    sidebar: sidebarSlice.reducer,
    applyJob: applyJobSlice.reducer,
    adminSidebar: adminSidebarSlice.reducer,
    moreDescription: moreJobDescriptionSlice.reducer,
    auth: authSlice.reducer,
    worker: workerSlice.reducer,
    categories: categorySlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

// ✅ Inferred types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
