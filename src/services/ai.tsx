import axios from "axios";

const API_URL = "http://localhost:8080/api/ai/chat";

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

export const postChatMessage = async (
  userInput: string,
  sessionId: string
): Promise<BookingQuery> => {
  const payload: ChatRequest = {
    userInput,
    sessionId,
  };

  try {
    const response = await axios.post<BookingQuery>(API_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error calling AI chat API:", error);
    throw new Error("Failed to get response from assistant.");
  }
};
