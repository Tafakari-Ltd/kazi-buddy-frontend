// src/Redux/Features/categoriesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";

interface Category {
  id: string;
  name: string;
  description: string;
}

interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  categoryJobs: any[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CategoryState = {
  categories: [],
  currentCategory: null,
  categoryJobs: [],
  loading: false,
  error: null,
  successMessage: null,
};

// Fetch all categories
export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("jobs/categories/");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch categories"
      );
    }
  }
);

// Fetch single category
export const fetchCategoryById = createAsyncThunk<
  Category,
  string,
  { rejectValue: string }
>(
  "categories/fetchCategoryById",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await api.get(`jobs/categories/${categoryId}/`);
      return response.data; // <- Changed from 'return response'
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch category"
      );
    }
  }
);
// Create category
export const createCategory = createAsyncThunk<
  Category,
  { name: string; description: string },
  { rejectValue: string | { message: string; fieldErrors: Record<string, string[]> } }
>(
  "categories/createCategory",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("jobs/categories/create/", data);
      return response.data;
    } catch (error: any) {
      if (error?.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        return rejectWithValue({
          message: "Validation errors occurred",
          fieldErrors: error.fieldErrors,
        } as any);
      }
      return rejectWithValue(error?.message || "Failed to create category");
    }
  }
);

// Update category
export const updateCategory = createAsyncThunk<
  Category,
  { categoryId: string; data: { name: string; description: string } },
  { rejectValue: string | { message: string; fieldErrors: Record<string, string[]> } }
>(
  "categories/updateCategory",
  async ({ categoryId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`jobs/categories/update/${categoryId}/`, data);
      return response.data;
    } catch (error: any) {
      if (error?.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        return rejectWithValue({
          message: "Validation errors occurred",
          fieldErrors: error.fieldErrors,
        } as any);
      }
      return rejectWithValue(error?.message || "Failed to update category");
    }
  }
);

// Delete category
export const deleteCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "categories/deleteCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      await api.delete(`jobs/categories/delete/${categoryId}/`);
      return categoryId;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to delete category"
      );
    }
  }
);

// Fetch jobs in category
export const fetchJobsByCategory = createAsyncThunk<
  any[],
  string,
  { rejectValue: string }
>(
  "categories/fetchJobsByCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await api.get(`jobs/categories/${categoryId}/jobs/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch jobs in category"
      );
    }
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategories: (state) => {
      state.categories = [];
      state.error = null;
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("categories");
      }
    },
    hydrateCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    clearState: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
      state.categoryJobs = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch all categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCategories.fulfilled,
        (state, action: PayloadAction<Category[]>) => {
          state.loading = false;
          state.categories = action.payload;

          if (typeof window !== "undefined") {
            sessionStorage.setItem("categories", JSON.stringify(action.payload));
          }
        }
      )
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch single category
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCategoryById.fulfilled,
        (state, action: PayloadAction<Category>) => {
          state.loading = false;
          state.currentCategory = action.payload;
        }
      )
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create category
    builder
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        createCategory.fulfilled,
        (state, action: PayloadAction<Category>) => {
          state.loading = false;
          state.categories.unshift(action.payload);
          state.successMessage = "Category created successfully";

          if (typeof window !== "undefined") {
            sessionStorage.setItem("categories", JSON.stringify(state.categories));
          }
        }
      )
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string"
          ? action.payload
          : "Failed to create category";
      });

    // Update category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        updateCategory.fulfilled,
        (state, action: PayloadAction<Category>) => {
          state.loading = false;
          const index = state.categories.findIndex(
            (cat) => cat.id === action.payload.id
          );
          if (index !== -1) {
            state.categories[index] = action.payload;
          }
          state.currentCategory = action.payload;
          state.successMessage = "Category updated successfully";

          if (typeof window !== "undefined") {
            sessionStorage.setItem("categories", JSON.stringify(state.categories));
          }
        }
      )
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string"
          ? action.payload
          : "Failed to update category";
      });

    // Delete category
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteCategory.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.categories = state.categories.filter(
            (cat) => cat.id !== action.payload
          );
          if (state.currentCategory?.id === action.payload) {
            state.currentCategory = null;
          }
          state.successMessage = "Category deleted successfully";

          if (typeof window !== "undefined") {
            sessionStorage.setItem("categories", JSON.stringify(state.categories));
          }
        }
      )
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch jobs by category
    builder
      .addCase(fetchJobsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchJobsByCategory.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.loading = false;
          state.categoryJobs = action.payload;
        }
      )
      .addCase(fetchJobsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCategories, hydrateCategories, clearState, clearCurrentCategory } =
  categoriesSlice.actions;
export default categoriesSlice;