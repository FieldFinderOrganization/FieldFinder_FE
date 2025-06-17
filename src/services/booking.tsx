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

export interface BookingResponseDTO {
  bookingId: string;
  bookingDate: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  providerId: string;
  bookingDetails: {
    slot: number;
    name: string;
    priceDetail: number;
    pitchId: string;
  }[];
}

export const createBooking = async (payload: BookingRequestDTO) => {
  const response = await axios.post<{
    BookingRequestDTO: BookingRequestDTO;
    bookingId: string;
  }>(baseURL, payload);
  return response.data;
};

export const getBookingSlot = async (pitchId: string, date: string) => {
  const response = await axios.get(`${baseURL}/slots/${pitchId}`, {
    params: { pitchId, date },
  });
  return response.data;
};

export const getBookingSlotByDate = async (date: string) => {
  const response = await axios.get(`${baseURL}/slots/all`, {
    params: { date },
  });
  return response.data;
};

export const getAvailablePitches = async (
  date: string,
  slots: number[],
  type: string
) => {
  const params = new URLSearchParams();
  params.append("date", date);

  slots.forEach((slot) => {
    params.append("slots", slot.toString());
  });

  params.append("pitchType", type);

  const response = await axios.get(`${baseURL}/available-pitches`, {
    params,
  });

  return response.data;
};

export const getAllBookings = async () => {
  const response = await axios.get<BookingResponseDTO[]>(`${baseURL}`);
  return response.data;
};

export const updateStatus = async (bookingId: string, status: string) => {
  const response = await axios.put<string>(
    `${baseURL}/${bookingId}/status`,
    null,
    {
      params: { status },
    }
  );
  return response.data;
};

export const updatePaymentStatus = async (
  bookingId: string,
  status: string
) => {
  const response = await axios.put<string>(
    `${baseURL}/${bookingId}/payment-status`,
    null,
    {
      params: { status },
    }
  );
  return response.data;
};

export const getBookingByUserId = async (userId: string) => {
  const response = await axios.get<BookingResponseDTO[]>(
    `${baseURL}/user/${userId}`
  );
  return response.data;
};
