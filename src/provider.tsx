"use client";

import { Provider } from "react-redux";
import { store } from "./redux/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "./redux/features/authSlice";

export function ReduxInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadState = () => {
      try {
        const serializedState = localStorage.getItem("authState");
        if (serializedState) {
          const state = JSON.parse(serializedState);
          if (state.user) {
            dispatch(loginSuccess(state.user));
          }
        }
      } catch (err) {
        console.error("Lỗi khi khôi phục trạng thái từ localStorage:", err);
      }
    };

    loadState();
  }, [dispatch]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ReduxInitializer>{children}</ReduxInitializer>
    </Provider>
  );
}
