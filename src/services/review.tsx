/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { auth } from "./firebaseAuth";

const baseURL: string = "http://localhost:8080/api/reviews";

export interface reviewRequestDTO {
  pitchId: string;
  userId: string;
  rating: number;
  comment: string;
}

export interface reviewResponseDTO {
  reviewId: string;
  pitchId: string;
  userId: string;
  rating: number;
  comment: string;
  createat: string;
}

const getConfig = async () => {
  if (typeof window === "undefined") return {};

  try {
    // 1. Chờ Firebase khởi tạo xong (Tránh lỗi auth.currentUser bị null khi vừa F5)
    const currentUser: any = await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });

    if (currentUser) {
      // 2. Gọi getIdToken(true) để ép Firebase cấp Token mới tinh nếu token cũ sắp tèo
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

  // 3. Fallback LocalStorage (Chỉ chạy vào đây nếu Firebase thực sự không có user)
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

export const createReview = async (
  payload: reviewRequestDTO,
): Promise<reviewResponseDTO> => {
  const config = await getConfig();
  const response = await axios.post<reviewResponseDTO>(
    baseURL,
    payload,
    config,
  );
  return response.data;
};

export const getReviewByPitch = async (pitchId: string) => {
  const config = await getConfig();
  const response = await axios.get<reviewResponseDTO[]>(
    `${baseURL}/pitch/${pitchId}`,
    config,
  );
  return response.data;
};

export const updateReview = async (
  reviewId: string,
  payload: reviewRequestDTO,
): Promise<reviewResponseDTO> => {
  const config = await getConfig();
  const response = await axios.put<reviewResponseDTO>(
    `${baseURL}/${reviewId}`,
    payload,
    config,
  );
  return response.data;
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  const config = await getConfig();
  await axios.delete(`${baseURL}/${reviewId}`, config);
};

export const getAverageRating = async (pitchId: string): Promise<number> => {
  const config = await getConfig();
  const response = await axios.get(
    `${baseURL}/pitch/${pitchId}/average-rating`,
    config,
  );
  return response.data;
};
