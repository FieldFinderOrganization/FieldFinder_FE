import axios from "axios";
import { auth } from "./firebaseAuth";

const baseURL = "http://localhost:8080/api/payments";

export interface PaymentRequestDTO {
  bookingId: string;
  userId: string;
  amount: number;
  paymentMethod: "BANK" | "CASH";
}

export interface ShopPaymentRequestDTO {
  orderCode: string;
  userId: string;
  amount: number;
  description: string;
  paymentMethod: "BANK" | "CASH";
  items: {
    productId: number;
    quantity: number;
  }[];
}

export interface paymentRes {
  transactionId: string;
  checkoutUrl: string;
  amount: string;
  status: string;
  paymentMethod: string;
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

export const createPayment = async (payload: PaymentRequestDTO) => {
  const config = await getConfig();
  const response = await axios.post<paymentRes>(
    `${baseURL}/create`,
    payload,
    config,
  );
  return response.data;
};

export const createShopPayment = async (payload: ShopPaymentRequestDTO) => {
  const config = await getConfig();
  const response = await axios.post<paymentRes>(
    `${baseURL}/create-shop-payment`,
    payload,
    config,
  );
  return response.data;
};

export const getAllPayments = async () => {
  const config = await getConfig();
  const response = await axios.get<paymentRes[]>(`${baseURL}`, config);
  return response.data;
};

export const getPaymentsByUserId = async (userId: string) => {
  const config = await getConfig();
  const response = await axios.get<paymentRes[]>(
    `${baseURL}/user/${userId}`,
    config,
  );
  return response.data;
};
