"use client";

import { Provider } from "react-redux";
import { store } from "./redux/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "./redux/features/authSlice";

// Component con để xử lý logic check token
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // 1. Lấy dữ liệu từ LocalStorage
    const storedAuthState = localStorage.getItem("authState"); // Nếu bạn lưu cả object
    const storedToken = localStorage.getItem("token");

    if (storedAuthState && storedToken) {
      try {
        const parsedState = JSON.parse(storedAuthState);
        // 2. Nạp lại vào Redux
        dispatch(
          loginSuccess({
            user: parsedState.user,
            token: storedToken,
          })
        );
      } catch (error) {
        console.error("Lỗi khôi phục trạng thái đăng nhập:", error);
        // Nếu lỗi parse JSON -> xóa sạch để tránh lỗi vặt
        dispatch(logout());
      }
    }
  }, [dispatch]);

  return <>{children}</>;
};

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
