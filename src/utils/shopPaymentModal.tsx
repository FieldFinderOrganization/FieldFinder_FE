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
import { discountRes, getAllDiscounts } from "@/services/discount";
import DiscountModal from "./discountModal"; // Ensure this path is correct
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reduxUser = useSelector((state: any) => state.auth.user);
  const currentUser = guestInfo || reduxUser;
  const isGuest = !!guestInfo;

  const { cartItems: contextCartItems, clearCart } = useCart();

  const [customItems, setCustomItems] = useState<cartItemRes[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(false);

  // --- 1. Fetch Items Logic ---
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

  // --- Discount Logic Initialization ---
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [selectedDiscounts, setSelectedDiscounts] = useState<discountRes[]>([]);

  useEffect(() => {
    const enrichAndSelectDiscounts = async () => {
      // Chỉ chạy khi modal mở và có sản phẩm
      if (!open || finalCartItems.length === 0) return;

      // 1. Thu thập các mã đã áp dụng từ CartItems (Dữ liệu Lite từ BE)
      const appliedCodes = new Set<string>();
      finalCartItems.forEach((item) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const itemDiscounts = (item as any).appliedDiscounts;
        if (Array.isArray(itemDiscounts)) {
          itemDiscounts.forEach((d: any) => appliedCodes.add(d.code));
        }
      });

      // Nếu không có mã nào từ BE hoặc user đã tự chọn mã rồi thì thôi
      if (appliedCodes.size === 0 || selectedDiscounts.length > 0) return;

      try {
        // 2. Fetch tất cả discount đầy đủ để lấy thông tin Scope, MinOrder...
        const allDiscounts = await getAllDiscounts();

        // 3. Lọc ra các discount khớp với mã đã áp dụng
        const fullDiscountsToSelect = allDiscounts.filter((d) =>
          appliedCodes.has(d.code)
        );

        if (fullDiscountsToSelect.length > 0) {
          setSelectedDiscounts(fullDiscountsToSelect);
        }
      } catch (error) {
        console.error("Lỗi đồng bộ mã giảm giá:", error);
      }
    };

    enrichAndSelectDiscounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalCartItems, open]);

  // --- 2. Calculate Subtotal (LOGIC MỚI: DÙNG GIÁ GỐC) ---
  const subTotal = useMemo(() => {
    return finalCartItems.reduce((total, item) => {
      // Ưu tiên dùng originalPrice nếu có, để tính tổng tiền gốc
      // Nếu không có originalPrice (API cũ), fallback về priceAtTime
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const basePrice = (item as any).originalPrice ?? item.priceAtTime;
      return total + basePrice * item.quantity;
    }, 0);
  }, [finalCartItems]);

  // --- 3. Discount Amount Calculation ---
  const discountAmount = useMemo(() => {
    return selectedDiscounts.reduce((sum, discount) => {
      // Ép kiểu để truy cập các trường mới từ backend
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = discount as any;

      const minOrder = d.minOrderValue || 0;

      // 1. Kiểm tra Min Order (trên tổng đơn hàng)
      if (minOrder > 0 && subTotal < minOrder) return sum;

      // 2. Xác định giá trị tính giảm giá (Applicable Subtotal) dựa trên Scope
      const scope = d.scope || "GLOBAL";
      let applicableSubtotal = 0;

      if (scope === "GLOBAL") {
        applicableSubtotal = subTotal;
      } else if (scope === "SPECIFIC_PRODUCT") {
        // Chỉ tính tổng tiền của các sản phẩm được phép áp dụng
        const applicableProductIds: number[] = d.applicableProductIds || [];
        applicableSubtotal = finalCartItems
          .filter((item) =>
            applicableProductIds.includes(Number(item.productId))
          )
          .reduce((acc, item) => {
            // Dùng giá gốc để tính giảm giá
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const price = (item as any).originalPrice ?? item.priceAtTime;
            return acc + price * item.quantity;
          }, 0);
      } else if (scope === "CATEGORY") {
        // Logic cho Category: Kiểm tra categoryId của sản phẩm
        const applicableCategoryIds: number[] = d.applicableCategoryIds || [];
        applicableSubtotal = finalCartItems
          .filter((item) => {
            // Lấy categoryId từ item (hoặc item.product nếu cấu trúc object lồng nhau)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const catId =
              (item as any).categoryId || (item as any).product?.categoryId;
            return applicableCategoryIds.includes(Number(catId));
          })
          .reduce((acc, item) => {
            // Dùng giá gốc để tính giảm giá
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const price = (item as any).originalPrice ?? item.priceAtTime;
            return acc + price * item.quantity;
          }, 0);
      }

      // Nếu không có sản phẩm nào phù hợp -> Không giảm
      if (applicableSubtotal === 0) return sum;

      // 3. Tính toán số tiền giảm
      const val = d.value ?? d.percentage ?? 0;
      const maxDiscount = d.maxDiscountAmount ?? 0;

      let currentDiscount = 0;
      if (d.discountType === "FIXED_AMOUNT") {
        currentDiscount = val;
        // Nếu giảm tiền mặt cho sp/category cụ thể, không được giảm quá tổng tiền nhóm sp đó
        if (scope !== "GLOBAL" && currentDiscount > applicableSubtotal) {
          currentDiscount = applicableSubtotal;
        }
      } else {
        // PERCENTAGE: Tính trên applicableSubtotal
        currentDiscount = (applicableSubtotal * val) / 100;

        // Kiểm tra Max Discount (Trần giảm giá)
        if (maxDiscount > 0 && currentDiscount > maxDiscount) {
          currentDiscount = maxDiscount;
        }
      }
      return sum + currentDiscount;
    }, 0);
  }, [selectedDiscounts, subTotal, finalCartItems]);

  const finalTotal = Math.max(0, subTotal - discountAmount);

  // --- 4. Payment State ---
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
        amount: finalTotal, // Send the discounted amount
        description: `Thanh toan don hang ${currentUser.name || "Guest"}`,
        paymentMethod: paymentMethod,
        items: finalCartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
        })),
        // Có thể gửi thêm danh sách mã giảm giá đã dùng về BE để lưu lịch sử/trừ số lượng
        // appliedDiscounts: selectedDiscounts.map(d => d.code)
      };

      const paymentRes = await createShopPayment(payload);

      if (paymentRes.checkoutUrl) {
        window.location.href = paymentRes.checkoutUrl;
      } else if (paymentMethod === "CASH") {
        toast.success("Đặt hàng thành công!");

        if (!customCartId) {
          await clearCart();
        }
        // Reset states
        setSelectedDiscounts([]);
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
                              (item as any).originalPrice ?? item.priceAtTime
                            )}{" "}
                            ₫
                          </p>
                          {(item as any).originalPrice &&
                            (item as any).originalPrice > item.priceAtTime && (
                              <p className="text-xs text-red-500 font-semibold">
                                Sau giảm:{" "}
                                {new Intl.NumberFormat("vi-VN").format(
                                  item.priceAtTime
                                )}{" "}
                                ₫
                              </p>
                            )}

                          <p className="text-xs text-gray-500 mt-1">
                            Tổng gốc:{" "}
                            {new Intl.NumberFormat("vi-VN").format(
                              ((item as any).originalPrice ??
                                item.priceAtTime) * item.quantity
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
                                prev.filter((d) => d.id !== discount.id)
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
                    className="border border-dashed border-gray-300 rounded-lg p-3 text-center text-sm text-gray-500 cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors"
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
                    className={`relative rounded-xl border-2 p-3 cursor-pointer flex items-center gap-3 transition-all hover:shadow-sm ${
                      paymentMethod === "BANK"
                        ? "border-blue-600 bg-blue-50/50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => setPaymentMethod("BANK")}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "BANK" ? "border-blue-600" : "border-gray-400"}`}
                    >
                      {paymentMethod === "BANK" && (
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800">
                        Chuyển khoản ngân hàng
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Quét mã QR qua PayOS
                      </span>
                    </div>
                  </div>

                  <div
                    className={`relative rounded-xl border-2 p-3 cursor-pointer flex items-center gap-3 transition-all hover:shadow-sm ${
                      paymentMethod === "CASH"
                        ? "border-blue-600 bg-blue-50/50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => setPaymentMethod("CASH")}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "CASH" ? "border-blue-600" : "border-gray-400"}`}
                    >
                      {paymentMethod === "CASH" && (
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800">
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
                  <span className="text-gray-600">Tạm tính (Gốc):</span>
                  <span className="font-medium">
                    {subTotal.toLocaleString("vi-VN")} ₫
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between mb-2 text-sm text-[#FE2A00]">
                    <span className="font-medium">Giảm giá:</span>
                    <span className="font-medium">
                      -{discountAmount.toLocaleString("vi-VN")} ₫
                    </span>
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
        orderValue={subTotal}
        products={finalCartItems}
      />
    </div>
  );
};

export default ShopPaymentModal;
