import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export interface Job {
  id: string;
  title: string;
  jobType: string;
  category: string;
  location: string;
  rate: string;
  description: string;
  image: string;
  colorFilter?: string;
  postedDate?: string;
  urgency?: string;
  requirements?: string[];
  benefits?: string[];
  company?: string;
  contactEmail?: string;
  contactPhone?: string;
  applicationDeadline?: string;
  experienceLevel?: string;
  isActive?: boolean;
}

export interface MoreJobDescriptionState {
  open: boolean;
  selectedJob: Job | null;
  loading: boolean;
  error: string | null;
}

const initialState: MoreJobDescriptionState = {
  open: false,
  selectedJob: null,
  loading: false,
  error: null,
};

export interface RootState {
  moreDescription: MoreJobDescriptionState;
}

const moreJobDescriptionSlice = createSlice({
  name: "moreDescription",
  initialState,
  reducers: {
    openJobDescription: (state, action: PayloadAction<Job>) => {
      state.open = true;
      state.selectedJob = action.payload;
      state.error = null;
    },
    closeJobDescription: (state) => {
      state.open = false;
      state.selectedJob = null;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateJobData: (state, action: PayloadAction<Partial<Job>>) => {
      if (state.selectedJob) {
        state.selectedJob = { ...state.selectedJob, ...action.payload };
      }
    },
    resetState: (state) => {
      state.open = false;
      state.selectedJob = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
    
  openJobDescription,

  closeJobDescription,

  setLoading,

  setError,

  updateJobData,

  resetState,

} = moreJobDescriptionSlice.actions;

export const selectJobDescriptionOpen = (state: RootState): boolean =>
  state.moreDescription.open;

export const selectSelectedJob = (state: RootState): Job | null =>
  state.moreDescription.selectedJob;

export const selectJobDescriptionLoading = (state: RootState): boolean =>
  state.moreDescription.loading;

export const selectJobDescriptionError = (state: RootState): string | null =>
  state.moreDescription.error;

export const selectJobTitle = (state: RootState): string =>
  state.moreDescription.selectedJob?.title || "";

export const selectJobLocation = (state: RootState): string =>
  state.moreDescription.selectedJob?.location || "";

export const selectJobRate = (state: RootState): string =>
  state.moreDescription.selectedJob?.rate || "";

export const selectIsJobModalOpen = (state: RootState): boolean =>
  state.moreDescription.open && state.moreDescription.selectedJob !== null;

export default moreJobDescriptionSlice;
