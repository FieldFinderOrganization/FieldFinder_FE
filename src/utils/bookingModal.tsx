import React from "react";
import { Button, Modal, Box, Typography, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { BookingRequestDTO, createBooking } from "@/services/booking";
import { toast } from "react-toastify";
import { createPayment, PaymentRequestDTO } from "@/services/payment";
import PaymentModal from "./paymentModal";

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

const BookingModal: React.FC<BookingModalProps> = ({
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

  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const dateObj = dayjs(fieldData.date, "DD/MM/YYYY");
  const dayAbbr = daysOfWeek[dateObj.day()];
  const [paymentMethod, setPaymentMethod] = React.useState("CASH");

  const [paymentData, setPaymentData] = React.useState<any>({
    checkoutUrl: "",
    bankAccountNumber: "",
    bankAccountName: "",
    bankName: "",
    amount: "",
  });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);

  const calculateSlotNumber = (hour: number) => {
    return hour - 6 + 1;
  };

  const parseTimeSlots = () => {
    if (!fieldData.time) return [];

    return fieldData.time.split(", ").flatMap((timeSlot) => {
      const [startStr, endStr] = timeSlot.split(" - ");
      const startHour = parseInt(startStr.split(":")[0], 10);
      const endHour = parseInt(endStr.split(":")[0], 10);

      const slots = [];
      for (let hour = startHour; hour < endHour; hour++) {
        slots.push({
          slot: calculateSlotNumber(hour),
          name: `${hour}:00-${hour + 1}:00`,
          priceDetail: parseInt(fieldData.price, 10),
        });
      }
      return slots;
    });
  };

  const bookingDetails = parseTimeSlots();
  const temporaryTotal = bookingDetails.reduce(
    (sum, item) => sum + item.priceDetail,
    0
  );
  const total = temporaryTotal;

  const handlePayment = async () => {
    try {
      if (bookingDetails.length === 0) {
        toast.error("Vui lòng chọn khung giờ");
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
      };

      const bookingResponse = await createBooking(payload);

      if (paymentMethod === "BANK") {
        const paymentPayload: PaymentRequestDTO = {
          bookingId: bookingResponse.bookingId,
          userId: user.userId,
          amount: total,
          paymentMethod: "BANK",
        };

        const paymentResponse = await createPayment(paymentPayload);
        setPaymentData(paymentResponse);
        setIsPaymentModalOpen(true);
      }
      toast.success("Đặt sân thành công!");
      onClose();
      resetSelectedSlots();
      onBookingSuccess();
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Đặt sân thất bại!");
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
            width: 700,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            border: "1px solid #e0e0e0",
          }}
        >
          <Button
            onClick={onClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </Button>
          <div className="main flex items-start p-4 gap-x-[2rem]">
            <div className="w-[55%] flex flex-col items-start gap-y-[1rem]">
              <Typography variant="h6" fontWeight={700}>
                Thông tin sân
              </Typography>
              <div className="flex items-center justify-between w-full">
                <div className="field-info text-[1rem] font-bold">Tên sân:</div>
                <div className="field-info text-[1rem] flex-1 text-right">
                  Sân {fieldData.name}
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <div className="field-info text-[1rem] font-bold">
                  Loại sân:
                </div>
                <div className="field-info text-[1rem] flex-1 text-right">
                  {fieldData.type
                    ? getPitchType(fieldData.type as string)
                    : "Không xác định"}
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <EventIcon className="text-[1.5rem]" />
                <div className="field-info text-[1rem] flex-1 text-right">
                  {dayAbbr}, {fieldData.date}
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <AccessTimeIcon className="text-[1.5rem]" />
                <div className="field-info text-[1rem] flex-1 text-right">
                  {fieldData.time || "Bạn chưa chọn thời gian"}
                </div>
              </div>
              {/* <div className="flex items-center justify-between w-full">
                <Typography variant="h6" fontWeight={700}>
                  Mã khuyến mãi
                </Typography>
                <div className="bg-[#FE2A00] text-white py-2 px-4 text-[0.8rem] cursor-pointer font-bold rounded-[0.5rem] gap-x-[0.3rem]">
                  <p>Chọn mã</p>
                </div>
              </div> */}
            </div>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: "black" }}
            />
            <div className="w-[45%] flex flex-col gap-y-[1rem]">
              <Typography variant="h6" fontWeight={700}>
                Thông tin người đặt
              </Typography>
              <div className="flex items-center justify-between w-full">
                <div className="field-info text-[1rem] font-bold">
                  Họ và tên:
                </div>
                <div className="field-info text-[1rem] flex-1 text-right">
                  {user?.name || "Chưa cập nhật"}
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <div className="field-info text-[1rem] font-bold">
                  Số điện thoại:
                </div>
                <div className="field-info text-[1rem] flex-1 text-right">
                  {user?.phone || "Chưa cập nhật"}
                </div>
              </div>
              <Divider
                orientation="horizontal"
                flexItem
                sx={{ borderColor: "black" }}
              />
              <Typography variant="h6" fontWeight={700}>
                Phương thức thanh toán
              </Typography>
              <div className="flex items-center justify-center gap-x-[1rem]">
                <div
                  className={`w-[140px] h-[40px] rounded-[10px] border-[3px] border-solid p-2 flex items-center gap-x-[0.5rem] justify-center cursor-pointer ${
                    paymentMethod === "CASH"
                      ? "border-[#FE2A00]"
                      : "border-[#A6A6A6]"
                  }`}
                  onClick={() => setPaymentMethod("CASH")}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "CASH"
                        ? "border-[#FE2A00]"
                        : "border-[#A6A6A6]"
                    }`}
                  >
                    {paymentMethod === "CASH" && (
                      <div className="w-2 h-2 rounded-full bg-[#FE2A00]"></div>
                    )}
                  </div>
                  <div className="w-fit [font-family:'Inter-Regular',Helvetica] font-normal text-black text-[1rem] tracking-[0] leading-[normal]">
                    Tiền mặt
                  </div>
                </div>

                <div
                  className={`w-[140px] h-[40px] rounded-[10px] border-[3px] border-solid p-2 flex items-center gap-x-[0.5rem] justify-center cursor-pointer ${
                    paymentMethod === "BANK"
                      ? "border-[#FE2A00]"
                      : "border-[#A6A6A6]"
                  }`}
                  onClick={() => setPaymentMethod("BANK")}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "BANK"
                        ? "border-[#FE2A00]"
                        : "border-[#A6A6A6]"
                    }`}
                  >
                    {paymentMethod === "BANK" && (
                      <div className="w-2 h-2 rounded-full bg-[#FE2A00]"></div>
                    )}
                  </div>
                  <div className="w-fit [font-family:'Inter-Regular',Helvetica] font-normal text-black text-[0.9rem] tracking-[0] leading-[normal]">
                    Thẻ ng.hàng
                  </div>
                </div>
              </div>

              <Divider
                orientation="horizontal"
                flexItem
                sx={{ borderColor: "black" }}
              />
              <Typography variant="h6" fontWeight={700}>
                Tổng tiền
              </Typography>
              <div className="flex items-center justify-between w-full">
                <div className="field-info text-[1rem] font-bold">
                  Tạm tính:
                </div>
                <div className="field-info text-[1rem] flex-1 text-right">
                  {temporaryTotal.toLocaleString("vi-VN")} VNĐ
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <div className="field-info text-[1rem] font-bold">
                  Tổng cộng:
                </div>
                <div className="field-info text-[1rem] flex-1 text-right">
                  {total.toLocaleString("vi-VN")} VNĐ
                </div>
              </div>
            </div>
          </div>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{ mr: 2, bgcolor: "#D7D7D7", color: "black" }}
            >
              Quay lại
            </Button>
            <Button
              variant="contained"
              sx={{ bgcolor: "#FE2A00", color: "white" }}
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
        }}
        paymentData={paymentData}
        fieldData={fieldData}
      />
    </div>
  );
};

export default BookingModal;
