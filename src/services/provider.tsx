import axios from "axios";
import { Provider } from "react-redux";

const baseURL: string = "http://localhost:8080";

interface Provider {
  cardNumber: string;
  bank: string;
}

interface ProviderResponse {
  providerId: string;
  userId: string;
  cardNumber: string;
  bank: string;
}

export interface Address {
  providerId: string;
  address: string;
}

export interface providerAddress {
  providerAddressId: string;
  address: string;
}

export const getProvider = async (
  userId: string
): Promise<{
  providerId: string;
  cardNumber: string;
  bank: string;
  status: number;
}> => {
  const response = await axios.get(`${baseURL}/providers/user/${userId}`);
  return response.data;
};

export const addProvider = async (
  providerObj: Provider,
  userId: string
): Promise<{ providerId: string; cardNumber: string; bank: string }> => {
  const payload = {
    userId,
    ...providerObj,
  };
  const response = await axios.post(`${baseURL}/providers`, payload);
  return response.data;
};

export const updateProvider = async (
  providerObj: Provider,
  providerId: string
): Promise<{ providerId: string; cardNumber: string; bank: string }> => {
  const payload = {
    ...providerObj,
  };
  const response = await axios.put(
    `${baseURL}/providers/${providerId}`,
    payload
  );
  return response.data;
};

export const addAddress = async (
  addressObj: Address
): Promise<providerAddress> => {
  const payload = {
    ...addressObj,
  };
  const response = await axios.post(
    `${baseURL}/api/provider-addresses`,
    payload
  );
  return response.data;
};

export const updateAddress = async (
  addressObj: Address,
  providerAddressId: string
): Promise<providerAddress> => {
  const payload = {
    ...addressObj,
  };
  const response = await axios.put(
    `${baseURL}/api/provider-addresses/${providerAddressId}`,
    payload
  );
  return response.data;
};

export const getAddress = async (
  providerId: string
): Promise<providerAddress[]> => {
  const response = await axios.get(
    `${baseURL}/api/provider-addresses/provider/${providerId}`
  );
  return response.data;
};

export const deleteAddress = async (
  providerAddressId: string
): Promise<void> => {
  await axios.delete(`${baseURL}/api/provider-addresses/${providerAddressId}`);
};

export const getAllAddresses = async (): Promise<providerAddress[]> => {
  const response = await axios.get<providerAddress[]>(
    `${baseURL}/api/provider-addresses`
  );
  return response.data;
};

export const getAllProviders = async (): Promise<ProviderResponse[]> => {
  const response = await axios.get<ProviderResponse[]>(`${baseURL}/providers`);
  return response.data;
};
