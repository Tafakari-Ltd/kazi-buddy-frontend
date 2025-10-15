// src/Redux/Selectors/categorySelectors.ts
import { RootState } from "../Store/Store";

export const selectAllCategories = (state: RootState) =>
  state.categories.categories;

export const selectCategoryLoading = (state: RootState) =>
  state.categories.loading;

export const selectCategoryError = (state: RootState) =>
  state.categories.error;

export const selectCategorySuccess = (state: RootState) =>
  state.categories.successMessage;

export const selectCurrentCategory = (state: RootState) =>
  state.categories.currentCategory;

export const selectCategoryJobs = (state: RootState) =>
  state.categories.categoryJobs;

export const selectCategoryById = (state: RootState, categoryId: string) =>
  state.categories.categories.find((cat) => cat.id === categoryId);

export const selectCategoryByName = (state: RootState, name: string) =>
  state.categories.categories.find((cat) =>
    cat.name.toLowerCase().includes(name.toLowerCase())
  );

export const selectCategoriesCount = (state: RootState) =>
  state.categories.categories.length;

export const selectIsCategoriesLoaded = (state: RootState) =>
  state.categories.categories.length > 0;