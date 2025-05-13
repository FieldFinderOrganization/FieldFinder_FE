import axios from "axios";

const baseURL: string = "http://localhost:8080/api";

interface User {
  name: string;
  email: string;
  phone: string;
}

export const updateUser = async (
  userObj: User,
  userId: String
): Promise<User> => {
  return axios.put(`${baseURL}/users/${userId}`, userObj);
};
