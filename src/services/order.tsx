import axios from "axios";

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

export const createOrder = async (payload: orderRequestDTO) => {
  const response = await axios.post<orderResponseDTO>(base_url, payload, getConfig());
  return response.data;
};

export const getAllOrders = async () => {
  const response = await axios.get<orderResponseDTO[]>(base_url, getConfig());
  return response.data;
};

export const getOrderById = async (id: string) => {
  const response = await axios.get<orderResponseDTO>(`${base_url}/${id}`, getConfig());
  return response.data;
};

export const getOrdersByUserId = async (userId: string) => {
  const response = await axios.get<orderResponseDTO[]>(
    `${base_url}/user/${userId}`,
    getConfig()
  );
  return response.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const response = await axios.put<orderResponseDTO>(
    `${base_url}/${id}/status`,
    null,
    {
      params: { status: status },
      ...getConfig()
    }
  );
  return response.data;
};

export const deleteOrder = async (id: number) => {
  await axios.delete(`${base_url}/${id}`, getConfig());
};
