"use client";

import { logout, setShowSidebar } from "@/redux/features/authSlice";
import { BookingResponseDTO, getBookingByUserId } from "@/services/booking";
import Header from "@/utils/header";
import Sidebar from "@/utils/sideBar";
import { Box, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "@/services/user";
import { getAllProviders } from "@/services/provider";
import { getAllPitches } from "@/services/pitch";

interface EnhancedBooking extends BookingResponseDTO {
  providerName: string;
  pitchName: string;
  slots: number[];
}

const slotToTime = (slot: number): string => {
  const startHour = slot + 5;
  const endHour = slot + 6;
  return `${startHour}:00-${endHour}:00`;
};

const mergeContinuousSlots = (slots: number[]): string => {
  if (slots.length === 0) return "Không có slot";

  const sortedSlots = [...slots].sort((a, b) => a - b);

  let result: string[] = [];
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
          `${slotToTime(start).split("-")[0]}-${slotToTime(current).split("-")[1]}`
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
      `${slotToTime(start).split("-")[0]}-${slotToTime(current).split("-")[1]}`
    );
  }

  return result.join(", ");
};

const BookingHistory: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [bookings, setBookings] = React.useState<EnhancedBooking[]>([]);
  const [loading, setLoading] = React.useState(true);

  const user = useSelector((state: any) => state.auth.user);
  const baseTabs = [{ label: "Thông tin cá nhân", value: 0 }];

  const providerTabs = [
    { label: "Thông tin cá nhân", value: 0 },
    { label: "Thông tin sân", value: 1 },
    { label: "Thông tin đặt sân", value: 2 },
  ];

  const tabs = user?.role === "PROVIDER" ? providerTabs : baseTabs;

  const [initTab, setInitTab] = useState(tabs[0].value);
  const [show, setShow] = useState(false);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setInitTab(newValue);
    dispatch(setShowSidebar(true));
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const bookingColumns: GridColDef[] = [
    { field: "bookingDate", headerName: "Ngày đặt", width: 150 },
    { field: "providerName", headerName: "Tên chủ sân", width: 150 },
    { field: "pitchName", headerName: "Tên sân", width: 150 },
    {
      field: "timeRange",
      headerName: "Khung giờ",
      width: 200,
      renderCell: (params: GridRenderCellParams<EnhancedBooking>) => {
        if (!params.row) return "Không có dữ liệu";
        return mergeContinuousSlots(params.row.slots);
      },
    },
    {
      field: "status",
      headerName: "Trạng thái đặt sân",
      width: 150,
      renderCell: (params) => {
        let typeText = "";
        switch (params.row.status) {
          case "PENDING":
            typeText = "Đang chờ";
            break;
          case "CONFIRMED":
            typeText = "Đã xác nhận";
            break;
          case "CANCELED":
            typeText = "Đã hủy";
            break;
          default:
            typeText = params.row.status;
        }
        return <span>{typeText}</span>;
      },
    },
    {
      field: "paymentStatus",
      headerName: "Trạng thái thanh toán",
      width: 150,
      renderCell: (params) => {
        let typeText = "";
        switch (params.row.paymentStatus) {
          case "PENDING":
            typeText = "Đang chờ";
            break;
          case "PAID":
            typeText = "Đã thanh toán";
            break;
          default:
            typeText = params.row.paymentStatus;
        }
        return <span>{typeText}</span>;
      },
    },
    { field: "totalPrice", headerName: "Tổng giá tiền", width: 120 },
  ];

  React.useEffect(() => {
    if (user && user.userId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [bookRes, userRes, providerRes, pitchesRes] = await Promise.all(
            [
              getBookingByUserId(user.userId),
              getAllUsers(),
              getAllProviders(),
              getAllPitches(),
            ]
          );

          const pitchMap = new Map(
            pitchesRes.map((pitch) => [pitch.pitchId, pitch])
          );

          const providerMap = new Map(
            providerRes.map((provider) => [provider.providerId, provider])
          );

          const userMap = new Map(userRes.map((user) => [user.userId, user]));

          const enhancedBookings = bookRes.map(
            (booking: BookingResponseDTO) => {
              const pitchId = booking.bookingDetails[0]?.pitchId;
              const pitch = pitchMap.get(pitchId);

              const provider = providerMap.get(booking.providerId);
              const providerUser = provider
                ? userMap.get(provider.userId)
                : null;

              return {
                ...booking,
                providerName: providerUser?.name || "Không xác định",
                pitchName: pitch?.name || "Không xác định",
                slots: booking.bookingDetails.map((detail) => detail.slot),
              };
            }
          );

          setBookings(enhancedBookings);
        } catch (error) {
          console.error("Lỗi khi tải dữ liệu:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 mx-auto flex flex-col space-y-[1rem] sm:space-y-[2rem] pt-[80px] pb-[100px]">
      <Header />
      <div className="main flex items-start justify-center gap-x-[2rem]">
        <Sidebar
          tabs={tabs}
          initTab={initTab}
          handleChangeTab={handleChangeTab}
          handleLogout={handleLogout}
        />
        <div className="w-[75%] mt-[1.5rem] space-y-[2rem]">
          <div className="flex flex-col items-start justify-start gap-y-[1rem]">
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Lịch sử đặt sân
            </Typography>
            <Box sx={{ height: 400, width: "100%", mb: 4 }}>
              <DataGrid
                rows={bookings || []}
                columns={bookingColumns}
                getRowId={(row) => row.bookingId}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 5,
                    },
                  },
                }}
                pageSizeOptions={[5]}
                checkboxSelection
                disableRowSelectionOnClick
              />
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
