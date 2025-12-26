/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import {
  Button,
  Modal,
  Box,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { BookingRequestDTO, createBooking } from "@/services/booking";
import { toast } from "react-toastify";
import { createPayment, PaymentRequestDTO } from "@/services/payment";
import PaymentModal from "./paymentModal";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import DiscountModal from "./discountModal";
import { discountRes } from "@/services/discount";

interface FieldData {
  id: string;
  name: string;
  type: string;
  price: string;
  description: string;
  date: string;
  time: string;
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  fieldData: FieldData;
  onBookingSuccess: () => void;
  resetSelectedSlots: () => void;
}

const BookingModalAI: React.FC<BookingModalProps> = ({
  open,
  onClose,
  fieldData,
  onBookingSuccess,
  resetSelectedSlots,
}) => {
  const user = useSelector((state: any) => state.auth.user);

  const getPitchType = (pitchType: string) => {
    switch (pitchType) {
      case "FIVE_A_SIDE":
        return "Sân 5";
      case "SEVEN_A_SIDE":
        return "Sân 7";
      case "ELEVEN_A_SIDE":
        return "Sân 11";
      default:
        return "Không xác định";
    }
  };

  const calculateSlotNumber = (hour: number) => hour - 6 + 1;

  const parsePrice = (priceStr: string) => {
    if (!priceStr) return 0;
    const cleanStr = priceStr.toString().replace(/\D/g, "");
    const val = parseInt(cleanStr, 10);
    return isNaN(val) ? 0 : val;
  };

  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const dateObj = dayjs(fieldData.date, "DD/MM/YYYY");
  const dayAbbr = dateObj.isValid() ? daysOfWeek[dateObj.day()] : "";

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any>({
    checkoutUrl: "",
    bankAccountNumber: "",
    bankAccountName: "",
    bankName: "",
    amount: "",
  });

  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [selectedDiscounts, setSelectedDiscounts] = useState<discountRes[]>([]);

  const bookingDetails = useMemo(() => {
    if (!fieldData.time || fieldData.time.trim() === "") return [];

    try {
      return fieldData.time.split(", ").flatMap((timeSlot) => {
        const [startStr, endStr] = timeSlot.split(" - ");
        if (!startStr || !endStr) return [];

        const startHour = parseInt(startStr.split(":")[0], 10);
        const endHour = parseInt(endStr.split(":")[0], 10);
        const pricePerSlot = parsePrice(fieldData.price);

        if (isNaN(startHour) || isNaN(endHour)) return [];

        const slots = [];
        for (let hour = startHour; hour < endHour; hour++) {
          slots.push({
            slot: calculateSlotNumber(hour),
            name: `${hour}:00-${hour + 1}:00`,
            priceDetail: pricePerSlot,
          });
        }
        return slots;
      });
    } catch (error) {
      console.error("Error parsing time slots:", error);
      return [];
    }
  }, [fieldData.time, fieldData.price]);

  const temporaryTotal = useMemo(
    () => bookingDetails.reduce((sum, item) => sum + item.priceDetail, 0),
    [bookingDetails]
  );

  const discountAmount = useMemo(() => {
    return selectedDiscounts.reduce((sum, discount) => {
      const val = discount.value ?? (discount as any).percentage ?? 0;
      const minOrder = discount.minOrderValue ?? 0;
      const maxDiscount = discount.maxDiscountAmount ?? 0;

      if (minOrder > 0 && temporaryTotal < minOrder) return sum;

      let currentDiscount = 0;
      if (discount.discountType === "FIXED_AMOUNT") {
        currentDiscount = val;
      } else {
        currentDiscount = (temporaryTotal * val) / 100;
        if (maxDiscount > 0 && currentDiscount > maxDiscount) {
          currentDiscount = maxDiscount;
        }
      }
      return sum + currentDiscount;
    }, 0);
  }, [selectedDiscounts, temporaryTotal]);

  const total = Math.max(0, temporaryTotal - discountAmount);

  const handlePayment = async () => {
    try {
      if (bookingDetails.length === 0) {
        toast.error("Vui lòng chọn khung giờ hợp lệ");
        return;
      }
      if (!user?.userId) {
        toast.error("Vui lòng đăng nhập để đặt sân");
        return;
      }

      const formattedDate = dayjs(fieldData.date, "DD/MM/YYYY").format(
        "YYYY-MM-DD"
      );

      const payload: BookingRequestDTO = {
        pitchId: fieldData.id,
        userId: user.userId,
        bookingDate: formattedDate,
        bookingDetails: bookingDetails,
        totalPrice: total,
      };

      const bookingResponse = await createBooking(payload);

      const resAny = bookingResponse as any;
      const safeId =
        resAny.bookingId || resAny.id || (resAny.data && resAny.data.bookingId);

      if (paymentMethod === "BANK") {
        if (!safeId) {
          toast.error("Lỗi: Không lấy được mã đặt sân để thanh toán!");
          return;
        }
        const paymentPayload: PaymentRequestDTO = {
          bookingId: safeId,
          userId: user.userId,
          amount: total,
          paymentMethod: "BANK",
        };

        const paymentResponse = await createPayment(paymentPayload);
        setPaymentData(paymentResponse);
        setIsPaymentModalOpen(true);
      } else {
        toast.success("Đặt sân thành công!");
        onClose();
        if (resetSelectedSlots) resetSelectedSlots();
        if (onBookingSuccess) onBookingSuccess();
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.message || "Đặt sân thất bại!");
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
            width: { xs: "95%", sm: 700 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Button
            onClick={onClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </Button>

          <div className="main flex flex-col md:flex-row gap-y-4 md:gap-x-8">
            <div className="w-full md:w-[55%] flex flex-col gap-y-3">
              <Typography variant="h6" fontWeight={700}>
                Thông tin sân
              </Typography>
              <InfoRow label="Tên sân" value={`Sân ${fieldData.name}`} />
              <InfoRow
                label="Loại sân"
                value={
                  fieldData.type ? getPitchType(fieldData.type) : "Unknown"
                }
              />

              <div className="flex items-center justify-between w-full">
                <EventIcon className="text-[1.5rem]" />
                <div className="field-info text-[1rem] flex-1 text-right font-medium">
                  {dayAbbr}, {fieldData.date}
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <AccessTimeIcon className="text-[1.5rem]" />
                <div className="field-info text-[1rem] flex-1 text-right font-medium">
                  {fieldData.time || "Chưa chọn giờ"}
                </div>
              </div>

              <div className="flex items-center justify-between w-full mt-2">
                <Typography variant="subtitle1" fontWeight={700}>
                  Mã khuyến mãi
                </Typography>
                <div
                  className="bg-[#FE2A00] text-white py-1 px-3 text-sm cursor-pointer font-bold rounded hover:bg-[#d92300]"
                  onClick={() => setIsDiscountModalOpen(true)}
                >
                  Chọn mã
                </div>
              </div>

              {selectedDiscounts.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {selectedDiscounts.map((discount) => {
                    const val =
                      discount.value ?? (discount as any).percentage ?? 0;
                    return (
                      <div
                        key={discount.id}
                        className="p-2 border border-[#FE2A00] rounded flex justify-between items-center bg-[#fff5f3]"
                      >
                        <div>
                          <div className="flex items-center gap-1">
                            <CardGiftcardIcon
                              sx={{ color: "#e25b43", fontSize: "1rem" }}
                            />
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              noWrap
                            >
                              {discount.code}
                            </Typography>
                          </div>
                          <Typography variant="caption" color="#FE2A00">
                            {discount.discountType === "FIXED_AMOUNT"
                              ? `-${val.toLocaleString()}đ`
                              : `-${val}%`}
                          </Typography>
                        </div>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setSelectedDiscounts(
                              selectedDiscounts.filter(
                                (d) => d.id !== discount.id
                              )
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
                <Typography variant="caption" color="text.secondary">
                  Chưa áp dụng mã nào
                </Typography>
              )}
            </div>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: "none", md: "block" } }}
            />
            <Divider
              orientation="horizontal"
              flexItem
              sx={{ display: { xs: "block", md: "none" } }}
            />

            <div className="w-full md:w-[45%] flex flex-col gap-y-3">
              <Typography variant="h6" fontWeight={700}>
                Người đặt
              </Typography>
              <InfoRow label="Họ tên" value={user?.name || "..."} />
              <InfoRow label="SĐT" value={user?.phone || "..."} />

              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                Thanh toán
              </Typography>
              <div className="flex gap-2">
                <PaymentOption
                  label="Tiền mặt"
                  selected={paymentMethod === "CASH"}
                  onClick={() => setPaymentMethod("CASH")}
                />
                <PaymentOption
                  label="Thẻ NH"
                  selected={paymentMethod === "BANK"}
                  onClick={() => setPaymentMethod("BANK")}
                />
              </div>

              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                Chi phí
              </Typography>
              <InfoRow
                label="Tạm tính"
                value={`${temporaryTotal.toLocaleString("vi-VN")} VNĐ`}
              />

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#FE2A00]">
                  <span className="font-bold">Giảm giá:</span>
                  <span>-{discountAmount.toLocaleString("vi-VN")} VNĐ</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xl font-bold text-[#FE2A00] mt-2">
                <span>Tổng:</span>
                <span>{total.toLocaleString("vi-VN")} VNĐ</span>
              </div>
            </div>
          </div>

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}
          >
            <Button variant="outlined" onClick={onClose} color="inherit">
              Quay lại
            </Button>
            <Button
              variant="contained"
              onClick={() => handlePayment()}
              sx={{
                bgcolor: "#FE2A00",
                color: "white",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#d92300" },
              }}
            >
              Thanh toán
            </Button>
          </Box>
        </Box>
      </Modal>

      <PaymentModal
        open={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          onClose();
          if (resetSelectedSlots) resetSelectedSlots();
          if (onBookingSuccess) onBookingSuccess();
        }}
        paymentData={paymentData}
        fieldData={fieldData}
      />

      <DiscountModal
        open={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        selectedDiscounts={selectedDiscounts}
        setSelectedDiscounts={setSelectedDiscounts}
        orderValue={temporaryTotal}
      />
    </div>
  );
};

// Component phụ
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-sm sm:text-base">
    <span className="font-bold text-gray-700">{label}:</span>
    <span className="text-right">{value}</span>
  </div>
);

const PaymentOption = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className={`flex-1 border-2 rounded-lg p-2 flex items-center justify-center gap-2 cursor-pointer transition-all ${selected ? "border-[#FE2A00] bg-[#fff5f3]" : "border-gray-300"}`}
  >
    <div
      className={`w-4 h-4 rounded-full border flex items-center justify-center ${selected ? "border-[#FE2A00]" : "border-gray-400"}`}
    >
      {selected && <div className="w-2 h-2 bg-[#FE2A00] rounded-full" />}
    </div>
    <span
      className={`text-sm ${selected ? "font-bold text-[#FE2A00]" : "text-gray-600"}`}
    >
      {label}
    </span>
  </div>
);

export default BookingModalAI;
