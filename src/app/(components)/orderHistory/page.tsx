"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getOrdersByUserId, orderResponseDTO } from "@/services/order";
import { toast } from "react-toastify";
import Link from "next/link";
import dayjs from "dayjs";
import Header from "@/utils/header";
import { Pagination, Stack, Tooltip } from "@mui/material";
import {
  FiPackage,
  FiCreditCard,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import RetryPaymentModal from "@/utils/reTryPaymentModal";

const ITEMS_PER_PAGE = 10;

const OrderHistoryPage = () => {
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const [orders, setOrders] = useState<orderResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [retryOrder, setRetryOrder] = useState<orderResponseDTO | null>(null);
  const [isRetryModalOpen, setIsRetryModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const data: orderResponseDTO[] = await getOrdersByUserId(user.userId);
        const sortedOrders = data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast.error("Không thể tải lịch sử đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user]);

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusClick = (order: orderResponseDTO) => {
    if (order.status === "PENDING" || order.status === "FAILED") {
      setRetryOrder(order);
      setIsRetryModalOpen(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Vui lòng đăng nhập
        </h2>
        <Link
          href="/login"
          className="text-blue-600 hover:underline font-medium"
        >
          Đi tới trang đăng nhập &rarr;
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-12 pt-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
            <FiPackage size={24} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Lịch sử đặt hàng</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <FiPackage size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-gray-500 mb-8">
              Hãy khám phá các sản phẩm thể thao chất lượng của chúng tôi.
            </p>
            <Link
              href="/sportShop/product"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-black hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Bắt đầu mua sắm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {currentOrders.map((order) => {
              const isPending = order.status === "PENDING";
              const isConfirmed =
                order.status === "CONFIRMED" || order.status === "PAID";
              const isCancelled = order.status === "CANCELLED";

              return (
                <div
                  key={order.orderId}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {/* Header Card */}
                  <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-600">
                      <div>
                        <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Mã đơn hàng
                        </span>
                        <span className="font-bold text-gray-900 text-base">
                          #{order.orderId}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Ngày đặt
                        </span>
                        <span className="font-medium">
                          {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Tổng tiền
                        </span>
                        <span className="font-bold text-gray-900 text-base">
                          {new Intl.NumberFormat("vi-VN").format(
                            order.totalAmount
                          )}{" "}
                          đ
                        </span>
                      </div>
                    </div>

                    <Tooltip
                      title={isPending ? "Nhấn để thanh toán ngay" : ""}
                      arrow
                    >
                      <div
                        onClick={() => handleStatusClick(order)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all
                            ${
                              isConfirmed
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : isCancelled
                                  ? "bg-red-100 text-red-700 border border-red-200"
                                  : "bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200 ring-2 ring-transparent hover:ring-yellow-200"
                            }`}
                      >
                        {isConfirmed && <FiCheckCircle size={14} />}
                        {isCancelled && <FiAlertCircle size={14} />}
                        {isPending && <FiCreditCard size={14} />}
                        {order.status}
                        {isPending && (
                          <span className="ml-1 text-[10px] opacity-70 normal-case">
                            (Thanh toán)
                          </span>
                        )}
                      </div>
                    </Tooltip>
                  </div>

                  {/* Body Card */}
                  <div className="px-6 py-2 divide-y divide-gray-50">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-4 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 flex-shrink-0 overflow-hidden border border-gray-100 relative">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FiPackage size={24} />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {item.productName}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                                x{item.quantity}
                              </span>
                              <span>•</span>
                              <span>
                                {new Intl.NumberFormat("vi-VN").format(
                                  item.price / item.quantity
                                )}{" "}
                                đ/sp
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-medium text-gray-900">
                          {new Intl.NumberFormat("vi-VN").format(item.price)} đ
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Card */}
                  <div className="bg-gray-50/30 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FiClock />
                      <span>
                        Cập nhật: {dayjs(order.createdAt).format("DD/MM/YYYY")}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500 mr-2">
                        Thanh toán qua:
                      </span>
                      <span className="font-semibold text-gray-900 bg-white border border-gray-200 px-2 py-1 rounded">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {orders.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center mt-10">
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                shape="rounded"
              />
            </Stack>
          </div>
        )}
      </div>

      <RetryPaymentModal
        open={isRetryModalOpen}
        onClose={() => setIsRetryModalOpen(false)}
        order={retryOrder}
        userId={user?.userId || ""}
        userName={user?.name || ""}
      />
    </div>
  );
};

export default OrderHistoryPage;
