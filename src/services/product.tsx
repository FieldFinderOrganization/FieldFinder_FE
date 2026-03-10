import axios from "axios";
import { auth } from "./firebaseAuth";

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
  onSalePercent?: number;
  stockQuantity: number;
  imageUrl: string;
  brand: string;
  sex: string;
  variants: ProductVariant[];
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

export const getAllProducts = async () => {
  const config = await getConfig();
  const response = await axios.get<productRes[]>(base_url, config);
  return response.data;
};

export const getProductById = async (id: string | number) => {
  const config = await getConfig();
  const response = await axios.get<productRes>(`${base_url}/${id}`, config);
  return response.data;
};

export const createProduct = async (payload: productReq) => {
  const config = await getConfig();
  const response = await axios.post<productRes>(base_url, payload, config);
  return response.data;
};

export const updateProduct = async (
  payload: productReq,
  id: string | number,
) => {
  const config = await getConfig();
  const response = await axios.put<productRes>(
    `${base_url}/${id}`,
    payload,
    config,
  );
  return response.data;
};

export const deleteProduct = async (id: string | number) => {
  const config = await getConfig();
  await axios.delete(`${base_url}/${id}`, config);
};

export const getProductsByCategories = async (categories: string[]) => {
  const params = new URLSearchParams();
  categories.forEach((cat) => params.append("categories", cat));

  const config = await getConfig();
  const response = await axios.get<productRes[]>(
    `${base_url}/by-categories?${params.toString()}`,
    config,
  );
  return response.data;
};

export const getTopSellingProducts = async () => {
  const config = await getConfig();
  const response = await axios.get<productRes[]>(
    `${base_url}/top-selling`,
    config,
  );
  return response.data;
};
