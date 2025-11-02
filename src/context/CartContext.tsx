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

import { getCartByUserId, createCart } from "@/services/cart";
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
  addToCart: (product: productRes, size: string) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, newQuantity: number) => Promise<void>;
  getCartCount: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<cartItemRes[]>([]);
  const [cartId, setCartId] = useState<number | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);

  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;
  console.log("User Info:", user);

  // 🔹 Hàm tìm hoặc tạo giỏ hàng
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
      console.error("Failed to find or create cart:", error);
      toast.error("Không thể khởi tạo giỏ hàng.");
    } finally {
      setLoadingCart(false);
    }
  }, []);

  // 🔹 Hàm load các items trong giỏ
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

  const addToCart = async (product: productRes, size: string) => {
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
        console.error("Failed to create cart before adding item:", err);
        toast.error("Không thể tạo giỏ hàng. Vui lòng thử lại.");
        setLoadingCart(false);
        return;
      } finally {
        setLoadingCart(false);
      }
    }

    if (!currentCartId) {
      toast.error("Giỏ hàng chưa sẵn sàng. Vui lòng thử lại.");
      return;
    }

    const payload: cartItemReq = {
      cartId: currentCartId,
      productId: product.id,
      quantity: 1,
      size: size,
    };

    try {
      await addItemToCart(payload);
      toast.success("Đã thêm vào giỏ hàng!");
      await loadCartItems(currentCartId);
    } catch (error: any) {
      console.error("Failed to add item:", error);
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Thêm vào giỏ hàng thất bại.");
      }
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    if (!cartId) return;
    try {
      await deleteCartItem(cartItemId);
      toast.info("Đã xóa sản phẩm khỏi giỏ hàng.");
      await loadCartItems(cartId);
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Không thể xóa sản phẩm.");
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
      toast.success("Cập nhật số lượng thành công!");
    } catch (error: any) {
      console.error("Failed to update quantity:", error);
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể cập nhật số lượng.");
      }
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

  const value = {
    cartItems,
    cartId,
    loadingCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartCount,
    getSubtotal,
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
