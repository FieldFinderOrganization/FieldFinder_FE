import axios from "axios";

const baseURL: string = "http://localhost:8080/api";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  message?: string;
  [key: string]: any;
}

export const login = (
  email: string,
  password: string
): Promise<LoginResponse> => {
  return axios.post(`${baseURL}/users/login`, {
    email,
    password,
  });
};

interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
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
  return axios.post(`${baseURL}/users/register`, registerObj);
};
