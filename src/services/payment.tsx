import axios from "axios";

const baseURL = "http://localhost:8080/api/payments";

export interface PaymentRequestDTO {
  bookingId: string;
  userId: string;
  amount: number;
  paymentMethod: "BANK" | "CASH";
}

export interface ShopPaymentRequestDTO {
  userId: string;
  amount: number;
  description: string;
  paymentMethod: "BANK" | "CASH";
  items: {
    productId: number;
    quantity: number;
  }[];
  discountCodes?: string[];
}

export interface paymentRes {
  transactionId: string;
  checkoutUrl: string;
  amount: string;
  status: string;
  paymentMethod: string;
}

export const createPayment = async (payload: PaymentRequestDTO) => {
  const response = await axios.post<paymentRes>(`${baseURL}/create`, payload);
  return response.data;
};

export const createShopPayment = async (payload: ShopPaymentRequestDTO) => {
  const response = await axios.post<paymentRes>(
    `${baseURL}/create-shop-payment`,
    payload
  );
  return response.data;
};

export const getAllPayments = async () => {
  const response = await axios.get<paymentRes[]>(`${baseURL}`);
  return response.data;
};

export const getPaymentsByUserId = async (userId: string) => {
  const response = await axios.get<paymentRes[]>(`${baseURL}/user/${userId}`);
  return response.data;
};
