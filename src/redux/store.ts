import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import type { AuthState } from "./features/authSlice";

// Hàm để lưu trạng thái vào localStorage
const saveState = (state: AuthState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("authState", serializedState);
  } catch (err) {
    console.error("Lỗi khi lưu trạng thái vào localStorage:", err);
  }
};

// Tạo store
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Lưu trạng thái vào localStorage mỗi khi trạng thái thay đổi
store.subscribe(() => {
  const state = store.getState().auth;
  saveState(state);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
