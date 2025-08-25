import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { voucherApi } from '../../api/voucher.api';

export const fetchVouchers = createAsyncThunk(
  'voucher/fetchVouchers',
  async ({ page, limit }: { page: number; limit: number }) => {
    const res = await voucherApi.getAdminList(page, limit);
    console.log(res.data);
    
    // Đảm bảo lấy đúng mảng voucher và total
    return {
      data: res.data.data,
      total: res.data.total,
      hasNextPage: res.data.hasNextPage,
    };
  }
);

export const createVoucher = createAsyncThunk(
  'voucher/createVoucher',
  async (data: any) => {
    const res = await voucherApi.create(data);
    return res.data;
  }
);

export const deactivateVoucher = createAsyncThunk(
  'voucher/deactivateVoucher',
  async (id: string) => {
    const res = await voucherApi.deactivate(id);
    return res.data;
  }
);

export const activateVoucher = createAsyncThunk(
  'voucher/activateVoucher',
  async (id: string) => {
    const res = await voucherApi.activate(id);
    return res.data;
  }
);

const voucherSlice = createSlice({
  name: 'voucher',
  initialState: {
    data: [],
    total: 0,
    hasNextPage: false,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVouchers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVouchers.fulfilled, (state, action) => {
        state.data = action.payload.data;
        state.total = action.payload.total;
        state.hasNextPage = action.payload.hasNextPage;
        state.loading = false;
      })
      .addCase(fetchVouchers.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default voucherSlice.reducer; 