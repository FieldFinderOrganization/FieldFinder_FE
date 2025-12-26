/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { getAllDiscounts, discountRes } from "@/services/discount";
import dayjs from "dayjs";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cartItemRes } from "@/services/cartItem";

interface DiscountModalProps {
  open: boolean;
  onClose: () => void;
  selectedDiscounts: discountRes[];
  setSelectedDiscounts: (discounts: discountRes[]) => void;
  orderValue: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products?: any[]; // Danh sách sản phẩm trong giỏ để check scope
}

const DiscountModal: React.FC<DiscountModalProps> = ({
  open,
  onClose,
  selectedDiscounts,
  setSelectedDiscounts,
  orderValue,
  products = [],
}) => {
  const [discounts, setDiscounts] = useState<discountRes[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDiscounts = async () => {
      setLoading(true);
      try {
        const data = await getAllDiscounts();
        const now = dayjs();

        const validDiscounts = data.filter((discount) => {
          // 1. Check Status
          if (discount.status !== "ACTIVE") return false;

          // 2. Check Date
          const startDate = dayjs(discount.startDate);
          const endDate = dayjs(discount.endDate).endOf("day");
          if (!now.isAfter(startDate) || !now.isBefore(endDate)) return false;

          // 3. Check Min Order
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const d = discount as any;
          const minOrder = d.minOrderValue || 0;
          if (minOrder > 0 && orderValue < minOrder) return false;

          // 4. Check Scope (Quan trọng)
          const scope = d.scope || "GLOBAL";

          if (scope === "GLOBAL") return true; // Luôn đúng với Global

          // Nếu scope đặc biệt mà không có sản phẩm nào để check -> false
          if (!products || products.length === 0) return false;

          if (scope === "SPECIFIC_PRODUCT") {
            const applicableProductIds: number[] = d.applicableProductIds || [];
            // Kiểm tra xem có sản phẩm nào trong giỏ nằm trong danh sách được áp dụng không
            const hasMatch = products.some((p) =>
              applicableProductIds.includes(Number(p.productId))
            );
            if (!hasMatch) return false;
          } else if (scope === "CATEGORY") {
            const applicableCategoryIds: number[] =
              d.applicableCategoryIds || [];
            // Kiểm tra xem có sản phẩm nào thuộc category được áp dụng không
            const hasMatch = products.some((p) => {
              // Lấy categoryId an toàn từ nhiều nguồn
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const catId =
                (p as any).categoryId || (p as any).product?.categoryId;
              return applicableCategoryIds.includes(Number(catId));
            });
            if (!hasMatch) return false;
          }

          return true;
        });

        setDiscounts(validDiscounts);
      } catch (error) {
        console.error("Error fetching discounts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchDiscounts();
    }
  }, [open, orderValue, products]);

  const toggleDiscountSelection = (discount: discountRes) => {
    const isSelected = selectedDiscounts.some((d) => d.id === discount.id);
    if (isSelected) {
      setSelectedDiscounts(
        selectedDiscounts.filter((d) => d.id !== discount.id)
      );
    } else {
      // Logic cộng dồn mã: Hiện tại cho phép chọn nhiều
      // Nếu muốn chỉ 1 mã, dùng: setSelectedDiscounts([discount]);
      setSelectedDiscounts([...selectedDiscounts, discount]);
    }
  };

  const formatCurrency = (value: number) => {
    return (value || 0).toLocaleString("vi-VN") + "đ";
  };

  const getDiscountValue = (discount: discountRes) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return discount.value ?? (discount as any).percentage ?? 0;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", sm: 600 },
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 0,
          borderRadius: 3,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          outline: "none",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid #eee",
            bgcolor: "#f9fafb",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            Chọn mã khuyến mãi
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* List Content */}
        <Box sx={{ overflowY: "auto", p: 2, flex: 1, bgcolor: "#f3f4f6" }}>
          {loading ? (
            <Typography align="center" py={3} color="text.secondary">
              Đang tải mã khuyến mãi...
            </Typography>
          ) : discounts.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary" mb={1}>
                Không có mã khuyến mãi phù hợp
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (Đơn hàng: {formatCurrency(orderValue)})
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {discounts.map((discount) => {
                const isSelected = selectedDiscounts.some(
                  (d) => d.id === discount.id
                );
                const val = getDiscountValue(discount);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const d = discount as any;
                const minOrder = d.minOrderValue || 0;
                const maxDiscount = d.maxDiscountAmount || 0;
                const scope = d.scope || "GLOBAL";

                return (
                  <Card
                    key={discount.id}
                    variant="outlined"
                    sx={{
                      cursor: "pointer",
                      border: isSelected
                        ? "1px solid #FE2A00"
                        : "1px solid transparent",
                      bgcolor: "white",
                      transition: "all 0.2s",
                      position: "relative",
                      overflow: "visible",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      "&:hover": {
                        borderColor: "#FE2A00",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      },
                    }}
                    onClick={() => toggleDiscountSelection(discount)}
                  >
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        {/* Left Icon Part */}
                        <Box
                          sx={{
                            background: isSelected
                              ? "linear-gradient(135deg, #FE2A00 0%, #FF8A65 100%)"
                              : "#eee",
                            minWidth: 70,
                            height: 70,
                            borderRadius: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            color: isSelected ? "white" : "gray",
                          }}
                        >
                          <CardGiftcardIcon fontSize="medium" />
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            sx={{ mt: 0.5 }}
                          >
                            {discount.discountType === "FIXED_AMOUNT"
                              ? "GIẢM TIỀN"
                              : "GIẢM %"}
                          </Typography>
                        </Box>

                        {/* Right Content Part */}
                        <Box sx={{ flex: 1 }}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography
                              fontWeight="bold"
                              variant="subtitle1"
                              color="text.primary"
                            >
                              {discount.code}
                            </Typography>
                            {scope !== "GLOBAL" && (
                              <Chip
                                label={
                                  scope === "CATEGORY"
                                    ? "Theo danh mục"
                                    : "Sản phẩm cụ thể"
                                }
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.65rem",
                                  bgcolor: "#e3f2fd",
                                  color: "#1565c0",
                                }}
                              />
                            )}
                          </Box>

                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="#FE2A00"
                            sx={{ mb: 0.5 }}
                          >
                            {discount.discountType === "FIXED_AMOUNT"
                              ? `Giảm ${formatCurrency(val)}`
                              : `Giảm ${val}% đơn hàng`}

                            {maxDiscount > 0 &&
                            discount.discountType !== "FIXED_AMOUNT"
                              ? ` (Tối đa ${formatCurrency(maxDiscount)})`
                              : ""}
                          </Typography>

                          <Box display="flex" flexDirection="column" gap={0.5}>
                            {minOrder > 0 && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                • Đơn tối thiểu: {formatCurrency(minOrder)}
                              </Typography>
                            )}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              • HSD:{" "}
                              {dayjs(discount.endDate).format("DD/MM/YYYY")}
                            </Typography>
                            {discount.description && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontStyle: "italic" }}
                              >
                                • {discount.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* Checkmark */}
                        {isSelected && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              color: "#FE2A00",
                            }}
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                                fill="#FE2A00"
                                opacity="0.1"
                              />
                              <path
                                d="M7.75 12.75L10.25 15.25L16.25 9.25"
                                stroke="#FE2A00"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "white",
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Đã chọn:{" "}
            <span style={{ fontWeight: "bold", color: "#FE2A00" }}>
              {selectedDiscounts.length}
            </span>{" "}
            mã
          </Typography>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              bgcolor: "#FE2A00",
              color: "white",
              fontWeight: "bold",
              textTransform: "none",
              px: 4,
              boxShadow: "0 4px 6px -1px rgba(254, 42, 0, 0.2)",
              "&:hover": { bgcolor: "#d92300" },
            }}
          >
            Xác nhận
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DiscountModal;
