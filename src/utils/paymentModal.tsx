/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React from "react";
import {
  Button,
  Modal,
  Box,
  Typography,
  Divider,
  Chip,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

interface paymentData {
  transactionId?: string;
  checkoutUrl?: string;
  status?: string;
  amount: number;

  bankAccountNumber?: string;
  bankAccountName?: string;
  bankName?: string;
  qrCode?: string;
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

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  paymentData,
  fieldData,
}) => {
  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const dateObj = dayjs(fieldData.date, "DD/MM/YYYY");
  const dayAbbr = dateObj.isValid() ? daysOfWeek[dateObj.day()] : "";

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
          width: { xs: "95%", sm: 800 },
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 3,
          outline: "none",
          overflow: "hidden",
        }}
      >
        <div className="bg-[#FE2A00] p-4 flex justify-between items-center text-white shadow-md">
          <div className="flex items-center gap-2">
            <MonetizationOnIcon />
            <Typography variant="h6" fontWeight={800} letterSpacing={1}>
              XÁC NHẬN THANH TOÁN
            </Typography>
          </div>
          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </div>

        <div className="p-6 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-3/5 flex flex-col gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="#188862"
                  mb={1.5}
                  className="uppercase flex items-center gap-2 border-b border-gray-100 pb-1"
                >
                  <PersonIcon fontSize="small" /> THÔNG TIN NGƯỜI ĐẶT
                </Typography>
                <div className="flex flex-col gap-3">
                  <InfoRow
                    icon={
                      <PersonIcon fontSize="small" className="text-gray-400" />
                    }
                    label="Họ tên"
                    value={user?.name || "Khách vãng lai"}
                    boldValue
                  />
                  <InfoRow
                    icon={
                      <PhoneIcon fontSize="small" className="text-gray-400" />
                    }
                    label="Số điện thoại"
                    value={user?.phone || "Chưa cập nhật"}
                  />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="#188862"
                  mb={1.5}
                  className="uppercase flex items-center gap-2 border-b border-gray-100 pb-1"
                >
                  <SportsSoccerIcon fontSize="small" /> CHI TIẾT SÂN BÓNG
                </Typography>
                <div className="flex flex-col gap-3">
                  <InfoRow label="Tên sân" value={fieldData.name} boldValue />
                  <InfoRow
                    label="Loại sân"
                    value={
                      fieldData.type
                        ? getPitchType(fieldData.type as string)
                        : "..."
                    }
                  />

                  <div className="mt-2 bg-green-50 p-3 rounded-lg border border-green-100">
                    <InfoRow
                      icon={
                        <EventIcon
                          fontSize="small"
                          className="text-[#188862]"
                        />
                      }
                      label="Ngày đá"
                      value={`${dayAbbr}, ${fieldData.date}`}
                      highlight
                    />
                    {fieldData.time && (
                      <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-green-200/50">
                        <span className="text-gray-600 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border border-[#188862] flex items-center justify-center text-[10px] text-[#188862]">
                            🕒
                          </span>
                          Khung giờ:
                        </span>
                        <span className="font-bold text-[#FE2A00] text-right bg-white px-2 py-0.5 rounded border border-red-100 shadow-sm">
                          {fieldData.time}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-2/5 flex flex-col">
              <div className="h-full bg-white p-5 rounded-xl border-2 border-[#FE2A00]/10 flex flex-col justify-between shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#FE2A00]/5 rounded-bl-full -mr-4 -mt-4"></div>

                <div>
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    align="center"
                    color="#FE2A00"
                    gutterBottom
                    sx={{ letterSpacing: 1 }}
                  >
                    TỔNG THANH TOÁN
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    align="center"
                    color="#333"
                    sx={{ mb: 1, fontSize: "2rem" }}
                  >
                    {paymentData.amount
                      ? paymentData.amount.toLocaleString()
                      : 0}
                    <span className="text-lg text-gray-400 font-medium ml-1">
                      đ
                    </span>
                  </Typography>

                  <Divider sx={{ mb: 3 }} />

                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">
                        Trạng thái:
                      </span>
                      <Chip
                        label={paymentData.status || "Chờ thanh toán"}
                        color={
                          paymentData.status === "PAID" ? "success" : "warning"
                        }
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </div>
                    {paymentData.transactionId && (
                      <div className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                        <span className="text-gray-500">Mã GD:</span>
                        <span className="font-mono text-xs font-bold text-gray-700 break-all ml-2">
                          {paymentData.transactionId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  {paymentData.checkoutUrl ? (
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<ArrowForwardIcon />}
                      sx={{
                        bgcolor: "#FE2A00",
                        py: 1.8,
                        fontSize: "1rem",
                        fontWeight: "bold",
                        borderRadius: "10px",
                        boxShadow: "0 8px 20px rgba(254, 42, 0, 0.25)",
                        "&:hover": {
                          bgcolor: "#d92300",
                          boxShadow: "0 10px 25px rgba(254, 42, 0, 0.35)",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                        textTransform: "none",
                      }}
                      onClick={() =>
                        window.open(paymentData.checkoutUrl, "_blank")
                      }
                    >
                      Tiến hành thanh toán
                    </Button>
                  ) : (
                    <div className="text-center p-4 bg-orange-50 rounded-xl border border-dashed border-orange-200">
                      <QrCodeScannerIcon
                        sx={{
                          fontSize: 40,
                          color: "#FE2A00",
                          mb: 1,
                          opacity: 0.8,
                        }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontSize="0.85rem"
                      >
                        Vui lòng kiểm tra thông tin và thanh toán tại quầy hoặc
                        chờ cập nhật phương thức chuyển khoản.
                      </Typography>
                    </div>
                  )}
                  <Typography
                    variant="caption"
                    display="block"
                    align="center"
                    color="text.disabled"
                    sx={{ mt: 2, fontSize: "0.7rem" }}
                  >
                    🔒 Giao dịch được bảo mật và an toàn 100%
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

const InfoRow = ({ icon, label, value, boldValue, highlight }: any) => (
  <div className="flex items-center justify-between text-sm py-0.5">
    <div className="flex items-center gap-2 text-gray-600">
      {icon}
      <span>{label}:</span>
    </div>
    <span
      className={`text-right ${
        boldValue ? "font-bold text-gray-800" : ""
      } ${highlight ? "font-bold text-[#188862]" : ""}`}
    >
      {value}
    </span>
  </div>
);

export default PaymentModal;
