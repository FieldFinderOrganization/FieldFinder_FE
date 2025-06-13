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
import { update } from "@/redux/features/authSlice";
import { toast } from "react-toastify";
import { addAddress, updateAddress, deleteAddress } from "@/services/provider";

import {
  getPitchesByProviderAddressId,
  PitchResponseDTO,
} from "@/services/pitch";

const buttonBase =
  "w-8 h-8 flex items-center justify-center rounded-md transition-all";

export default function AddressInfo() {
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
    "Gò Vấp",
    "Quận 5",
    "Tân Phú",
    "Thủ Đức",
    "Quận 8",
  ];

  interface Area {
    id: string;
    name: string;
    count: number;
  }

  interface Address {
    providerAddressId: string;
    address: string;
  }

  const [areas, setAreas] = useState<
    { id: string; name: string; count: number }[]
  >([]);
  const [pitches, setPitches] = useState<PitchResponseDTO[]>([]);
  const [pitchesByArea, setPitchesByArea] = useState<{
    [key: string]: PitchResponseDTO[];
  }>({});
  const selectedArea = areas.find((a) => a.id === selectedId);

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
      }
    };

    fetchPitchesForAllAreas();
  }, [user?.addresses]);

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

    // Kiểm tra trùng tên (không phân biệt hoa thường)
    const existingAddresses = (user?.addresses || []).map((addr: Address) =>
      addr.address.toLowerCase()
    );
    if (existingAddresses.includes(trimmedAddress.toLowerCase())) {
      toast.error("Khu vực này đã tồn tại");
      return;
    }

    try {
      const newAddr = await addAddress({
        address: trimmedAddress,
        providerId: user?.providerId!,
      });
      dispatch(update({ addresses: [...(user?.addresses || []), newAddr] }));
      toast.success("Đã thêm khu vực thành công");
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

    // Kiểm tra trùng tên với các khu vực khác (ngoại trừ khu vực đang chỉnh sửa)
    const existingAddresses = (user?.addresses || [])
      .filter((addr: Address) => addr.providerAddressId !== selectedId)
      .map((addr: Address) => addr.address.toLowerCase());
    if (existingAddresses.includes(trimmedAddress.toLowerCase())) {
      toast.error("Khu vực này đã tồn tại");
      return;
    }

    try {
      const updatedAddr = await updateAddress(
        { address: trimmedAddress, providerId: user?.providerId! },
        selectedId
      );
      const list: Address[] = (user?.addresses || []).map((addr: Address) =>
        addr.providerAddressId === selectedId ? updatedAddr : addr
      );
      dispatch(update({ addresses: list }));
      toast.success("Chỉnh sửa thành công");
      handleEditClose();
    } catch {
      toast.error("Chỉnh sửa thất bại");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;
    try {
      await deleteAddress(selectedId);
      const updatedAddresses = (user?.addresses || []).filter(
        (addr: Address) => addr.providerAddressId !== selectedId
      );
      dispatch(update({ addresses: updatedAddresses }));
      toast.success("Xóa khu vực thành công");
      setSelectedId(null);
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
    <div id="address-info" className="flex flex-col w-[90%]">
      <div className="flex items-center gap-x-[2rem] mb-4">
        <Typography variant="h6">Địa chỉ</Typography>
        <div className="flex space-x-4">
          <Tooltip title="Thêm khu vực" arrow>
            <div
              className={`${buttonBase} bg-[#e25b43] text-white cursor-pointer`}
              onClick={handleAddClick}
            >
              <AddOutlinedIcon fontSize="medium" />
            </div>
          </Tooltip>
          <Tooltip title="Sửa khu vực" arrow>
            <div
              className={`${buttonBase} ${
                selectedId
                  ? "bg-[#e25b43] text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleEditClick}
            >
              <EditOutlinedIcon fontSize="medium" />
            </div>
          </Tooltip>
          <Tooltip title="Xóa khu vực" arrow>
            <div
              className={`${buttonBase} ${
                selectedId
                  ? "bg-[#e25b43] text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleDeleteClick}
            >
              <DeleteOutlineOutlinedIcon fontSize="medium" />
            </div>
          </Tooltip>
        </div>
      </div>

      <div className="areas grid grid-cols-4 gap-x-[1.5rem] gap-y-[1.5rem]">
        {areas.map((area) => (
          <div
            key={area.id}
            className="area border-2 border-gray-400 rounded-md flex items-center relative px-4 py-2 w-[190px]"
          >
            <Typography component="div" className="flex items-center w-full">
              <span className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
                {area.name}
              </span>
              <span className="flex-shrink-0">🏟️ {area.count}</span>
            </Typography>

            <Checkbox
              checked={selectedId === area.id}
              onChange={() =>
                setSelectedId(selectedId === area.id ? null : area.id)
              }
              sx={{
                "& .MuiSvgIcon-root": { fontSize: 16 },
                marginTop: "-0.5rem",
                marginRight: "-0.5rem",
              }}
            />
          </div>
        ))}
      </div>

      <Dialog open={openAddModal} onClose={handleAddClose}>
        <DialogTitle>Thêm khu vực mới</DialogTitle>
        <DialogContent>
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
        <DialogActions>
          <Button onClick={handleAddClose}>Hủy</Button>
          <Button onClick={handleAddSave} disabled={!tempAddress.trim()}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditModal} onClose={handleEditClose}>
        <DialogTitle>Chỉnh sửa khu vực</DialogTitle>
        <DialogContent>
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
        <DialogActions>
          <Button onClick={handleEditClose}>Hủy</Button>
          <Button onClick={handleEditSave} disabled={!tempAddress.trim()}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteModal} onClose={handleDeleteClose}>
        <DialogTitle>Xác nhận xóa khu vực</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa khu vực "{selectedArea?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Hủy</Button>
          <Button color="error" onClick={handleDeleteConfirm}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
