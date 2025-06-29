"use client";

import React from "react";
import { Button, Modal, Box, Typography, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

interface paymentData {
  transactionId: string;
  checkoutUrl?: string;
  status: string;
  amount: number;
}

interface FieldData {
  id: string;
  name: string;
  type: string;
  price: string;
  description: string;
  date: string;
  time: string;
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  paymentData: paymentData;
  fieldData: FieldData;
}

const paymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  paymentData,
  fieldData,
}) => {
  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const dateObj = dayjs(fieldData.date, "DD/MM/YYYY");
  const dayAbbr = daysOfWeek[dateObj.day()];

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

  return (
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
        <div className="main flex items-start p-4 gap-x-[2rem] justify-center">
          <div className="w-[45%] flex flex-col items-start gap-y-[1rem]">
            <Typography variant="h6" fontWeight={700}>
              Thông tin người đặt
            </Typography>
            <div className="flex items-center justify-between w-full">
              <div className="field-info text-[1rem] font-bold">Tên:</div>
              <div className="field-info text-[1rem] flex-1 text-right">
                {user?.name || "Không xác định"}
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="field-info text-[1rem] font-bold">
                Số điện thoại:
              </div>
              <div className="field-info text-[1rem] flex-1 text-right">
                {user?.phone || "Không xác định"}
              </div>
            </div>
            <Divider
              orientation="horizontal"
              flexItem
              sx={{ borderColor: "black" }}
            />
            <Typography variant="h6" fontWeight={700}>
              Thông tin sân
            </Typography>
            <div className="flex items-center justify-between w-full">
              <div className="field-info text-[1rem] font-bold">Tên sân:</div>
              <div className="field-info text-[1rem] flex-1 text-right">
                Sân {fieldData.name || "Không xác định"}
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="field-info text-[1rem] font-bold">Loại sân:</div>
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
          </div>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: "black" }}
          />
          <div className="w-[45%] flex flex-col gap-y-[1rem]">
            <Typography variant="h6" fontWeight={700}>
              Thông tin thanh toán
            </Typography>
            {/* <div className="flex items-center justify-between w-full">
              <div className="field-info text-[1rem] font-bold">
                Tên tài khỏan:
              </div>
              <div className="field-info text-[1rem] flex-1 text-right">
                {paymentData.bankAccountName || "Chưa cập nhật"}
              </div>
            </div> */}
            <Divider
              orientation="horizontal"
              flexItem
              sx={{ borderColor: "black" }}
            />
            <Typography variant="h6" fontWeight={700}>
              Tổng tiền
            </Typography>
            <div className="flex items-center justify-between w-full">
              <div className="field-info text-[1rem] font-bold">Tổng cộng:</div>
              <div className="field-info text-[1rem] flex-1 text-right">
                {paymentData.amount} VNĐ
              </div>
            </div>
            {paymentData.checkoutUrl && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
                onClick={() => {
                  window.open(paymentData.checkoutUrl, "_blank");
                }}
              >
                Thanh toán ngay
              </Button>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default paymentModal;
