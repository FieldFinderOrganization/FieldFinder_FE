import axios from "axios";

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
}

export const addItemToCart = async (payload: cartItemReq) => {
  const response = await axios.post<cartItemRes>(base_url, payload);
  return response.data;
};

export const getItemsByCartId = async (cartId: number) => {
  const response = await axios.get<cartItemRes[]>(`${base_url}/cart/${cartId}`);
  return response.data;
};

export const updateCartItem = async (id: number, quantity: number) => {
  const response = await axios.put<cartItemRes>(`${base_url}/${id}`, null, {
    params: { quantity },
  });
  return response.data;
};

export const deleteCartItem = async (id: number) => {
  await axios.delete(`${base_url}/${id}`);
};
