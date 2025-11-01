"use client";

import React from "react";
import { useFavourite } from "@/context/FavouriteContext";
import { productRes } from "@/services/product";
import Link from "next/link";
import { IoMdHeart } from "react-icons/io";
import { FaCheck } from "react-icons/fa"; // Icon "Added"

// Component Card cho trang Favourites
const FavouriteCard: React.FC<{ product: productRes }> = ({ product }) => {
  const { toggleFavourite } = useFavourite();

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(product.price);

  return (
    <div className="flex flex-col gap-3">
      {/* Ảnh */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square group">
        <Link href={`/sportShop/product/${product.id}`}>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        {/* Nút Tim (để XÓA) */}
        <button
          onClick={() => toggleFavourite(product)}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition"
          title="Remove from Favourites"
        >
          <IoMdHeart size={20} className="text-red-500" />
        </button>
      </div>

      {/* Info */}
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <h3 className="font-bold text-lg truncate">{product.name}</h3>
          <p className="text-gray-600">{product.description}</p>
        </div>
        <p className="font-semibold text-base ml-2">{formattedPrice}</p>
      </div>

      {/* Nút Added (như trong ảnh) */}
      <button
        onClick={() => toggleFavourite(product)} // Click cũng là Xóa
        className="w-full border border-gray-300 rounded-lg py-2 px-4 flex items-center justify-center gap-2 text-green-600 font-medium"
      >
        <FaCheck />
        Added
      </button>
    </div>
  );
};

// --- COMPONENT TRANG CHÍNH ---
const FavouritesPage = () => {
  const { favourites } = useFavourite();

  return (
    <div className="container mx-auto max-w-6xl p-6 mt-10">
      <h1 className="text-3xl font-semibold mb-8">Favourites</h1>

      {favourites.length === 0 ? (
        // --- DANH SÁCH RỖNG ---
        <div className="text-center py-20">
          <h2 className="text-2xl font-medium mb-4">
            Your favourites list is empty.
          </h2>
          <Link
            href="/sportShop/product"
            className="bg-black text-white px-6 py-3 rounded-full font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {favourites.map((product) => (
            <FavouriteCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavouritesPage;
