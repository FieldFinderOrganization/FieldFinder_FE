import axios from "axios";

const baseURL: string = "http://localhost:8080/api/bookings";

export interface BookingRequestDTO {
  pitchId: string;
  userId: string;
  bookingDate: string;
  bookingDetails: {
    slot: number;
    name: string;
    priceDetail: number;
  }[];
}

export const createBooking = async (payload: BookingRequestDTO) => {
  const response = await axios.post<BookingRequestDTO>(baseURL, payload);
  return response.data;
};

export const getBookingSlot = async (pitchId: string, date: string) => {
  const response = await axios.get(`${baseURL}/slots/${pitchId}`, {
    params: { pitchId, date },
  });
  return response.data;
};
