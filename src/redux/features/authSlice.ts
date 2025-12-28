import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserDTO {
  userId?: string;
  name?: string;
  email: string;
  phone?: string | null;
  role?: string;
  cardNumber?: string;
  bank?: string;
  addresses?: { providerAddressId: string; address: string }[];
  providerId?: string;
}

export interface AuthState {
  user: UserDTO | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  showSidebar: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  isAuthenticated: false,
  showSidebar: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    registerSuccess: (state, action: PayloadAction<UserDTO>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: UserDTO; token: string }>
    ) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      localStorage.setItem("token", action.payload.token);
    },
    update: (state, action: PayloadAction<Partial<UserDTO>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.isAuthenticated = false;

      localStorage.removeItem("authState");
      localStorage.removeItem("token");
      sessionStorage.setItem("justLoggedOut", "true");
      window.location.href = "/login";
    },
    setShowSidebar(state, action: PayloadAction<boolean>) {
      state.showSidebar = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
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
  setToken,
} = authSlice.actions;

export default authSlice.reducer;
