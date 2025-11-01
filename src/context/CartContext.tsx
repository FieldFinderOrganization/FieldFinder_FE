"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { productRes } from "@/services/product"; // Import type sản phẩm của bạn

// 1. Định nghĩa 1 item trong giỏ hàng
export interface CartItem {
  id: string; // ID duy nhất (sẽ là `product.id-size`)
  product: productRes;
  size: string;
  quantity: number;
}

// 2. Định nghĩa Context sẽ chia sẻ những gì
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: productRes, size: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  getCartCount: () => number;
  getSubtotal: () => number;
}

// 3. Tạo Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// 4. Tạo Provider (Component Cha)
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 5. Load giỏ hàng từ localStorage khi app khởi động (chỉ chạy ở client)
  useEffect(() => {
    const storedCart = localStorage.getItem("mtkicks_cart");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // 6. Lưu giỏ hàng vào localStorage mỗi khi nó thay đổi
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("mtkicks_cart", JSON.stringify(cartItems));
    } else {
      // Xóa key nếu giỏ hàng rỗng
      localStorage.removeItem("mtkicks_cart");
    }
  }, [cartItems]);

  // --- CÁC HÀM XỬ LÝ GIỎ HÀNG ---

  const addToCart = (product: productRes, size: string) => {
    const itemId = `${product.id}-${size}`; // Tạo ID duy nhất

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemId);

      if (existingItem) {
        // Nếu đã có -> Tăng số lượng
        return prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Nếu chưa có -> Thêm mới
        const newItem: CartItem = {
          id: itemId,
          product,
          size,
          quantity: 1,
        };
        return [...prevItems, newItem];
      }
    });
    // (Bạn có thể thêm toast "Đã thêm vào giỏ" ở đây)
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      // Nếu giảm về 0, hãy xóa
      removeFromCart(itemId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Lấy tổng số lượng (cho cái badge)
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Lấy tổng tiền
  const getSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  // 7. Cung cấp state và hàm cho các component con
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartCount,
    getSubtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// 8. Tạo Hook (để dễ xài)
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
