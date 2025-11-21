"use client";

import React from "react";
import { productRes } from "@/services/product";
import { FiPlus } from "react-icons/fi";
import Link from "next/link";
import { useFavourite } from "@/context/FavouriteContext";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: productRes;
}

// Định nghĩa variants (kịch bản animation)
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(product.price);

  const { toggleFavourite, isFavourited } = useFavourite();
  const isFav = isFavourited(product.id);

  return (
    <motion.div
      className="flex flex-col gap-2 relative"
      variants={cardVariants}
    >
      <Link href={`/sportShop/product/${product.id}`}>
        <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square group">
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
        <h3 className="font-bold text-lg truncate mb-[-1rem]">
          {product.name}
        </h3>
         
        <p className="text-gray-600">
          {product.sex}'s {product.categoryName}
        </p>
        <p className="font-semibold text-base mt-1">{formattedPrice}</p>
      </div>
      <button
        onClick={() => toggleFavourite(product)}
        title={isFav ? "Remove from Favourite" : "Add to Favourite"}
        className="absolute bottom-0 right-0 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg 
                   transition-all duration-200 hover:scale-110 hover:bg-black hover:text-white cursor-pointer"
      >
        {isFav ? (
          <IoMdHeart size={24} className="text-red-500" />
        ) : (
          <IoMdHeartEmpty size={24} />
        )}
      </button>
    </motion.div>
  );
};

export default ProductCard;
