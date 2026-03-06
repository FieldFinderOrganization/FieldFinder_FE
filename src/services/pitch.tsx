import axios from "axios";

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

export const getPitchesByProviderAddressId = async (
  providerAddressId: string
): Promise<PitchResponseDTO[]> => {
  const response = await axios.get<PitchResponseDTO[]>(
    `${baseURL}/provider/${providerAddressId}`, getConfig()
  );
  return response.data;
};

export const createPitch = async (
  payload: PitchRequestDTO
): Promise<PitchResponseDTO> => {
  const response = await axios.post<PitchResponseDTO>(baseURL, payload, getConfig());
  return response.data;
};

export const updatePitch = async (
  pitchId: string,
  payload: PitchRequestDTO
): Promise<PitchResponseDTO> => {
  const response = await axios.put<PitchResponseDTO>(
    `${baseURL}/${pitchId}`,
    payload,
    getConfig()
  );
  return response.data;
};

export const deletePitch = async (pitchId: string): Promise<void> => {
  await axios.delete(`${baseURL}/${pitchId}`, getConfig());
};

export const getAllPitches = async (): Promise<PitchResponseDTO[]> => {
  const response = await axios.get<PitchResponseDTO[]>(`${baseURL}`, getConfig());
  return response.data;
};

export const getPitchById = async (
  pitchId: string
): Promise<PitchResponseDTO> => {
  const response = await axios.get<PitchResponseDTO>(`${baseURL}/${pitchId}`, getConfig());
  return response.data;
};
