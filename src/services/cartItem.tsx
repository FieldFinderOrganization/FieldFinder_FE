import axios from "axios";
import { discountRes } from "./discount";

const base_url: string = "http://localhost:8080/api/cart-items";

export interface cartItemReq {
  cartId: number | null;
  userId: string | undefined;
  productId: number;
  quantity: number;
  size: string;
}

export interface cartItemRes {
  id: number;
  cartId: number;
  productId: number;
  productName: string;
  imageUrl: string;
  size: string;
  quantity: number;
  priceAtTime: number;
  originalPrice?: number;
  appliedDiscounts?: discountRes[];
  categoryId: number;
  categoryName: string;
}

const getConfig = () => {
  if (typeof window === "undefined") return {};

  try {
    const persistedState = localStorage.getItem("persist:root");

    if (persistedState) {
      const parsedRoot = JSON.parse(persistedState);

      if (parsedRoot.auth) {
        const authState = JSON.parse(parsedRoot.auth);

        const token = authState.token;

        if (token) {
          return {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
        }
      }
    }
  } catch (error) {
    console.error("Error retrieving token from storage:", error);
  }

  return {};
};

export const addItemToCart = async (payload: cartItemReq) => {
  const response = await axios.post<cartItemRes>(base_url, payload, getConfig());
  return response.data;
};

export const getItemsByCartId = async (cartId: number) => {
  const response = await axios.get<cartItemRes[]>(`${base_url}/cart/${cartId}`, getConfig());
  return response.data;
};

export const updateCartItem = async (id: number, quantity: number) => {
  const response = await axios.put<cartItemRes>(`${base_url}/${id}`, null, {
    params: { quantity },
      ...getConfig() 
  });
  return response.data;
};

export const deleteCartItem = async (id: number) => {
  await axios.delete(`${base_url}/${id}`, getConfig());
};
