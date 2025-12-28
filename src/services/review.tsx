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
export const createReview = async (
  payload: reviewRequestDTO
): Promise<reviewResponseDTO> => {
  const response = await axios.post<reviewResponseDTO>(baseURL, payload);
  return response.data;
};

export const getReviewByPitch = async (pitchId: string) => {
  const response = await axios.get<reviewResponseDTO[]>(
    `${baseURL}/pitch/${pitchId}`
  );
  return response.data;
};

export const updateReview = async (
  reviewId: string,
  payload: reviewRequestDTO
): Promise<reviewResponseDTO> => {
  const response = await axios.put<reviewResponseDTO>(
    `${baseURL}/${reviewId}`,
    payload
  );
  return response.data;
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  await axios.delete(`${baseURL}/${reviewId}`);
};

export const getAverageRating = async (pitchId: string): Promise<number> => {
  const response = await axios.get(
    `${baseURL}/pitch/${pitchId}/average-rating`
  );
  return response.data;
};
