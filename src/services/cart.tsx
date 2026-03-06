import axios from "axios";

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

export const getMyCart = async () => {
  const response = await axios.get<cartRes>(base_url, getConfig());
  return response.data;
};

export const addItemToCart = async (payload: cartItemReq) => {
  const response = await axios.post<string>(`${base_url}/add`, payload, getConfig());
  return response.data;
};

export const updateCartItem = async (payload: cartItemReq) => {
  const response = await axios.put<string>(`${base_url}/update`, payload, getConfig());
  return response.data;
};

export const removeCartItem = async (productId: number, size: string) => {
  const response = await axios.delete<string>(`${base_url}/remove`, {
    headers: { Authorization: `Bearer ${getConfig().headers?.Authorization}` },
    params: { productId, size },
  });
  return response.data;
};

export const clearCart = async () => {
  const response = await axios.delete<string>(`${base_url}/clear`, getConfig());
  return response.data;
};