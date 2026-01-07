import axios from "axios";

const base_url: string = "http://localhost:8080/api/products";

export interface productReq {
  categoryId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  brand: string;
  sex: string;
  variants?: { size: string; quantity: number }[];
}

export interface ProductVariant {
  size: string;
  quantity: number;
}

export interface productRes {
  id: number;
  name: string;
  description: string;
  categoryName: string;
  price: number;
  salePrice?: number;
  onSalePercent?: number;
  stockQuantity: number;
  imageUrl: string;
  brand: string;
  sex: string;
  variants: ProductVariant[];
}

// --- HELPER: Lấy token từ localStorage và tạo Header ---
const getConfig = () => {
  if (typeof window === "undefined") return {}; // Check SSR

  try {
    // 1. Lấy chuỗi JSON root từ localStorage (key cấu hình trong store.ts là "persist:root" hoặc "root")
    // Trong store.ts bạn để key: "root" -> localStorage key sẽ là "persist:root"
    const persistedState = localStorage.getItem("persist:root");

    if (persistedState) {
      // 2. Parse JSON
      const parsedRoot = JSON.parse(persistedState);

      // 3. Lấy slice "auth" (nó cũng là một chuỗi JSON stringified)
      if (parsedRoot.auth) {
        const authState = JSON.parse(parsedRoot.auth);

        // 4. Lấy token
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

export const getAllProducts = async () => {
  const response = await axios.get<productRes[]>(base_url, getConfig());
  return response.data;
};

export const getProductById = async (id: string | number) => {
  const response = await axios.get<productRes>(
    `${base_url}/${id}`,
    getConfig()
  );
  return response.data;
};

export const createProduct = async (payload: productReq) => {
  const response = await axios.post<productRes>(base_url, payload, getConfig());
  return response.data;
};

export const updateProduct = async (
  payload: productReq,
  id: string | number
) => {
  const response = await axios.put<productRes>(
    `${base_url}/${id}`,
    payload,
    getConfig()
  );
  return response.data;
};

export const deleteProduct = async (id: string | number) => {
  await axios.delete(`${base_url}/${id}`, getConfig());
};

export const getProductsByCategories = async (categories: string[]) => {
  const params = new URLSearchParams();
  categories.forEach((cat) => params.append("categories", cat));

  const response = await axios.get<productRes[]>(
    `${base_url}/by-categories?${params.toString()}`,
    getConfig()
  );
  return response.data;
};

export const getTopSellingProducts = async () => {
  const response = await axios.get<productRes[]>(
    `${base_url}/top-selling`,
    getConfig()
  );
  return response.data;
};
