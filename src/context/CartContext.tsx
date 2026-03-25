/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { productRes } from "@/services/product";
import { toast } from "react-toastify";
import { usePathname } from "next/navigation"; // Thêm hook lấy URL hiện tại

import {
  getMyCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart as clearCartApi,
  cartRes,
  CartItemDetail,
} from "@/services/cart";

import { useSelector, useDispatch } from "react-redux"; // Thêm useDispatch
import { RootState } from "@/redux/store";
import { logout } from "@/redux/features/authSlice"; // Import action logout của bạn

interface CartContextType {
  cartData: cartRes | null;
  cartItems: CartItemDetail[];
  loadingCart: boolean;
  addToCart: (
    product: productRes,
    size: string,
    quantity?: number,
  ) => Promise<void>;
  removeFromCart: (productId: number, size: string) => Promise<void>;
  updateQuantity: (
    productId: number,
    size: string,
    newQuantity: number,
  ) => Promise<void>;
  getCartCount: () => number;
  getSubtotal: () => number;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartData, setCartData] = useState<cartRes | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);

  const { isAuthenticated, token } = useSelector(
    (state: RootState) => state.auth,
  );

  const dispatch = useDispatch();
  const pathname = usePathname();
  const hiddenRoutes = ["/login", "/signup"];

  const fetchCart = useCallback(async () => {
    if (hiddenRoutes.includes(pathname)) {
      return null;
    }
    // FIX 1: CHẶN GỌI API NẾU ĐANG Ở TRANG LOGIN HOẶC REGISTER
    if (pathname === "/login" || pathname === "/signup") {
      setCartData(null);
      setLoadingCart(false);
      return;
    }

    if (
      !isAuthenticated ||
      !token ||
      token === "null" ||
      token === "undefined" ||
      token.trim() === ""
    ) {
      setCartData(null);
      setLoadingCart(false);
      return;
    }

    setLoadingCart(true);
    try {
      const data = await getMyCart();
      setCartData(data);
    } catch (error: any) {
      console.error("Failed to fetch cart:", error);
      // FIX 2: TỰ ĐỘNG XÓA TOKEN HẾT HẠN KHỎI REDUX KHI GẶP LỖI 401
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
        dispatch(logout()); // Đuổi cổ cái token cũ đi để tránh nó gọi API bậy bạ lần sau
      }
      setCartData(null);
    } finally {
      setLoadingCart(false);
    }
  }, [isAuthenticated, token, pathname, dispatch]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (
    product: productRes,
    size: string,
    quantity: number = 1,
  ) => {
    if (!isAuthenticated || !token || token === "null") {
      toast.warn("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }

    try {
      await addItemToCart({ productId: product.id, size, quantity });
      toast.success(`Đã thêm vào giỏ hàng!`);
      await fetchCart();
    } catch (error: any) {
      console.error("Failed to add item:", error);
      const msg =
        error?.response?.data?.message || "Thêm vào giỏ hàng thất bại.";
      toast.error(msg);
    }
  };

  const removeFromCart = async (productId: number, size: string) => {
    if (!isAuthenticated || !token || token === "null") return;
    try {
      await removeCartItem(productId, size);
      toast.info("Đã xóa sản phẩm khỏi giỏ hàng.");
      await fetchCart();
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Lỗi khi xóa sản phẩm.");
    }
  };

  const updateQuantity = async (
    productId: number,
    size: string,
    newQuantity: number,
  ) => {
    if (!isAuthenticated || !token || token === "null") return;

    if (newQuantity < 1) {
      await removeFromCart(productId, size);
      return;
    }

    try {
      await updateCartItem({ productId, size, quantity: newQuantity });
      await fetchCart();
    } catch (error: any) {
      console.error("Update quantity failed:", error);
      toast.error(error?.response?.data?.message || "Lỗi cập nhật số lượng");
    }
  };

  const getCartCount = () => {
    if (!cartData || !cartData.items) return 0;
    return cartData.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    if (!cartData) return 0;
    return cartData.totalCartPrice;
  };

  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !token || token === "null") return;
    try {
      await clearCartApi();
      setCartData({ items: [], totalCartPrice: 0 });
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  }, [isAuthenticated, token]);

  const value = {
    cartData,
    cartItems: cartData?.items || [],
    loadingCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartCount,
    getSubtotal,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
