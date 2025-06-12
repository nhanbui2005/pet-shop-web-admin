import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export enum CategoryType {
  DOG = 'DOG',
  CAT = 'CAT',
  OTHER = 'OTHER'
}

export interface Category {
  _id: string;
  name: string;
  parentId?: string;
  categoryType?: CategoryType;
  isRoot: boolean;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
  success: false,
};

export const fetchCategories = createAsyncThunk(
  'category/fetchAll',
  async () => {
    const response = await axiosClient.get('/category/get-all');
    console.log(response.data);
    return response.data;
  }
);

export const createCategory = createAsyncThunk(
  'category/create',
  async (data: {
    name: string;
    parentId?: string;
    categoryType?: CategoryType;
    isRoot: boolean;
  }) => {
    const response = await axiosClient.post('/category/create', data);    
    return response.data;
  }
);

export const updateCategory = createAsyncThunk(
  'category/update',
  async ({ id, name }: { id: string; name: string }) => {
    const response = await axiosClient.post('/category/update-name', { id, name });
    return response.data;
  }
);

export const fetchCategoriesByType = createAsyncThunk(
  'categories/getByType',
  async (type: CategoryType, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/category/get-categories?type=${type}`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Có lỗi xảy ra khi lấy danh mục theo loại');
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    resetCategoryState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create category';
      })
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update category';
      })
      // Fetch Categories By Type
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
        state.error = action.payload as string;
      });
  },
});

export const { resetCategoryState } = categorySlice.actions;
export default categorySlice.reducer; 