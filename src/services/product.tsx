import axios from "axios";

const base_url: string = "http://localhost:8080/api/products";

// Request DTO (Dữ liệu gửi đi)
export interface productReq {
  categoryId: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  brand: string;
  sex: string;
}

// Response DTO (Dữ liệu nhận về)
export interface productRes {
  id: number;
  name: string;
  description: string;
  categoryName: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  brand: string;
  sex: string;
}

// 1. Lấy tất cả sản phẩm
export const getAllProducts = async () => {
  const response = await axios.get<productRes[]>(base_url);
  return response.data;
};

// 2. Lấy chi tiết 1 sản phẩm theo ID
export const getProductById = async (id: string | number) => {
  const response = await axios.get<productRes>(`${base_url}/${id}`);
  return response.data;
};

// 3. Tạo sản phẩm mới
export const createProduct = async (payload: productReq) => {
  const response = await axios.post<productRes>(base_url, payload);
  return response.data;
};

// 4. Cập nhật sản phẩm
export const updateProduct = async (
  payload: productReq,
  id: string | number
) => {
  const response = await axios.put<productRes>(`${base_url}/${id}`, payload);
  return response.data;
};

// 5. Xóa sản phẩm
export const deleteProduct = async (id: string | number) => {
  await axios.delete(`${base_url}/${id}`);
};
