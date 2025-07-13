import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SearchState {
  query: string;
  isShown: boolean;
}

const initialState: SearchState = {
  query: "",
  isShown: false,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
      state.isShown = true;
    },
    clearQuery: (state) => {
      state.query = "";
      state.isShown = false;
    },
    toggleSearch: (state) => {
      state.isShown = false;
    },
  },
});

export const { setQuery, clearQuery, toggleSearch } = searchSlice.actions;

export default searchSlice;
