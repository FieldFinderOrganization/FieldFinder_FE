/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Header from "@/utils/header";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  loginSuccess,
  update,
  logout,
  setShowSidebar,
} from "@/redux/features/authSlice";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Divider,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Box,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import "../profile/profile.css";
import { toast } from "react-toastify";

import {
  addProvider,
  updateProvider,
  getProvider,
  getAllProviders,
  getAddressByProviderId,
} from "../../../services/provider";
import Sidebar from "@/utils/sideBar";
import AddressInfo from "../addressInfo/page";
import PitchInfo from "../pitchInfo/PitchInfo";
import {
  getPitchesByProviderAddressId,
  getAllPitches,
} from "../../../services/pitch";
import { getAllUsers, updateUser, getUserById } from "@/services/user";
import {
  BookingResponseDTO,
  getAllBookings,
  updatePaymentStatus,
  updateStatus,
  getBookingByProviderId,
} from "@/services/booking";
import { getAllPayments } from "@/services/payment";
import dayjs from "dayjs";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import { persistor } from "@/redux/store";
import ChatBox from "@/utils/chatBox";
import { GiSoccerBall } from "react-icons/gi";

// IMPORT COMPONENT UPLOAD CỦA BẠN (Sửa đường dẫn nếu cần)
import ImageEditorUploader from "@/utils/imageEditorUploader";

const Profile: React.FC = () => {
  const [activeChatUser, setActiveChatUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.user);
  const searchParams = useSearchParams();
  const baseTabs = [{ label: "Thông tin cá nhân", value: 0 }];

  const providerTabs = [
    { label: "Thông tin cá nhân", value: 0 },
    { label: "Thông tin sân", value: 1 },
    { label: "Thông tin đặt sân", value: 2 },
  ];

  const tabs = user?.role === "PROVIDER" ? providerTabs : baseTabs;

  const initialTab = parseInt(searchParams.get("tab") || "0", 10);
  const [initTab, setInitTab] = useState(
    tabs.find((tab) => tab.value === initialTab)?.value || tabs[0].value,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProvider, setIsEditingProvider] = useState(false);

  // STATE CHO TAB KHU VỰC
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [areas, setAreas] = useState<
    { id: string; name: string; count: number }[]
  >([]);
  const selectedAreaId = areas[selectedIndex]?.id;

  const banks = [
    { code: "BIDV", name: "BIDV" },
    { code: "VCB", name: "VietcomBank" },
    { code: "TCB", name: "Techcombank" },
    { code: "MB", name: "MBBank" },
    { code: "CTG", name: "VietinBank" },
  ];

  const [bookings, setBookings] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingResponseDTO | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("PAID");

  const handleOpen = (booking: BookingResponseDTO) => {
    setSelectedBooking(booking);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBooking(null);
  };

  const handleChangePaymentStatus = (event: SelectChangeEvent) => {
    setPaymentStatus(event.target.value as string);
  };

  const handleConfirm = async () => {
    if (selectedBooking) {
      try {
        await updateStatus(selectedBooking.bookingId, "CONFIRMED");
        await updatePaymentStatus(selectedBooking.bookingId, paymentStatus);
        toast.success("Cập nhật trạng thái thành công");

        if (user?.providerId) {
          resetBooking(user.providerId);
        }

        handleClose();
      } catch (error) {
        toast.error("Lỗi khi cập nhật trạng thái");
      }
    }
  };

  const slotToTime = (slot: number): string => {
    const startHour = slot + 5;
    const endHour = slot + 6;
    return `${startHour}:00-${endHour}:00`;
  };

  const mergeContinuousSlots = (slots: number[]): string => {
    if (slots.length === 0) return "Không có slot";

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
      field: "userName",
      headerName: "Khách hàng",
      width: 160,
      renderCell: (params) => (
        <span className="font-semibold text-gray-800">
          {params.row.userName}
        </span>
      ),
    },
    { field: "pitchName", headerName: "Tên sân", width: 160 },
    {
      field: "timeRange",
      headerName: "Khung giờ",
      width: 160,
      renderCell: (params) => {
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
      width: 130,
      renderCell: (params) => (
        <span className="font-bold text-[#e25b43]">
          {params.row.totalPrice?.toLocaleString("vi-VN")} đ
        </span>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Thao tác",
      width: 160,
      getActions: (params) => {
        if (!params || !params.row) {
          return [];
        }
        const booking = params.row as BookingResponseDTO & {
          paymentMethod?: string;
          userName?: string;
          userId?: string;
        };

        return [
          <Box
            sx={{
              "& .MuiIconButton-root": {
                color: "#64748b",
                "&:hover": { color: "#0093FF", backgroundColor: "#e0f2fe" },
              },
            }}
          >
            <GridActionsCellItem
              icon={<EditOutlinedIcon />}
              label="Sửa trạng thái"
              onClick={() => handleOpen(booking)}
              showInMenu={false}
            />
          </Box>,
          <Box
            sx={{
              "& .MuiIconButton-root": {
                color: "#64748b",
                "&:hover": { color: "#10b981", backgroundColor: "#d1fae5" },
              },
            }}
          >
            <GridActionsCellItem
              icon={<ChatBubbleOutlineIcon color="primary" />}
              label="Nhắn tin với khách"
              onClick={() => {
                if (booking.userId) {
                  setActiveChatUser({
                    id: booking.userId,
                    name: booking.userName || "Khách hàng",
                  });
                } else {
                  toast.warning("Không tìm thấy thông tin khách hàng!");
                }
              }}
              showInMenu={false}
            />
          </Box>,
        ];
      },
    },
  ];

  const resetBooking = async (providerId: string) => {
    try {
      const providerBookings = await getBookingByProviderId(providerId);
      const sortedBookings = [...providerBookings].sort(
        (a, b) =>
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime(),
      );
      setBookings(sortedBookings);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Lỗi khi tải danh sách đơn đặt!");
    }
  };

  useEffect(() => {
    if (user?.role === "PROVIDER" && user?.providerId) {
      resetBooking(user.providerId);
    }
  }, [user?.userId, user?.role, user?.providerId]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!user?.userId) return;

      const freshUser = await getUserById(user.userId);

      dispatch(
        update({
          role: freshUser.role,
          name: freshUser.name,
          email: freshUser.email,
          phone: freshUser.phone,
          imageUrl: freshUser.imageUrl, // Đồng bộ ảnh vào Redux nếu có
        }),
      );
    };

    fetchUser();
  }, [user?.userId]);

  const fetchPitchesForAllAreas = async () => {
    if (user?.providerId) {
      try {
        const providerAddresses = await getAddressByProviderId(user.providerId);

        const updatedAreas = await Promise.all(
          providerAddresses.map(async (addr: any) => {
            try {
              const pitchList = await getPitchesByProviderAddressId(
                addr.providerAddressId,
              );
              return {
                id: addr.providerAddressId,
                name: addr.address,
                count: pitchList.length || 0,
              };
            } catch (error) {
              return {
                id: addr.providerAddressId,
                name: addr.address,
                count: 0,
              };
            }
          }),
        );
        setAreas(updatedAreas);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách địa chỉ:", error);
      }
    }
  };

  useEffect(() => {
    fetchPitchesForAllAreas();
  }, [user?.providerId]);

  const handleSelectArea = (index: number) => {
    setSelectedIndex(index);
  };

  const [providerUser, setProviderUser] = useState({
    cardNumber: user?.cardNumber || "Chưa có thông tin",
    bank: user?.bank || "Chưa có thông tin",
  });

  useEffect(() => {
    if (user && user.role === "PROVIDER" && !user.providerId) {
      const fetchProviderData = async () => {
        try {
          const res = await getProvider(user.userId);
          if (res) {
            dispatch(
              update({
                cardNumber: res.cardNumber || "",
                bank: res.bank || "",
                providerId: res.providerId || "",
              }),
            );
            setProviderUser({
              cardNumber: res.cardNumber || "Chưa có thông tin",
              bank: res.bank || "Chưa có thông tin",
            });
          }
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu provider:", error);
        }
      };
      fetchProviderData();
    }
  }, [user, dispatch]);

  // STATE ĐƯỢC MỞ RỘNG ĐỂ CHỨA THÊM IMAGE_URL
  const [editedUser, setEditedUser] = useState({
    name: user?.name || "Nguyễn Văn A",
    email: user?.email || "vittapbay@gmail.com",
    phone: user?.phone || "0000000000",
    status: "ACTIVE",
    imageUrl: user?.imageUrl || "",
  });

  // Tự động cập nhật editedUser khi user Redux tải xong
  useEffect(() => {
    if (user) {
      setEditedUser((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone || "Chưa cập nhật",
        imageUrl: user.imageUrl || "",
      }));
    }
  }, [user]);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setInitTab(newValue);
    dispatch(setShowSidebar(true));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({
      name: user?.name || "Nguyễn Văn A",
      email: user?.email || "vittapbay@gmail.com",
      phone: user?.phone || "0000000000",
      status: "ACTIVE",
      imageUrl: user?.imageUrl || "",
    });
  };

  const handleSave = async () => {
    try {
      await updateUser(editedUser, user?.userId);
      setIsEditing(false);
      // Cập nhật cả imageUrl mới vào Redux để hiển thị toàn App
      dispatch(
        update({
          name: editedUser.name,
          email: editedUser.email,
          phone: editedUser.phone,
          imageUrl: editedUser.imageUrl,
        }),
      );
      toast.success("Cập nhật thông tin thành công!");
    } catch (err) {
      toast.error("Lỗi cập nhật thông tin!");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProviderInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setProviderUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditProvider = () => {
    setIsEditingProvider(true);
  };

  const handleCancelProvider = () => {
    setIsEditingProvider(false);
    setProviderUser({
      cardNumber: user?.cardNumber || "Chưa có thông tin",
      bank: user?.bank || "Chưa có thông tin",
    });
  };

  const handleSaveProvider = async () => {
    try {
      const providerData = {
        cardNumber: providerUser.cardNumber,
        bank: providerUser.bank,
      };

      if (
        !providerData.cardNumber ||
        providerData.cardNumber === "Chưa có thông tin" ||
        !providerData.bank ||
        providerData.bank === "Chưa có thông tin"
      ) {
        toast.warn("Vui lòng nhập đầy đủ số tài khoản và tên ngân hàng.");
        return;
      }

      let currentProviderId = user?.providerId;

      if (!currentProviderId) {
        const response = await addProvider(providerData, user?.userId);
        currentProviderId = response.providerId;
        dispatch(
          update({
            cardNumber: providerUser.cardNumber,
            bank: providerUser.bank,
            providerId: currentProviderId,
          }),
        );
      } else {
        await updateProvider(providerData, currentProviderId);
        dispatch(
          update({
            cardNumber: providerUser.cardNumber,
            bank: providerUser.bank,
          }),
        );
      }

      setIsEditingProvider(false);
      toast.success("Cập nhật thông tin Chủ sân thành công");
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin nhà cung cấp:", err);
      toast.error("Cập nhật thông tin thất bại");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    persistor.purge();
    router.push("/login");
  };

  const isProviderInfoEmpty =
    providerUser.cardNumber === "Chưa có thông tin" &&
    providerUser.bank === "Chưa có thông tin";

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex flex-col pt-[80px] pb-[100px] font-sans">
      <Header />

      {/* Container Chính */}
      <div className="flex flex-col md:flex-row items-start justify-center gap-6 w-full max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <Sidebar
          tabs={tabs}
          initTab={initTab}
          handleChangeTab={handleChangeTab}
          handleLogout={handleLogout}
        />

        <div className="w-full md:flex-1 space-y-8">
          {/* TAB 0: Thông tin cá nhân */}
          {initTab === 0 && (
            <div className="flex flex-col gap-6">
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "800",
                  color: "#1e293b",
                  letterSpacing: "-0.5px",
                }}
              >
                Hồ sơ cá nhân
              </Typography>

              {/* Thẻ Avatar & Header */}
              <div className="bg-white w-full rounded-[20px] shadow-sm border border-gray-100 p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:shadow-md">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                  {/* HIỂN THỊ ẢNH AVATAR */}
                  <div className="relative group">
                    <img
                      src={
                        editedUser.imageUrl ||
                        user?.imageUrl ||
                        "./images/lc1.jpg"
                      }
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-gray-100"
                    />
                    <div className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                  </div>

                  <div className="flex flex-col justify-center gap-y-1">
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: "800", color: "#0f172a" }}
                    >
                      {editedUser?.name || "Nguyễn Văn A"}
                    </Typography>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <Chip
                        label={user?.role || "Người dùng"}
                        size="small"
                        sx={{
                          backgroundColor:
                            user?.role === "PROVIDER" ? "#e0e7ff" : "#f1f5f9",
                          color:
                            user?.role === "PROVIDER" ? "#0369a1" : "#475569",
                          fontWeight: "bold",
                          fontSize: "0.75rem",
                        }}
                      />
                      <Typography className="text-gray-400 text-sm">
                        {editedUser.email}
                      </Typography>
                    </div>

                    {/* HIỂN THỊ NÚT UPLOAD KHI Ở CHẾ ĐỘ CHỈNH SỬA */}
                    {isEditing && (
                      <div className="mt-3">
                        <ImageEditorUploader
                          onUploadSuccess={(url) =>
                            setEditedUser((prev) => ({
                              ...prev,
                              imageUrl: url,
                            }))
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                  {!isEditing ? (
                    <Button
                      variant="outlined"
                      startIcon={<BorderColorIcon fontSize="small" />}
                      onClick={handleEdit}
                      sx={{
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: "700",
                        borderColor: "#e2e8f0",
                        color: "#475569",
                        "&:hover": {
                          backgroundColor: "#f8fafc",
                          borderColor: "#cbd5e1",
                        },
                      }}
                    >
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#0093FF",
                          color: "white",
                          fontWeight: "700",
                          borderRadius: "10px",
                          textTransform: "none",
                          boxShadow: "none",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0,147,255,0.2)",
                          },
                        }}
                        onClick={handleSave}
                      >
                        Lưu thay đổi
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        sx={{
                          fontWeight: "700",
                          borderRadius: "10px",
                          textTransform: "none",
                        }}
                        onClick={handleCancel}
                      >
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Lưới thông tin chi tiết */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[16px] border border-gray-100 shadow-sm flex flex-col gap-1">
                  <Typography className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    Họ và Tên
                  </Typography>
                  {isEditing ? (
                    <TextField
                      name="name"
                      value={editedUser.name}
                      onChange={handleInputChange}
                      size="small"
                      fullWidth
                      sx={{ mt: 1 }}
                    />
                  ) : (
                    <Typography
                      sx={{
                        fontWeight: "600",
                        color: "#1e293b",
                        fontSize: "1.05rem",
                      }}
                    >
                      {editedUser.name}
                    </Typography>
                  )}
                </div>

                <div className="bg-white p-5 rounded-[16px] border border-gray-100 shadow-sm flex flex-col gap-1">
                  <Typography className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    Địa chỉ Email
                  </Typography>
                  {isEditing ? (
                    <TextField
                      name="email"
                      value={editedUser.email}
                      onChange={handleInputChange}
                      size="small"
                      fullWidth
                      sx={{ mt: 1 }}
                      disabled // Email không nên cho sửa dễ dàng
                    />
                  ) : (
                    <Typography
                      sx={{
                        fontWeight: "600",
                        color: "#1e293b",
                        fontSize: "1.05rem",
                      }}
                    >
                      {editedUser.email}
                    </Typography>
                  )}
                </div>

                <div className="bg-white p-5 rounded-[16px] border border-gray-100 shadow-sm flex flex-col gap-1">
                  <Typography className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    Số điện thoại
                  </Typography>
                  {isEditing ? (
                    <TextField
                      name="phone"
                      value={editedUser.phone}
                      onChange={handleInputChange}
                      size="small"
                      fullWidth
                      sx={{ mt: 1 }}
                    />
                  ) : (
                    <Typography
                      sx={{
                        fontWeight: "600",
                        color: "#1e293b",
                        fontSize: "1.05rem",
                      }}
                    >
                      {editedUser.phone || "Chưa cập nhật"}
                    </Typography>
                  )}
                </div>

                <div className="bg-white p-5 rounded-[16px] border border-gray-100 shadow-sm flex flex-col gap-1">
                  <Typography className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    Loại tài khoản
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "700",
                      color: "#0093FF",
                      fontSize: "1.05rem",
                    }}
                  >
                    {user?.role === "PROVIDER"
                      ? "Đối tác Chủ sân"
                      : "Khách hàng thành viên"}
                  </Typography>
                </div>
              </div>
            </div>
          )}

          {/* TAB 0 (Tiếp tục): Thông tin nhà cung cấp */}
          {initTab === 0 && user?.role === "PROVIDER" && (
            <div className="flex flex-col gap-6 mt-8">
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "800",
                  color: "#1e293b",
                  letterSpacing: "-0.5px",
                }}
              >
                Thiết lập Chủ sân
              </Typography>

              <div className="bg-white w-full rounded-[20px] shadow-sm border border-gray-100 p-6 lg:p-8 flex flex-col gap-y-8 transition-all hover:shadow-md">
                {/* Banner Hoàn thiện hồ sơ */}
                <div
                  className={`flex flex-col sm:flex-row items-center justify-between w-full gap-4 p-5 rounded-2xl border ${isProviderInfoEmpty ? "bg-orange-50 border-orange-100" : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100"}`}
                >
                  <div className="flex items-center gap-x-4 w-full sm:w-auto">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center bg-white shadow-sm ${isProviderInfoEmpty ? "text-orange-500" : "text-emerald-500"}`}
                    >
                      {isProviderInfoEmpty ? (
                        <WarningAmberIcon fontSize="medium" />
                      ) : (
                        <VerifiedUserIcon fontSize="medium" />
                      )}
                    </div>
                    <div className="flex flex-col gap-y-1">
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "800",
                          color: isProviderInfoEmpty ? "#c2410c" : "#065f46",
                          lineHeight: 1,
                        }}
                      >
                        {isProviderInfoEmpty
                          ? "Hồ sơ chưa hoàn tất"
                          : "Hồ sơ hoàn tất 100%"}
                      </Typography>
                      <Typography
                        className={`text-sm font-medium ${isProviderInfoEmpty ? "text-orange-600" : "text-emerald-600"}`}
                      >
                        {isProviderInfoEmpty
                          ? "Cập nhật ngân hàng để nhận thanh toán"
                          : "Bạn đã có thể nhận tiền từ khách hàng"}
                      </Typography>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                    {!isEditingProvider ? (
                      <Button
                        variant="contained"
                        onClick={handleEditProvider}
                        sx={{
                          borderRadius: "10px",
                          textTransform: "none",
                          fontWeight: "700",
                          backgroundColor: isProviderInfoEmpty
                            ? "#ea580c"
                            : "#059669",
                          boxShadow: "none",
                          "&:hover": {
                            backgroundColor: isProviderInfoEmpty
                              ? "#c2410c"
                              : "#047857",
                            boxShadow: "none",
                          },
                        }}
                      >
                        {isProviderInfoEmpty
                          ? "Bổ sung ngay"
                          : "Chỉnh sửa ngân hàng"}
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor: "#0093FF",
                            fontWeight: "700",
                            borderRadius: "10px",
                            textTransform: "none",
                            boxShadow: "none",
                          }}
                          onClick={handleSaveProvider}
                        >
                          Lưu
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          sx={{
                            fontWeight: "700",
                            borderRadius: "10px",
                            textTransform: "none",
                          }}
                          onClick={handleCancelProvider}
                        >
                          Hủy
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="flex flex-col items-start gap-y-2 flex-1 w-full">
                    <Typography className="text-gray-500 font-bold text-xs uppercase tracking-wider">
                      Số tài khoản ngân hàng
                    </Typography>
                    {isEditingProvider ? (
                      <TextField
                        name="cardNumber"
                        type="string"
                        value={providerUser.cardNumber}
                        onChange={handleProviderInputChange}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      <Typography
                        sx={{
                          fontWeight: "600",
                          fontSize: "1.1rem",
                          color:
                            providerUser.cardNumber === "Chưa có thông tin"
                              ? "#94a3b8"
                              : "#1e293b",
                        }}
                      >
                        {providerUser.cardNumber}
                      </Typography>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-y-2 flex-1 w-full">
                    <Typography className="text-gray-500 font-bold text-xs uppercase tracking-wider">
                      Ngân hàng thụ hưởng
                    </Typography>
                    {isEditingProvider ? (
                      <Autocomplete
                        options={banks}
                        getOptionLabel={(option) => option.name}
                        value={
                          banks.find(
                            (bank) => bank.code === providerUser.bank,
                          ) || null
                        }
                        onChange={(_, value) => {
                          setProviderUser((prev) => ({
                            ...prev,
                            bank: value ? value.code : "",
                          }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            name="bank"
                            size="small"
                            fullWidth
                          />
                        )}
                        sx={{ width: "100%" }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          fontWeight: "600",
                          fontSize: "1.1rem",
                          color:
                            providerUser.bank === "Chưa có thông tin"
                              ? "#94a3b8"
                              : "#1e293b",
                        }}
                      >
                        {providerUser.bank}
                      </Typography>
                    )}
                  </div>
                </div>

                <Divider sx={{ width: "100%", borderStyle: "dashed" }} />

                <div className="w-full">
                  <AddressInfo providerId={user?.providerId} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Thông tin sân */}
          {initTab === 1 && (
            <div className="flex flex-col gap-6">
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "800",
                  color: "#1e293b",
                  letterSpacing: "-0.5px",
                }}
              >
                Quản lý Sân bóng
              </Typography>
              <div className="bg-white w-full flex flex-col md:flex-row items-start justify-start rounded-[20px] shadow-sm border border-gray-100 p-6 gap-8">
                {/* Cột chọn Khu vực */}
                <div className="w-full md:w-[30%] flex flex-col gap-y-4">
                  <Typography
                    sx={{
                      fontWeight: "700",
                      fontSize: "1rem",
                      color: "#64748b",
                      textTransform: "uppercase",
                      tracking: "wider",
                    }}
                  >
                    Các khu vực
                  </Typography>
                  <div className="flex flex-col gap-y-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar">
                    <div className="flex md:flex-col gap-3 min-w-max md:min-w-0">
                      {areas.map((area, index) => {
                        const isSelected = selectedIndex === index;
                        return (
                          <div
                            className={`flex flex-col items-start justify-center rounded-xl px-5 py-4 cursor-pointer transition-all border ${
                              isSelected
                                ? "bg-orange-50 border-orange-200 text-orange-700 shadow-sm"
                                : "bg-white border-gray-100 text-gray-600 hover:border-orange-100 hover:bg-orange-50/50"
                            } md:w-full`}
                            onClick={() => handleSelectArea(index)}
                            key={index}
                          >
                            <Typography
                              sx={{ fontWeight: "700", fontSize: "0.95rem" }}
                              className="truncate w-full"
                            >
                              {area.name}
                            </Typography>
                            <div
                              className={`flex items-center gap-x-1 mt-1.5 ${isSelected ? "text-orange-600" : "text-gray-400"}`}
                            >
                              <LocationOnOutlinedIcon
                                sx={{ fontSize: "1.1rem" }}
                              />
                              <Typography
                                sx={{ fontSize: "0.85rem", fontWeight: "600" }}
                              >
                                {area.count} sân đang hoạt động
                              </Typography>
                            </div>
                          </div>
                        );
                      })}
                      {areas.length === 0 && (
                        <Typography className="text-gray-400 italic text-sm py-4">
                          Chưa có khu vực nào. Hãy thêm địa chỉ ở phần Hồ sơ.
                        </Typography>
                      )}
                    </div>
                  </div>
                </div>

                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    display: { xs: "none", md: "block" },
                    borderStyle: "dashed",
                  }}
                />
                <Divider
                  orientation="horizontal"
                  flexItem
                  sx={{
                    display: { xs: "block", md: "none" },
                    width: "100%",
                    borderStyle: "dashed",
                  }}
                />

                {/* Cột hiển thị Sân bóng */}
                <div className="w-full md:flex-1 flex flex-col min-h-[500px]">
                  {selectedAreaId ? (
                    <PitchInfo
                      providerAddressId={selectedAreaId}
                      onPitchUpdate={fetchPitchesForAllAreas}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full bg-[#f8fafc] rounded-2xl border-2 border-dashed border-gray-200 p-10 mt-4 md:mt-0">
                      <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                        <GiSoccerBall size={40} color="#cbd5e1" />
                      </div>
                      <Typography
                        sx={{
                          color: "#64748b",
                          fontWeight: "600",
                          fontSize: "1.1rem",
                        }}
                      >
                        Chưa chọn khu vực
                      </Typography>
                      <Typography
                        sx={{
                          color: "#94a3b8",
                          fontSize: "0.9rem",
                          textAlign: "center",
                          mt: 1,
                          maxWidth: "300px",
                        }}
                      >
                        Vui lòng chọn một khu vực bên trái để xem và quản lý các
                        sân bóng tương ứng.
                      </Typography>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Thông tin đặt sân */}
          {initTab === 2 && user?.role === "PROVIDER" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "800",
                    color: "#1e293b",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Đơn đặt sân gần đây
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<RestartAltOutlinedIcon />}
                  onClick={() => resetBooking(user?.providerId)}
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
                />
              </Box>
            </div>
          )}
        </div>
      </div>

      {activeChatUser && (
        <ChatBox
          currentUserId={user?.userId}
          receiverId={activeChatUser.id}
          receiverName={activeChatUser.name}
          onClose={() => setActiveChatUser(null)}
        />
      )}

      {/* Modal Xác Nhận Thanh Toán */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 450 },
            bgcolor: "white",
            borderRadius: "24px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            p: 4,
            outline: "none",
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "800", color: "#0f172a", mb: 1 }}
          >
            Cập nhật trạng thái Booking
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
            Vui lòng kiểm tra kỹ thông tin đơn đặt sân trước khi xác nhận thanh
            toán.
          </Typography>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-5">
            {selectedBooking && (
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Mã đơn:</span>
                  <span className="text-slate-800 font-mono text-xs">
                    {selectedBooking.bookingId.split("-")[0]}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Ngày đặt:</span>
                  <span className="text-slate-800 font-semibold">
                    {dayjs(selectedBooking.bookingDate).format("DD/MM/YYYY")}
                  </span>
                </div>
                <Divider sx={{ borderStyle: "dashed", my: 0.5 }} />
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Cần thu:</span>
                  <span className="text-[#e25b43] font-black text-lg">
                    {selectedBooking.totalPrice.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            )}
          </div>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel id="payment-status-label" sx={{ fontWeight: 600 }}>
              Trạng thái thực tế
            </InputLabel>
            <Select
              labelId="payment-status-label"
              value={paymentStatus}
              label="Trạng thái thực tế"
              onChange={handleChangePaymentStatus}
              sx={{
                borderRadius: "12px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#cbd5e1",
                },
              }}
            >
              <MenuItem value="PAID" sx={{ fontWeight: 600, color: "#059669" }}>
                Khách đã thanh toán đủ
              </MenuItem>
              <MenuItem
                value="PENDING"
                sx={{ fontWeight: 600, color: "#d97706" }}
              >
                Khách chưa thanh toán
              </MenuItem>
              <MenuItem
                value="REFUNDED"
                sx={{ fontWeight: 600, color: "#dc2626" }}
              >
                Hoàn tiền cho khách
              </MenuItem>
            </Select>
          </FormControl>

          <Box
            sx={{ display: "flex", justifyContent: "space-between", gap: 3 }}
          >
            <Button
              variant="outlined"
              fullWidth
              onClick={handleClose}
              sx={{
                borderRadius: "12px",
                fontWeight: "700",
                padding: "10px 0",
                color: "#64748b",
                borderColor: "#cbd5e1",
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleConfirm}
              sx={{
                borderRadius: "12px",
                fontWeight: "700",
                padding: "10px 0",
                bgcolor: "#0093FF",
                boxShadow: "none",
                "&:hover": { boxShadow: "0 4px 12px rgba(0,147,255,0.25)" },
              }}
            >
              Xác nhận
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default Profile;
