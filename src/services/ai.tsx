/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { auth } from "../services/firebaseAuth";

const API_URL = "http://localhost:8080/api/ai";

export interface ChatRequest {
  userInput: string;
  sessionId: string;
}

export interface BookingQuery {
  bookingDate: string | null;
  slotList: number[];
  pitchType: string;
  message: string;
  data: any;
}

export interface ProductDTO {
  id: number;
  name: string;
  price: number;
  salePrice: number;
  imageUrl: string;
  brand: string;
  description: string;
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

export const postChatMessage = async (
  userInput: string,
  sessionId: string,
): Promise<BookingQuery> => {
  const payload: ChatRequest = {
    userInput,
    sessionId,
  };

  try {
    const config = await getConfig();
    const response = await axios.post<BookingQuery>(
      `${API_URL}/chat`,
      payload,
      config,
    );
    return response.data;
  } catch (error) {
    console.error("Error calling AI chat API:", error);
    throw new Error("Failed to get response from assistant.");
  }
};

export const postImageMessage = async (
  base64Image: string,
  sessionId: string,
): Promise<BookingQuery> => {
  try {
    const config = await getConfig();
    const response = await axios.post<BookingQuery>(
      `${API_URL}/image`,
      {
        image: base64Image,
        sessionId: sessionId,
      },
      config,
    );
    return response.data;
  } catch {
    throw new Error("Failed to analyze image.");
  }
};
