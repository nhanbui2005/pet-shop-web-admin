import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CategoryType, createCategory, getAllCategories, updateCategory, getCategoriesByType, type Category } from '../../api/category.api';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchAllCategories = createAsyncThunk(
  'category/fetchAll',
  async () => {
    const response = await getAllCategories();
    return response.data;
  }
);

export const addCategory = createAsyncThunk(
  'category/create',
  async (data: { 
    name: string; 
    isRoot: boolean;
    parentId?: string;
    categoryType?: CategoryType;
  }) => {
    const response = await createCategory(data);
    return response.data;
  }
);

export const editCategory = createAsyncThunk(
  'category/update',
  async (data: { _id: string; name: string }) => {
    const response = await updateCategory(data);
    return response.data;
  }
);

export const fetchCategoriesByType = createAsyncThunk(
  'category/fetchByType',
  async (type: CategoryType) => {
    const response = await getCategoriesByType(type);
    return response.data.data;
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      // Create category
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create category';
      })
      // Update category
      .addCase(editCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(cat => cat._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(editCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update category';
      })
      // Fetch categories by type
      .addCase(fetchCategoriesByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesByType.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategoriesByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories by type';
      });
  },
});

export default categorySlice.reducer; 