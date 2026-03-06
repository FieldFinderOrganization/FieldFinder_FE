import axios from "axios";

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

const getConfig = () => {
  if (typeof window === "undefined") return {};

  try {
    const persistedState = localStorage.getItem("persist:root");

    if (persistedState) {
      const parsedRoot = JSON.parse(persistedState);

      if (parsedRoot.auth) {
        const authState = JSON.parse(parsedRoot.auth);

        const token = authState.token;

        if (token) {
          return {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
        }
      }
    }
  } catch (error) {
    console.error("Error retrieving token from storage:", error);
  }

  return {};
};

export const createReview = async (
  payload: reviewRequestDTO
): Promise<reviewResponseDTO> => {
  const response = await axios.post<reviewResponseDTO>(baseURL, payload, getConfig());
  return response.data;
};

export const getReviewByPitch = async (pitchId: string) => {
  const response = await axios.get<reviewResponseDTO[]>(
    `${baseURL}/pitch/${pitchId}`, getConfig()
  );
  return response.data;
};

export const updateReview = async (
  reviewId: string,
  payload: reviewRequestDTO
): Promise<reviewResponseDTO> => {
  const response = await axios.put<reviewResponseDTO>(
    `${baseURL}/${reviewId}`,
    payload, getConfig()
  );
  return response.data;
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  await axios.delete(`${baseURL}/${reviewId}`, getConfig());
};

export const getAverageRating = async (pitchId: string): Promise<number> => {
  const response = await axios.get(
    `${baseURL}/pitch/${pitchId}/average-rating`, getConfig()
  );
  return response.data;
};
