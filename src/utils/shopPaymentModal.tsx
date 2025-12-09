"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Box,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector } from "react-redux";
import { useCart } from "@/context/CartContext";
import { toast } from "react-toastify";
import { createShopPayment, ShopPaymentRequestDTO } from "@/services/payment";
import { getItemsByCartId, cartItemRes } from "@/services/cartItem";

interface GuestInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
}

interface ShopPaymentModalProps {
  open: boolean;
  onClose: () => void;
  guestInfo?: GuestInfo | null;
  onPaymentSuccess?: () => void;
  customCartId?: number | null;
}

const ShopPaymentModal: React.FC<ShopPaymentModalProps> = ({
  open,
  onClose,
  guestInfo,
  customCartId,
}) => {
  const reduxUser = useSelector((state: any) => state.auth.user);
  const currentUser = guestInfo || reduxUser;
  const isGuest = !!guestInfo;

  const { cartItems: contextCartItems, getSubtotal, clearCart } = useCart();

  const [customItems, setCustomItems] = useState<cartItemRes[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(false);

  useEffect(() => {
    if (open && customCartId) {
      const fetchCustomCartItems = async () => {
        setLoadingCustom(true);
        try {
          const items = await getItemsByCartId(customCartId);
          setCustomItems(items || []);
        } catch (error) {
          console.error("Lỗi tải giỏ hàng AI:", error);
          toast.error("Không thể tải thông tin đơn hàng");
        } finally {
          setLoadingCustom(false);
        }
      };

      fetchCustomCartItems();
    } else {
      setCustomItems([]);
    }
  }, [open, customCartId]);

  const finalCartItems = customCartId ? customItems : contextCartItems;

  const totalAmount = finalCartItems.reduce(
    (total, item) => total + item.priceAtTime * item.quantity,
    0
  );

  const [paymentMethod, setPaymentMethod] = useState<"BANK" | "CASH">("BANK");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!currentUser || (!currentUser.userId && !isGuest)) {
      toast.error("Thông tin người dùng không hợp lệ.");
      return;
    }

    if (finalCartItems.length === 0) {
      toast.warn("Danh sách sản phẩm trống");
      return;
    }

    setIsProcessing(true);
    try {
      const payload: ShopPaymentRequestDTO = {
        userId: isGuest ? "GUEST" : currentUser.userId,
        amount: totalAmount,
        description: `Thanh toan don hang ${currentUser.name || "Guest"}`,
        paymentMethod: paymentMethod,
        items: finalCartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
        })),
      };

      const paymentRes = await createShopPayment(payload);

      if (paymentRes.checkoutUrl) {
        window.location.href = paymentRes.checkoutUrl;
      } else if (paymentMethod === "CASH") {
        toast.success("Đặt hàng thành công!");

        if (!customCartId) {
          await clearCart();
        }
        onClose();
      }
    } catch (error: any) {
      console.error("Payment failed", error);
      const msg = error.response?.data?.message || "Tạo thanh toán thất bại.";
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
          width: 800,
          maxHeight: "90vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 0,
          borderRadius: 3,
          outline: "none",
        }}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Xác nhận đơn hàng {isGuest ? "(Khách)" : ""}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-3/5 flex flex-col gap-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <Typography
                variant="subtitle1"
                fontWeight={700}
                mb={1}
                className="text-blue-800 flex items-center gap-2"
              >
                👤 Thông tin người nhận
              </Typography>
              <div className="text-sm text-gray-700 space-y-1 pl-1">
                <p>
                  <span className="font-semibold min-w-[80px] inline-block">
                    Họ tên:
                  </span>{" "}
                  {currentUser?.name || "N/A"}
                </p>
                <p>
                  <span className="font-semibold min-w-[80px] inline-block">
                    Email:
                  </span>{" "}
                  {currentUser?.email || "N/A"}
                </p>
                <p>
                  <span className="font-semibold min-w-[80px] inline-block">
                    SĐT:
                  </span>{" "}
                  {currentUser?.phone || "N/A"}
                </p>
                {currentUser?.address && (
                  <p>
                    <span className="font-semibold min-w-[80px] inline-block">
                      Địa chỉ:
                    </span>{" "}
                    {currentUser.address}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                📦 Sản phẩm ({finalCartItems.length})
              </Typography>

              {loadingCustom ? (
                <div className="text-center py-4 text-gray-500">
                  Đang tải thông tin sản phẩm...
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {finalCartItems.map((item) => (
                    <div
                      key={item.id || item.productId}
                      className="flex gap-4 items-start p-3 border border-gray-100 rounded-lg"
                    >
                      <img
                        src={item.imageUrl || "/placeholder.png"}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-md border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold line-clamp-2">
                          {item.productName}
                        </p>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            Size: {item.size}
                          </span>
                          <span className="text-xs">x{item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {new Intl.NumberFormat("vi-VN").format(
                            item.priceAtTime
                          )}{" "}
                          ₫
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Tổng:{" "}
                          {new Intl.NumberFormat("vi-VN").format(
                            item.priceAtTime * item.quantity
                          )}{" "}
                          ₫
                        </p>
                      </div>
                    </div>
                  ))}
                  {finalCartItems.length === 0 && !loadingCustom && (
                    <p className="text-center text-red-500 text-sm">
                      Không tìm thấy sản phẩm trong giỏ hàng này.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-2/5 flex flex-col gap-5 border-l border-gray-100 pl-0 md:pl-8">
            <Typography
              variant="subtitle1"
              fontWeight={700}
              className="text-gray-800"
            >
              💳 Phương thức thanh toán
            </Typography>

            <div className="flex flex-col gap-3">
              <div
                className={`relative rounded-xl border-2 p-4 cursor-pointer flex items-center gap-3 transition-all hover:shadow-md ${
                  paymentMethod === "BANK"
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => setPaymentMethod("BANK")}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "BANK" ? "border-blue-600" : "border-gray-400"}`}
                >
                  {paymentMethod === "BANK" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800">
                    Chuyển khoản ngân hàng
                  </span>
                  <span className="text-xs text-gray-500">
                    Quét mã QR qua PayOS
                  </span>
                </div>
              </div>

              <div
                className={`relative rounded-xl border-2 p-4 cursor-pointer flex items-center gap-3 transition-all hover:shadow-md ${
                  paymentMethod === "CASH"
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => setPaymentMethod("CASH")}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "CASH" ? "border-blue-600" : "border-gray-400"}`}
                >
                  {paymentMethod === "CASH" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800">
                    Thanh toán khi nhận hàng
                  </span>
                  <span className="text-xs text-gray-500">
                    COD (Cash on Delivery)
                  </span>
                </div>
              </div>
            </div>

            <Divider sx={{ my: 1 }} />

            <div className="mt-auto bg-gray-50 p-4 rounded-xl">
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">
                  {totalAmount.toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <div className="flex justify-between mb-3 text-sm">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="text-green-600 font-medium">Miễn phí</span>
              </div>
              <Divider sx={{ my: 1, borderStyle: "dashed" }} />
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-gray-800">
                  Tổng thanh toán:
                </span>
                <span className="text-xl font-bold text-red-600">
                  {totalAmount.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>

            <Button
              variant="contained"
              fullWidth
              onClick={handlePayment}
              disabled={isProcessing}
              sx={{
                mt: 1,
                bgcolor: "#111827",
                color: "white",
                fontWeight: "bold",
                py: 1.8,
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "1rem",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                "&:hover": {
                  bgcolor: "#000000",
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                },
                "&:disabled": { bgcolor: "#9CA3AF", color: "#F3F4F6" },
              }}
            >
              {isProcessing
                ? "Đang xử lý..."
                : `Thanh toán ${totalAmount.toLocaleString("vi-VN")} ₫`}
            </Button>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default ShopPaymentModal;
