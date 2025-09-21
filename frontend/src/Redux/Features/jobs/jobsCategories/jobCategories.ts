// src/Redux/Features/categorySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";

interface Category {
    id: string;
    name: string;
    description: string;
}

interface CategoryState {
    categories: Category[];
    loading: boolean;
    error: string | null;
}


const savedCategories = sessionStorage.getItem("categories");

const initialState: CategoryState = {
    categories: savedCategories ? JSON.parse(savedCategories) : [],
    loading: false,
    error: null,
};

export const fetchCategories = createAsyncThunk<Category[]>(
    "categories/fetchCategories",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("jobs/categories/");
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch categories"
            );
        }
    }
);

const categorySlice = createSlice({
    name: "categories",
    initialState,
    reducers: {
        clearCategories: (state) => {
            state.categories = [];
            state.error = null;
            sessionStorage.removeItem("categories");
        },
    },
    extraReducers: (builder) => {
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

                  
                    sessionStorage.setItem(
                        "categories",
                        JSON.stringify(action.payload)
                    );
                }
            )
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearCategories } = categorySlice.actions;
export default categorySlice;
