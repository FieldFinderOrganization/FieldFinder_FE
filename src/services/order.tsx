/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { auth } from "./firebaseAuth";

const base_url = "http://localhost:8080/api/orders";

export interface orderItemRequestDTO {
  productId: number;
  quantity: number;
}

export interface orderItemResponseDTO {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  imageUrl: string;
  size: string;
}

export interface orderResponseDTO {
  orderId: string;
  userName: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: orderItemResponseDTO[];
}

export interface orderRequestDTO {
  userId: string | undefined;
  items: orderItemRequestDTO[];
  paymentMethod: string;
  discountCodes?: string[];
}

const getConfig = async () => {
  if (typeof window === "undefined") return {};

  try {
    // 1. Chờ Firebase khởi tạo xong (Tránh lỗi auth.currentUser bị null khi vừa F5)
    const currentUser: any = await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });

    if (currentUser) {
      // 2. Gọi getIdToken(true) để ép Firebase cấp Token mới tinh nếu token cũ sắp tèo
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

  // 3. Fallback LocalStorage (Chỉ chạy vào đây nếu Firebase thực sự không có user)
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

export const createOrder = async (payload: orderRequestDTO) => {
  const config = await getConfig();
  const response = await axios.post<orderResponseDTO>(
    base_url,
    payload,
    config,
  );
  return response.data;
};

export const getAllOrders = async () => {
  const config = await getConfig();
  const response = await axios.get<orderResponseDTO[]>(base_url, config);
  return response.data;
};

export const getOrderById = async (id: string) => {
  const config = await getConfig();
  const response = await axios.get<orderResponseDTO>(
    `${base_url}/${id}`,
    config,
  );
  return response.data;
};

export const getOrdersByUserId = async (userId: string) => {
  const config = await getConfig();
  const response = await axios.get<orderResponseDTO[]>(
    `${base_url}/user/${userId}`,
    config,
  );
  return response.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const config = await getConfig();
  const response = await axios.put<orderResponseDTO>(
    `${base_url}/${id}/status`,
    null,
    {
      params: { status: status },
      ...config,
    },
  );
  return response.data;
};

export const deleteOrder = async (id: number) => {
  const config = await getConfig();
  await axios.delete(`${base_url}/${id}`, config);
};
