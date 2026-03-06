import axios from "axios";

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

export const createPayment = async (payload: PaymentRequestDTO) => {
  const response = await axios.post<paymentRes>(`${baseURL}/create`, payload, getConfig());
  return response.data;
};

export const createShopPayment = async (payload: ShopPaymentRequestDTO) => {
  const response = await axios.post<paymentRes>(
    `${baseURL}/create-shop-payment`,
    payload,
    getConfig()
  );
  return response.data;
};

export const getAllPayments = async () => {
  const response = await axios.get<paymentRes[]>(`${baseURL}`, getConfig());
  return response.data;
};

export const getPaymentsByUserId = async (userId: string) => {
  const response = await axios.get<paymentRes[]>(`${baseURL}/user/${userId}`, getConfig());
  return response.data;
};
