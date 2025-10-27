import axios from "axios";
import { UUID } from "crypto";

const baseURL: string = "http://localhost:8080/api/users";

interface UserDTO {
  id: UUID;
  email: string;
  name: string;
  phone: string | null;
  role: string; // "USER" | "PROVIDER" | "ADMIN"
  status: string; // "ACTIVE" | "BLOCKED"
}

interface LoginResponse {
  message: string;
  user: UserDTO;
}

export const login = (idToken: string): Promise<{ data: LoginResponse }> => {
  return axios.post(`${baseURL}/login`, {
    idToken,
  });
};

export const loginSocial = (
  idToken: string
): Promise<{ data: LoginResponse }> => {
  return axios.post(`${baseURL}/login-social`, {
    idToken,
  });
};

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  [key: string]: any;
  status: string;
}

interface RegisterResponse {
  id?: string;
  message?: string;
  [key: string]: any;
}

export const register = (
  registerObj: RegisterRequest
): Promise<RegisterResponse> => {
  return axios.post(`${baseURL}/register`, registerObj);
};
