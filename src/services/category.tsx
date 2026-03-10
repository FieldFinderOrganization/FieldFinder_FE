import axios from "axios";
import { auth } from "./firebaseAuth";

const base_url: string = "http://localhost:8080/api/categories";

export interface categoryReq {
  name: string;
  description: string;
  parentId: number | null;
}

export interface categoryRes {
  id: number;
  name: string;
  description: string;
  parentName: string | null;
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

export const getAllCategory = async () => {
  const config = await getConfig();
  const response = await axios.get<categoryRes[]>(base_url, config);
  return response.data;
};

export const getCategoryById = async (id: string) => {
  const config = await getConfig();
  const response = await axios.get<categoryRes>(`${base_url}/${id}`, config);
  return response.data;
};

export const createCategory = async (payload: categoryReq) => {
  const config = await getConfig();
  const response = await axios.post<categoryRes>(base_url, payload, config);
  return response.data;
};

export const updateCategory = async (payload: categoryReq, id: string) => {
  const config = await getConfig();
  const response = await axios.put<categoryRes>(
    `${base_url}/${id}`,
    payload,
    config,
  );
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const config = await getConfig();
  await axios.delete(`${base_url}/${id}`, config);
};
