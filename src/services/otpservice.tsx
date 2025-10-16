import axios from "axios";

const baseURL = "http://localhost:8080/api/auth";

export const sendOtp = (email: string) => {
  return axios.post(`${baseURL}/send-otp?email=${email}`);
};

export const verifyOtp = (email: string, code: string) => {
  return axios.post(`${baseURL}/verify-otp`, { email, code });
};
