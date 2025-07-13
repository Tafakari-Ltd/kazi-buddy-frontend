import { configureStore } from "@reduxjs/toolkit";




import searchSlice from "../Features/SearchSlice";


import sidebarSlice from "../Features/SIdebarSlice";


import applyJobSlice from "../Features/ApplyJobSlice";


import adminSidebarSlice from "../Features/AdminSIdebarSlice";
import moreJobDescriptionSlice from "../Features/JobDescriptionSlice";


export const store = configureStore({

  reducer: {

    search: searchSlice.reducer,

    sidebar: sidebarSlice.reducer,

    applyJob:applyJobSlice.reducer,

    adminSidebar:adminSidebarSlice.reducer,

    moreDescription:moreJobDescriptionSlice.reducer

  },

  devTools: process.env.NODE_ENV !== "production",

});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
