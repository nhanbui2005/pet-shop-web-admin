import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

// Define the CategoryType enum
export enum CategoryType {
  DOG = 'DOG',
  CAT = 'CAT',
  OTHER = 'OTHER'
}

// Define the Category interface
export interface Category {
  _id: string;
  name: string;
  parentId?: string;
  categoryType?: CategoryType;
  isRoot: boolean;
  children?: Category[]; // Optional children for hierarchical display
  createdAt: string;
  updatedAt: string;
}

// Define the shape of the Redux state for categories
interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Initial state for the category slice
const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
  success: false,
};

// Async thunk to fetch all categories
export const fetchCategories = createAsyncThunk(
  'category/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/category/get-all');
      // Assuming the API response for get-all is { success: true, data: Category[] }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// Async thunk to create a new category
export const createCategory = createAsyncThunk(
  'category/create',
  async (data: {
    name: string;
    parentId?: string;
    categoryType?: CategoryType;
    isRoot: boolean;
  }, { rejectWithValue }) => {
    try {
      // Prepare the request data, only include parentId if it's defined
      const requestData: any = {
        name: data.name,
        isRoot: data.isRoot,
      };
      
      // Only add parentId if it's defined (not undefined or null)
      if (data.parentId !== undefined && data.parentId !== null) {
        requestData.parentId = data.parentId;
      }
      
      // Only add categoryType if it's defined
      if (data.categoryType !== undefined) {
        requestData.categoryType = data.categoryType;
      }
      
      const response = await axiosClient.post('/category/create', requestData);
      // Assuming the API response for create is { success: true, data: Category }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors?.[0] || error.response?.data?.message || 'Failed to create category');
    }
  }
);

// Async thunk to update an existing category's name
export const updateCategory = createAsyncThunk(
  'category/update',
  async ({ id, name }: { id: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/category/update-name', { id, name });
      console.log('...', response.data);
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors?.[0] || error.response?.data?.message || 'Failed to update category');
    }
  }
);

// Async thunk to delete a category
// Assuming a DELETE endpoint for category deletion. Adjust if your API uses POST.
export const deleteCategory = createAsyncThunk(
  'category/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      // Assuming the API returns a success message or just an empty success response
      const response = await axiosClient.delete(`/category/delete/${id}`); // Or axiosClient.post('/category/delete', { id });
      return response.data; // You might return a message or the ID of the deleted item
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

// Async thunk to fetch categories by type (e.g., 'DOG', 'CAT')
export const fetchCategoriesByType = createAsyncThunk(
  'categories/getByType',
  async (type: CategoryType, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/category/get-categories?type=${type}`);
      // Assuming the API response for get-categories by type is { success: true, data: Category[] }
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Có lỗi xảy ra khi lấy danh mục theo loại');
    }
  }
);

// Create the category slice using createSlice
const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    // Reducer to reset the state (e.g., after an operation completes)
    resetCategoryState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  // Define extraReducers to handle actions dispatched by createAsyncThunks
  extraReducers: (builder) => {
    builder
      // Handle fetchCategories lifecycle
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null; // Clear any previous errors
        state.categories = action.payload || []; // Assuming payload is { data: Category[] }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || 'Failed to fetch categories';
      })
      // Handle createCategory lifecycle
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null; // Clear any previous errors
        if (action.payload.success && action.payload.data) {
          state.categories.push(action.payload.data); // Add the newly created category to the state
        }
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string || action.error.message || 'Failed to create category';
      })
      // Handle updateCategory lifecycle
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null; // Clear any previous errors
        if (action.payload.success && action.payload.data) {
          // Find the updated category by _id and replace it in the array
          state.categories = state.categories.map(cat =>
            cat._id === action.payload.data._id ? { ...cat, ...action.payload.data } : cat
          );
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string || action.error.message || 'Failed to update category';
      })
      // Handle deleteCategory lifecycle
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null; // Clear any previous errors
        // Filter out the deleted category from the state. Assuming action.meta.arg is the ID.
        // Or if your delete API returns the deleted ID, use action.payload.id (adjust as needed).
        // The `action.meta.arg` contains the original argument passed to the thunk (the ID in this case).
        state.categories = state.categories.filter(cat => cat._id !== action.meta.arg);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string || action.error.message || 'Failed to delete category';
      })
      // Handle fetchCategoriesByType lifecycle
      .addCase(fetchCategoriesByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesByType.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null; // Clear any previous errors
        state.categories = action.payload; // Assuming payload is directly Category[]
      })
      .addCase(fetchCategoriesByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || 'Failed to fetch categories by type';
      });
  },
});

// Export the reducer and actions
export const { resetCategoryState } = categorySlice.actions;
export default categorySlice.reducer;
