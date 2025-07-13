import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  open: false,
};

const adminSidebarSlice = createSlice({
  name: "adminSidebar",
  initialState,
  reducers: {
    openSidebar: (state) => {
      state.open = true;
    },
    closeSidebar: (state) => {
      state.open = false;
    },

    resetSidebar: () => initialState,
  },
});

export const {
  openSidebar,
  closeSidebar,

  resetSidebar,
} = adminSidebarSlice.actions;

export default adminSidebarSlice;
