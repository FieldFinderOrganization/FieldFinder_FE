/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { toast } from "react-toastify";
import {
  addAddress,
  updateAddress,
  deleteAddress,
  getAddressByProviderId,
} from "@/services/provider";

import {
  getPitchesByProviderAddressId,
  PitchResponseDTO,
} from "@/services/pitch";

export interface AddressInfoProps {
  providerId?: string;
}
const buttonBase =
  "w-8 h-8 flex items-center justify-center rounded-md transition-all";

export default function AddressInfo({ providerId }: AddressInfoProps) {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [tempAddress, setTempAddress] = useState("");

  const locations = [
    "Quận 1",
    "Quận 2",
    "Quận 3",
    "Quận 4",
    "Quận 5",
    "Quận 6",
    "Quận 7",
    "Quận 8",
    "Quận 9",
    "Quận 10",
    "Quận 11",
    "Quận 12",
    "Gò Vấp",
    "Tân Bình",
    "Tân Phú",
    "Bình Thạnh",
    "Phú Nhuận",
    "Bình Tân",
    "Thủ Đức",
  ];

  const [areas, setAreas] = useState<
    { id: string; name: string; count: number }[]
  >([]);

  const selectedArea = areas.find((a) => a.id === selectedId);

  // HÀM LẤY DANH SÁCH TỪ API THAY VÌ REDUX
  const fetchAddresses = async () => {
    if (!providerId) return;

    try {
      const providerAddresses = await getAddressByProviderId(providerId);

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
  };

  useEffect(() => {
    fetchAddresses();
  }, [providerId]);

  const handleAddClick = () => {
    setTempAddress("");
    setOpenAddModal(true);
  };
  const handleEditClick = () =>
    selectedArea && (setTempAddress(selectedArea.name), setOpenEditModal(true));
  const handleDeleteClick = () => selectedArea && setOpenDeleteModal(true);
  const handleAddClose = () => setOpenAddModal(false);
  const handleEditClose = () => setOpenEditModal(false);
  const handleDeleteClose = () => setOpenDeleteModal(false);

  const handleAddSave = async () => {
    const trimmedAddress = tempAddress.trim();
    if (!trimmedAddress) {
      toast.error("Vui lòng nhập tên khu vực");
      return;
    }

    // Kiểm tra trùng tên dựa vào danh sách areas từ API
    const existingAddresses = areas.map((area) => area.name.toLowerCase());
    if (existingAddresses.includes(trimmedAddress.toLowerCase())) {
      toast.error("Khu vực này đã tồn tại");
      return;
    }

    try {
      await addAddress({
        address: trimmedAddress,
        providerId: providerId!,
      });
      toast.success("Đã thêm khu vực thành công");
      fetchAddresses(); // Gọi API tải lại danh sách mới
      handleAddClose();
    } catch {
      toast.error("Thêm khu vực thất bại");
    }
  };

  const handleEditSave = async () => {
    if (!selectedId) return;

    const trimmedAddress = tempAddress.trim();
    if (!trimmedAddress) {
      toast.error("Vui lòng nhập tên khu vực");
      return;
    }

    // Kiểm tra trùng tên
    const existingAddresses = areas
      .filter((area) => area.id !== selectedId)
      .map((area) => area.name.toLowerCase());

    if (existingAddresses.includes(trimmedAddress.toLowerCase())) {
      toast.error("Khu vực này đã tồn tại");
      return;
    }

    try {
      await updateAddress(
        { address: trimmedAddress, providerId: providerId! },
        selectedId,
      );
      toast.success("Chỉnh sửa thành công");
      fetchAddresses(); // Gọi API tải lại danh sách mới
      handleEditClose();
    } catch {
      toast.error("Chỉnh sửa thất bại");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;
    try {
      await deleteAddress(selectedId);
      toast.success("Xóa khu vực thành công");
      setSelectedId(null);
      fetchAddresses(); // Gọi API tải lại danh sách mới
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error("Khu vực không tồn tại");
      } else {
        toast.error("Xóa khu vực thất bại");
      }
    } finally {
      handleDeleteClose();
    }
  };

  return (
    <div id="address-info" className="flex flex-col w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <Typography
          variant="h6"
          sx={{ fontWeight: "700", color: "#1e293b", fontSize: "1.1rem" }}
        >
          Địa chỉ các chi nhánh
        </Typography>
        <div className="flex gap-3">
          <Tooltip title="Thêm khu vực" arrow>
            <div
              className={`${buttonBase} bg-[#059669] hover:bg-[#047857] text-white cursor-pointer shadow-sm`}
              onClick={handleAddClick}
            >
              <AddOutlinedIcon fontSize="small" />
            </div>
          </Tooltip>
          <Tooltip title="Sửa khu vực" arrow>
            <div
              className={`${buttonBase} ${
                selectedId
                  ? "bg-[#0093FF] hover:bg-[#007add] text-white cursor-pointer shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
              onClick={handleEditClick}
            >
              <EditOutlinedIcon fontSize="small" />
            </div>
          </Tooltip>
          <Tooltip title="Xóa khu vực" arrow>
            <div
              className={`${buttonBase} ${
                selectedId
                  ? "bg-[#ef4444] hover:bg-[#dc2626] text-white cursor-pointer shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
              onClick={handleDeleteClick}
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </div>
          </Tooltip>
        </div>
      </div>

      {areas.length === 0 ? (
        <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center bg-gray-50">
          <Typography className="text-gray-500 font-medium">
            Chưa có địa chỉ nào được thêm
          </Typography>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {areas.map((area) => {
            const isSelected = selectedId === area.id;
            return (
              <div
                key={area.id}
                onClick={() => setSelectedId(isSelected ? null : area.id)}
                className={`border-2 rounded-xl flex items-center justify-between px-4 py-3 cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#0093FF] bg-blue-50"
                    : "border-gray-200 hover:border-[#0093FF]/50 bg-white"
                }`}
              >
                <div className="flex flex-col flex-1 overflow-hidden pr-2">
                  <Typography className="font-bold text-[#1e293b] truncate text-[0.95rem]">
                    {area.name}
                  </Typography>
                  <Typography className="text-xs font-medium text-gray-500 mt-0.5">
                    🏟️ {area.count} sân đang hoạt động
                  </Typography>
                </div>
                <Checkbox
                  checked={isSelected}
                  sx={{
                    "& .MuiSvgIcon-root": { fontSize: 20 },
                    color: "#cbd5e1",
                    "&.Mui-checked": { color: "#0093FF" },
                    padding: 0,
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={openAddModal}
        onClose={handleAddClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Thêm khu vực mới</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Autocomplete
            freeSolo
            options={locations}
            inputValue={tempAddress}
            onInputChange={(event, newInputValue) => {
              setTempAddress(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                margin="dense"
                label="Tên khu vực"
                type="text"
                fullWidth
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleAddClose}
            color="inherit"
            sx={{ fontWeight: "bold" }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAddSave}
            disabled={!tempAddress.trim()}
            variant="contained"
            sx={{ bgcolor: "#0093FF", fontWeight: "bold" }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditModal}
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Chỉnh sửa khu vực</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Autocomplete
            freeSolo
            options={locations}
            inputValue={tempAddress}
            onInputChange={(event, newInputValue) => {
              setTempAddress(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                margin="dense"
                label="Tên khu vực"
                type="text"
                fullWidth
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleEditClose}
            color="inherit"
            sx={{ fontWeight: "bold" }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleEditSave}
            disabled={!tempAddress.trim()}
            variant="contained"
            sx={{ bgcolor: "#0093FF", fontWeight: "bold" }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteModal} onClose={handleDeleteClose}>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Xác nhận xóa khu vực
        </DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa khu vực "{selectedArea?.name}"? Các sân
          thuộc khu vực này có thể bị ảnh hưởng.
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleDeleteClose}
            color="inherit"
            sx={{ fontWeight: "bold" }}
          >
            Hủy
          </Button>
          <Button
            color="error"
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{ fontWeight: "bold" }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
