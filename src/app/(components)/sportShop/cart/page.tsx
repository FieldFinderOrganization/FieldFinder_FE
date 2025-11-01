"use client";

import React from "react";
import { useCart, CartItem } from "@/context/CartContext";
import { FiTrash2, FiHeart } from "react-icons/fi";
import Link from "next/link";

const CartItemRow: React.FC<{ item: CartItem }> = ({ item }) => {
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(item.product.price);

  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex gap-4 border-b border-gray-200 py-6">
      {/* Ảnh */}
      <Link href={`product/${item.product.id}`}>
        <img
          src={item.product.imageUrl}
          alt={item.product.name}
          className="w-32 h-32 object-cover rounded-lg bg-gray-100"
        />
      </Link>

      {/* Thông tin */}
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-medium">{item.product.name}</h3>
          <p className="text-gray-500">{item.product.description}</p>
          <p className="text-gray-500">{item.size}</p>
        </div>

        {/* Nút bấm (Số lượng, Xóa, Tim) */}
        <div className="flex items-center gap-6">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="px-3 py-1 text-lg"
            >
              -
            </button>
            <span className="px-4 py-1 border-x border-gray-300">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="px-3 py-1 text-lg"
            >
              +
            </button>
          </div>
          <button onClick={() => removeFromCart(item.id)} title="Remove item">
            <FiTrash2 className="text-gray-600 hover:text-red-600" size={20} />
          </button>
          <button title="Move to favorites">
            <FiHeart className="text-gray-600 hover:text-black" size={20} />
          </button>
        </div>
      </div>

      {/* Giá tiền */}
      <div className="text-lg font-semibold">
        <p>VND {formattedPrice}</p>
      </div>
    </div>
  );
};

const CartPage = () => {
  const { cartItems, getSubtotal } = useCart();
  const subtotal = getSubtotal();
  const formattedSubtotal = new Intl.NumberFormat("vi-VN").format(subtotal);

  return (
    <div className="container mx-auto max-w-6xl p-6">
      {cartItems.length === 0 ? (
        // --- GIỎ HÀNG RỖNG ---
        <div className="text-center py-20">
          <h2 className="text-2xl font-medium mb-4">Your cart is empty.</h2>
          <Link
            href="sportShop/product"
            className="bg-black text-white px-6 py-3 rounded-full font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        // --- GIỎ HÀNG CÓ ĐỒ ---
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* CỘT TRÁI: CART (2/3) */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">Cart</h2>
            <div className="flex flex-col gap-8">
              {cartItems.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: SUMMARY (1/3) */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-semibold mb-6">Summary</h2>

            <div className="bg-gray-50 p-6 rounded-lg sticky top-28">
              <div className="flex justify-between items-center mb-2 text-gray-600">
                <p>Subtotal</p>
                <p>VND {formattedSubtotal}</p>
              </div>
              <div className="flex justify-between items-center mb-6 text-gray-600">
                <p>Estimated Delivery</p>
                <p>Free</p>
              </div>

              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between items-center font-bold text-lg">
                  <p>Total</p>
                  <p>VND {formattedSubtotal}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <button className="bg-black text-white p-3 rounded-md text-md font-medium hover:bg-gray-800 transition cursor-pointer">
                  Guest Checkout
                </button>
                <button className="bg-black text-white p-3 rounded-md text-md font-semibold hover:bg-gray-800 transition cursor-pointer">
                  Member Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
