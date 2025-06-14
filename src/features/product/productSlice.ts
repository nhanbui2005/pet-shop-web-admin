import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface Category {
  _id: string;
  name: string;
}

export interface Product {
  _id: string;
  isActivate: boolean;
  name: string;
  images: string[];
  maxPromotionalPrice: number;
  maxSellingPrice: number;
  minPromotionalPrice: number;
  minSellingPrice: number;
  supplier: string;
  categories: Category[];
  sumStock: number;
}

export interface Attribute {
  id: string;
  name: string;
  type: 'select' | 'multi-select';
  options: string[];
}

export interface ProductVariant {
  id: string;
  attributes: { [key: string]: string | string[] };
  stock: number;
  image?: string;
  sku?: string;
  importPrice?: number;
  sellingPrice?: number;
  promotionalPrice?: number;
}

export interface ProductDetail extends Product {
  descriptions: {
    title: string;
    content: string;
  }[];
  variants: {
    unitValues: string[];
    stock: number;
    importPrice: number;
    sellingPrice: number;
    promotionalPrice: number;
  }[];
}

export interface ProductState {
  products: Product[];
  selectedProduct: ProductDetail | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  success: false,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
};

export const fetchProducts = createAsyncThunk(
  'products/getProducts',
  async (params: PaginationParams, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/products/admin/getProducts', { params });      
      console.log('response', response);
      return response.data;
    } catch (err: any) {
      console.error("API Error:", err);
      return rejectWithValue(err.message || 'Có lỗi xảy ra khi lấy danh sách sản phẩm');
    }
  }
);

export const getDetail = createAsyncThunk(
  'products/getDetail',
  async (params: PaginationParams, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/products/admin/getProducts', { params });      
      console.log('response', response);
      return response.data;
    } catch (err: any) {
      console.error("API Error:", err);
      return rejectWithValue(err.message || 'Có lỗi xảy ra khi lấy danh sách sản phẩm');
    }
  }
);

export const getDetailProduct = createAsyncThunk(
  'products/getDetailProduct',
  async (id: string, { rejectWithValue }) => {
    try {      
      const response = await axiosClient.get(`/products/getProduct/${id}`);   
         
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Có lỗi xảy ra khi lấy thông tin chi tiết sản phẩm');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (data: any, { rejectWithValue }) => {
    try {
      console.log('data', data);
      
      const response = await axiosClient.post('/products/create-test', data);
      console.log('response', response.data);
      
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Có lỗi xảy ra');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await axiosClient.post(`/products/update-basic-info/${id}`, data);
    return response.data;
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    resetProductState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.selectedProduct = null;
    },
    setPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // Get Detail Product
      .addCase(getDetailProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDetailProduct.fulfilled, (state, action) => {
        state.loading = false;        
        state.selectedProduct = action.payload;
      })
      .addCase(getDetailProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update product';
      });
  },
});

export const { resetProductState, setPagination } = productSlice.actions;
export default productSlice.reducer; 