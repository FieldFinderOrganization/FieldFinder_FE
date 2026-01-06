/* eslint-disable @typescript-eslint/no-unused-vars */
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
}

const BookingModalAI: React.FC<BookingModalProps> = ({
  open,
  onClose,
  fieldData,
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

  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const dateObj = dayjs(fieldData.date, "DD/MM/YYYY");
  const dayAbbr = dateObj.isValid() ? daysOfWeek[dateObj.day()] : "";

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentData, setPaymentData] = useState<any>({
    checkoutUrl: "",
    bankAccountNumber: "",
    bankAccountName: "",
    bankName: "",
    amount: "",
  });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const calculateSlotNumber = (hour: number) => {
    return hour - 6 + 1;
  };

  const parseTimeSlots = () => {
    if (!fieldData.time || fieldData.time.trim() === "") {
      return [];
    }

    try {
      return fieldData.time.split(", ").flatMap((timeSlot) => {
        const [startStr, endStr] = timeSlot.split("-");
        if (!startStr || !endStr) return [];
        const startHour = parseInt(startStr.split(":")[0], 10);
        const endHour = parseInt(endStr.split(":")[0], 10);

        if (isNaN(startHour) || isNaN(endHour)) return [];

        const slots = [];
        // Xử lý giá tiền an toàn hơn: xóa các ký tự không phải số
        const pricePerSlot =
          parseInt(fieldData.price.replace(/\D/g, ""), 10) || 0;

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
  };

  const bookingDetails = useMemo(
    () => parseTimeSlots(),
    [fieldData.time, fieldData.price]
  );

  const temporaryTotal = useMemo(
    () => bookingDetails.reduce((sum, item) => sum + item.priceDetail, 0),
    [bookingDetails]
  );

  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  const [selectedDiscounts, setSelectedDiscounts] = useState<discountRes[]>([]);

  const discountAmount = useMemo(() => {
    return selectedDiscounts.reduce((sum, discount) => {
      const val = discount.value ?? (discount as any).percentage ?? 0;
      const minOrder = discount.minOrderValue || 0;
      const maxDiscount = discount.maxDiscountAmount || 0;

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

      const payload: BookingRequestDTO = {
        pitchId: fieldData.id,
        userId: user.userId,
        bookingDate: dayjs(fieldData.date, "DD/MM/YYYY").format("YYYY-MM-DD"),
        bookingDetails: bookingDetails,
        totalPrice: total,
      };

      const bookingResponse = await createBooking(payload);

      const resAny = bookingResponse as any;
      const bookingId =
        resAny.bookingId || resAny.id || (resAny.data && resAny.data.bookingId);

      if (paymentMethod === "BANK") {
        const paymentPayload: PaymentRequestDTO = {
          bookingId: bookingId,
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
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      const msg = error.response?.data?.message || "Đặt sân thất bại!";
      toast.error(msg);
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
            width: { xs: "90%", sm: 700 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
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
          <div className="main flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-[55%] flex flex-col gap-3">
              <Typography variant="h6" fontWeight={700}>
                Thông tin sân
              </Typography>
              <div className="flex items-center justify-between w-full">
                <div className="text-[1rem] font-bold">Tên sân:</div>
                <div className="text-[1rem] flex-1 text-right">
                  Sân {fieldData.name}
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <div className="text-[1rem] font-bold">Loại sân:</div>
                <div className="text-[1rem] flex-1 text-right">
                  {getPitchType(fieldData.type)}
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <EventIcon className="text-[1.5rem]" />
                <div className="text-[1rem] flex-1 text-right">
                  {dayAbbr}, {fieldData.date}
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <AccessTimeIcon className="text-[1.5rem]" />
                <div className="text-[1rem] flex-1 text-right">
                  {fieldData.time || "Bạn chưa chọn thời gian"}
                </div>
              </div>

              <div className="flex items-center justify-between w-full mt-2">
                <Typography variant="h6" fontWeight={700}>
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
                <div className="grid grid-cols-2 gap-2">
                  {selectedDiscounts.map((discount) => {
                    const val =
                      discount.value ?? (discount as any).percentage ?? 0;
                    return (
                      <div
                        key={discount.id}
                        className="p-2 border border-[#FE2A00] rounded flex justify-between items-center bg-[#fff5f3]"
                      >
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-1">
                            <CardGiftcardIcon
                              sx={{ color: "#e25b43", fontSize: "1rem" }}
                            />
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              noWrap
                              title={discount.code}
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
                  Chưa có mã nào được chọn
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

            <div className="w-full md:w-[45%] flex flex-col gap-3">
              <Typography variant="h6" fontWeight={700}>
                Thông tin người đặt
              </Typography>
              <div className="flex items-center justify-between w-full">
                <div className="text-[1rem] font-bold">Họ và tên:</div>
                <div className="text-[1rem] flex-1 text-right">
                  {user?.name || "Chưa cập nhật"}
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <div className="text-[1rem] font-bold">Số điện thoại:</div>
                <div className="text-[1rem] flex-1 text-right">
                  {user?.phone || "Chưa cập nhật"}
                </div>
              </div>

              <Divider />

              <Typography variant="h6" fontWeight={700}>
                Phương thức thanh toán
              </Typography>
              <div className="flex gap-2">
                <div
                  className={`flex-1 border-2 rounded-lg p-2 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === "CASH"
                      ? "border-[#FE2A00] bg-[#fff5f3]"
                      : "border-gray-300"
                  }`}
                  onClick={() => setPaymentMethod("CASH")}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "CASH"
                        ? "border-[#FE2A00]"
                        : "border-gray-400"
                    }`}
                  >
                    {paymentMethod === "CASH" && (
                      <div className="w-2 h-2 rounded-full bg-[#FE2A00]"></div>
                    )}
                  </div>
                  <span
                    className={`text-sm ${paymentMethod === "CASH" ? "font-bold text-[#FE2A00]" : "text-gray-600"}`}
                  >
                    Tiền mặt
                  </span>
                </div>

                <div
                  className={`flex-1 border-2 rounded-lg p-2 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === "BANK"
                      ? "border-[#FE2A00] bg-[#fff5f3]"
                      : "border-gray-300"
                  }`}
                  onClick={() => setPaymentMethod("BANK")}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "BANK"
                        ? "border-[#FE2A00]"
                        : "border-gray-400"
                    }`}
                  >
                    {paymentMethod === "BANK" && (
                      <div className="w-2 h-2 rounded-full bg-[#FE2A00]"></div>
                    )}
                  </div>
                  <span
                    className={`text-sm ${paymentMethod === "BANK" ? "font-bold text-[#FE2A00]" : "text-gray-600"}`}
                  >
                    Chuyển khoản
                  </span>
                </div>
              </div>

              <Divider />

              <Typography variant="h6" fontWeight={700}>
                Tổng tiền
              </Typography>
              <div className="flex items-center justify-between w-full">
                <div className="text-[1rem] font-bold">Tạm tính:</div>
                <div className="text-[1rem] flex-1 text-right">
                  {temporaryTotal.toLocaleString("vi-VN")} VNĐ
                </div>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#FE2A00]">
                  <span className="font-bold">Giảm giá:</span>
                  <span>-{discountAmount.toLocaleString("vi-VN")} VNĐ</span>
                </div>
              )}

              <div className="flex items-center justify-between w-full">
                <div className="text-[1rem] font-bold">Tổng cộng:</div>
                <div className="text-[1rem] flex-1 text-right text-[#FE2A00] font-bold text-xl">
                  {total.toLocaleString("vi-VN")} VNĐ
                </div>
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
              sx={{
                bgcolor: "#FE2A00",
                color: "white",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#d92300" },
              }}
              onClick={handlePayment}
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
        userId={user?.userId}
      />
    </div>
  );
};

export default BookingModalAI;
