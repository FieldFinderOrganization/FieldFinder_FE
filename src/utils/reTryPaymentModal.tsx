/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Button,
  Modal,
  Box,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { createShopPayment, ShopPaymentRequestDTO } from "@/services/payment";
import { orderResponseDTO } from "@/services/order";

interface RetryPaymentModalProps {
  open: boolean;
  onClose: () => void;
  order: orderResponseDTO | null;
  userId: string;
  userName: string;
}

const RetryPaymentModal: React.FC<RetryPaymentModalProps> = ({
  open,
  onClose,
  order,
  userId,
  userName,
}) => {
  console.log(order);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!order) return null;

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Chuẩn bị payload từ thông tin đơn hàng cũ
      const payload: ShopPaymentRequestDTO = {
        orderCode: order.orderId,
        userId: userId,
        amount: order.totalAmount,
        description: `Thanh toan lai don hang #${order.orderId}`,
        paymentMethod: "BANK", // Chỉ hỗ trợ BANK như bạn yêu cầu
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
        })),
      };

      const paymentRes = await createShopPayment(payload);

      if (paymentRes.checkoutUrl) {
        window.location.href = paymentRes.checkoutUrl;
      } else {
        toast.error("Không thể tạo link thanh toán. Vui lòng thử lại.");
      }
    } catch (error: any) {
      console.error("Retry payment failed", error);
      const msg = error.response?.data?.message || "Thanh toán thất bại.";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 0,
          borderRadius: 3,
          outline: "none",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 sticky top-0 z-10 rounded-t-xl">
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Thanh toán lại đơn hàng #{order.orderId}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-gray-700">
            <p className="mb-1">
              <span className="font-bold">Người đặt:</span> {userName}
            </p>
            <p className="mb-1">
              <span className="font-bold">Tổng tiền:</span>{" "}
              {new Intl.NumberFormat("vi-VN").format(order.totalAmount)} đ
            </p>
            <p>
              <span className="font-bold">Số lượng SP:</span>{" "}
              {order.items.length}
            </p>
          </div>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Bạn đang thực hiện thanh toán lại cho đơn hàng này qua phương thức{" "}
            <b>Chuyển khoản ngân hàng (PayOS)</b>.
          </Typography>

          <Divider />

          <div className="flex justify-end gap-3 mt-2">
            <Button onClick={onClose} sx={{ color: "gray" }}>
              Hủy bỏ
            </Button>
            <Button
              variant="contained"
              onClick={handlePayment}
              disabled={isProcessing}
              sx={{
                bgcolor: "#111827",
                color: "white",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#000000" },
              }}
            >
              {isProcessing ? "Đang xử lý..." : "Thanh toán ngay"}
            </Button>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default RetryPaymentModal;
