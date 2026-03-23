/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector } from "react-redux";
import { useCart } from "@/context/CartContext";
import { toast } from "react-toastify";
import { createShopPayment, ShopPaymentRequestDTO } from "@/services/payment";
import { getItemsByCartId, cartItemRes } from "@/services/cartItem";
import { discountRes, getAllDiscounts, getMyWallet } from "@/services/discount";
import DiscountModal from "./discountModal";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { createOrder, orderRequestDTO } from "@/services/order";

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

  const currentUserId = currentUser?.userId;

  const { cartItems: contextCartItems, clearCart } = useCart();

  const [customItems, setCustomItems] = useState<cartItemRes[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(false);

  const calculateItemCurrentPrice = (
    item: any,
    selectedDiscounts: discountRes[],
  ) => {
    const originalPrice = (item as any).originalPrice ?? item.priceAtTime;

    if (selectedDiscounts.length === 0) return originalPrice;

    const activeCodes = new Set(selectedDiscounts.map((d) => d.code));
    const itemDiscounts = (item as any).appliedDiscounts || [];

    const validDiscounts = itemDiscounts.filter((d: any) =>
      activeCodes.has(d.code),
    );

    let currentPrice = originalPrice;

    validDiscounts.forEach((d: any) => {
      let discountAmount = 0;
      const val = d.value ?? d.percentage ?? 0;

      if (d.discountType === "FIXED_AMOUNT") {
        discountAmount = val;
      } else {
        discountAmount = (currentPrice * val) / 100;

        if (d.maxDiscountAmount && discountAmount > d.maxDiscountAmount) {
          discountAmount = d.maxDiscountAmount;
        }
      }

      currentPrice -= discountAmount;
    });

    return currentPrice < 0 ? 0 : currentPrice;
  };

  const normalizeDiscount = (raw: any): discountRes => ({
    id: raw.id ?? raw.discountId ?? raw.userDiscountId ?? raw.code,
    code: raw.code ?? raw.discountCode,
    description: raw.description,
    discountType: raw.discountType ?? raw.type,
    value: raw.value,
    minOrderValue: raw.minOrderValue,
    maxDiscountAmount: raw.maxDiscountAmount,
    quantity: raw.quantity ?? 0,
    startDate: raw.startDate,
    endDate: raw.endDate,
    status: raw.status ?? "ACTIVE",
  });

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

  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [selectedDiscounts, setSelectedDiscounts] = useState<discountRes[]>([]);

  useEffect(() => {
    const enrichAndSelectDiscounts = async () => {
      if (!open || finalCartItems.length === 0) return;

      const appliedCodes = new Set<string>();
      finalCartItems.forEach((item) => {
        const itemDiscounts = (item as any).appliedDiscounts;
        if (Array.isArray(itemDiscounts)) {
          itemDiscounts.forEach((d: any) => appliedCodes.add(d.code));
        }
      });

      if (appliedCodes.size === 0) {
        setSelectedDiscounts([]);
        return;
      }

      try {
        let allDiscounts: discountRes[] = [];

        if (currentUserId && !isGuest) {
          const walletData = await getMyWallet(currentUserId);
          if (Array.isArray(walletData)) {
            allDiscounts = walletData.map(normalizeDiscount);
          }
        } else {
          allDiscounts = await getAllDiscounts();
        }

        const fullDiscountsToSelect = allDiscounts.filter((d) =>
          appliedCodes.has(d.code),
        );

        if (fullDiscountsToSelect.length > 0) {
          setSelectedDiscounts(fullDiscountsToSelect);
        }
      } catch (error) {
        console.error("Lỗi đồng bộ mã giảm giá:", error);
      }
    };

    enrichAndSelectDiscounts();
  }, [finalCartItems, open, currentUserId, isGuest]);

  const totalOriginalPrice = useMemo(() => {
    return finalCartItems.reduce((total, item) => {
      const original = (item as any).originalPrice;
      return total + original * item.quantity;
    }, 0);
  }, [finalCartItems]);

  const finalTotal = useMemo(() => {
    return finalCartItems.reduce((total, item) => {
      return (
        total +
        calculateItemCurrentPrice(item, selectedDiscounts) * item.quantity
      );
    }, 0);
  }, [finalCartItems, selectedDiscounts]);

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
      const orderPayload: orderRequestDTO = {
        userId: isGuest ? "GUEST" : currentUser.userId,
        paymentMethod: paymentMethod,
        discountCodes: selectedDiscounts.map((d) => d.code),
        items: finalCartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
        })),
      };

      const orderResponse = await createOrder(orderPayload);

      // ✅ If CASH payment, just show success message and close modal
      if (paymentMethod === "CASH") {
        toast.success("Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.", {
          autoClose: 5000,
          position: "top-center",
        });

        // Clear cart if not using custom cart (AI cart)
        if (!customCartId) {
          await clearCart();
        }

        // Reset selected discounts
        setSelectedDiscounts([]);

        // Close modal
        onClose();

        return; // ⚠️ IMPORTANT: Exit here, don't continue to payment gateway
      }

      // ✅ For BANK payment, proceed with PayOS
      const payload: ShopPaymentRequestDTO = {
        orderCode: orderResponse.orderId,
        userId: isGuest ? "GUEST" : currentUser.userId,
        amount: finalTotal,
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
        // Clear cart before redirecting to payment gateway
        if (!customCartId) {
          await clearCart();
        }
        setSelectedDiscounts([]);

        // Redirect to PayOS payment page
        window.location.href = paymentRes.checkoutUrl;
      } else {
        toast.error("Không nhận được link thanh toán từ PayOS");
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
    <div>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", md: 800 },
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

          <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6 md:gap-8">
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
                    {finalCartItems.map((item) => {
                      const dynamicPrice = calculateItemCurrentPrice(
                        item,
                        selectedDiscounts,
                      );
                      const originalPrice = (item as any).originalPrice;

                      return (
                        <div
                          key={item.productId}
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
                                originalPrice,
                              )}{" "}
                              ₫
                            </p>

                            {originalPrice > dynamicPrice && (
                              <p className="text-xs text-red-500 font-semibold">
                                Sau giảm:{" "}
                                {new Intl.NumberFormat("vi-VN").format(
                                  dynamicPrice,
                                )}{" "}
                                ₫
                              </p>
                            )}

                            <p className="text-xs text-gray-500 mt-1">
                              Tổng cộng:{" "}
                              {new Intl.NumberFormat("vi-VN").format(
                                dynamicPrice * item.quantity,
                              )}{" "}
                              ₫
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full md:w-2/5 flex flex-col gap-5 border-l border-gray-100 pl-0 md:pl-8">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Typography variant="subtitle1" fontWeight={700}>
                    🎫 Mã khuyến mãi
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setIsDiscountModalOpen(true)}
                    sx={{
                      textTransform: "none",
                      fontWeight: "bold",
                      color: "#FE2A00",
                    }}
                  >
                    Chọn mã
                  </Button>
                </div>

                {selectedDiscounts.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {selectedDiscounts.map((discount) => {
                      const val =
                        discount.value ?? (discount as any).percentage ?? 0;
                      return (
                        <div
                          key={discount.id}
                          className="flex justify-between items-center p-2 bg-red-50 border border-red-100 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <CardGiftcardIcon
                              sx={{ color: "#FE2A00", fontSize: 20 }}
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-800">
                                {discount.code}
                              </span>
                              <span className="text-xs text-red-600">
                                {discount.discountType === "FIXED_AMOUNT"
                                  ? `-${val.toLocaleString()}đ`
                                  : `-${val}%`}
                              </span>
                            </div>
                          </div>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setSelectedDiscounts((prev) =>
                                prev.filter((d) => d.id !== discount.id),
                              )
                            }
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    onClick={() => setIsDiscountModalOpen(true)}
                    className="border border-dashed border-gray-300 rounded-lg p-3 text-center text-sm text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    Chưa áp dụng mã nào
                  </div>
                )}
              </div>

              <Divider />

              <div>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  className="text-gray-800 mb-3"
                >
                  💳 Phương thức thanh toán
                </Typography>
                <div className="flex flex-col gap-3">
                  <div
                    className={`relative rounded-xl border-2 p-3 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === "BANK" ? "border-blue-600 bg-blue-50/50" : "border-gray-200"}`}
                    onClick={() => setPaymentMethod("BANK")}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "BANK" ? "border-blue-600" : "border-gray-400"}`}
                    >
                      {paymentMethod === "BANK" && (
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-800 block">
                        Chuyển khoản ngân hàng
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Quét mã QR qua PayOS
                      </span>
                    </div>
                  </div>
                  <div
                    className={`relative rounded-xl border-2 p-3 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === "CASH" ? "border-blue-600 bg-blue-50/50" : "border-gray-200"}`}
                    onClick={() => setPaymentMethod("CASH")}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "CASH" ? "border-blue-600" : "border-gray-400"}`}
                    >
                      {paymentMethod === "CASH" && (
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-800 block">
                        Thanh toán khi nhận hàng
                      </span>
                      <span className="text-[10px] text-gray-500">
                        COD (Cash on Delivery)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-600">Tổng tiền hàng (Gốc):</span>
                  <span className="font-medium line-through text-gray-400">
                    {totalOriginalPrice.toLocaleString("vi-VN")} ₫
                  </span>
                </div>

                {totalOriginalPrice > finalTotal && (
                  <div className="flex justify-between mb-2 text-sm text-blue-600">
                    <span className="font-medium">Tổng tiết kiệm:</span>
                    <span className="font-medium">
                      -
                      {(totalOriginalPrice - finalTotal).toLocaleString(
                        "vi-VN",
                      )}{" "}
                      ₫
                    </span>
                  </div>
                )}

                {selectedDiscounts.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 block mb-1">
                      Mã đã áp dụng:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedDiscounts.map((d) => (
                        <span
                          key={d.id}
                          className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded border border-red-200 font-bold"
                        >
                          {d.code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

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
                    {finalTotal.toLocaleString("vi-VN")} ₫
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
                  py: 1.5,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": { bgcolor: "#000000" },
                  "&:disabled": { bgcolor: "#9CA3AF", color: "#F3F4F6" },
                }}
              >
                {isProcessing
                  ? "Đang xử lý..."
                  : `Thanh toán ${finalTotal.toLocaleString("vi-VN")} ₫`}
              </Button>
            </div>
          </div>
        </Box>
      </Modal>

      <DiscountModal
        open={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        selectedDiscounts={selectedDiscounts}
        setSelectedDiscounts={setSelectedDiscounts}
        orderValue={totalOriginalPrice}
        products={finalCartItems}
        userId={currentUser?.userId}
      />
    </div>
  );
};

export default ShopPaymentModal;
