import axios from "axios";
import { auth } from "../services/firebaseAuth";
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
  totalPrice: number;
}

export interface BookingResponseDTO {
  bookingId: string;
  userId: string;
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

// THÊM INTERFACE NÀY ĐỂ KHỚP VỚI BACKEND
export interface ProviderBookingResponseDTO {
  bookingId: string;
  bookingDate: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  providerId: string;
  paymentMethod?: string;
  userId?: string;
  userName?: string;
  providerName?: string;
  pitchName: string;
  slots: number[];
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

export const createBooking = async (payload: BookingRequestDTO) => {
  const config = await getConfig();
  const response = await axios.post<{
    BookingRequestDTO: BookingRequestDTO;
    bookingId: string;
  }>(baseURL, payload, config);
  return response.data;
};

export const getBookingSlot = async (pitchId: string, date: string) => {
  const config = await getConfig();
  const response = await axios.get(`${baseURL}/slots/${pitchId}`, {
    params: { pitchId, date },
    ...config,
  });
  return response.data;
};

export const getBookingSlotByDate = async (date: string) => {
  const config = await getConfig();
  const response = await axios.get(`${baseURL}/slots/all`, {
    params: { date },
    ...config,
  });
  return response.data;
};

export const getAvailablePitches = async (
  date: string,
  slots: number[],
  type: string,
) => {
  const config = await getConfig();
  const params = new URLSearchParams();
  params.append("date", date);

  slots.forEach((slot) => {
    params.append("slots", slot.toString());
  });

  params.append("pitchType", type);

  const response = await axios.get(`${baseURL}/available-pitches`, {
    params,
    ...config,
  });

  return response.data;
};

export const getAllBookings = async () => {
  const config = await getConfig();
  const response = await axios.get<BookingResponseDTO[]>(`${baseURL}`, config);
  return response.data;
};

export const updateStatus = async (bookingId: string, status: string) => {
  const config = await getConfig();
  const response = await axios.put<string>(
    `${baseURL}/${bookingId}/status`,
    null,
    {
      params: { status },
      ...config,
    },
  );
  return response.data;
};

export const updatePaymentStatus = async (
  bookingId: string,
  status: string,
) => {
  const config = await getConfig();
  const response = await axios.put<string>(
    `${baseURL}/${bookingId}/payment-status`,
    null,
    {
      params: { status },
      ...config,
    },
  );
  return response.data;
};

export const getBookingByUserId = async (userId: string) => {
  const config = await getConfig();
  const response = await axios.get<ProviderBookingResponseDTO[]>(
    `${baseURL}/user/${userId}`,
    config,
  );
  return response.data;
};

export const getBookingByProviderId = async (providerId: string) => {
  const config = await getConfig();
  const response = await axios.get<ProviderBookingResponseDTO[]>(
    `${baseURL}/provider/${providerId}`,
    config,
  );
  return response.data;
};
