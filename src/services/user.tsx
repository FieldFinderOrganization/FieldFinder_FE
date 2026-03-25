import axios from "axios";
import { auth } from "./firebaseAuth";

const baseURL: string = "http://localhost:8080/api";

interface User {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  imageUrl?: string;
}

interface User1 {
  name: string;
  email: string;
  phone: string;
  imageUrl?: string;
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

export const updateUser = async (
  userObj: User1,
  userId: string,
): Promise<User1> => {
  const config = await getConfig();
  return axios.put(`${baseURL}/users/${userId}`, userObj, config);
};

export const getAllUsers = async (): Promise<User[]> => {
  const config = await getConfig();
  const response = await axios.get(`${baseURL}/users`, config);
  return response.data;
};

export const changeUserStatus = async (
  userId: string,
  status: string,
): Promise<User> => {
  const config = await getConfig();
  const response = await axios.patch(
    `${baseURL}/users/${userId}/status?status=${status}`,
    config,
  );
  return response.data;
};
export const getUserById = async (userId: string): Promise<User> => {
  const config = await getConfig();
  const response = await axios.get(`${baseURL}/users/${userId}`, config);
  return response.data;
};
