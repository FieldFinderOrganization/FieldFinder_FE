import axios from "axios";
import { auth } from "./firebaseAuth";

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

export const createDiscount = async (payload: discountReq) => {
  const config = await getConfig();
  const response = await axios.post<discountRes>(base_url, payload, config);
  return response.data;
};

export const updateDiscount = async (payload: discountReq, id: string) => {
  const config = await getConfig();
  const response = await axios.put<discountRes>(
    `${base_url}/${id}`,
    payload,
    config,
  );
  return response.data;
};

export const deleteDiscount = async (id: string) => {
  const config = await getConfig();
  await axios.delete(`${base_url}/${id}`, config);
};

export const getAllDiscounts = async () => {
  const config = await getConfig();
  const response = await axios.get<discountRes[]>(base_url, config);
  return response.data;
};

export const getDiscountById = async (id: string) => {
  const config = await getConfig();
  const response = await axios.get<discountRes>(`${base_url}/${id}`, config);
  return response.data;
};

export const saveDiscountToWallet = async (
  userId: string,
  payload: userDiscountReq,
) => {
  const config = await getConfig();
  const response = await axios.post(
    `${base_url}/${userId}/save`,
    payload,
    config,
  );
  return response.data;
};

export const getMyWallet = async (userId: string) => {
  const config = await getConfig();
  const response = await axios.get<userDiscountRes[]>(
    `${base_url}/${userId}/wallet`,
    config,
  );
  return response.data;
};
