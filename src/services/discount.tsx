import axios from "axios";

const base_url: string = "http://localhost:8080/api/discounts";

export interface discountReq {
  code: string;
  description: string;
  discountType: string; // PERCENTAGE hoặc FIXED_AMOUNT
  value: number;
  startDate: string;
  endDate: string;
  status: string; // "ACTIVE" | "INACTIVE" | "EXPIRED"
  active: boolean;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  scope?: string;
  quantity?: number;
}

export interface discountRes {
  id: string; // UUID
  code: string;
  description: string;
  discountType: string; // "PERCENTAGE" | "FIXED_AMOUNT"
  value: number; // Decrease value
  startDate: string;
  endDate: string;
  status: string; // "ACTIVE", "INACTIVE", "EXPIRED"
  minOrderValue?: number;
  maxDiscountAmount?: number;
  quantity: number;
}

export interface userDiscountRes {
  id: string;
  userDiscountId: string;
  discountCode: string;
  description: string;
  status: string;
  value: number;
  type: string;
  startDate: string;
  endDate: string;
  minOrderValue: number;
  discountType: string;
  maxDiscountAmount?: number;
  quantity: number;
}

export interface userDiscountReq {
  discountCode: string;
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

export const createDiscount = async ( payload: discountReq) => {
  const response = await axios.post<discountRes>(base_url, payload, getConfig());
  return response.data;
};

export const updateDiscount = async (payload: discountReq, id: string) => {
  const response = await axios.put<discountRes>(`${base_url}/${id}`, payload, getConfig());
  return response.data;
};

export const deleteDiscount = async (id: string) => {
  await axios.delete(`${base_url}/${id}`, getConfig());
};

export const getAllDiscounts = async () => {
  const response = await axios.get<discountRes[]>(base_url, getConfig());
  return response.data;
};

export const getDiscountById = async (id: string) => {
  const response = await axios.get<discountRes>(`${base_url}/${id}`, getConfig());
  return response.data;
};

export const saveDiscountToWallet = async (
  userId: string,
  payload: userDiscountReq
) => {
  const response = await axios.post(`${base_url}/${userId}/save`, payload, getConfig());
  return response.data;
};

export const getMyWallet = async (userId: string) => {
  const response = await axios.get<userDiscountRes[]>(
    `${base_url}/${userId}/wallet`,
    getConfig()
  );
  return response.data;
};
