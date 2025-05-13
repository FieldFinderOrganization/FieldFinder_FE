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

export const getPitchesByProviderAddressId = async (
  providerAddressId: string
): Promise<PitchResponseDTO[]> => {
  const response = await axios.get<PitchResponseDTO[]>(
    `${baseURL}/provider/${providerAddressId}`
  );
  return response.data;
};

export const createPitch = async (
  payload: PitchRequestDTO
): Promise<PitchResponseDTO> => {
  const response = await axios.post<PitchResponseDTO>(baseURL, payload);
  return response.data;
};

export const updatePitch = async (
  pitchId: string,
  payload: PitchRequestDTO
): Promise<PitchResponseDTO> => {
  const response = await axios.put<PitchResponseDTO>(
    `${baseURL}/${pitchId}`,
    payload
  );
  return response.data;
};

export const deletePitch = async (pitchId: string): Promise<void> => {
  await axios.delete(`${baseURL}/${pitchId}`);
};
