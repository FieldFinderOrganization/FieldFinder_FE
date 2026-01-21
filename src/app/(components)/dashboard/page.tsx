/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Header from "@/utils/header";
import * as React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import Box from "@mui/material/Box";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PeopleIcon from "@mui/icons-material/People";
import StoreIcon from "@mui/icons-material/Store";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import ReceiptIcon from "@mui/icons-material/Receipt";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import FileDownloadIcon from "@mui/icons-material/FileDownload"; // Import icon download

// Import thư viện Excel
import * as XLSX from "xlsx";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  SelectChangeEvent,
  Divider,
  Modal,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { toast } from "react-toastify";
import {
  BookingResponseDTO,
  getAllBookings,
  updatePaymentStatus,
  updateStatus,
} from "@/services/booking";
import {
  getAllAddresses,
  getAllProviders,
  updateProvider,
} from "@/services/provider";
import { getAllPitches, updatePitch, getPitchById } from "@/services/pitch";
import { getAllUsers, updateUser, changeUserStatus } from "@/services/user";
import dayjs from "dayjs";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { providerAddress } from "../../../services/provider";
import { getAllCategory } from "@/services/category";

// ===== PRODUCT & DISCOUNT SERVICE =====
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  productRes,
} from "@/services/product";

import {
  getAllDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  discountRes,
} from "@/services/discount";

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
  status: string;
}

interface ProviderData {
  providerId: string;
  userId: string;
  cardNumber: string;
  bank: string;
}

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

const Dashboard: React.FC = () => {
  const [users, setUsers] = React.useState<UserData[]>([]);
  const [providers, setProviders] = React.useState<ProviderData[]>([]);
  const [pitches, setPitches] = React.useState<PitchData[]>([]);
  const [bookings, setBookings] = React.useState<
    (BookingResponseDTO & {
      providerName: string;
      pitchName: string;
      slots: number[];
    })[]
  >([]);
  // ===== PRODUCT =====
  const [products, setProducts] = React.useState<productRes[]>([]);
  const [openProductDialog, setOpenProductDialog] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<
    (productRes & { categoryId?: number }) | null
  >(null);
  const [categories, setCategories] = React.useState<
    { id: number; name: string }[]
  >([]);

  const [discounts, setDiscounts] = React.useState<discountRes[]>([]);
  const [openDiscountDialog, setOpenDiscountDialog] = React.useState(false);
  const [editingDiscount, setEditingDiscount] = React.useState<
    (discountRes & { scope?: string }) | null
  >(null);

  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState(0);
  const [chartType, setChartType] = React.useState("bar");

  const [editUserDialogOpen, setEditUserDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserData | null>(null);

  const [editProviderDialogOpen, setEditProviderDialogOpen] =
    React.useState(false);
  const [editingProvider, setEditingProvider] =
    React.useState<ProviderData | null>(null);

  const [editPitchDialogOpen, setEditPitchDialogOpen] = React.useState(false);
  const [editingPitch, setEditingPitch] = React.useState<PitchData | null>(
    null
  );
  const userTableRef = React.useRef<HTMLDivElement>(null);
  const providerTableRef = React.useRef<HTMLDivElement>(null);
  const pitchTableRef = React.useRef<HTMLDivElement>(null);
  const bookingTableRef = React.useRef<HTMLDivElement>(null);
  const productTableRef = React.useRef<HTMLDivElement>(null);
  const discountTableRef = React.useRef<HTMLDivElement>(null);

  const [addresses, setAddresses] = React.useState<providerAddress[] | null>(
    null
  );

  React.useEffect(() => {
    const fetchAddresses = async () => {
      const data = await getAllAddresses();
      setAddresses(data);
    };
    fetchAddresses();
  }, []);

  const addressMap = new Map(
    (addresses ?? []).map((addr) => [addr.providerAddressId, addr.address])
  );

  const weeklyUserData = [0, 1, 2, users.length];
  const weeklyProviderData = [0, 1, 2, providers.length];
  const weeklyPitchData = [0, 2, 3, pitches.length];
  const weeklyInvoiceData = [0, 1, 2, 5];
  const weeklyProductData = [0, 1, 2, products.length];
  const weeklyDiscountData = [0, 1, 2, discounts.length];

  const [statusModalOpen, setStatusModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserData | null>(null);
  const [newStatus, setNewStatus] = React.useState<"ACTIVE" | "BLOCKED">(
    "ACTIVE"
  );

  // ===== EXPORT FUNCTION =====
  const handleExportExcel = () => {
    try {
      // 1. Sheet Tổng quan (Overview)
      const confirmedPaidBookings = bookings.filter(
        (b) => b.status === "CONFIRMED" && b.paymentStatus === "PAID"
      );
      const totalRevenue = confirmedPaidBookings.reduce(
        (sum, b) => sum + (b.totalPrice || 0),
        0
      );

      const overviewData = [
        { "Danh mục": "Tổng người dùng", "Số lượng": users.length },
        { "Danh mục": "Tổng chủ sân", "Số lượng": providers.length },
        { "Danh mục": "Tổng sân bóng", "Số lượng": pitches.length },
        {
          "Danh mục": "Tổng đơn đặt (Đã TT)",
          "Số lượng": confirmedPaidBookings.length,
        },
        {
          "Danh mục": "Tổng doanh thu",
          "Số lượng": totalRevenue.toLocaleString() + " VND",
        },
        { "Danh mục": "Tổng sản phẩm", "Số lượng": products.length },
        { "Danh mục": "Tổng mã giảm giá", "Số lượng": discounts.length },
      ];

      // 2. Sheet Hóa đơn (Bookings)
      const bookingData = bookings.map((b) => ({
        "ID Đơn": b.bookingId,
        "Ngày đặt": dayjs(b.bookingDate).format("DD/MM/YYYY"),
        "Chủ sân": b.providerName,
        "Sân bóng": b.pitchName,
        "Khung giờ": mergeContinuousSlots(b.slots),
        "Tổng tiền": b.totalPrice,
        "Trạng thái":
          b.status === "CONFIRMED"
            ? "Đã xác nhận"
            : b.status === "PENDING"
              ? "Đang chờ"
              : "Đã hủy",
        "Thanh toán":
          b.paymentStatus === "PAID"
            ? "Đã thanh toán"
            : b.paymentStatus === "REFUNDED"
              ? "Hoàn tiền"
              : "Chờ thanh toán",
      }));

      // 3. Sheet Người dùng (Users)
      const userData = users.map((u) => ({
        "ID User": u.userId,
        "Họ tên": u.name,
        Email: u.email,
        "Số điện thoại": u.phone,
        "Vai trò": u.role === "PROVIDER" ? "Chủ sân" : "Người dùng",
        "Trạng thái": u.status === "ACTIVE" ? "Hoạt động" : "Bị khóa",
      }));

      // 4. Sheet Sản phẩm (Products)
      const productData = products.map((p) => ({
        "Tên sản phẩm": p.name,
        Brand: p.brand,
        "Danh mục": p.categoryName,
        "Giá gốc": p.price,
        "% Giảm": p.onSalePercent,
        "Giá bán": p.salePrice,
        "Tồn kho": p.stockQuantity,
      }));

      // Tạo Workbook
      const wb = XLSX.utils.book_new();

      const wsOverview = XLSX.utils.json_to_sheet(overviewData);
      const wsBookings = XLSX.utils.json_to_sheet(bookingData);
      const wsUsers = XLSX.utils.json_to_sheet(userData);
      const wsProducts = XLSX.utils.json_to_sheet(productData);

      // Thêm các sheet vào workbook
      XLSX.utils.book_append_sheet(wb, wsOverview, "Tổng quan");
      XLSX.utils.book_append_sheet(wb, wsBookings, "Đơn đặt sân");
      XLSX.utils.book_append_sheet(wb, wsUsers, "Người dùng");
      XLSX.utils.book_append_sheet(wb, wsProducts, "Sản phẩm");

      // Xuất file
      const fileName = `Bao_cao_san_bong_${dayjs().format("DD-MM-YYYY")}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success("Xuất báo cáo thành công!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Lỗi khi xuất báo cáo");
    }
  };

  const userColumns: GridColDef<UserData>[] = [
    // { field: "userId", headerName: "ID Người dùng", width: 250 },
    { field: "name", headerName: "Tên", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "phone", headerName: "Số điện thoại", width: 150 },
    { field: "role", headerName: "Vai trò", width: 120 },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 150,
      renderCell: (params) => {
        let typeText = "";
        switch (params.row.status) {
          case "ACTIVE":
            typeText = "Đang hoạt động";
            break;
          case "BLOCKED":
            typeText = "Ngưng hoạt động";
            break;
          default:
            typeText = params.row.status;
        }
        return <span>{typeText}</span>;
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Thao tác",
      width: 150, // Tăng chiều rộng để chứa thêm nút
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditOutlinedIcon />}
          label="Edit"
          onClick={() => handleEditUserClick(params.row)}
        />,
        <GridActionsCellItem
          icon={<BlockOutlinedIcon />}
          label="Thay đổi trạng thái"
          onClick={() => handleOpenStatusModal(params.row)}
        />,
      ],
    },
  ];

  const providerColumns: GridColDef<
    ProviderData & { userName: string; userEmail: string }
  >[] = [
    { field: "providerId", headerName: "ID Chủ sân", width: 250 },
    { field: "userName", headerName: "Tên", width: 150 },
    { field: "userEmail", headerName: "Email", width: 200 },
    { field: "cardNumber", headerName: "Số thẻ", width: 150 },
    { field: "bank", headerName: "Ngân hàng", width: 120 },
    {
      field: "actions",
      type: "actions",
      headerName: "Thao tác",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditOutlinedIcon />}
          label="Edit"
          onClick={() => handleEditProviderClick(params.row)}
        />,
      ],
    },
  ];

  const pitchColumns: GridColDef<PitchData>[] = [
    // { field: "pitchId", headerName: "ID Sân bóng", width: 250 },
    { field: "providerAddressId", headerName: "ID Địa chỉ", width: 200 },
    {
      field: "address",
      headerName: "Tên khu vực",
      width: 200,
      renderCell: (params: GridRenderCellParams<PitchData>) =>
        addressMap.get(params.row?.providerAddressId) || "Không có địa chỉ",
    },
    { field: "name", headerName: "Tên sân", width: 150 },
    {
      field: "type",
      headerName: "Loại sân",
      width: 150,
      renderCell: (params) => {
        if (!params || !params.row) {
          return <span>Không có dữ liệu</span>;
        }
        let typeText = "";
        switch (params.row.type) {
          case "FIVE_A_SIDE":
            typeText = "5 người";
            break;
          case "SEVEN_A_SIDE":
            typeText = "7 người";
            break;
          case "ELEVEN_A_SIDE":
            typeText = "11 người";
            break;
          default:
            typeText = params.row.type || "Không xác định";
        }
        return <span>{typeText}</span>;
      },
    },
    { field: "price", headerName: "Giá (VND)", width: 120 },
    {
      field: "actions",
      type: "actions",
      headerName: "Thao tác",
      width: 100,
      getActions: (params) => {
        if (!params || !params.row) {
          return [];
        }
        return [
          <GridActionsCellItem
            icon={<EditOutlinedIcon />}
            label="Edit"
            onClick={() => handleEditPitchClick(params.row)}
          />,
        ];
      },
    },
  ];

  const providerRows = providers.map((provider) => {
    const user = users.find((u) => u.userId === provider.userId);
    return {
      id: provider.providerId,
      ...provider,
      userName: user?.name || "Không xác định",
      userEmail: user?.email || "Không xác định",
    };
  });

  const [open, setOpen] = React.useState(false);
  const [selectedBooking, setSelectedBooking] =
    React.useState<BookingResponseDTO | null>(null);

  const handleOpen = (booking: BookingResponseDTO) => {
    setSelectedBooking(booking);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBooking(null);
  };

  const [paymentStatus, setPaymentStatus] = React.useState<string>("PAID");

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

  const bookingColumns: GridColDef[] = [
    {
      field: "bookingDate",
      headerName: "Ngày đặt",
      width: 150,
      renderCell: (params) => {
        return dayjs(params.row.bookingDate).format("DD/MM/YYYY");
      },
    },
    // { field: "bookingId", headerName: "ID Đặt chỗ", width: 250 },
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
      headerName: "Trạng thái",
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
      width: 120,
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
    { field: "totalPrice", headerName: "Tổng giá tiền", width: 150 },
    {
      field: "actions",
      type: "actions",
      headerName: "Thao tác",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditOutlinedIcon />}
          label="Edit"
          onClick={() => handleOpen(params.row)}
        />,
      ],
    },
  ];

  // ===== PRODUCT COLUMNS =====
  const productColumns: GridColDef<productRes>[] = [
    { field: "name", headerName: "Tên", width: 200 },
    { field: "brand", headerName: "Brand", width: 120 },
    { field: "categoryName", headerName: "Danh mục", width: 150 },
    { field: "price", headerName: "Giá gốc", width: 120 },
    { field: "salePercent", headerName: "% Giảm", width: 100 },
    { field: "salePrice", headerName: "Giá sau giảm", width: 140 },
    { field: "stockQuantity", headerName: "Tồn kho", width: 100 },
    {
      field: "actions",
      type: "actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditOutlinedIcon />}
          label="Edit"
          onClick={() => {
            setEditingProduct(params.row);
            setOpenProductDialog(true);
          }}
        />,
        <GridActionsCellItem
          icon={<BlockOutlinedIcon />}
          label="Delete"
          onClick={async () => {
            if (!confirm("Xóa sản phẩm?")) return;
            await deleteProduct(params.row.id);
            toast.success("Đã xóa sản phẩm");
            setProducts(await getAllProducts());
          }}
        />,
      ],
    },
  ];

  // ===== DISCOUNT COLUMNS =====
  const discountColumns: GridColDef<discountRes>[] = [
    { field: "code", headerName: "Code", width: 150 },
    { field: "discountType", headerName: "Loại", width: 120 },
    { field: "value", headerName: "Giá trị", width: 120 },
    { field: "status", headerName: "Trạng thái", width: 120 },
    { field: "startDate", headerName: "Bắt đầu", width: 120 },
    { field: "endDate", headerName: "Kết thúc", width: 120 },
    { field: "quantity", headerName: "Giới hạn sử dụng", width: 150 },
    {
      field: "actions",
      type: "actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditOutlinedIcon />}
          label="Edit"
          onClick={() => {
            setEditingDiscount(params.row);
            setOpenDiscountDialog(true);
          }}
        />,
        <GridActionsCellItem
          icon={<BlockOutlinedIcon />}
          label="Delete"
          onClick={async () => {
            if (!confirm("Xóa discount?")) return;
            await deleteDiscount(params.row.id);
            toast.success("Đã xóa discount");
            setDiscounts(await getAllDiscounts());
          }}
        />,
      ],
    },
  ];

  const resetUsers = async () => {
    try {
      const userRes = await getAllUsers();
      setUsers(
        (userRes || []).map((user: any) => ({
          userId: user.userId ?? user.id ?? "",
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role ?? "USER",
          status: user.status,
        }))
      );
      toast.success("Đã đặt lại danh sách người dùng");
    } catch (error) {
      console.error("Lỗi khi đặt lại người dùng:", error);
      toast.error("Lỗi khi đặt lại danh sách người dùng");
    }
  };

  const resetProviders = async () => {
    try {
      const providerRes = await getAllProviders();
      setProviders(providerRes || []);
      toast.success("Đã đặt lại danh sách Chủ sân");
    } catch (error) {
      console.error("Lỗi khi đặt lại Chủ sân:", error);
      toast.error("Lỗi khi đặt lại danh sách Chủ sân");
    }
  };

  const resetPitches = async () => {
    try {
      const pitchRes = await getAllPitches();
      setPitches(pitchRes || []);
      toast.success("Đã đặt lại danh sách sân bóng");
    } catch (error) {
      console.error("Lỗi khi đặt lại sân bóng:", error);
      toast.error("Lỗi khi đặt lại danh sách sân bóng");
    }
  };

  const resetBookings = async () => {
    try {
      const [userRes, providerRes, pitchRes, bookRes] = await Promise.all([
        getAllUsers(),
        getAllProviders(),
        getAllPitches(),
        getAllBookings(),
      ]);

      const pitchMap = new Map(pitchRes.map((pitch) => [pitch.pitchId, pitch]));

      const providerMap = new Map(
        providerRes.map((provider) => [provider.providerId, provider])
      );

      const userMap = new Map(userRes.map((user) => [user.userId, user]));
      const enhancedBookings = bookRes.map((booking: BookingResponseDTO) => {
        const pitchId = booking.bookingDetails[0]?.pitchId;
        const pitch = pitchMap.get(pitchId);

        const provider = providerMap.get(booking.providerId);
        const providerUser = provider ? userMap.get(provider.userId) : null;

        return {
          ...booking,
          providerName: providerUser?.name || "Không xác định",
          pitchName: pitch?.name || "Không xác định",
          slots: booking.bookingDetails.map((detail) => detail.slot),
        };
      });
      setBookings(enhancedBookings || []);
      toast.success("Đã đặt lại danh sách đơn đặt");
    } catch (error) {
      console.error("Lỗi khi đặt lại đơn đặt:", error);
      toast.error("Lỗi khi đặt lại danh sách đơn đặt");
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [userRes, providerRes, pitchRes, bookRes] = await Promise.all([
          getAllUsers(),
          getAllProviders(),
          getAllPitches(),
          getAllBookings(),
        ]);

        const usersData = (userRes || []).map((user: any) => ({
          userId: user.userId ?? user.id ?? "",
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role ?? "USER",
          status: user.status,
        }));

        const pitchMap = new Map(
          pitchRes.map((pitch) => [pitch.pitchId, pitch])
        );

        const providerMap = new Map(
          providerRes.map((provider) => [provider.providerId, provider])
        );

        const userMap = new Map(userRes.map((user) => [user.userId, user]));

        setUsers(usersData);
        setProviders(providerRes || []);
        setPitches(pitchRes || []);

        const enhancedBookings = bookRes.map((booking: BookingResponseDTO) => {
          const pitchId = booking.bookingDetails[0]?.pitchId;
          const pitch = pitchMap.get(pitchId);

          const provider = providerMap.get(booking.providerId);
          const providerUser = provider ? userMap.get(provider.userId) : null;

          return {
            ...booking,
            providerName: providerUser?.name || "Không xác định",
            pitchName: pitch?.name || "Không xác định",
            slots: booking.bookingDetails.map((detail) => detail.slot),
          };
        });

        setBookings(enhancedBookings || []);
        const productRes = await getAllProducts();
        const discountRes = await getAllDiscounts();
        const categoryRes = await getAllCategory(); // 👈 THÊM

        setProducts(productRes || []);
        setDiscounts(discountRes || []);
        setCategories(categoryRes || []); // 👈 THÊM
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        toast.error("Lỗi khi tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const scrollToUserTable = () => {
    userTableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToProviderTable = () => {
    providerTableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToPitchTable = () => {
    pitchTableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToBookingTable = () => {
    bookingTableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleEditUserClick = (user: UserData) => {
    setEditingUser(user);
    setEditUserDialogOpen(true);
  };

  const handleEditProviderClick = (provider: ProviderData) => {
    setEditingProvider(provider);
    setEditProviderDialogOpen(true);
  };

  const handleEditPitchClick = (pitch: PitchData) => {
    setEditingPitch(pitch);
    setEditPitchDialogOpen(true);
  };

  const handleUserSave = async () => {
    if (!editingUser) return;

    try {
      await updateUser(
        {
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
        },
        editingUser.userId
      );

      setUsers(
        users.map((user) =>
          user.userId === editingUser.userId ? editingUser : user
        )
      );

      toast.success("Cập nhật người dùng thành công");
      setEditUserDialogOpen(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      toast.error("Lỗi khi cập nhật người dùng");
    }
  };

  const handleProviderSave = async () => {
    if (!editingProvider) return;

    try {
      await updateProvider(
        {
          cardNumber: editingProvider.cardNumber,
          bank: editingProvider.bank,
        },
        editingProvider.providerId
      );

      setProviders(
        providers.map((provider) =>
          provider.providerId === editingProvider.providerId
            ? editingProvider
            : provider
        )
      );

      toast.success("Cập nhật Chủ sân thành công");
      setEditProviderDialogOpen(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật Chủ sân:", error);
      toast.error("Lỗi khi cập nhật Chủ sân");
    }
  };

  const handlePitchSave = async () => {
    if (!editingPitch) return;

    try {
      await updatePitch(editingPitch.pitchId, {
        providerAddressId: editingPitch.providerAddressId,
        name: editingPitch.name,
        type: editingPitch.type,
        price: editingPitch.price,
        description: editingPitch.description,
      });

      setPitches(
        pitches.map((pitch) =>
          pitch.pitchId === editingPitch.pitchId ? editingPitch : pitch
        )
      );

      toast.success("Cập nhật sân bóng thành công");
      setEditPitchDialogOpen(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật sân bóng:", error);
      toast.error("Lỗi khi cập nhật sân bóng");
    }
  };

  const handleOpenStatusModal = (user: UserData) => {
    setSelectedUser(user);
    setNewStatus(user.status as "ACTIVE" | "BLOCKED");
    setStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setStatusModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveStatus = async () => {
    if (selectedUser) {
      try {
        await changeUserStatus(selectedUser.userId, newStatus);
        toast.success("Thay đổi trạng thái thành công");

        setUsers(
          users.map((user) =>
            user.userId === selectedUser.userId
              ? { ...user, status: newStatus }
              : user
          )
        );
        handleCloseStatusModal();
      } catch (error) {
        console.error("Lỗi khi thay đổi trạng thái:", error);
        toast.error("Lỗi khi thay đổi trạng thái");
      }
    }
  };

  const renderChart = () => {
    const dataMap: Record<string, number[]> = {
      users: weeklyUserData,
      providers: weeklyProviderData,
      pitches: weeklyPitchData,
      invoices: weeklyInvoiceData,
      products: weeklyProductData,
      discounts: weeklyDiscountData,
    };

    const labels: Record<string, string> = {
      users: "Người dùng",
      providers: "Chủ sân",
      pitches: "Sân bóng",
      invoices: "Hóa đơn",
      products: "Sản phẩm",
      discounts: "Mã giảm giá",
    };

    const colors: Record<string, string> = {
      users: "#1976d2",
      providers: "#d32f2f",
      pitches: "#ed6c02",
      invoices: "#2e7d32",
      products: "#9c27b0",
      discounts: "#f57c00",
    };

    const activeDataKey = [
      "users",
      "providers",
      "pitches",
      "invoices",
      "products",
      "discounts",
    ][activeTab];
    const activeData = dataMap[activeDataKey];
    const label = labels[activeDataKey];
    const color = colors[activeDataKey];

    if (chartType === "bar") {
      return (
        <BarChart
          xAxis={[
            {
              scaleType: "band",
              data: [1, 2, 3, 4],
              valueFormatter: (value) => `Tuần ${value}`,
            },
          ]}
          series={[
            {
              data: activeData,
              label,
              color,
            },
          ]}
          yAxis={[{ label: "Số lượng" }]}
          height={300}
        />
      );
    } else {
      return (
        <LineChart
          xAxis={[
            {
              data: [1, 2, 3, 4],
              valueFormatter: (value) => `Tuần ${value}`,
              label: "Dòng thời gian",
            },
          ]}
          series={[
            {
              data: activeData,
              label,
              color,
              showMark: true,
            },
          ]}
          yAxis={[{ label: "Số lượng" }]}
          height={300}
          margin={{ bottom: 40, left: 50 }}
        />
      );
    }
  };

  const confirmedPaidBookings = bookings.filter(
    (book) => book.status === "CONFIRMED" && book.paymentStatus === "PAID"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Đang tải dữ liệu thống kê...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 mx-auto px-4 sm:px-8 flex flex-col space-y-[1rem] sm:space-y-[2rem] pt-[100px] pb-[100px]">
      <Header />
      <div className="main flex flex-col items-center max-w-7xl w-full px-4 mt-[1rem] mx-auto">
        <div className="w-full mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Tổng Quan Dashboard</h1>

            <Button
              variant="contained"
              color="success"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportExcel}
              sx={{ fontWeight: "bold" }}
            >
              Xuất Báo Cáo Excel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={scrollToUserTable}
            >
              <CardContent className="flex flex-col items-center">
                <PeopleIcon className="text-blue-500 text-4xl mb-2" />
                <Typography variant="h5" component="div">
                  {users.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Người dùng
                </Typography>
                <div className="flex items-center mt-2 text-green-600">
                  <ArrowUpwardIcon fontSize="small" />
                  <span>{users.length}</span>
                </div>
              </CardContent>
            </Card>
            <Card
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={scrollToProviderTable}
            >
              <CardContent className="flex flex-col items-center">
                <StoreIcon className="text-red-500 text-4xl mb-2" />
                <Typography variant="h5" component="div">
                  {providers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chủ sân
                </Typography>
                <div className="flex items-center mt-2 text-green-600">
                  <ArrowUpwardIcon fontSize="small" />
                  <span>{providers.length}</span>
                </div>
              </CardContent>
            </Card>
            <Card
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={scrollToPitchTable}
            >
              <CardContent className="flex flex-col items-center">
                <SportsSoccerIcon className="text-orange-500 text-4xl mb-2" />
                <Typography variant="h5" component="div">
                  {pitches.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sân bóng
                </Typography>
                <div className="flex items-center mt-2 text-green-600">
                  <ArrowUpwardIcon fontSize="small" />
                  <span>{pitches.length}</span>
                </div>
              </CardContent>
            </Card>
            <Card
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={scrollToBookingTable}
            >
              <CardContent className="flex flex-col items-center">
                <ReceiptIcon className="text-green-500 text-4xl mb-2" />
                <Typography variant="h5" component="div">
                  {confirmedPaidBookings.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hóa đơn
                </Typography>
                <div className="flex items-center mt-2 text-green-600">
                  <ArrowUpwardIcon fontSize="small" />
                  <span>
                    {confirmedPaidBookings.reduce(
                      (sum, book) => sum + (book.totalPrice || 0),
                      0
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="w-full mb-8 bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Phân Tích Dữ Liệu</h2>
            <div className="flex space-x-2">
              <Button
                variant={chartType === "bar" ? "contained" : "outlined"}
                onClick={() => setChartType("bar")}
              >
                Biểu đồ cột
              </Button>
              <Button
                variant={chartType === "line" ? "contained" : "outlined"}
                onClick={() => setChartType("line")}
              >
                Biểu đồ đường
              </Button>
            </div>
          </div>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab label="Người dùng" icon={<PeopleIcon />} />
            <Tab label="Chủ sân" icon={<StoreIcon />} />
            <Tab label="Sân bóng" icon={<SportsSoccerIcon />} />
            <Tab label="Hóa đơn" icon={<ReceiptIcon />} />
            <Tab label="Sản phẩm" icon={<Inventory2Icon />} />
            <Tab label="Discount" icon={<LocalOfferIcon />} />
          </Tabs>
          {renderChart()}
        </div>
        <div ref={userTableRef} className="w-full mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Danh sách người dùng</h2>
            <Button
              variant="outlined"
              color="primary"
              onClick={resetUsers}
              startIcon={<RestartAltOutlinedIcon />}
            >
              Đặt lại
            </Button>
          </div>
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
        <div ref={providerTableRef} className="w-full mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Danh sách Chủ sân</h2>
            <Button
              variant="outlined"
              color="primary"
              onClick={resetProviders}
              startIcon={<RestartAltOutlinedIcon />}
            >
              Đặt lại
            </Button>
          </div>
          <Box sx={{ height: 400, width: "100%", mb: 4 }}>
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
        <div ref={pitchTableRef} className="w-full mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Danh sách sân bóng</h2>
            <Button
              variant="outlined"
              color="primary"
              onClick={resetPitches}
              startIcon={<RestartAltOutlinedIcon />}
            >
              Đặt lại
            </Button>
          </div>
          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={pitches.map((pitch) => ({ id: pitch.pitchId, ...pitch }))}
              columns={pitchColumns}
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
        <div ref={bookingTableRef} className="w-full mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Danh sách đơn đặt</h2>
            <Button
              variant="outlined"
              color="primary"
              onClick={resetBookings}
              startIcon={<RestartAltOutlinedIcon />}
            >
              Đặt lại
            </Button>
          </div>
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
        {
          <div ref={productTableRef} className="w-full mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Quản lý sản phẩm</h2>

              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={async () => {
                    const data = await getAllProducts();
                    setProducts(data || []);
                    toast.success("Đã đặt lại danh sách sản phẩm");
                  }}
                  startIcon={<RestartAltOutlinedIcon />}
                >
                  Đặt lại
                </Button>

                <Button
                  variant="contained"
                  onClick={() => {
                    setEditingProduct({
                      name: "",
                      brand: "",
                      price: 0,
                      stockQuantity: 0,
                      imageUrl: "",
                      categoryId: undefined,
                    } as any);
                    setOpenProductDialog(true);
                  }}
                >
                  + Thêm sản phẩm
                </Button>
              </div>
            </div>

            <Box sx={{ height: 400, width: "100%", mb: 4 }}>
              <DataGrid
                rows={products || []}
                columns={productColumns}
                getRowId={(row) => row.id}
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
        }

        {
          <div ref={discountTableRef} className="w-full mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Quản lý Discount</h2>

              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={async () => {
                    const data = await getAllDiscounts();
                    setDiscounts(data || []);
                    toast.success("Đã đặt lại danh sách discount");
                  }}
                  startIcon={<RestartAltOutlinedIcon />}
                >
                  Đặt lại
                </Button>

                <Button
                  variant="contained"
                  onClick={() => {
                    setEditingDiscount({
                      code: "",
                      description: "",
                      discountType: "FIXED_AMOUNT", // Mặc định loại
                      value: 0,
                      scope: "GLOBAL", // Mặc định phạm vi
                      quantity: 1,
                      status: "ACTIVE", // Mặc định status có giá trị để gửi đi
                      startDate: "",
                      endDate: "",
                      active: true,
                    } as any);
                    setOpenDiscountDialog(true);
                  }}
                >
                  + Thêm Discount
                </Button>
              </div>
            </div>

            <Box sx={{ height: 400, width: "100%", mb: 4 }}>
              <DataGrid
                rows={discounts || []}
                columns={discountColumns}
                getRowId={(row) => row.id}
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
        }
      </div>

      <Dialog
        open={openProductDialog}
        onClose={() => setOpenProductDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
        </DialogTitle>

        <DialogContent>
          <div className="grid grid-cols-1 gap-4 mt-2">
            <TextField
              label="Tên sản phẩm"
              fullWidth
              value={editingProduct?.name || ""}
              onChange={(e) =>
                setEditingProduct((prev: any) => ({
                  ...(prev ?? ({} as any)),
                  name: e.target.value,
                }))
              }
            />

            <TextField
              label="Brand"
              fullWidth
              value={editingProduct?.brand || ""}
              onChange={(e) =>
                setEditingProduct((prev: any) => ({
                  ...(prev ?? ({} as any)),
                  brand: e.target.value,
                }))
              }
            />

            <TextField
              label="Link ảnh (Cloudinary)"
              fullWidth
              placeholder="https://res.cloudinary.com/..."
              value={editingProduct?.imageUrl || ""}
              onChange={(e) =>
                setEditingProduct((prev: any) => ({
                  ...(prev ?? ({} as any)),
                  imageUrl: e.target.value,
                }))
              }
            />

            {editingProduct?.imageUrl && (
              <div className="flex justify-center mt-2">
                <img
                  src={editingProduct.imageUrl}
                  alt="Preview"
                  className="max-h-[200px] rounded border object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/300x200?text=Invalid+Image";
                  }}
                />
              </div>
            )}

            {/* GIÁ */}
            <TextField
              label="Giá (VND)"
              type="number"
              fullWidth
              value={editingProduct?.price || 0}
              onChange={(e) =>
                setEditingProduct((prev: any) => ({
                  ...(prev ?? ({} as any)),
                  price: Number(e.target.value),
                }))
              }
            />

            <TextField
              select
              label="Danh mục"
              fullWidth
              value={editingProduct?.categoryId || ""}
              onChange={(e) =>
                setEditingProduct((prev: any) => ({
                  ...(prev ?? {}),
                  categoryId: Number(e.target.value),
                }))
              }
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Tồn kho"
              type="number"
              fullWidth
              value={editingProduct?.stockQuantity || 0}
              onChange={(e) =>
                setEditingProduct((prev: any) => ({
                  ...(prev ?? ({} as any)),
                  stockQuantity: Number(e.target.value),
                }))
              }
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenProductDialog(false)}>Hủy</Button>

          <Button
            variant="contained"
            onClick={async () => {
              try {
                if (editingProduct?.id) {
                  await updateProduct(editingProduct as any, editingProduct.id);
                  toast.success("Cập nhật sản phẩm thành công");
                } else {
                  if (!editingProduct?.categoryId) {
                    toast.error("Vui lòng chọn danh mục");
                    return;
                  }

                  await createProduct(editingProduct as any);
                  toast.success("Thêm sản phẩm thành công");
                }

                const data = await getAllProducts();
                setProducts(data || []);

                setOpenProductDialog(false);
                setEditingProduct(null);
              } catch (error) {
                console.error(error);
                toast.error("Lỗi khi lưu sản phẩm");
              }
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDiscountDialog}
        onClose={() => setOpenDiscountDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingDiscount ? "Chỉnh sửa Discount" : "Thêm Discount"}
        </DialogTitle>

        <DialogContent>
          <div className="grid grid-cols-1 gap-4 mt-2">
            <TextField
              label="Mã Discount"
              fullWidth
              value={editingDiscount?.code || ""}
              onChange={(e) =>
                setEditingDiscount((prev: any) => ({
                  ...(prev ?? ({} as any)),
                  code: e.target.value,
                }))
              }
            />

            <TextField
              label="Mô tả"
              fullWidth
              value={editingDiscount?.description || ""}
              onChange={(e) =>
                setEditingDiscount((prev: any) => ({
                  ...(prev ?? ({} as any)),
                  description: e.target.value,
                }))
              }
            />

            <TextField
              select
              label="Loại Discount"
              fullWidth
              value={editingDiscount?.discountType || "FIXED_AMOUNT"}
              onChange={(e) =>
                setEditingDiscount((prev: any) => ({
                  ...(prev ?? ({} as any)),
                  discountType: e.target.value,
                }))
              }
            >
              <MenuItem value="FIXED_AMOUNT">Giảm tiền cố định</MenuItem>
              <MenuItem value="PERCENTAGE">Giảm theo %</MenuItem>
            </TextField>

            <TextField
              label={
                editingDiscount?.discountType === "PERCENTAGE"
                  ? "Phần trăm giảm (%)"
                  : "Số tiền giảm"
              }
              type="number"
              fullWidth
              value={editingDiscount?.value || 0}
              onChange={(e) =>
                setEditingDiscount((prev: any) => ({
                  ...(prev ?? {}),
                  value: Number(e.target.value),
                }))
              }
            />
            <TextField
              select
              label="Phạm vi áp dụng"
              fullWidth
              value={editingDiscount?.scope || "GLOBAL"}
              onChange={(e) =>
                setEditingDiscount((prev: any) => ({
                  ...(prev ?? {}),
                  scope: e.target.value,
                }))
              }
            >
              <MenuItem value="GLOBAL">Toàn hệ thống</MenuItem>
              <MenuItem value="SPECIFIC_PRODUCT">Sản phẩm cụ thể</MenuItem>
              <MenuItem value="CATEGORY">Danh mục</MenuItem>
            </TextField>

            <TextField
              label="Số lượt sử dụng"
              type="number"
              fullWidth
              inputProps={{ min: 1 }}
              value={editingDiscount?.quantity ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setEditingDiscount((prev: any) => ({
                  ...(prev ?? {}),
                  quantity: val === "" ? "" : Number(val),
                }));
              }}
              error={
                editingDiscount?.quantity !== undefined &&
                Number(editingDiscount?.quantity) <= 0
              }
              helperText={
                editingDiscount?.quantity !== undefined &&
                Number(editingDiscount?.quantity) <= 0
                  ? "Số lượng phải lớn hơn 0"
                  : ""
              }
            />

            <TextField
              select
              label="Trạng thái"
              fullWidth
              value={editingDiscount?.status || "ACTIVE"}
              onChange={(e) =>
                setEditingDiscount((prev: any) => ({
                  ...(prev ?? {}),
                  status: e.target.value,
                }))
              }
            >
              <MenuItem value="ACTIVE">Hoạt động</MenuItem>
              <MenuItem value="INACTIVE">Tạm ngưng</MenuItem>
            </TextField>

            <TextField
              type="date"
              label="Ngày bắt đầu"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={editingDiscount?.startDate || ""}
              onChange={(e) =>
                setEditingDiscount((prev: any) => ({
                  ...(prev ?? ({} as any)),
                  startDate: e.target.value,
                }))
              }
            />

            <TextField
              type="date"
              label="Ngày kết thúc"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={editingDiscount?.endDate || ""}
              onChange={(e) =>
                setEditingDiscount((prev: any) => ({
                  ...(prev ?? ({} as any)),
                  endDate: e.target.value,
                }))
              }
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDiscountDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                if (editingDiscount?.id) {
                  await updateDiscount(
                    editingDiscount as any,
                    editingDiscount.id
                  );
                  toast.success("Cập nhật discount thành công");
                } else {
                  await createDiscount(editingDiscount as any);
                  toast.success("Thêm discount thành công");
                }

                setDiscounts(await getAllDiscounts());
                setOpenDiscountDialog(false);
              } catch (err) {
                console.error(err);
                toast.error("Lỗi khi lưu discount");
              }
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editUserDialogOpen}
        onClose={() => setEditUserDialogOpen(false)}
      >
        <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        <DialogContent>
          {editingUser && (
            <div className="grid grid-cols-1 gap-4 mt-4">
              <TextField
                margin="dense"
                label="Tên"
                fullWidth
                value={editingUser.name}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
              />
              <TextField
                margin="dense"
                label="Email"
                fullWidth
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
              />
              <TextField
                margin="dense"
                label="Số điện thoại"
                fullWidth
                value={editingUser.phone}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, phone: e.target.value })
                }
              />
              <TextField
                select
                margin="dense"
                label="Vai trò"
                fullWidth
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    role: e.target.value as "USER" | "PROVIDER",
                  })
                }
              >
                <MenuItem value="USER">Người dùng</MenuItem>
                <MenuItem value="PROVIDER">Chủ sân</MenuItem>
              </TextField>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleUserSave} variant="contained" color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={editProviderDialogOpen}
        onClose={() => setEditProviderDialogOpen(false)}
      >
        <DialogTitle>Chỉnh sửa Chủ sân</DialogTitle>
        <DialogContent>
          {editingProvider && (
            <div className="grid grid-cols-1 gap-4 mt-4">
              <TextField
                margin="dense"
                label="Số thẻ"
                fullWidth
                value={editingProvider.cardNumber}
                onChange={(e) =>
                  setEditingProvider({
                    ...editingProvider,
                    cardNumber: e.target.value,
                  })
                }
              />
              <TextField
                select
                margin="dense"
                label="Ngân hàng"
                fullWidth
                value={editingProvider.bank}
                onChange={(e) =>
                  setEditingProvider({
                    ...editingProvider,
                    bank: e.target.value,
                  })
                }
              >
                <MenuItem value="BIDV">BIDV</MenuItem>
                <MenuItem value="Agribank">Agribank</MenuItem>
                <MenuItem value="MB">MB Bank</MenuItem>
                <MenuItem value="Vietcombank">Vietcombank</MenuItem>
              </TextField>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProviderDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={handleProviderSave}
            variant="contained"
            color="primary"
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={editPitchDialogOpen}
        onClose={() => setEditPitchDialogOpen(false)}
      >
        <DialogTitle>Chỉnh sửa sân bóng</DialogTitle>
        <DialogContent>
          {editingPitch && (
            <div className="grid grid-cols-1 gap-4 mt-4">
              <TextField
                margin="dense"
                label="Tên sân"
                fullWidth
                value={editingPitch.name}
                onChange={(e) =>
                  setEditingPitch({ ...editingPitch, name: e.target.value })
                }
              />
              <TextField
                select
                margin="dense"
                label="Loại sân"
                fullWidth
                value={editingPitch.type}
                onChange={(e) =>
                  setEditingPitch({
                    ...editingPitch,
                    type: e.target.value as any,
                  })
                }
              >
                <MenuItem value="FIVE_A_SIDE">5 người</MenuItem>
                <MenuItem value="SEVEN_A_SIDE">7 người</MenuItem>
                <MenuItem value="ELEVEN_A_SIDE">11 người</MenuItem>
              </TextField>
              <TextField
                margin="dense"
                label="Giá (VND)"
                fullWidth
                type="number"
                value={editingPitch.price}
                onChange={(e) =>
                  setEditingPitch({
                    ...editingPitch,
                    price: Number(e.target.value),
                  })
                }
              />
              <TextField
                margin="dense"
                label="Mô tả"
                fullWidth
                multiline
                rows={3}
                value={editingPitch.description || ""}
                onChange={(e) =>
                  setEditingPitch({
                    ...editingPitch,
                    description: e.target.value,
                  })
                }
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPitchDialogOpen(false)}>Hủy</Button>
          <Button onClick={handlePitchSave} variant="contained" color="primary">
            Lưu
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
                  value={paymentStatus || "PENDING"}
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

      <Modal open={statusModalOpen} onClose={handleCloseStatusModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            Thay đổi trạng thái người dùng
          </Typography>
          {selectedUser && (
            <>
              <Typography sx={{ mt: 2 }}>
                Tên người dùng: {selectedUser.name}
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="status-label">Trạng thái</InputLabel>
                <Select
                  labelId="status-label"
                  value={newStatus}
                  label="Trạng thái"
                  onChange={(e) =>
                    setNewStatus(e.target.value as "ACTIVE" | "BLOCKED")
                  }
                >
                  <MenuItem value="ACTIVE">Đang hoạt động</MenuItem>
                  <MenuItem value="BLOCKED">Ngưng hoạt động</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button variant="outlined" onClick={handleCloseStatusModal}>
              Hủy
            </Button>
            <Button variant="contained" onClick={handleSaveStatus}>
              Lưu
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default Dashboard;
