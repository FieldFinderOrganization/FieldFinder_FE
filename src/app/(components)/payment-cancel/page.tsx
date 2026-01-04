/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiXCircle } from "react-icons/fi";

const PaymentCancelContent = () => {
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const orderCode = searchParams.get("myOrderId");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full border-t-4 border-red-500">
        <div className="flex justify-center mb-6">
          <FiXCircle size={70} className="text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Thanh toán thất bại!
        </h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          Giao dịch của bạn đã bị hủy hoặc xảy ra lỗi trong quá trình xử lý. Vui
          lòng kiểm tra lại thông tin hoặc thử phương thức thanh toán khác.
        </p>

        {orderCode && (
          <div className="bg-red-50 p-3 rounded-lg mb-6 text-sm text-red-700">
            Mã đơn hàng: <span className="font-bold">#{orderCode}</span>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/sportShop/cart"
            className="block w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition shadow-md hover:shadow-lg transform active:scale-95"
          >
            Thử lại thanh toán
          </Link>

          <Link
            href="/home"
            className="block w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Về trang chủ
          </Link>
        </div>

        <div className="mt-8 text-xs text-gray-400">
          Cần hỗ trợ? Liên hệ{" "}
          <a href="#" className="text-blue-500 hover:underline">
            Customer Support
          </a>
        </div>
      </div>
    </div>
  );
};

const PaymentCancelPage = () => {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center text-gray-500">
          Đang xử lý...
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
};

export default PaymentCancelPage;
