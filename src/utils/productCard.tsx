"use client";

import React from "react";
import { productRes } from "@/services/product";
import { FiPlus } from "react-icons/fi";
import { useFavourite } from "@/context/FavouriteContext";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import Link from "next/link";

interface ProductCardProps {
  product: productRes;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(product.price);

  const { toggleFavourite, isFavourited } = useFavourite();
  const isFav = isFavourited(product.id);

  return (
    <div className="flex flex-col gap-2 relative">
      <Link href={`product/${product.id}`}>
        <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square  group">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
          />
          <span className="absolute top-3 right-3 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Best Seller
          </span>
        </div>
      </Link>

      <div>
        <h3 className="font-bold text-lg truncate">{product.name}</h3>
        <p className="text-gray-600">
          {product.sex}'s {product.categoryName}
        </p>
        <p className="font-semibold text-base mt-1">{formattedPrice}</p>
      </div>

      {/* Nút Plus */}
      <button
        onClick={() => toggleFavourite(product)}
        title={isFav ? "Xóa khỏi Yêu thích" : "Thêm vào Yêu thích"}
        className="absolute bottom-0 right-0 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 hover:bg-black hover:text-white cursor-pointer"
      >
        {isFav ? (
          <IoMdHeart size={24} className="text-red-500" />
        ) : (
          <IoMdHeartEmpty size={24} />
        )}
      </button>
    </div>
  );
};

export default ProductCard;
