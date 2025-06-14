import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export interface Supplier {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface SupplierState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: SupplierState = {
  suppliers: [],
  loading: false,
  error: null,
  success: false,
};

export const fetchSuppliers = createAsyncThunk(
  'supplier/fetchAll',
  async () => {
    const response = await axiosClient.get('/supplier/get-all');
    return response.data;
  }
);

export const createSupplier = createAsyncThunk(
  'supplier/create',
  async (formData: FormData) => {
    const response = await axiosClient.post('/supplier/create', formData);
    return response.data;
  }
);

export const updateSupplier = createAsyncThunk(
  'supplier/update',
  async ({ id, data }: { id: string; data: FormData }) => {
    const response = await axiosClient.post(`/supplier/update?id=${id}`, data);
    return response.data;
  }
);

export const deleteSupplier = createAsyncThunk(
  'supplier/delete',
  async (id: string) => {
    const response = await axiosClient.delete(`/supplier/delete/${id}`);
    return response.data;
  }
);

const supplierSlice = createSlice({
  name: 'supplier',
  initialState,
  reducers: {
    resetSupplierState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch suppliers';
      })
      // Create supplier
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create supplier';
      })
      // Update supplier
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update supplier';
      })
      // Delete supplier
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true; // Or handle the response based on your API
        // Remove the deleted supplier from the state
        state.suppliers = state.suppliers.filter(supplier => supplier._id !== action.meta.arg);
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete supplier';
      });
  },
});

export const { resetSupplierState } = supplierSlice.actions;
export default supplierSlice.reducer; 