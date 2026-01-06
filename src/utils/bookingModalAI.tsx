/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from "react";
import {
  Button,
  Modal,
  Box,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import {
  BookingRequestDTO,
  createBooking,
  getBookingSlot,
} from "@/services/booking";
import { createPayment, PaymentRequestDTO } from "@/services/payment";
import { discountRes } from "@/services/discount";
import PaymentModal from "./paymentModal";
import DiscountModal from "./discountModal";

interface FieldData {
  id: string;
  name: string;
  type: string;
  price: string | number;
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

  const timeSlotsList = [
    "6:00 - 7:00",
    "7:00 - 8:00",
    "8:00 - 9:00",
    "9:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00",
    "18:00 - 19:00",
    "19:00 - 20:00",
    "20:00 - 21:00",
    "21:00 - 22:00",
    "22:00 - 23:00",
    "23:00 - 24:00",
  ];

  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

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

  useEffect(() => {
    if (open && fieldData) {
      if (fieldData.date) {
        const parsedDate = dayjs(fieldData.date, "DD/MM/YYYY");
        if (parsedDate.isValid()) {
          setSelectedDate(parsedDate);
        }
      }

      if (fieldData.time) {
        const slots = fieldData.time
          .split(", ")
          .map((t) => {
            if (t.includes("-") && !t.includes(" - ")) {
              return t.replace("-", " - ");
            }
            return t;
          })
          .filter((t) => timeSlotsList.includes(t));
        setSelectedTimeSlots(slots);
      } else {
        setSelectedTimeSlots([]);
      }
    }
  }, [open, fieldData]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!fieldData.id || !selectedDate) return;
      setIsLoadingSlots(true);
      try {
        const formattedDate = selectedDate.format("YYYY-MM-DD");
        const res = await getBookingSlot(fieldData.id, formattedDate);
        setBookedSlots(res);
      } catch (error) {
        console.error("Failed to fetch booked slots", error);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    if (open) {
      fetchSlots();
    }
  }, [selectedDate, fieldData.id, open]);

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
  const getSlotNumberFromStr = (timeSlot: string) =>
    timeSlotsList.indexOf(timeSlot) + 1;
  const isSlotBooked = (timeSlot: string) =>
    bookedSlots.includes(getSlotNumberFromStr(timeSlot));

  const parsePrice = (price: string | number) => {
    if (typeof price === "number") return price;
    if (!price) return 0;
    return parseInt(price.toString().replace(/\D/g, ""), 10) || 0;
  };

  const handleToggleSlot = (slot: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const bookingDetails = useMemo(() => {
    const pricePerSlot = parsePrice(fieldData.price);

    const sortedSlots = [...selectedTimeSlots].sort((a, b) => {
      return timeSlotsList.indexOf(a) - timeSlotsList.indexOf(b);
    });

    return sortedSlots.map((slotStr) => {
      const [startStr] = slotStr.split(" - ");
      const startHour = parseInt(startStr.split(":")[0], 10);
      return {
        slot: calculateSlotNumber(startHour),
        name: slotStr,
        priceDetail: pricePerSlot,
      };
    });
  }, [selectedTimeSlots, fieldData.price]);

  const temporaryTotal = useMemo(
    () => bookingDetails.reduce((sum, item) => sum + item.priceDetail, 0),
    [bookingDetails]
  );

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
        toast.warn("Vui lòng chọn ít nhất một khung giờ");
        return;
      }
      if (!user?.userId) {
        toast.warn("Vui lòng đăng nhập để đặt sân");
        return;
      }
      if (!selectedDate || !selectedDate.isValid()) {
        toast.error("Ngày đặt không hợp lệ");
        return;
      }

      const formattedDate = selectedDate.format("YYYY-MM-DD");

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
        resAny.bookingId ||
        resAny.id ||
        resAny.booking_id ||
        (resAny.data && resAny.data.bookingId);

      if (!safeId) {
        toast.error("Lỗi hệ thống: Không lấy được mã đặt sân!");
        return;
      }

      if (paymentMethod === "BANK") {
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
            width: { xs: "95%", md: 850 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            borderRadius: 3,
            maxHeight: "95vh",
            overflowY: "auto",
            outline: "none",
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              minWidth: "auto",
              color: "gray",
            }}
          >
            <CloseIcon />
          </Button>

          <div className="main flex flex-col md:flex-row gap-y-6 md:gap-x-8">
            <div className="w-full md:w-[60%] flex flex-col gap-y-4">
              <Typography variant="h6" fontWeight={800} color="#188862">
                XÁC NHẬN & CHỈNH SỬA
              </Typography>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                <InfoRow label="Tên sân" value={fieldData.name} highlight />
                <InfoRow
                  label="Loại sân"
                  value={getPitchType(fieldData.type)}
                />
                <Divider sx={{ borderStyle: "dashed" }} />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EventIcon className="text-[#188862]" fontSize="small" />
                    <span className="font-medium text-gray-700">Ngày đặt:</span>
                  </div>
                  <div className="w-[160px]">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: {
                            size: "small",
                            variant: "standard",
                            InputProps: {
                              disableUnderline: true,
                              style: {
                                fontWeight: "bold",
                                fontSize: "0.95rem",
                                color: "#1f2937",
                                textAlign: "right",
                              },
                            },
                          },
                        }}
                        disablePast
                      />
                    </LocalizationProvider>
                  </div>
                </div>
              </div>

              {/* GRID GIỜ */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <AccessTimeIcon
                      className="text-[#188862]"
                      fontSize="small"
                    />
                    <span className="font-bold text-gray-700 text-sm">
                      Chọn khung giờ:
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Đã chọn: {selectedTimeSlots.length}
                  </span>
                </div>

                {isLoadingSlots ? (
                  <div className="flex justify-center py-6 border border-dashed rounded-lg">
                    <CircularProgress size={24} sx={{ color: "#188862" }} />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {timeSlotsList.map((slot) => {
                      const booked = isSlotBooked(slot);
                      const selected = selectedTimeSlots.includes(slot);

                      let isDisabledByTime = false;
                      if (selectedDate) {
                        const now = dayjs();
                        const isToday = selectedDate.isSame(now, "day");

                        if (selectedDate.isBefore(now, "day")) {
                          isDisabledByTime = true;
                        } else if (isToday) {
                          const [startStr] = slot.split(" - ");
                          const [startHourStr] = startStr.split(":");
                          const startHour = parseInt(startHourStr, 10);

                          const slotTime = selectedDate
                            .hour(startHour)
                            .minute(0)
                            .second(0);

                          if (slotTime.isBefore(now.add(30, "minute"))) {
                            isDisabledByTime = true;
                          }
                        }
                      }

                      const disabled = booked || isDisabledByTime;

                      return (
                        <button
                          key={slot}
                          onClick={() => !disabled && handleToggleSlot(slot)}
                          disabled={disabled}
                          className={`
                                        text-[11px] py-2 px-1 rounded border transition-all duration-200
                                        ${
                                          disabled
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-transparent"
                                            : selected
                                              ? "bg-[#188862] text-white border-[#188862] font-bold shadow-md"
                                              : "bg-white text-gray-600 border-gray-300 hover:border-[#188862] hover:text-[#188862]"
                                        }
                                    `}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="flex gap-3 mt-2 text-[10px] text-gray-500 justify-end">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-gray-200 rounded"></div> Đã
                    đặt
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-gray-100 border border-transparent rounded"></div>{" "}
                    Quá hạn
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-[#188862] rounded"></div>{" "}
                    Đang chọn
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 border border-gray-300 rounded bg-white"></div>{" "}
                    Trống
                  </div>
                </div>
              </div>
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

            <div className="w-full md:w-[40%] flex flex-col gap-y-4">
              <Typography variant="h6" fontWeight={800} color="#188862">
                THANH TOÁN
              </Typography>

              <div className="flex flex-col gap-y-1 text-sm">
                <InfoRow label="Người đặt" value={user?.name || "..."} />
                <InfoRow label="Số điện thoại" value={user?.phone || "..."} />
              </div>

              <div className="border border-dashed border-[#188862]/30 p-3 rounded-lg bg-[#188862]/5 hover:bg-[#188862]/10 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
                    <CardGiftcardIcon fontSize="small" /> Mã ưu đãi
                  </span>
                  <button
                    className="text-xs bg-white border border-[#FE2A00] text-[#FE2A00] px-3 py-1 rounded-full font-bold hover:bg-[#FE2A00] hover:text-white transition-all"
                    onClick={() => setIsDiscountModalOpen(true)}
                  >
                    {selectedDiscounts.length > 0 ? "Thêm mã khác" : "Chọn mã"}
                  </button>
                </div>
                {selectedDiscounts.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {selectedDiscounts.map((discount) => (
                      <div
                        key={discount.id}
                        className="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-sm"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-gray-800">
                            {discount.code}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {discount.discountType === "FIXED_AMOUNT"
                              ? `Giảm ${discount.value?.toLocaleString()}đ`
                              : `Giảm ${discount.value}%`}
                          </span>
                        </div>
                        <CloseIcon
                          sx={{
                            fontSize: 16,
                            cursor: "pointer",
                            color: "#999",
                          }}
                          onClick={() =>
                            setSelectedDiscounts((prev) =>
                              prev.filter((d) => d.id !== discount.id)
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 italic ml-1">
                    Chưa áp dụng mã nào
                  </span>
                )}
              </div>

              <Divider />

              <Typography
                variant="subtitle2"
                fontWeight={700}
                className="text-gray-700"
              >
                Phương thức thanh toán
              </Typography>
              <div className="flex gap-3">
                <PaymentOption
                  label="Tiền mặt"
                  selected={paymentMethod === "CASH"}
                  onClick={() => setPaymentMethod("CASH")}
                />
                <PaymentOption
                  label="Chuyển khoản"
                  selected={paymentMethod === "BANK"}
                  onClick={() => setPaymentMethod("BANK")}
                />
              </div>

              {/* Box Tổng kết */}
              <div className="bg-gray-50 p-4 rounded-xl mt-2 border border-gray-200">
                <InfoRow
                  label="Đơn giá"
                  value={`${parsePrice(fieldData.price).toLocaleString()} đ/h`}
                />
                <InfoRow
                  label="Số giờ"
                  value={`${selectedTimeSlots.length} giờ`}
                />
                <Divider sx={{ my: 1, borderStyle: "dashed" }} />
                <InfoRow
                  label="Tạm tính"
                  value={`${temporaryTotal.toLocaleString()} đ`}
                />

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#FE2A00] text-sm mb-1">
                    <span className="font-bold">Giảm giá:</span>
                    <span>-{discountAmount.toLocaleString()} đ</span>
                  </div>
                )}

                <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-700">Tổng cộng:</span>
                  <span className="font-extrabold text-xl text-[#FE2A00]">
                    {total.toLocaleString()} đ
                  </span>
                </div>
              </div>

              <Button
                variant="contained"
                onClick={handlePayment}
                fullWidth
                sx={{
                  mt: 1,
                  bgcolor: "#FE2A00",
                  fontWeight: "bold",
                  py: 1.5,
                  fontSize: "1rem",
                  borderRadius: "10px",
                  boxShadow: "0 4px 12px rgba(254, 42, 0, 0.3)",
                  "&:hover": {
                    bgcolor: "#d92300",
                    boxShadow: "0 6px 16px rgba(254, 42, 0, 0.4)",
                  },
                }}
              >
                XÁC NHẬN ĐẶT SÂN
              </Button>
            </div>
          </div>
        </Box>
      </Modal>

      <PaymentModal
        open={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          onClose();
        }}
        paymentData={paymentData}
        fieldData={{
          ...fieldData,
          price: fieldData.price.toString(),
          time: selectedTimeSlots.join(", "),
          date: selectedDate
            ? selectedDate.format("DD/MM/YYYY")
            : fieldData.date,
        }}
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

const InfoRow = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="flex justify-between text-sm mb-1.5 items-center">
    <span className="font-medium text-gray-500">{label}:</span>
    <span
      className={`text-right ${highlight ? "font-bold text-gray-800 text-base" : "font-semibold text-gray-700"}`}
    >
      {value}
    </span>
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
    className={`
        flex-1 border rounded-lg p-2.5 flex items-center justify-center gap-2 cursor-pointer transition-all select-none
        ${
          selected
            ? "border-[#FE2A00] bg-[#FE2A00]/5 ring-1 ring-[#FE2A00]"
            : "border-gray-300 hover:bg-gray-50"
        }
    `}
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
