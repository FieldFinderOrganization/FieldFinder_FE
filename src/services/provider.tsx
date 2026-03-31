/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { Provider } from "react-redux";
import { auth } from "./firebaseAuth";

const baseURL: string = "http://localhost:8080";

interface Provider {
  cardNumber: string;
  bank: string;
}

interface ProviderResponse {
  providerId: string;
  userId: string;
  cardNumber: string;
  bank: string;
}

export interface Address {
  providerId: string;
  address: string;
}

export interface providerAddress {
  providerAddressId: string;
  address: string;
}

const getConfig = async () => {
  if (typeof window === "undefined") return {};

  try {
    // 1. Chờ Firebase khởi tạo xong (Tránh lỗi auth.currentUser bị null khi vừa F5)
    const currentUser: any = await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });

    if (currentUser) {
      // 2. Gọi getIdToken(true) để ép Firebase cấp Token mới tinh nếu token cũ sắp tèo
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

  // 3. Fallback LocalStorage (Chỉ chạy vào đây nếu Firebase thực sự không có user)
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

export const getProvider = async (
  userId: string,
): Promise<{
  providerId: string;
  cardNumber: string;
  bank: string;
  status: number;
}> => {
  const config = await getConfig();
  const response = await axios.get(
    `${baseURL}/providers/user/${userId}`,
    config,
  );
  return response.data;
};

export const addProvider = async (
  providerObj: Provider,
  userId: string,
): Promise<{ providerId: string; cardNumber: string; bank: string }> => {
  const payload = {
    userId,
    ...providerObj,
  };
  const config = await getConfig();
  const response = await axios.post(`${baseURL}/providers`, payload, config);
  return response.data;
};

export const updateProvider = async (
  providerObj: Provider,
  providerId: string,
): Promise<{ providerId: string; cardNumber: string; bank: string }> => {
  const payload = {
    ...providerObj,
  };
  const config = await getConfig();
  const response = await axios.put(
    `${baseURL}/providers/${providerId}`,
    payload,
    config,
  );
  return response.data;
};

export const addAddress = async (
  addressObj: Address,
): Promise<providerAddress> => {
  const payload = {
    ...addressObj,
  };
  const config = await getConfig();
  const response = await axios.post(
    `${baseURL}/api/provider-addresses`,
    payload,
    config,
  );
  return response.data;
};

export const updateAddress = async (
  addressObj: Address,
  providerAddressId: string,
): Promise<providerAddress> => {
  const payload = {
    ...addressObj,
  };
  const config = await getConfig();
  const response = await axios.put(
    `${baseURL}/api/provider-addresses/${providerAddressId}`,
    payload,
    config,
  );
  return response.data;
};

export const getAddressByProviderId = async (
  providerId: string,
): Promise<providerAddress[]> => {
  const config = await getConfig();
  const response = await axios.get(
    `${baseURL}/api/provider-addresses/provider/${providerId}`,
    config,
  );
  return response.data;
};

export const deleteAddress = async (
  providerAddressId: string,
): Promise<void> => {
  const config = await getConfig();
  await axios.delete(
    `${baseURL}/api/provider-addresses/${providerAddressId}`,
    config,
  );
};

export const getAllAddresses = async (): Promise<providerAddress[]> => {
  const config = await getConfig();
  const response = await axios.get<providerAddress[]>(
    `${baseURL}/api/provider-addresses`,
    config,
  );
  return response.data;
};

export const getAllProviders = async (): Promise<ProviderResponse[]> => {
  const config = await getConfig();
  const response = await axios.get<ProviderResponse[]>(
    `${baseURL}/providers`,
    config,
  );
  return response.data;
};
