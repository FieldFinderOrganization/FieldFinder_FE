"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { productRes } from "@/services/product"; // Import type sản phẩm
import { toast } from "react-toastify"; // Import toast (nếu bạn muốn)

// 1. Định nghĩa Context sẽ chia sẻ những gì
interface FavouriteContextType {
  favourites: productRes[];
  toggleFavourite: (product: productRes) => void;
  isFavourited: (productId: number) => boolean;
  getFavouriteCount: () => number;
}

// 2. Tạo Context
const FavouriteContext = createContext<FavouriteContextType | undefined>(
  undefined
);

// 3. Tạo Provider
export const FavouriteProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [favourites, setFavourites] = useState<productRes[]>([]);

  // 4. Load Favourites từ localStorage khi app khởi động
  useEffect(() => {
    const storedFavourites = localStorage.getItem("mtkicks_favourites");
    if (storedFavourites) {
      setFavourites(JSON.parse(storedFavourites));
    }
  }, []);

  // 5. Lưu Favourites vào localStorage mỗi khi nó thay đổi
  useEffect(() => {
    if (favourites.length > 0) {
      localStorage.setItem("mtkicks_favourites", JSON.stringify(favourites));
    } else {
      localStorage.removeItem("mtkicks_favourites");
    }
  }, [favourites]);

  // --- CÁC HÀM XỬ LÝ ---

  // Kiểm tra xem 1 SP có trong list hay không
  const isFavourited = (productId: number) => {
    return favourites.some((p) => p.id === productId);
  };

  // Thêm hoặc Xóa khỏi Favourites
  const toggleFavourite = (product: productRes) => {
    if (isFavourited(product.id)) {
      // ĐÃ CÓ -> Xóa
      setFavourites((prev) => prev.filter((p) => p.id !== product.id));
      toast.info("Đã xóa khỏi mục Yêu thích");
    } else {
      // CHƯA CÓ -> Thêm
      setFavourites((prev) => [...prev, product]);
      toast.success("Đã thêm vào mục Yêu thích");
    }
  };

  // Lấy tổng số lượng (cho badge)
  const getFavouriteCount = () => {
    return favourites.length;
  };

  // 6. Cung cấp giá trị
  const value = {
    favourites,
    toggleFavourite,
    isFavourited,
    getFavouriteCount,
  };

  return (
    <FavouriteContext.Provider value={value}>
      {children}
    </FavouriteContext.Provider>
  );
};

// 7. Tạo Hook (để dễ xài)
export const useFavourite = () => {
  const context = useContext(FavouriteContext);
  if (context === undefined) {
    throw new Error("useFavourite must be used within a FavouriteProvider");
  }
  return context;
};
