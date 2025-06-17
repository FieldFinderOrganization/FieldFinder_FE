import axios from "axios";

const base_url: string = "http://localhost:8080/api/discounts";

export interface discountReq {
  code: string;
  description: string;
  percentage: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface discountRes {
  id: string;
  code: string;
  description: string;
  percentage: number;
  startDate: string;
  endDate: string;
  status: string;
}

export const createDiscount = async (payload: discountReq) => {
  const response = await axios.post<discountRes>(base_url, payload);
  return response.data;
};

export const updateDiscount = async (payload: discountReq, id: string) => {
  const response = await axios.put<discountRes>(`${base_url}/${id}`, payload);
  return response.data;
};

export const deleteDiscount = async (id: string) => {
  await axios.delete(`${base_url}/${id}`);
};

export const getAllDiscounts = async () => {
  const response = await axios.get<discountRes[]>(base_url);
  return response.data;
};

export const getDiscountById = async (id: string) => {
  const response = await axios.get<discountRes>(`${base_url}/${id}`);
  return response.data;
};
