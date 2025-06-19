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

export const updateUser = async (
  userObj: User1,
  userId: String
): Promise<User1> => {
  return axios.put(`${baseURL}/users/${userId}`, userObj);
};

export const getAllUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${baseURL}/users/users`);
  return response.data;
};

export const changeUserStatus = async (
  userId: string,
  status: string
): Promise<User> => {
  const response = await axios.patch(
    `${baseURL}/users/${userId}/status?status=${status}`
  );
  return response.data;
};
