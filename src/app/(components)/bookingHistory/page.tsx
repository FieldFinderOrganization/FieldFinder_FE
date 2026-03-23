/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { logout, setShowSidebar } from "@/redux/features/authSlice";
import {
  ProviderBookingResponseDTO,
  getBookingByUserId,
} from "@/services/booking";
import Header from "@/utils/header";
import Sidebar from "@/utils/sideBar";
import { Box, Typography, Button } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { persistor } from "@/redux/store";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import { toast } from "react-toastify";

const slotToTime = (slot: number): string => {
  const startHour = slot + 5;
  const endHour = slot + 6;
  return `${startHour}:00-${endHour}:00`;
};

const mergeContinuousSlots = (slots: number[]): string => {
  if (!slots || slots.length === 0) return "Không có slot";

  const sortedSlots = [...slots].sort((a, b) => a - b);
  const result: string[] = [];
  let start = sortedSlots[0];
  let current = start;

  for (let i = 1; i < sortedSlots.length; i++) {
    if (sortedSlots[i] === current + 1) {
      current = sortedSlots[i];
    } else {
      if (start === current) {
        result.push(slotToTime(start));
      } else {
        result.push(
          `${slotToTime(start).split("-")[0]}-${slotToTime(current).split("-")[1]}`,
        );
      }
      start = sortedSlots[i];
      current = start;
    }
  }

  if (start === current) {
    result.push(slotToTime(start));
  } else {
    result.push(
      `${slotToTime(start).split("-")[0]}-${slotToTime(current).split("-")[1]}`,
    );
  }

  return result.join(", ");
};

const BookingHistory: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [bookings, setBookings] = useState<ProviderBookingResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useSelector((state: any) => state.auth.user);
  const baseTabs = [{ label: "Thông tin cá nhân", value: 0 }];

  const providerTabs = [
    { label: "Thông tin cá nhân", value: 0 },
    { label: "Thông tin sân", value: 1 },
    { label: "Thông tin đặt sân", value: 2 },
  ];

  const tabs = user?.role === "PROVIDER" ? providerTabs : baseTabs;
  const [initTab, setInitTab] = useState(tabs[0].value);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setInitTab(newValue);
    dispatch(setShowSidebar(true));
  };

  const handleLogout = () => {
    dispatch(logout());
    persistor.purge();
    router.push("/login");
  };

  const bookingColumns: GridColDef[] = [
    {
      field: "bookingDate",
      headerName: "Ngày đặt",
      width: 120,
      renderCell: (params) => {
        return dayjs(params.row.bookingDate).format("DD/MM/YYYY");
      },
    },
    {
      field: "providerName",
      headerName: "Tên chủ sân",
      width: 180,
      renderCell: (params) => (
        <span className="font-semibold text-gray-800">
          {params.row.providerName}
        </span>
      ),
    },
    { field: "pitchName", headerName: "Tên sân", width: 160 },
    {
      field: "timeRange",
      headerName: "Khung giờ",
      width: 160,
      renderCell: (
        params: GridRenderCellParams<ProviderBookingResponseDTO>,
      ) => {
        if (!params.row) return "Không có dữ liệu";
        return (
          <div className="bg-gray-100 px-2 py-1 rounded-md text-sm text-gray-700 w-fit mt-2">
            {mergeContinuousSlots(params.row.slots)}
          </div>
        );
      },
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 140,
      renderCell: (params) => {
        let typeText = "";
        let colorClass = "";
        switch (params.row.status) {
          case "PENDING":
            typeText = "Đang chờ";
            colorClass =
              "bg-yellow-50 text-yellow-600 border border-yellow-200";
            break;
          case "CONFIRMED":
            typeText = "Đã xác nhận";
            colorClass = "bg-green-50 text-green-600 border border-green-200";
            break;
          case "CANCELED":
            typeText = "Đã hủy";
            colorClass = "bg-red-50 text-red-600 border border-red-200";
            break;
          default:
            typeText = params.row.status;
            colorClass = "bg-gray-50 text-gray-600";
        }
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}
          >
            {typeText}
          </span>
        );
      },
    },
    {
      field: "paymentStatus",
      headerName: "Thanh toán",
      width: 140,
      renderCell: (params) => {
        let typeText = "";
        let colorClass = "";
        switch (params.row.paymentStatus) {
          case "PENDING":
            typeText = "Đang chờ";
            colorClass = "text-yellow-600 font-medium";
            break;
          case "PAID":
            typeText = "Đã thanh toán";
            colorClass = "text-green-600 font-semibold";
            break;
          case "REFUNDED":
            typeText = "Hoàn tiền";
            colorClass = "text-red-600 font-medium";
            break;
          default:
            typeText = params.row.paymentStatus;
        }
        return <span className={`${colorClass} text-sm`}>{typeText}</span>;
      },
    },
    {
      field: "totalPrice",
      headerName: "Tổng giá",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => (
        <span className="font-bold text-[#e25b43]">
          {params.row.totalPrice?.toLocaleString("vi-VN")} đ
        </span>
      ),
    },
  ];

  const fetchBookings = async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      const bookRes = await getBookingByUserId(user.userId);
      // Sắp xếp booking mới nhất lên đầu
      const sorted = [...bookRes].sort(
        (a, b) =>
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime(),
      );
      setBookings(sorted);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      toast.error("Không thể tải lịch sử đặt sân");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user?.userId]);

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex flex-col pt-[80px] pb-[100px] font-sans">
      <Header />
      <div className="flex flex-col md:flex-row items-start justify-center gap-6 w-full max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <Sidebar
          tabs={tabs}
          initTab={initTab}
          handleChangeTab={handleChangeTab}
          handleLogout={handleLogout}
        />

        <div className="w-full md:flex-1 space-y-8">
          <div className="flex flex-col gap-6">
            {/* Thanh tiêu đề */}
            <div className="flex justify-between items-center flex-wrap gap-4">
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "800",
                  color: "#1e293b",
                  letterSpacing: "-0.5px",
                }}
              >
                Lịch sử đặt sân
              </Typography>
              <Button
                variant="contained"
                startIcon={<RestartAltOutlinedIcon />}
                onClick={fetchBookings}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: "700",
                  backgroundColor: "white",
                  color: "#0f172a",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                    borderColor: "#cbd5e1",
                  },
                }}
              >
                Làm mới dữ liệu
              </Button>
            </div>

            {/* Bảng Dữ Liệu */}
            <Box
              sx={{
                height: 650,
                width: "100%",
                backgroundColor: "white",
                borderRadius: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                border: "1px solid #f1f5f9",
                overflow: "hidden",
                "& .MuiDataGrid-root": {
                  border: "none",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f8fafc",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  borderBottom: "1px solid #e2e8f0",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #f1f5f9",
                  fontSize: "0.95rem",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#f8fafc",
                },
              }}
            >
              <DataGrid
                rows={bookings || []}
                columns={bookingColumns}
                getRowId={(row) => row.bookingId}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10 },
                  },
                }}
                pageSizeOptions={[5, 10, 20]}
                checkboxSelection={false}
                disableRowSelectionOnClick
                loading={loading}
              />
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
