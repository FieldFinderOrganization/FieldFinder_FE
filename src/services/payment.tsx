import axios from "axios";

const baseURL = "http://localhost:8080/api/payments";

export interface PaymentRequestDTO {
  bookingId: string;
  userId: string;
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
