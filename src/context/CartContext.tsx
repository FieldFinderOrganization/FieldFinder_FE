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

import { getCartByUserId, createCart, deleteCart } from "@/services/cart";
import {
  getItemsByCartId,
  addItemToCart,
  updateCartItem,
  deleteCartItem,
  cartItemRes,
  cartItemReq,
} from "@/services/cartItem";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface CartContextType {
  cartItems: cartItemRes[];
  cartId: number | null;
  loadingCart: boolean;
  addToCart: (
    product: productRes,
    size: string,
    quantity?: number
  ) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, newQuantity: number) => Promise<void>;
  getCartCount: () => number;
  getSubtotal: () => number;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<cartItemRes[]>([]);
  const [cartId, setCartId] = useState<number | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);

  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;

  const findOrCreateCart = useCallback(async (currentUserId: string) => {
    if (!currentUserId) return;
    setLoadingCart(true);
    try {
      const existingCarts = await getCartByUserId(currentUserId);

      if (existingCarts && existingCarts.length > 0) {
        setCartId(existingCarts[0].cartId);
      } else {
        const newCart = await createCart({ userId: currentUserId });
        setCartId(newCart.cartId);
      }
    } catch (error) {
    } finally {
      setLoadingCart(false);
    }
  }, []);

  const loadCartItems = useCallback(async (currentCartId: number) => {
    try {
      const items = await getItemsByCartId(currentCartId);
      setCartItems(items);
    } catch (error) {
      console.error("Failed to load cart items:", error);
    } finally {
      setLoadingCart(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      findOrCreateCart(userId);
    } else {
      setCartId(null);
      setCartItems([]);
      setLoadingCart(false);
    }
  }, [userId, findOrCreateCart]);

  useEffect(() => {
    if (cartId) {
      loadCartItems(cartId);
    }
  }, [cartId, loadCartItems]);

  const addToCart = async (
    product: productRes,
    size: string,
    quantity: number = 1
  ) => {
    if (!userId) {
      toast.warn("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }

    let currentCartId = cartId;

    if (!currentCartId) {
      setLoadingCart(true);
      try {
        const newCart = await createCart({ userId });
        setCartId(newCart.cartId);
        currentCartId = newCart.cartId;
      } catch (err) {
        console.error("Failed to create cart:", err);
        toast.error("Lỗi kết nối giỏ hàng.");
        setLoadingCart(false);
        return;
      } finally {
        setLoadingCart(false);
      }
    }

    const payload: cartItemReq = {
      cartId: currentCartId!,
      userId: userId,
      productId: product.id,
      quantity: quantity,
      size: size,
    };

    try {
      await addItemToCart(payload);
      toast.success(`Đã thêm vào giỏ hàng!`);
      await loadCartItems(currentCartId!);
    } catch (error: any) {
      console.error("Failed to add item:", error);
      const msg =
        error?.response?.data?.message || "Thêm vào giỏ hàng thất bại.";
      toast.error(msg);
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    if (!cartId) return;
    try {
      await deleteCartItem(cartItemId);
      await loadCartItems(cartId);
      toast.info("Đã xóa sản phẩm.");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Lỗi khi xóa sản phẩm.");
    }
  };

  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (!cartId) return;

    if (newQuantity < 1) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      await updateCartItem(cartItemId, newQuantity);
      await loadCartItems(cartId);
    } catch (error: any) {
      console.error("Update quantity failed:", error);
      toast.error(error?.response?.data?.message || "Lỗi cập nhật số lượng");
    }
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.priceAtTime * item.quantity,
      0
    );
  };

  const clearCart = useCallback(async () => {
    if (!cartId) return;
    try {
      setCartItems([]);

      setCartId(null);
      if (userId) {
        await findOrCreateCart(userId);
      }
    } catch (error) {
      console.error("Failed to clear cart context:", error);
    }
  }, [cartId, userId, findOrCreateCart]);

  const value = {
    cartItems,
    cartId,
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
