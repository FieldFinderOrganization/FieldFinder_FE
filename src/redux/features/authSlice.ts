import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  cardNumber: string;
  bank: string;
  addresses: { providerAddressId: string; address: string }[];
  providerId: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  showSidebar: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  isAuthenticated: false,
  showSidebar: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    registerSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    update: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.isAuthenticated = false;
      localStorage.removeItem("authState");
    },
    setShowSidebar(state, action: PayloadAction<boolean>) {
      state.showSidebar = action.payload; // Action để set show
    },
  },
});

export const {
  registerSuccess,
  loginStart,
  loginSuccess,
  update,
  logout,
  setShowSidebar,
} = authSlice.actions;
export default authSlice.reducer;
