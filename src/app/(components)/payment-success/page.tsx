/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { updateOrderStatus } from "@/services/order";
import { toast } from "react-toastify";

const PaymentStatusContent = () => {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const orderCode = searchParams.get("myOrderId");

  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!orderCode || isUpdating) return;

      if (code === "00") {
        setIsUpdating(true);
        try {
          await updateOrderStatus(orderCode, "PAID");
          setIsSuccess(true);
          toast.success("Xác nhận thanh toán thành công!");
        } catch (error) {
          console.error("Lỗi cập nhật trạng thái:", error);
          toast.error("Có lỗi khi cập nhật trạng thái đơn hàng.");
        } finally {
          setIsUpdating(false);
        }
      }
    };

    confirmPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, orderCode]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
        {code === "00" ? (
          <>
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600 mb-6">
              Mã đơn hàng:{" "}
              <span className="font-bold text-black">#{orderCode}</span>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Thanh toán thất bại hoặc bị hủy
            </h1>
            <p className="text-gray-600 mb-6">
              Vui lòng thử lại hoặc liên hệ hỗ trợ.
            </p>
          </>
        )}

        <Link
          href="/orderHistory"
          className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Lịch sử đặt hàng
        </Link>
      </div>
    </div>
  );
};

const PaymentSuccessPage = () => {
  return (
    <Suspense fallback={<div>Đang xử lý kết quả thanh toán...</div>}>
      <PaymentStatusContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;
