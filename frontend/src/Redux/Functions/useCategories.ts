"use client";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Store/Store";
import {
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchJobsByCategory,
  clearState,
  clearCurrentCategory,
} from "../Features/jobs/jobsCategories/jobCategories";

export const useCategories = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, currentCategory, loading, error, successMessage } =
    useSelector((state: RootState) => state.categories);

  const handleFetchCategories = async () => {
    const result = await dispatch(fetchCategories());
    return result.payload;
  };

  const handleFetchCategoryById = async (categoryId: string) => {
    const result = await dispatch(fetchCategoryById(categoryId));
    return result.payload;
  };

  const handleCreateCategory = async (name: string, description: string) => {
    const result = await dispatch(createCategory({ name, description }));
    return result.payload;
  };

  const handleUpdateCategory = async (
    categoryId: string,
    name: string,
    description: string,
  ) => {
    const result = await dispatch(
      updateCategory({
        categoryId,
        data: { name, description },
      }),
    );
    return result.payload;
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const result = await dispatch(deleteCategory(categoryId));
    return result.payload;
  };

  const handleFetchJobsByCategory = async (categoryId: string) => {
    const result = await dispatch(fetchJobsByCategory(categoryId));
    return result.payload;
  };

  const handleClearState = () => {
    dispatch(clearState());
  };

  const handleClearCurrentCategory = () => {
    dispatch(clearCurrentCategory());
  };

  return {
    categories,
    currentCategory,
    loading,
    error,
    successMessage,
    handleFetchCategories,
    handleFetchCategoryById,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleFetchJobsByCategory,
    handleClearState,
    handleClearCurrentCategory,
  };
};
