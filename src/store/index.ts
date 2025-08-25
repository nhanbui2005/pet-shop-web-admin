import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../features/product/productSlice';
import supplierReducer from '../features/supplier/supplierSlice';
import categoryReducer from '../features/category/categorySlice';
import authReducer from '../features/auth/authSlice';
import voucherReducer from '../features/voucher/voucherSlice';
import blogReducer from '../features/blog/blogSlice';

export const store = configureStore({
  reducer: {
    product: productReducer,
    supplier: supplierReducer,
    category: categoryReducer,
    auth: authReducer,
    voucher: voucherReducer,
    blog: blogReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 