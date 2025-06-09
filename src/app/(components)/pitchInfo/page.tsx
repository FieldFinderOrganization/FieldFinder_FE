import { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { toast } from "react-toastify";

import {
  getPitchesByProviderAddressId,
  createPitch,
  updatePitch,
  PitchRequestDTO,
  PitchResponseDTO,
  deletePitch,
} from "../../../services/pitch";

interface PitchInfoProps {
  providerAddressId: string;
}

export default function PitchInfo({ providerAddressId }: PitchInfoProps) {
  const [pitches, setPitches] = useState<PitchResponseDTO[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const emptyForm: PitchRequestDTO = {
    providerAddressId,
    name: "",
    type: "FIVE_A_SIDE",
    price: 0,
    description: "",
  };
  const [formData, setFormData] = useState<PitchRequestDTO>(emptyForm);

  useEffect(() => {
    if (!providerAddressId) return;
    getPitchesByProviderAddressId(providerAddressId)
      .then(setPitches)
      .catch(() => toast.error("Không tải được danh sách sân"));
  }, [providerAddressId]);

  const selectedPitch = selectedIndex !== null ? pitches[selectedIndex] : null;

  const handleSelect = (idx: number) => {
    setSelectedIndex(idx === selectedIndex ? null : idx);
  };

  const onAdd = () => {
    setFormData({ ...emptyForm });
    setOpenAdd(true);
  };
  const saveAdd = async () => {
    try {
      const newPitch = await createPitch(formData);
      setPitches([newPitch, ...pitches]);
      toast.success("Đã thêm sân");
      setOpenAdd(false);
    } catch {
      toast.error("Thêm sân thất bại");
    }
  };

  const onEdit = () => {
    if (!selectedPitch) return;
    setFormData({
      providerAddressId,
      name: selectedPitch.name,
      type: selectedPitch.type,
      price: Number(selectedPitch.price),
      description: selectedPitch.description ?? "",
    });
    setOpenEdit(true);
  };
  const saveEdit = async () => {
    if (!selectedPitch) return;
    try {
      const updated = await updatePitch(selectedPitch.pitchId, formData);
      setPitches(
        pitches.map((p) => (p.pitchId === updated.pitchId ? updated : p))
      );
      toast.success("Đã cập nhật sân");
      setOpenEdit(false);
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  const onDelete = () => setOpenDelete(true);
  const confirmDelete = async () => {
    if (!selectedPitch) return;
    await deletePitch(selectedPitch.pitchId);
    toast.success("Xóa sân thành công");
  };

  return (
    <div className="flex flex-col items-start gap-y-6">
      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
        Thông tin sân
      </Typography>
      <div className="flex items-center gap-x-4">
        <Tooltip title="Thêm sân" arrow>
          <div
            className="w-8 h-8 bg-[#e25b43] text-white flex items-center justify-center rounded-md cursor-pointer"
            onClick={onAdd}
          >
            <AddOutlinedIcon fontSize="small" />
          </div>
        </Tooltip>
        <Tooltip
          title={selectedPitch ? "Chỉnh sửa sân" : "Chọn sân để sửa"}
          arrow
        >
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-md ${
              selectedPitch
                ? "bg-[#e25b43] text-white cursor-pointer"
                : "bg-gray-300 text-gray-500"
            }`}
            onClick={onEdit}
          >
            <EditOutlinedIcon fontSize="small" />
          </div>
        </Tooltip>
        <Tooltip title={selectedPitch ? "Xóa sân" : "Chọn sân để xóa"} arrow>
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-md ${
              selectedPitch
                ? "bg-[#e25b43] text-white cursor-pointer"
                : "bg-gray-300 text-gray-500"
            }`}
            onClick={onDelete}
          >
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </div>
        </Tooltip>
      </div>

      <Divider flexItem sx={{ borderColor: "grey", my: 2 }} />

      <div className="san flex flex-wrap gap-x-5 gap-y-6">
        {pitches.map((pitch, idx) => {
          const isSel = idx === selectedIndex;
          return (
            <Card
              key={pitch.pitchId}
              className={`max-w-[218px] h-[130px] cursor-pointer ${isSel ? "border-2 border-[#e25b43]" : ""}`}
              onClick={() => handleSelect(idx)}
            >
              <CardContent className="p-2 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <Typography
                    fontWeight="bold"
                    fontSize="0.9rem"
                    color={isSel ? "#e25b43" : "text.primary"}
                  >
                    {pitch.name}
                  </Typography>
                  <Checkbox
                    checked={isSel}
                    sx={{ "& .MuiSvgIcon-root": { fontSize: 16 } }}
                  />
                </div>
                <Typography fontSize="0.8rem" color="text.secondary">
                  {pitch.type.replace(/_/g, " ")} • {pitch.price}₫
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog Thêm */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Thêm sân mới</DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          <TextField
            label="Tên sân"
            fullWidth
            value={formData.name}
            onChange={(e) =>
              setFormData((f) => ({ ...f, name: e.target.value }))
            }
          />
          <TextField
            label="Loại (FIVE_A_SIDE, ...)"
            fullWidth
            value={formData.type}
            onChange={(e) =>
              setFormData((f) => ({ ...f, type: e.target.value as any }))
            }
          />
          <TextField
            label="Giá"
            type="number"
            fullWidth
            value={formData.price}
            onChange={(e) =>
              setFormData((f) => ({ ...f, price: Number(e.target.value) }))
            }
          />
          <TextField
            label="Mô tả"
            fullWidth
            multiline
            value={formData.description}
            onChange={(e) =>
              setFormData((f) => ({ ...f, description: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Hủy</Button>
          <Button onClick={saveAdd} disabled={!formData.name.trim()}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Sửa */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Chỉnh sửa sân</DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          {/* Các input giống Dialog Thêm */}
          <TextField
            label="Tên sân"
            fullWidth
            value={formData.name}
            onChange={(e) =>
              setFormData((f) => ({ ...f, name: e.target.value }))
            }
          />
          <TextField
            label="Loại"
            fullWidth
            value={formData.type}
            onChange={(e) =>
              setFormData((f) => ({ ...f, type: e.target.value as any }))
            }
          />
          <TextField
            label="Giá"
            type="number"
            fullWidth
            value={formData.price}
            onChange={(e) =>
              setFormData((f) => ({ ...f, price: Number(e.target.value) }))
            }
          />
          <TextField
            label="Mô tả"
            fullWidth
            multiline
            value={formData.description}
            onChange={(e) =>
              setFormData((f) => ({ ...f, description: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Hủy</Button>
          <Button onClick={saveEdit} disabled={!formData.name.trim()}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Xóa */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Xác nhận xóa sân</DialogTitle>
        <DialogContent>
          Bạn có chắc muốn xóa sân “{selectedPitch?.name}”?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Hủy</Button>
          <Button color="error" onClick={confirmDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
