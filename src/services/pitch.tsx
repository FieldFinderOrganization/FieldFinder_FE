import axios from "axios";
import { auth } from "./firebaseAuth";

const baseURL: string = "http://localhost:8080/api/pitches";

export interface PitchRequestDTO {
  providerAddressId: string;
  name: string;
  type: "FIVE_A_SIDE" | "SEVEN_A_SIDE" | "ELEVEN_A_SIDE";
  price: number;
  description?: string;
}

export interface PitchResponseDTO {
  pitchId: string;
  providerAddressId: string;
  name: string;
  type: "FIVE_A_SIDE" | "SEVEN_A_SIDE" | "ELEVEN_A_SIDE";
  price: number;
  description?: string;
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

export const getPitchesByProviderAddressId = async (
  providerAddressId: string,
): Promise<PitchResponseDTO[]> => {
  const config = await getConfig();
  const response = await axios.get<PitchResponseDTO[]>(
    `${baseURL}/provider/${providerAddressId}`,
    config,
  );
  return response.data;
};

export const createPitch = async (
  payload: PitchRequestDTO,
): Promise<PitchResponseDTO> => {
  const config = await getConfig();
  const response = await axios.post<PitchResponseDTO>(baseURL, payload, config);
  return response.data;
};

export const updatePitch = async (
  pitchId: string,
  payload: PitchRequestDTO,
): Promise<PitchResponseDTO> => {
  const config = await getConfig();
  const response = await axios.put<PitchResponseDTO>(
    `${baseURL}/${pitchId}`,
    payload,
    config,
  );
  return response.data;
};

export const deletePitch = async (pitchId: string): Promise<void> => {
  const config = await getConfig();
  await axios.delete(`${baseURL}/${pitchId}`, config);
};

export const getAllPitches = async (): Promise<PitchResponseDTO[]> => {
  const config = await getConfig();
  const response = await axios.get<PitchResponseDTO[]>(`${baseURL}`, config);
  return response.data;
};

export const getPitchById = async (
  pitchId: string,
): Promise<PitchResponseDTO> => {
  const config = await getConfig();
  const response = await axios.get<PitchResponseDTO>(
    `${baseURL}/${pitchId}`,
    config,
  );
  return response.data;
};
