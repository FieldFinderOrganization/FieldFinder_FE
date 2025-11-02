import axios from "axios";

const base_url: string = "http://localhost:8080/api/carts";

export interface cartReq {
  userId: string;
}

export interface cartRes {
  cartId: number;
  userId: string;
  userName: string;
  createdAt: string;
}

export const createCart = async (payload: cartReq) => {
  const response = await axios.post<cartRes>(base_url, payload);
  return response.data;
};

export const getCartByUserId = async (userId: string) => {
  const response = await axios.get<cartRes[]>(`${base_url}/user/${userId}`);
  return response.data;
};

export const deleteCart = async (id: number) => {
  await axios.delete(`${base_url}/${id}`);
};

export const getAllCarts = async () => {
  const response = await axios.get<cartRes[]>(base_url);
  return response.data;
};
