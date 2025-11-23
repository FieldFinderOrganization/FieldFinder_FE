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
}

export interface orderResponseDTO {
  orderId: number;
  userName: string;
  totalAmount: number;
  status: string;
  paymentMethod: string; // BANK OR CASH
  createdAt: string;
  items: orderItemResponseDTO[];
}

export interface orderRequestDTO {
  userId: string;
  items: orderItemRequestDTO[];
  paymentMethod: string; // BANK OR CASH
}

export const createOrder = async (payload: orderRequestDTO) => {
  const response = await axios.post<orderResponseDTO>(base_url, payload);
  return response.data;
};

export const getAllOrders = async () => {
  const response = await axios.get<orderResponseDTO[]>(base_url);
  return response.data;
};

export const getOrderById = async (id: string) => {
  const response = await axios.get<orderResponseDTO>(`${base_url}/${id}`);
  return response.data;
};

export const getOrdersByUserId = async (userId: string) => {
  const response = await axios.get<orderResponseDTO[]>(
    `${base_url}/user/${userId}`
  );
  return response.data;
};

export const updateOrderStatus = async (id: number, status: string) => {
  const response = await axios.put<orderResponseDTO>(
    `${base_url}/${id}/status`,
    null,
    {
      params: { status: status },
    }
  );
  return response.data;
};

export const deleteOrder = async (id: number) => {
  await axios.delete(`${base_url}/${id}`);
};
