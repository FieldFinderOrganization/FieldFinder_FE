import axios from "axios";

const base_url: string = "http://localhost:8080/api/products";

export interface productReq {
  categoryId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  brand: string;
  sex: string;
  variants?: { size: string; quantity: number }[];
}

export interface ProductVariant {
  size: string;
  quantity: number;
}

export interface productRes {
  id: number;
  name: string;
  description: string;
  categoryName: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  imageUrl: string;
  brand: string;
  sex: string;
  variants: ProductVariant[];
}

export const getAllProducts = async () => {
  const response = await axios.get<productRes[]>(base_url);
  return response.data;
};

export const getProductById = async (id: string | number) => {
  const response = await axios.get<productRes>(`${base_url}/${id}`);
  return response.data;
};

export const createProduct = async (payload: productReq) => {
  const response = await axios.post<productRes>(base_url, payload);
  return response.data;
};

export const updateProduct = async (
  payload: productReq,
  id: string | number
) => {
  const response = await axios.put<productRes>(`${base_url}/${id}`, payload);
  return response.data;
};

export const deleteProduct = async (id: string | number) => {
  await axios.delete(`${base_url}/${id}`);
};
