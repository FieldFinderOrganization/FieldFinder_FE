import axios from "axios";
import { auth } from "../services/firebaseAuth";

const base_url: string = "http://localhost:8080/api/cart";

export interface CartItemDetail {
  productId: number;
  productName: string;
  imageUrl: string;
  size: string;
  originalPrice: number;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
  stockAvailable: number;
  salePercent: number;
}

export interface cartRes {
  items: CartItemDetail[];
  totalCartPrice: number;
}

export interface cartItemReq {
  productId: number;
  quantity: number;
  size: string;
}

const getConfig = async () => {
  if (typeof window === "undefined") return {};

  try {
    const currentUser = auth.currentUser;

    if (currentUser) {
      const token = await currentUser.getIdToken(true);

      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    }
  } catch (error) {
    console.error("Lỗi khi lấy token sống từ Firebase:", error);
  }

  try {
    const persistedState = localStorage.getItem("persist:root");
    if (persistedState) {
      const parsedRoot = JSON.parse(persistedState);
      if (parsedRoot.auth) {
        const authState = JSON.parse(parsedRoot.auth);
        const token = authState.token;
        if (token) {
          return { headers: { Authorization: `Bearer ${token}` } };
        }
      }
    }
  } catch (error) {
    console.error("Lỗi fallback LocalStorage:", error);
  }

  return {};
};

export const getMyCart = async () => {
  const config = await getConfig();
  const response = await axios.get<cartRes>(base_url, config);
  return response.data;
};

export const addItemToCart = async (payload: cartItemReq) => {
  const config = await getConfig();
  const response = await axios.post<string>(`${base_url}/add`, payload, config);
  return response.data;
};

export const updateCartItem = async (payload: cartItemReq) => {
  const config = await getConfig();
  const response = await axios.put<string>(
    `${base_url}/update`,
    payload,
    config,
  );
  return response.data;
};

export const removeCartItem = async (productId: number, size: string) => {
  const config = await getConfig();
  const response = await axios.delete<string>(`${base_url}/remove`, {
    headers: { Authorization: `Bearer ${config.headers?.Authorization}` },
    params: { productId, size },
  });
  return response.data;
};

export const clearCart = async () => {
  const config = await getConfig();
  const response = await axios.delete<string>(`${base_url}/clear`, config);
  return response.data;
};
