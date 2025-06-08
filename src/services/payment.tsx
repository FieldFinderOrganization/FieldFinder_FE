import axios from "axios";

const baseURL = "http://localhost:8080/api/payments";

export interface PaymentRequestDTO {
  bookingId: string;
  userId: string;
  amount: number;
  paymentMethod: string;
}

export interface paymentData {
  bankAccountNumber: string;
  bankAccountName: string;
  bankName: string;
  amount: number;
  paymentMethod: string;
}

export const createPayment = async (payload: PaymentRequestDTO) => {
  const response = await axios.post<PaymentRequestDTO>(
    `${baseURL}/create`,
    payload
  );
  return response.data;
};

export const getAllPayments = async () => {
  const response = await axios.get<paymentData[]>(`${baseURL}`);
  return response.data;
};
