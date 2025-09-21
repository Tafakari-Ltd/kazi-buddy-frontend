import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  open: false,
  type: null,
  active: null,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.open = !state.open;
    },
    openSidebar: (state) => {
      state.open = true;
    },
    closeSidebar: (state) => {
      state.open = false;
    },
    setSidebarType: (state, action) => {
      state.type = action.payload;
    },
    setActiveLink: (state, action) => {
      state.active = action.payload;
    },
    resetSidebar: () => initialState,
  },
});

export const {
  toggleSidebar,
  openSidebar,
  closeSidebar,
  setSidebarType,
  setActiveLink,
  resetSidebar,
} = sidebarSlice.actions;

export default sidebarSlice;
