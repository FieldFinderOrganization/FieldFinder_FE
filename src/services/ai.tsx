/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

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

// --- HELPER: Lấy Header có Token ---
const getConfig = () => {
  if (typeof window === "undefined")
    return { headers: { "Content-Type": "application/json" } };

  const token = localStorage.getItem("token");
  const headers: any = { "Content-Type": "application/json" };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return { headers };
};

export const postChatMessage = async (
  userInput: string,
  sessionId: string
): Promise<BookingQuery> => {
  const payload: ChatRequest = {
    userInput,
    sessionId,
  };

  try {
    const response = await axios.post<BookingQuery>(
      `${API_URL}/chat`,
      payload,
      getConfig()
    );
    return response.data;
  } catch (error) {
    console.error("Error calling AI chat API:", error);
    throw new Error("Failed to get response from assistant.");
  }
};

export const postImageMessage = async (
  base64Image: string,
  sessionId: string
): Promise<BookingQuery> => {
  try {
    const response = await axios.post<BookingQuery>(
      `${API_URL}/image`,
      {
        image: base64Image,
        sessionId: sessionId,
      },
      getConfig()
    );
    return response.data;
  } catch {
    throw new Error("Failed to analyze image.");
  }
};
