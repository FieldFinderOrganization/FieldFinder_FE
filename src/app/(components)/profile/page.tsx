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
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Select,
  MenuItem,
  Box,
  Modal,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import "../profile/profile.css";
import { toast } from "react-toastify";

import {
  addProvider,
  updateProvider,
  getProvider,
  getAllProviders,
} from "../../../services/provider";
import Sidebar from "@/utils/sideBar";
import AddressInfo from "../addressInfo/page";
import {
  getPitchesByProviderAddressId,
  createPitch,
  PitchRequestDTO,
  PitchResponseDTO,
  deletePitch,
  updatePitch,
  getAllPitches,
} from "../../../services/pitch";
import { getAllUsers, updateUser } from "@/services/user";
import {
  BookingResponseDTO,
  getAllBookings,
  updatePaymentStatus,
  updateStatus,
} from "@/services/booking";
import { getAllPayments } from "@/services/payment";
import dayjs from "dayjs";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.user);
  const searchParams = useSearchParams();
  const baseTabs = [
    { label: "Thông tin cá nhân", value: 0 },
    // { label: "Thông báo", value: 2 },
  ];

  const providerTabs = [
    { label: "Thông tin cá nhân", value: 0 },
    { label: "Thông tin sân", value: 1 },
    { label: "Thông tin đặt sân", value: 2 },
  ];

  const tabs = user?.role === "PROVIDER" ? providerTabs : baseTabs;

  const initialTab = parseInt(searchParams.get("tab") || "0", 10);
  const [initTab, setInitTab] = useState(
    tabs.find((tab) => tab.value === initialTab)?.value || tabs[0].value
  );
  const [show, setShow] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProvider, setIsEditingProvider] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const [areas, setAreas] = useState<
    { id: string; name: string; count: number }[]
  >([]);
  const [pitchesByArea, setPitchesByArea] = useState<{
    [key: string]: PitchResponseDTO[];
  }>({});
  const [pitches, setPitches] = useState<PitchResponseDTO[]>([]);
  const [selectedPitchIds, setSelectedPitchIds] = useState<string[]>([]);
  const [openPitchModal, setOpenPitchModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pitchToEdit, setPitchToEdit] = useState<PitchResponseDTO | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const selectedAreaId = areas[selectedIndex]?.id;

  const [currentPage, setCurrentPage] = useState(1);
  const pitchesPerPage = 6;
  const totalPitches = pitches.length;
  const totalPages = Math.ceil(totalPitches / pitchesPerPage);
  const indexOfLastPitch = currentPage * pitchesPerPage;
  const indexOfFirstPitch = indexOfLastPitch - pitchesPerPage;
  const currentPitches = pitches.slice(indexOfFirstPitch, indexOfLastPitch);

  const banks = [
    { code: "BIDV", name: "BIDV" },
    { code: "VCB", name: "VietcomBank" },
    { code: "TCB", name: "Techcombank" },
    { code: "MB", name: "MBBank" },
    { code: "CTG", name: "VietinBank" },
  ];

  const theme = useTheme();

  const [bookings, setBookings] = useState<any[]>([]);

  const [open, setOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingResponseDTO | null>(null);

  const handleOpen = (booking: BookingResponseDTO) => {
    setSelectedBooking(booking);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBooking(null);
  };

  const [paymentStatus, setPaymentStatus] = useState<string>("PAID");

  const handleChangePaymentStatus = (event: SelectChangeEvent) => {
    setPaymentStatus(event.target.value as string);
  };

  const handleConfirm = async () => {
    if (selectedBooking) {
      try {
        await updateStatus(selectedBooking.bookingId, "CONFIRMED");
        await updatePaymentStatus(selectedBooking.bookingId, paymentStatus);
        toast.success("Cập nhật trạng thái thành công");
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

  const bookingColumns: GridColDef[] = [
    {
      field: "bookingDate",
      headerName: "Ngày đặt",
      width: 150,
      renderCell: (params) => {
        return dayjs(params.row.bookingDate).format("DD/MM/YYYY");
      },
    },
    { field: "providerName", headerName: "Tên chủ sân", width: 150 },
    { field: "pitchName", headerName: "Tên sân", width: 150 },
    {
      field: "timeRange",
      headerName: "Khung giờ",
      width: 200,
      renderCell: (params) => {
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
    { field: "totalPrice", headerName: "Tổng giá", width: 120 },
    {
      field: "actions",
      type: "actions",
      headerName: "Thao tác",
      width: 100,
      getActions: (params) => {
        if (!params || !params.row) {
          return [];
        }
        const booking = params.row as BookingResponseDTO & {
          paymentMethod?: string;
        };
        return [
          <GridActionsCellItem
            icon={<EditOutlinedIcon />}
            label="Edit"
            onClick={() => handleOpen(booking)}
          />,
        ];
      },
    },
  ];

  const fetchBooking = async (providerId: string) => {
    try {
      const [bookings, payments, users, providers, pitches] = await Promise.all(
        [
          getAllBookings(),
          getAllPayments(),
          getAllUsers(),
          getAllProviders(),
          getAllPitches(),
        ]
      );

      const filteredBookings = bookings.filter(
        (booking) => booking.providerId === providerId
      );

      const pitchMap = new Map(pitches.map((pitch) => [pitch.pitchId, pitch]));
      const providerMap = new Map(
        providers.map((provider) => [provider.providerId, provider])
      );
      const userMap = new Map(users.map((user) => [user.userId, user]));

      const paymentMethod =
        payments.length > 0 ? payments[0].paymentMethod : null;

      const enhancedBookings = filteredBookings.map((booking) => {
        const pitchId = booking.bookingDetails[0]?.pitchId;
        const pitch = pitchMap.get(pitchId);
        const provider = providerMap.get(booking.providerId);
        const providerUser = provider ? userMap.get(provider.userId) : null;

        return {
          ...booking,
          paymentMethod,
          providerName: providerUser?.name || "Không xác định",
          pitchName: pitch?.name || "Không xác định",
          slots: booking.bookingDetails.map((detail) => detail.slot),
        };
      });

      return enhancedBookings;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  };

  const resetBooking = async (providerId: string) => {
    try {
      const [bookings, payments, users, providers, pitches] = await Promise.all(
        [
          getAllBookings(),
          getAllPayments(),
          getAllUsers(),
          getAllProviders(),
          getAllPitches(),
        ]
      );

      const filteredBookings = bookings.filter(
        (booking) => booking.providerId === providerId
      );

      const pitchMap = new Map(pitches.map((pitch) => [pitch.pitchId, pitch]));
      const providerMap = new Map(
        providers.map((provider) => [provider.providerId, provider])
      );
      const userMap = new Map(users.map((user) => [user.userId, user]));

      const paymentMethod =
        payments.length > 0 ? payments[0].paymentMethod : null;

      const enhancedBookings = filteredBookings.map((booking) => {
        const pitchId = booking.bookingDetails[0]?.pitchId;
        const pitch = pitchMap.get(pitchId);
        const provider = providerMap.get(booking.providerId);
        const providerUser = provider ? userMap.get(provider.userId) : null;

        return {
          ...booking,
          paymentMethod,
          providerName: providerUser?.name || "Không xác định",
          pitchName: pitch?.name || "Không xác định",
          slots: booking.bookingDetails.map((detail) => detail.slot),
        };
      });

      setBookings(enhancedBookings);
      toast.success("Đặt lại danh sách đơn đặt thành công!");
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchBooking(user?.providerId)
      .then((data) => {
        const rows = data.map((booking) => ({
          id: booking.bookingId,
          ...booking,
        }));
        setBookings(rows);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [user?.userId]);

  const getPitchTypeName = (type: string) => {
    switch (type) {
      case "FIVE_A_SIDE":
        return "Sân 5";
      case "SEVEN_A_SIDE":
        return "Sân 7";
      case "ELEVEN_A_SIDE":
        return "Sân 11";
      default:
        return type;
    }
  };

  useEffect(() => {
    const fetchPitchesForAllAreas = async () => {
      if (user?.addresses) {
        const pitchesData: { [key: string]: PitchResponseDTO[] } = {};
        for (const address of user.addresses) {
          try {
            const pitchList = await getPitchesByProviderAddressId(
              address.providerAddressId
            );
            pitchesData[address.providerAddressId] = pitchList;
          } catch (error) {
            console.error(
              `Lỗi khi lấy sân cho khu vực ${address.providerAddressId}:`,
              error
            );
            toast.error(
              `Lỗi khi tải danh sách sân cho khu vực ${address.address}`
            );
          }
        }
        setPitchesByArea(pitchesData);
        const updatedAreas = user.addresses.map((addr: any) => ({
          id: addr.providerAddressId,
          name: addr.address,
          count: pitchesData[addr.providerAddressId]?.length || 0,
        }));
        setAreas(updatedAreas);
        // Set initial pitches for the selected area
        if (selectedAreaId) {
          setPitches(pitchesData[selectedAreaId] || []);
        }
      }
    };
    fetchPitchesForAllAreas();
  }, [user?.addresses]);

  useEffect(() => {
    if (selectedAreaId) {
      const fetchPitches = async () => {
        try {
          // Fetch pitches if not already in pitchesByArea
          const data =
            pitchesByArea[selectedAreaId] ||
            (await getPitchesByProviderAddressId(selectedAreaId));
          setPitches(data); // Update pitches state
          setPitchesByArea((prev) => ({
            ...prev,
            [selectedAreaId]: data, // Ensure pitchesByArea is updated
          }));
        } catch (error) {
          console.error("Error fetching pitches:", error);
          toast.error("Lỗi khi tải danh sách sân");
        }
      };
      fetchPitches();
    }
  }, [selectedAreaId]);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    setSelectedPitchIds([]);
    setCurrentPage(1);
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
              })
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

  const [editedUser, setEditedUser] = useState({
    name: user?.name || "Nguyễn Văn A",
    email: user?.email || "vittapbay@gmail.com",
    phone: user?.phone || "0000000000",
    status: "ACTIVE",
  });

  useEffect(() => {
    const loadState = async () => {
      try {
        const serializedState = localStorage.getItem("authState");
        if (serializedState) {
          const state = JSON.parse(serializedState);
          if (state.user) {
            dispatch(loginSuccess(state.user));
            setEditedUser({
              name: state.user.name,
              email: state.user.email,
              phone: state.user.phone,
              status: "ACTIVE",
            });
            setProviderUser({
              cardNumber: state.user.cardNumber || "Chưa có thông tin",
              bank: state.user.bank || "Chưa có thông tin",
            });
          }
        }
      } catch (err) {
        console.error("Lỗi khi khôi phục trạng thái từ localStorage:", err);
      }
    };
    loadState();
  }, [dispatch]);

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
    });
  };

  const handleSave = async () => {
    await updateUser(editedUser, user?.userId);
    setIsEditing(false);
    dispatch(
      update({
        name: editedUser.name,
        email: editedUser.email,
        phone: editedUser.phone,
      })
    );
    toast.success("Change information successfully!");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProviderInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
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
          })
        );
      } else {
        await updateProvider(providerData, currentProviderId);
        dispatch(
          update({
            cardNumber: providerUser.cardNumber,
            bank: providerUser.bank,
          })
        );
      }

      setIsEditingProvider(false);
      toast.success("Cập nhật thông tin nhà cung cấp thành công");
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin nhà cung cấp:", err);
      toast.error("Cập nhật thông tin thất bại");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const isProviderInfoEmpty =
    providerUser.cardNumber === "Chưa có thông tin" &&
    providerUser.bank === "Chưa có thông tin";

  const handleAddPitch = () => {
    setIsEditMode(false);
    setPitchToEdit(null);
    setOpenPitchModal(true);
  };

  const handleEditPitch = () => {
    if (selectedPitchIds.length === 1) {
      const pitch = pitches.find((p) => p.pitchId === selectedPitchIds[0]);
      if (pitch) {
        setIsEditMode(true);
        setPitchToEdit(pitch);
        setOpenPitchModal(true);
      }
    }
  };

  const handleDeletePitches = () => {
    if (selectedPitchIds) {
      const pitch = pitches.find((p) => p.pitchId === selectedPitchIds[0]);
      setOpenDeleteModal(true);
    }
  };

  const handleSavePitch = async (
    formData: Omit<PitchRequestDTO, "providerAddressId">
  ) => {
    try {
      if (isEditMode && pitchToEdit) {
        const updatedPitch = await updatePitch(pitchToEdit.pitchId, {
          ...formData,
          providerAddressId: pitchToEdit.providerAddressId,
        });
        // Update both pitches and pitchesByArea atomically
        setPitches((prevPitches) =>
          prevPitches.map((p) =>
            p.pitchId === updatedPitch.pitchId ? updatedPitch : p
          )
        );
        setPitchesByArea((prev) => ({
          ...prev,
          [selectedAreaId]: prev[selectedAreaId].map((p) =>
            p.pitchId === updatedPitch.pitchId ? updatedPitch : p
          ),
        }));
        toast.success("Cập nhật sân thành công");
      } else if (selectedAreaId) {
        const isNameDuplicate = pitches.some((p) => p.name === formData.name);
        if (isNameDuplicate) {
          toast.error("Tên sân đã tồn tại trong khu vực này");
          return;
        }
        const newPitch = await createPitch({
          ...formData,
          providerAddressId: selectedAreaId,
        });
        // Update both pitches and pitchesByArea
        setPitches((prevPitches) => [...prevPitches, newPitch]);
        setPitchesByArea((prev) => ({
          ...prev,
          [selectedAreaId]: [...(prev[selectedAreaId] || []), newPitch],
        }));
        setAreas((prevAreas) =>
          prevAreas.map((area) =>
            area.id === selectedAreaId
              ? { ...area, count: area.count + 1 }
              : area
          )
        );
        toast.success("Thêm sân thành công");
      }
      setOpenPitchModal(false);
      setSelectedPitchIds([]);
    } catch (error) {
      console.error("Error saving pitch:", error);
      toast.error("Lỗi khi lưu sân");
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedPitchIds.length === 1) {
      const pitchId = selectedPitchIds[0];
      try {
        await deletePitch(pitchId);
        toast.success("Xóa sân thành công!");
        const updatedPitches = pitches.filter((p) => p.pitchId !== pitchId);
        setPitches(updatedPitches);
        setAreas((prevAreas) =>
          prevAreas.map((area) =>
            area.id === selectedAreaId
              ? { ...area, count: area.count - 1 }
              : area
          )
        );
        setOpenDeleteModal(false);
        setSelectedPitchIds([]);
      } catch (error) {
        toast.error("Xóa sân thất bại. Vui lòng thử lại.");
        console.error("Lỗi khi xóa sân:", error);
      }
    }
  };

  const handlePitchCheckboxChange = (pitchId: string) => {
    if (selectedPitchIds.includes(pitchId)) {
      setSelectedPitchIds([]);
    } else {
      setSelectedPitchIds([pitchId]);
    }
  };

  const PitchModal: React.FC<{
    open: boolean;
    onClose: () => void;
    onSave: (data: Omit<PitchRequestDTO, "providerAddressId">) => void;
    initialData?: PitchResponseDTO;
    areaName: string;
  }> = ({ open, onClose, onSave, initialData, areaName }) => {
    const [formData, setFormData] = useState({
      name: initialData?.name || "",
      type: initialData?.type || "FIVE_A_SIDE",
      price: initialData?.price || 0,
      description: initialData?.description || "",
    });

    const handleSave = () => {
      onSave(formData);
    };

    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>
          {initialData ? "Chỉnh sửa sân" : "Thêm sân mới"}
        </DialogTitle>
        <DialogContent>
          <Typography>Khu vực: {areaName}</Typography>
          <TextField
            label="Tên sân"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            margin="dense"
          />
          <Select
            label="Loại sân"
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as any })
            }
            fullWidth
            margin="dense"
          >
            <MenuItem value="FIVE_A_SIDE">5 người</MenuItem>
            <MenuItem value="SEVEN_A_SIDE">7 người</MenuItem>
            <MenuItem value="ELEVEN_A_SIDE">11 người</MenuItem>
          </Select>
          <TextField
            label="Giá"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
            fullWidth
            margin="dense"
          />
          <TextField
            label="Mô tả"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            fullWidth
            margin="dense"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            onClick={handleSave}
            disabled={!formData.name || formData.price <= 0}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

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
          {initTab === 0 && (
            <div className="flex flex-col items-start justify-start gap-y-[1rem]">
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Thông tin cá nhân
              </Typography>
              <div className="bg-white w-full flex flex-col items-center justify-start rounded-lg shadow-md py-6 px-10 right-sidebar gap-y-[1.5rem]">
                <div className="flex items-center justify-between w-[90%]">
                  <div className="flex items-start gap-x-[2rem]">
                    <img
                      src="./images/lc1.jpg"
                      className="w-21 h-21 rounded-full"
                    />
                    <div className="flex flex-col gap-y-[0.3rem]">
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {user?.name || "Nguyễn Văn A"}
                      </Typography>
                      <Typography
                        className="text-[1.2rem]"
                        sx={{ fontWeight: "medium" }}
                      >
                        {user?.role || "Người dùng"}
                      </Typography>
                      <Typography
                        className="text-[1rem]"
                        sx={{ fontWeight: "medium" }}
                      >
                        45 Tân Lập
                      </Typography>
                    </div>
                  </div>
                  <div>
                    {!isEditing ? (
                      <div
                        className="flex items-center justify-center border-1 border-gray-600 rounded-lg px-4 py-2 cursor-pointer gap-x-[0.5rem] hover:bg-gray-200"
                        onClick={handleEdit}
                      >
                        <Typography className="text-[1.2rem]">Edit</Typography>
                        <BorderColorIcon fontSize="small" />
                      </div>
                    ) : (
                      <div className="flex gap-x-[1rem]">
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor: "#0093FF",
                            color: "white",
                            fontWeight: "bold",
                          }}
                          onClick={handleSave}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          sx={{
                            borderColor: "red",
                            color: "red",
                            fontWeight: "bold",
                          }}
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <Divider
                  sx={{
                    borderBottomWidth: "1px",
                    borderColor: "black",
                    width: "90%",
                  }}
                />
                <div className="flex items-center gap-y-[2rem] flex-col w-[90%]">
                  <div className="flex justify-between w-full">
                    <div className="flex flex-col items-start gap-y-[0.5rem]">
                      <Typography className="text-[1.2rem]">Tên</Typography>
                      {isEditing ? (
                        <TextField
                          name="name"
                          value={editedUser.name}
                          onChange={handleInputChange}
                          size="small"
                          sx={{ width: "200px" }}
                        />
                      ) : (
                        <Typography
                          className="text-[1.2rem]"
                          sx={{ fontWeight: "bold", textAlign: "left" }}
                        >
                          {editedUser.name}
                        </Typography>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-y-[0.5rem]">
                      <Typography className="text-[1.2rem]">Email</Typography>
                      {isEditing ? (
                        <TextField
                          name="email"
                          value={editedUser.email}
                          onChange={handleInputChange}
                          size="small"
                          sx={{ width: "200px" }}
                        />
                      ) : (
                        <Typography
                          className="text-[1.2rem]"
                          sx={{ fontWeight: "bold", textAlign: "right" }}
                        >
                          {editedUser.email}
                        </Typography>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between w-full">
                    <div className="flex flex-col items-start gap-y-[0.5rem]">
                      <Typography className="text-[1.2rem]">
                        Số điện thoại
                      </Typography>
                      {isEditing ? (
                        <TextField
                          name="phone"
                          value={editedUser.phone}
                          onChange={handleInputChange}
                          size="small"
                          sx={{ width: "200px" }}
                        />
                      ) : (
                        <Typography
                          className="text-[1.2rem]"
                          sx={{ fontWeight: "bold", textAlign: "left" }}
                        >
                          {editedUser.phone}
                        </Typography>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-y-[0.5rem]">
                      <Typography className="text-[1.2rem]">Vai trò</Typography>
                      <Typography
                        className="text-[1.2rem]"
                        sx={{ fontWeight: "bold", textAlign: "right" }}
                      >
                        {user?.role || "Người dùng"}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {initTab === 0 && user?.role === "PROVIDER" && (
            <div className="flex flex-col items-start justify-start gap-y-[1rem]">
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Thông tin nhà cung cấp
              </Typography>
              <div className="bg-white w-full flex flex-col items-center justify-start rounded-lg shadow-md py-6 px-10 right-sidebar gap-y-[1.5rem]">
                <div className="flex items-center justify-between w-[90%]">
                  <div className="flex items-center gap-x-[2rem] rounded-md border-gray-400 border-1 py-2 px-8">
                    <div
                      className={`w-15 h-15 rounded-full flex items-center justify-center border-1 ${
                        isProviderInfoEmpty ? "border-dashed" : "border-solid"
                      } border-gray-600`}
                    >
                      <ManageAccountsIcon
                        fontSize="medium"
                        sx={{ fontWeight: "bold", color: "black" }}
                      />
                    </div>
                    <div className="flex flex-col gap-y-[0.3rem]">
                      <div className="flex items-center gap-x-[0.5rem]">
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {providerUser?.bank === "Chưa có thông tin" &&
                          providerUser?.cardNumber === "Chưa có thông tin"
                            ? "0%"
                            : "100%"}
                        </Typography>
                        <KeyboardArrowRightIcon
                          fontSize="small"
                          sx={{
                            fontWeight: "bold",
                            color: "black",
                            cursor: "pointer",
                          }}
                        />
                      </div>
                      <Typography
                        className="text-[1.2rem]"
                        sx={{ fontWeight: "medium" }}
                      >
                        của phần thông tin đã được hoàn thành
                      </Typography>
                    </div>
                  </div>
                  <div>
                    {!isEditingProvider ? (
                      <div
                        className="flex items-center justify-center border-1 border-gray-600 rounded-lg px-4 py-2 cursor-pointer gap-x-[0.5rem] hover:bg-gray-200"
                        onClick={handleEditProvider}
                      >
                        <Typography className="text-[1.2rem]">
                          {isProviderInfoEmpty
                            ? "Thêm thông tin"
                            : "Chỉnh sửa thông tin"}
                        </Typography>
                        <BorderColorIcon fontSize="small" />
                      </div>
                    ) : (
                      <div className="flex gap-x-[1rem]">
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor: "#0093FF",
                            color: "white",
                            fontWeight: "bold",
                          }}
                          onClick={handleSaveProvider}
                        >
                          Lưu
                        </Button>
                        <Button
                          variant="outlined"
                          sx={{
                            borderColor: "red",
                            color: "red",
                            fontWeight: "bold",
                          }}
                          onClick={handleCancelProvider}
                        >
                          Hủy
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  id="bank-info"
                  className="flex items-center gap-y-[2rem] flex-col w-[90%]"
                >
                  <div className="flex justify-between w-full">
                    <div className="flex flex-col items-start gap-y-[0.5rem]">
                      <Typography className="text-[1.2rem]">
                        Số tài khoản ngân hàng
                      </Typography>
                      {isEditingProvider ? (
                        <TextField
                          name="cardNumber"
                          type="string"
                          value={providerUser.cardNumber}
                          onChange={handleProviderInputChange}
                          size="small"
                          sx={{ width: "200px" }}
                        />
                      ) : (
                        <Typography
                          className="text-[1.2rem]"
                          sx={{ fontWeight: "bold", textAlign: "left" }}
                        >
                          {providerUser.cardNumber}
                        </Typography>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-y-[0.5rem]">
                      <Typography className="text-[1.2rem]">
                        Ngân hàng
                      </Typography>
                      {isEditingProvider ? (
                        <Autocomplete
                          options={banks}
                          getOptionLabel={(option) => option.name}
                          value={
                            banks.find(
                              (bank) => bank.code === providerUser.bank
                            ) || null
                          }
                          onChange={(_, value) => {
                            setProviderUser((prev) => ({
                              ...prev,
                              bank: value ? value.code : "",
                            }));
                          }}
                          renderInput={(params) => (
                            <TextField {...params} name="bank" size="small" />
                          )}
                          sx={{ width: "200px" }}
                        />
                      ) : (
                        <Typography
                          className="text-[1.2rem]"
                          sx={{ fontWeight: "bold", textAlign: "right" }}
                        >
                          {providerUser.bank}
                        </Typography>
                      )}
                    </div>
                  </div>
                </div>
                <Divider
                  sx={{
                    borderBottomWidth: "1px",
                    borderColor: "black",
                    width: "90%",
                  }}
                />
                <AddressInfo />
              </div>
            </div>
          )}
          {initTab === 1 && (
            <div className="flex flex-col items-start justify-start gap-y-[1rem]">
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Thông tin sân
              </Typography>
              <div className="bg-white w-full flex items-start justify-start rounded-lg shadow-md p-6 right-sidebar gap-x-[1rem]">
                <div className="w-[28%] flex flex-col gap-y-[1rem]">
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      color: "#e25b43",
                    }}
                  >
                    Khu vực
                  </Typography>
                  <div className="locations flex flex-col gap-y-[1rem]">
                    {areas.map((area, index) => {
                      const isSelected = selectedIndex === index;
                      return (
                        <div
                          className={`flex flex-col items-start ${
                            isSelected
                              ? "bg-[#e25b43] text-white"
                              : "bg-white text-black"
                          } rounded-xl px-4 py-[0.3rem] w-[200px] cursor-pointer shadow-xl`}
                          onClick={() => handleSelect(index)}
                          key={index}
                        >
                          <Typography
                            sx={{
                              fontWeight: "medium",
                              fontSize: "1rem",
                              color: isSelected ? "white" : "#e25b43",
                            }}
                          >
                            {area.name}
                          </Typography>
                          <div className="flex items-center gap-x-[0.3rem]">
                            <LocationOnOutlinedIcon sx={{ fontSize: "1rem" }} />
                            <Typography
                              sx={{ fontWeight: "normal", fontSize: "0.8rem" }}
                            >
                              {area.count} sân
                            </Typography>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    borderColor: "grey",
                    borderWidth: "1px",
                    marginLeft: "-3rem",
                  }}
                />
                <div className="w-[70%] flex flex-col gap-y-[1rem] ml-[1rem]">
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      color: "#e25b43",
                    }}
                  >
                    {areas[selectedIndex]?.name || "Khu vực"}
                  </Typography>
                  <div className="action-bars flex items-center gap-x-[1rem]">
                    <div className="search px-4 py-[0.3rem] border-1 border-black rounded-md flex items-center justify-between w-[320px]">
                      <input
                        placeholder="Nhập tên sân"
                        className="w-[100%] text-gray-600 focus:outline-none text-[0.9rem]"
                      />
                      <SearchOutlinedIcon
                        sx={{ color: "black", cursor: "pointer" }}
                        fontSize="small"
                      />
                    </div>
                    <div className="flex items-center gap-x-[0.8rem]">
                      <Tooltip title="Thêm sân" arrow>
                        <div
                          className="bg-[#e25b43] text-white cursor-pointer w-8 h-8 flex items-center justify-center rounded-md"
                          onClick={handleAddPitch}
                        >
                          <AddOutlinedIcon fontSize="medium" />
                        </div>
                      </Tooltip>
                      <Tooltip title="Sửa sân" arrow>
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-md ${
                            selectedPitchIds.length === 1
                              ? "bg-[#e25b43] text-white cursor-pointer"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                          onClick={
                            selectedPitchIds.length === 1
                              ? handleEditPitch
                              : undefined
                          }
                        >
                          <EditOutlinedIcon fontSize="medium" />
                        </div>
                      </Tooltip>
                      <Tooltip title="Xóa sân" arrow>
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-md ${
                            selectedPitchIds.length > 0
                              ? "bg-[#e25b43] text-white cursor-pointer"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                          onClick={
                            selectedPitchIds.length > 0
                              ? handleDeletePitches
                              : undefined
                          }
                        >
                          <DeleteOutlineOutlinedIcon fontSize="medium" />
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="san flex flex-wrap gap-x-[2rem] gap-y-[2rem] mt-[1rem]">
                    {currentPitches.map((pitch) => (
                      <Card
                        key={pitch.pitchId}
                        sx={{
                          width: "200px",
                          height: "150px",
                          padding: "0px",
                        }}
                      >
                        <CardContent
                          sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            gap: "0.3rem",
                            flexDirection: "column",
                            padding: 0,
                          }}
                        >
                          <div className="header flex items-center gap-x-[1rem] w-full px-[1rem] py-[0.5rem] bg-gray-200 relative">
                            <img
                              src="./images/lc1.jpg"
                              className="rounded-md h-8 w-8 object-cover"
                            />
                            <div className="flex flex-col gap-y-[0.4rem] pb-[0.2rem] items-start">
                              <p className="font-bold text-[0.7rem] text-[#e25b43] text-ellipsis flex-1 overflow-hidden whitespace-nowrap">
                                {pitch.name}
                              </p>
                              <p className="flex items-start text-[0.7rem]">
                                {getPitchTypeName(pitch.type)}
                              </p>
                            </div>
                            <div className="flex flex-col items-center right-2 top-0 absolute">
                              <Checkbox
                                checked={selectedPitchIds.includes(
                                  pitch.pitchId
                                )}
                                onChange={() =>
                                  handlePitchCheckboxChange(pitch.pitchId)
                                }
                                sx={{ "& .MuiSvgIcon-root": { fontSize: 16 } }}
                              />
                            </div>
                          </div>
                          <div className="footer flex flex-col gap-y-[0.2rem] text-gray-600 text-[0.8rem] px-[1rem] py-[0.5rem] h-fit w-full">
                            <p>Giá: {pitch.price}</p>
                            <p>Mô tả: {pitch.description || "Không có"}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-4 gap-1 items-center">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-gray-500 disabled:text-gray-300 text-2xl cursor-pointer"
                      >
                        «
                      </button>

                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-gray-500 disabled:text-gray-300 text-2xl  cursor-pointer"
                      >
                        ‹
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded font-medium ${
                              page === currentPage
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black border border-gray-300"
                            } cursor-pointer`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-gray-500 disabled:text-gray-300 text-2xl  cursor-pointer"
                      >
                        ›
                      </button>

                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-gray-500 disabled:text-gray-300 text-2xl  cursor-pointer"
                      >
                        »
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {initTab === 2 && user?.role === "PROVIDER" && (
            <div className="flex flex-col gap-y-[1rem]">
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Danh sách đặt sân
                </Typography>
                <button
                  type="button"
                  className="flex items-center gap-x-2 border border-blue-500 text-blue-500 px-4 py-2 rounded hover:bg-blue-50 cursor-pointer"
                  onClick={() => resetBooking(user?.providerId)}
                >
                  <RestartAltOutlinedIcon />
                  Đặt lại
                </button>
              </div>
              <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={bookings || []}
                  columns={bookingColumns}
                  getRowId={(row) => row.bookingId}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 5 },
                    },
                  }}
                  pageSizeOptions={[5]}
                  checkboxSelection
                  disableRowSelectionOnClick
                />
              </Box>
            </div>
          )}
        </div>
      </div>
      <PitchModal
        open={openPitchModal}
        onClose={() => setOpenPitchModal(false)}
        onSave={handleSavePitch}
        initialData={isEditMode && pitchToEdit ? pitchToEdit : undefined}
        areaName={areas[selectedIndex]?.name || ""}
      />
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle>Xác nhận xóa sân</DialogTitle>
        <DialogContent>Bạn có chắc chắn muốn xóa sân đã chọn?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)}>Hủy</Button>
          <Button color="error" onClick={handleDeleteConfirm}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            boxShadow: 24,
            gapY: 4,
            p: 4,
          }}
        >
          <Typography variant="h5">Xác nhận thanh toán</Typography>
          <Divider
            orientation="horizontal"
            flexItem
            sx={{
              borderColor: "black",
              borderWidth: "1px",
              marginBottom: 2,
              marginTop: 1,
            }}
          />
          {selectedBooking && (
            <>
              <Typography>ID Đặt chỗ: {selectedBooking.bookingId}</Typography>
              <Typography>
                Ngày đặt:{" "}
                {dayjs(selectedBooking.bookingDate).format("DD-MM-YYYY")}
              </Typography>
              <Typography>
                Tổng giá: {selectedBooking.totalPrice} VNĐ
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="payment-status-label">
                  Trạng thái thanh toán
                </InputLabel>
                <Select
                  labelId="payment-status-label"
                  value={paymentStatus}
                  label="Trạng thái thanh toán"
                  onChange={handleChangePaymentStatus}
                >
                  <MenuItem value="PAID">Đã thanh toán</MenuItem>
                  <MenuItem value="REFUNDED">Đã hoàn tiền</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button variant="outlined" onClick={handleClose}>
              Hủy
            </Button>
            <Button variant="contained" onClick={handleConfirm}>
              Xác nhận
            </Button>
          </Box>
        </Box>
      </Modal>
      ;
    </div>
  );
};

export default Profile;
