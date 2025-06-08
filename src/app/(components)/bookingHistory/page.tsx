"use client";

import { logout } from "@/redux/features/authSlice";
import {
  BookingResponseDTO,
  getBookingByUserId,
  getBookingSlotByDate,
} from "@/services/booking";
import Header from "@/utils/header";
import Sidebar from "@/utils/sideBar";
import { Box, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "@/services/user";
import { getAllProviders } from "@/services/provider";
import { getPitchById } from "@/services/pitch";
import dayjs from "dayjs";

interface BookingSlot {
  pitchId: string;
  bookedSlots: number[];
}

interface EnhancedBooking extends BookingResponseDTO {
  providerName: string;
  pitchName: string;
  slots: number[];
}

const bookingHistory: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [bookings, setBookings] = React.useState<EnhancedBooking[]>([]);
  const [loading, setLoading] = React.useState(true);

  const user = useSelector((state: any) => state.auth.user);
  const baseTabs = [
    { label: "Thông tin cá nhân", value: 0 },
    { label: "Thông báo", value: 2 },
  ];

  const providerTabs = [
    { label: "Thông tin cá nhân", value: 0 },
    { label: "Thông tin sân", value: 1 },
    { label: "Thông tin đặt sân", value: 2 },
  ];

  const tabs = user?.role === "PROVIDER" ? providerTabs : baseTabs;

  const [initTab, setInitTab] = useState(tabs[0].value);
  const [show, setShow] = useState(false);

  const handleShow = (event: React.MouseEvent<HTMLElement>) => {
    setShow(!show);
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setInitTab(newValue);
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
      field: "slots",
      headerName: "Slots",
      width: 150,
      renderCell: (params) => params.row.slots.join(", ") || "Không có slot",
    },
    { field: "status", headerName: "Trạng thái đơn", width: 120 },
    { field: "paymentStatus", headerName: "Trạng thái thanh toán", width: 200 },
    { field: "totalPrice", headerName: "Tổng giá tiền", width: 120 },
  ];

  React.useEffect(() => {
    if (user && user.userId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [bookRes, userRes, providerRes] = await Promise.all([
            getBookingByUserId(user.userId),
            getAllUsers(),
            getAllProviders(),
          ]);

          const usersData = (userRes || []).map((u: any) => ({
            userId: u.userId ?? u.id ?? "",
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: u.role ?? "USER",
          }));

          const enhancedBookings = await Promise.all(
            (bookRes || []).map(async (booking: BookingResponseDTO) => {
              const date = dayjs(booking.bookingDate).format("YYYY-MM-DD");
              const slotData = await getBookingSlotByDate(date);
              const slotInfo = slotData.find((slot: BookingSlot) =>
                slot.bookedSlots.includes(booking.bookingDetails[0]?.slot)
              ) || { pitchId: "", bookedSlots: [] };
              const provider = providerRes.find(
                (p: any) => p.providerId === booking.providerId
              );
              const user = usersData.find(
                (u: any) => u.userId === provider?.userId
              );
              const pitch = slotInfo.pitchId
                ? await getPitchById(slotInfo.pitchId)
                : null;
              return {
                ...booking,
                providerName: user?.name || "Không xác định",
                pitchName: pitch?.name || "Không xác định",
                slots: slotInfo.bookedSlots || [],
              };
            })
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
          show={show}
          handleShow={handleShow}
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

export default bookingHistory;
