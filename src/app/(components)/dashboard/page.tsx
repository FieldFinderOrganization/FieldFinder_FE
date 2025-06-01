"use client";
import Header from "@/utils/header";
import * as React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { getAllProviders } from "@/services/provider";
import { getAllPitches } from "@/services/pitch";
import { getAllUsers } from "@/services/user";

export interface PitchData {
  pitchId: string;
  providerAddressId: string;
  name: string;
  type: "FIVE_A_SIDE" | "SEVEN_A_SIDE" | "ELEVEN_A_SIDE";
  price: number;
  description?: string;
}

interface UserData {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: "USER" | "PROVIDER";
}

interface ProviderData {
  providerId: string;
  userId: string;
  cardNumber: string;
  bank: string;
}

const Dashboard: React.FC = () => {
  const [users, setUsers] = React.useState<UserData[]>([]);
  const [providers, setProviders] = React.useState<ProviderData[]>([]);
  const [pitches, setPitches] = React.useState<PitchData[]>([]);
  const [loading, setLoading] = React.useState(true);

  const weeklyUserData = [0, 1, 2, users.length];
  const weeklyProviderData = [0, 1, 2, providers.length];
  const weeklyPitchData = [0, 2, 3, pitches.length];
  const weeklyInvoiceData = [0, 1, 2, 5];

  // Định nghĩa cột cho bảng người dùng
  const userColumns: GridColDef<UserData>[] = [
    { field: "userId", headerName: "ID Người dùng", width: 250 },
    { field: "name", headerName: "Tên", width: 150, editable: true },
    { field: "email", headerName: "Email", width: 200, editable: true },
    { field: "phone", headerName: "Số điện thoại", width: 150, editable: true },
    { field: "role", headerName: "Vai trò", width: 120 },
  ];

  // Định nghĩa cột cho bảng nhà cung cấp
  const providerColumns: GridColDef<
    ProviderData & { userName: string; userEmail: string }
  >[] = [
    { field: "providerId", headerName: "ID Nhà cung cấp", width: 250 },
    { field: "userName", headerName: "Tên", width: 150 },
    { field: "userEmail", headerName: "Email", width: 200 },
    { field: "cardNumber", headerName: "Số thẻ", width: 150, editable: true },
    { field: "bank", headerName: "Ngân hàng", width: 150, editable: true },
  ];

  // Kết hợp dữ liệu người dùng với nhà cung cấp
  const providerRows = providers.map((provider) => {
    const user = users.find((u) => u.userId === provider.userId);
    return {
      id: provider.providerId,
      ...provider,
      userName: user?.name || "Không xác định",
      userEmail: user?.email || "Không xác định",
    };
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [userRes, providerRes, pitchRes] = await Promise.all([
          getAllUsers(),
          getAllProviders(),
          getAllPitches(),
        ]);

        setUsers(
          (userRes || []).map((user: any) => ({
            userId: user.userId ?? user.id ?? "",
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role ?? "USER",
          }))
        );
        setProviders(providerRes || []);
        setPitches(pitchRes || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 mx-auto px-4 sm:px-8 flex flex-col space-y-[1rem] sm:space-y-[2rem] pt-[100px] pb-[100px]">
      <Header />

      <div className="main flex flex-col items-center max-w-7xl w-full px-4 mt-[1rem] mx-auto">
        <div className="w-full mb-8">
          <h1 className="text-2xl font-bold mb-4">Tổng Quan Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">Tổng Người Dùng</h3>
              <p className="text-3xl">{users.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">Tổng Nhà Cung Cấp</h3>
              <p className="text-3xl">{providers.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">Tổng Sân Bóng</h3>
              <p className="text-3xl">{pitches.length}</p>
            </div>
          </div>
        </div>

        <div className="w-full mb-8">
          <h2 className="text-xl font-semibold mb-4">Tăng Trưởng Hàng Tuần</h2>
          <BarChart
            xAxis={[
              {
                scaleType: "band",
                data: [1, 2, 3, 4],
                valueFormatter: (value) => `Tuần ${value}`,
              },
            ]}
            series={[
              { label: "Người dùng", data: weeklyUserData },
              { label: "Nhà cung cấp", data: weeklyProviderData },
              { label: "Sân bóng", data: weeklyPitchData },
              { label: "Hóa đơn", data: weeklyInvoiceData },
            ]}
            yAxis={[{ label: "Số lượng" }]}
            height={300}
          />
        </div>

        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">Phân Tích Xu Hướng</h2>
          <LineChart
            xAxis={[
              {
                data: [1, 2, 3, 4],
                valueFormatter: (value) => `Tuần ${value}`,
                label: "Dòng thời gian",
              },
            ]}
            series={[
              { label: "Người dùng", data: weeklyUserData, color: "#1976d2" },
              {
                label: "Nhà cung cấp",
                data: weeklyProviderData,
                color: "#d32f2f",
              },
              { label: "Sân bóng", data: weeklyPitchData, color: "#ed6c02" },
              { label: "Hóa đơn", data: weeklyInvoiceData, color: "#2e7d32" },
            ]}
            yAxis={[{ label: "Số lượng" }]}
            height={300}
            margin={{ bottom: 30, left: 50 }}
          />
        </div>

        {/* Bảng Người Dùng */}
        <div className="w-full mt-8">
          <h2 className="text-xl font-semibold mb-4">Danh sách người dùng</h2>
          <Box sx={{ height: 400, width: "100%", mb: 4 }}>
            <DataGrid
              rows={users.map((user) => ({ id: user.userId, ...user }))}
              columns={userColumns}
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

        {/* Bảng Nhà Cung Cấp */}
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">Danh sách nhà cung cấp</h2>
          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={providerRows}
              columns={providerColumns}
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
  );
};

export default Dashboard;
