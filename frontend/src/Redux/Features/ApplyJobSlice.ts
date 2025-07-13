import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ApplyJobState {
  name: string;
  email: string;
  message: string;
  files: File[];
  errors: {
    name?: string;
    email?: string;
  };
  isModalOpen: boolean; 
}

const initialState: ApplyJobState = {
  name: "",
  email: "",
  message: "",
  files: [],
  errors: {},
  isModalOpen: false, // initially closed
};

const applyJobSlice = createSlice({
  name: "applyJob",
  initialState,
  reducers: {
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    setMessage(state, action: PayloadAction<string>) {
      state.message = action.payload;
    },
    setErrors(state, action: PayloadAction<{ name?: string; email?: string }>) {
      state.errors = action.payload;
    },
    addFiles(state, action: PayloadAction<File[]>) {
      state.files = [...state.files, ...action.payload];
    },
    clearFiles(state) {
      state.files = [];
    },
    clearForm(state) {
      state.name = "";
      state.email = "";
      state.message = "";
      state.files = [];
      state.errors = {};
    },

 
    openJobModal(state) {
      state.isModalOpen = true;
    },
    closeJobModal(state) {
      state.isModalOpen = false;
    },
  },
});

export const {
  setName,
  setEmail,
  setMessage,
  setErrors,
  addFiles,
  clearFiles,
  clearForm,
  openJobModal,
  closeJobModal,
} = applyJobSlice.actions;

export default applyJobSlice;
