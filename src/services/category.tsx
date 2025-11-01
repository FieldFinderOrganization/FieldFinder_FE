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

export const getAllCategory = async () => {
  const response = await axios.get<categoryRes[]>(base_url);
  return response.data;
};

export const getCategoryById = async (id: string) => {
  const response = await axios.get<categoryRes>(`${base_url}/${id}`);
  return response.data;
};

export const createCategory = async (payload: categoryReq) => {
  const response = await axios.post<categoryRes>(base_url, payload);
  return response.data;
};

export const updateCategory = async (payload: categoryReq, id: string) => {
  const response = await axios.put<categoryRes>(`${base_url}/${id}`, payload);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  await axios.delete(`${base_url}/${id}`);
};
