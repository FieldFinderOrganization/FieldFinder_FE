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

const getConfig = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getMyCart = async (token: string) => {
  const response = await axios.get<cartRes>(base_url, getConfig(token));
  return response.data;
};

export const addItemToCart = async (payload: cartItemReq, token: string) => {
  const response = await axios.post<string>(`${base_url}/add`, payload, getConfig(token));
  return response.data;
};

export const updateCartItem = async (payload: cartItemReq, token: string) => {
  const response = await axios.put<string>(`${base_url}/update`, payload, getConfig(token));
  return response.data;
};

export const removeCartItem = async (productId: number, size: string, token: string) => {
  const response = await axios.delete<string>(`${base_url}/remove`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { productId, size },
  });
  return response.data;
};

export const clearCart = async (token: string) => {
  const response = await axios.delete<string>(`${base_url}/clear`, getConfig(token));
  return response.data;
};