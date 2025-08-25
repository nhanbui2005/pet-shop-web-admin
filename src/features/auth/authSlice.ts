// Trong file authSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'; // Thêm "type" ở đây

interface AuthState {
  token: string | null;
  user: {
    _id: string;
    name: string;
    surName: string;
    phone: string;
    email: string;
    avatar: string;
    createdAt: string;
  } | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    setUser(state, action: PayloadAction<AuthState['user']>) {
      state.user = action.payload;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
    },
  },
});

export const { setToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer; 