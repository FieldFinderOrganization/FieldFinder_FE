import axios from "axios";

const baseURL: string = "http://localhost:8080/api";

interface User {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

interface User1 {
  name: string;
  email: string;
  phone: string;
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

export const updateUser = async (
  userObj: User1,
  userId: string
): Promise<User1> => {
  return axios.put(`${baseURL}/users/${userId}`, userObj, getConfig());
};

export const getAllUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${baseURL}/users`);
  return response.data;
};

export const changeUserStatus = async (
  userId: string,
  status: string
): Promise<User> => {
  const response = await axios.patch(
    `${baseURL}/users/${userId}/status?status=${status}`, getConfig()
  );
  return response.data;
};
export const getUserById = async (userId: string): Promise<User> => {
  const response = await axios.get(`${baseURL}/users/${userId}`, getConfig());
  return response.data;
};