"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { cartItemRes } from "@/services/cartItem";
import { FiTrash2 } from "react-icons/fi";
import Link from "next/link";
import ShopPaymentModal from "@/utils/shopPaymentModal";
import GuestInfoModal from "@/utils/guestInfoModal";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const CartItemRow: React.FC<{ item: cartItemRes }> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const formattedPrice = new Intl.NumberFormat("vi-VN").format(
    item.priceAtTime
  );
  return (
    <div className="flex gap-4 border-b border-gray-200 py-6">
      <Link href={`/sportShop/product/${item.productId}`}>
        <img
          src={item.imageUrl}
          alt={item.productName}
          className="w-32 h-32 object-cover rounded-lg bg-gray-100"
        />
      </Link>
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-medium">{item.productName}</h3>
          <p className="text-gray-500">{item.size}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="px-3 py-1 text-lg cursor-pointer"
            >
              -
            </button>
            <span className="px-4 py-1 border-x border-gray-300">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="px-3 py-1 text-lg cursor-pointer"
            >
              +
            </button>
          </div>
          <button onClick={() => removeFromCart(item.id)} title="Remove item">
            <FiTrash2
              className="text-gray-600 hover:text-red-600 cursor-pointer"
              size={20}
            />
          </button>
        </div>
      </div>
      <div className="text-lg font-semibold">
        <p>{formattedPrice} VND</p>
      </div>
    </div>
  );
};

const CartPage = () => {
  const { cartItems, getSubtotal, loadingCart } = useCart();
  const subtotal = getSubtotal();
  const formattedSubtotal = new Intl.NumberFormat("vi-VN").format(subtotal);
  const isAuthenticated = useSelector(
    (state: any) => state.auth.isAuthenticated
  );

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestInfo, setGuestInfo] = useState<any>(null);

  const handleMemberCheckout = () => {
    if (!isAuthenticated) {
      toast.warn("Vui lòng đăng nhập để sử dụng Member Checkout");
      return;
    }
    setGuestInfo(null);
    setIsPaymentOpen(true);
  };

  const handleGuestCheckout = () => {
    if (isAuthenticated) {
      toast.info("Bạn đã đăng nhập, chuyển sang thanh toán thành viên.");
      handleMemberCheckout();
      return;
    }
    setIsGuestModalOpen(true);
  };

  const handleGuestConfirm = (info: any) => {
    setGuestInfo(info);
    setIsGuestModalOpen(false);
    setIsPaymentOpen(true);
  };

  if (loadingCart) {
    return (
      <div className="container mx-auto max-w-6xl p-6 mt-10 text-center">
        <h1 className="text-3xl font-semibold">Loading Cart...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-6 mt-10">
      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-medium mb-4">Your cart is empty.</h2>
          <Link
            href="/sportShop/product"
            className="bg-black text-white px-6 py-3 rounded-full font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-semibold mb-8">Cart</h1>
            <div>
              {cartItems.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: SUMMARY */}
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-medium mb-8">Summary</h2>
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
                <div className="flex justify-between items-center font-bold text-xl">
                  <p>Total</p>
                  <p>VND {formattedSubtotal}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <button
                  onClick={handleGuestCheckout}
                  className="bg-gray-800 text-white p-4 rounded-full text-lg font-medium hover:bg-black transition cursor-pointer"
                >
                  Guest Checkout
                </button>

                <button
                  onClick={handleMemberCheckout}
                  className="bg-black text-white p-4 rounded-full text-lg font-medium hover:bg-gray-800 transition cursor-pointer"
                >
                  Member Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <GuestInfoModal
        open={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onConfirm={handleGuestConfirm}
      />

      <ShopPaymentModal
        open={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        guestInfo={guestInfo}
      />
    </div>
  );
};

export default CartPage;
