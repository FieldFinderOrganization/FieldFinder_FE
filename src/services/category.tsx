import axios from "axios";

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

export const getAllCategory = async () => {
  const response = await axios.get<categoryRes[]>(base_url, getConfig());
  return response.data;
};

export const getCategoryById = async (id: string) => {
  const response = await axios.get<categoryRes>(`${base_url}/${id}`, getConfig());
  return response.data;
};

export const createCategory = async (payload: categoryReq) => {
  const response = await axios.post<categoryRes>(base_url, payload, getConfig());
  return response.data;
};

export const updateCategory = async (payload: categoryReq, id: string) => {
  const response = await axios.put<categoryRes>(`${base_url}/${id}`, payload, getConfig());
  return response.data;
};

export const deleteCategory = async (id: string) => {
  await axios.delete(`${base_url}/${id}`, getConfig());
};