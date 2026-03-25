/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useCallback } from "react";
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
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CancelIcon from "@mui/icons-material/Cancel";
import { toast } from "react-toastify";
import MenuItem from "@mui/material/MenuItem";
import f from "../../../../public/images/field1.jpg";

import ImageEditorUploader from "@/utils/imageEditorUploader";

import {
  getPitchesByProviderAddressId,
  createPitch,
  updatePitch,
  PitchRequestDTO,
  PitchResponseDTO,
  deletePitch,
} from "@/services/pitch";
import { TextField } from "@mui/material";

export interface PitchInfoProps {
  providerAddressId: string;
  onPitchUpdate?: () => void | Promise<void>;
}

const PitchInfo: React.FC<PitchInfoProps> = ({
  providerAddressId,
  onPitchUpdate,
}) => {
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
    environment: "OUTDOOR",
    imageUrls: [],
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
      if (onPitchUpdate) await onPitchUpdate();
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
      environment: selectedPitch.environment || "OUTDOOR",
      imageUrls: selectedPitch.imageUrls || [],
    });
    setOpenEdit(true);
  };

  const saveEdit = async () => {
    if (!selectedPitch) return;
    try {
      const updated = await updatePitch(selectedPitch.pitchId, formData);
      setPitches(
        pitches.map((p) => (p.pitchId === updated.pitchId ? updated : p)),
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

    setPitches(pitches.filter((p) => p.pitchId !== selectedPitch.pitchId));

    toast.success("Xóa sân thành công");
    setOpenDelete(false);
    setSelectedIndex(null);
    if (onPitchUpdate) await onPitchUpdate();
  };

  const handleImageUpload = useCallback((url: string) => {
    setFormData((prevData: PitchRequestDTO) => ({
      ...prevData,
      imageUrls: [...(prevData.imageUrls || []), url],
    }));
  }, []);

  return (
    <div className="flex flex-col items-start gap-y-6">
      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
        Thông tin sân
      </Typography>
      <div className="flex items-center gap-x-4">
        <Tooltip title="Thêm sân" arrow>
          <div
            className="w-8 h-8 bg-[#e25b43] text-white flex items-center justify-center rounded-md cursor-pointer hover:bg-[#c84b35] transition-colors"
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
            className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
              selectedPitch
                ? "bg-[#e25b43] text-white cursor-pointer hover:bg-[#c84b35]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={selectedPitch ? onEdit : undefined}
          >
            <EditOutlinedIcon fontSize="small" />
          </div>
        </Tooltip>
        <Tooltip title={selectedPitch ? "Xóa sân" : "Chọn sân để xóa"} arrow>
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
              selectedPitch
                ? "bg-[#e25b43] text-white cursor-pointer hover:bg-[#c84b35]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={selectedPitch ? onDelete : undefined}
          >
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </div>
        </Tooltip>
      </div>

      <Divider flexItem sx={{ borderColor: "grey", my: 2 }} />

      <div className="san flex flex-wrap gap-x-5 gap-y-6">
        {pitches.map((pitch, idx) => {
          const isSel = idx === selectedIndex;
          const coverImage =
            pitch.imageUrls && pitch.imageUrls.length > 0
              ? pitch.imageUrls[0]
              : f.src;

          return (
            <Card
              key={pitch.pitchId}
              className={`w-[218px] min-h-[160px] cursor-pointer transition-all flex flex-col ${
                isSel
                  ? "border-2 border-[#e25b43] shadow-md transform scale-[1.02]"
                  : "hover:shadow-md"
              }`}
              onClick={() => handleSelect(idx)}
            >
              <img
                src={coverImage}
                alt="pitch-cover"
                className="w-full h-[90px] object-cover border-b border-gray-100"
              />
              <CardContent className="p-2 flex flex-col justify-between flex-1">
                <div className="flex justify-between items-center">
                  <Typography
                    fontWeight="bold"
                    fontSize="0.9rem"
                    color={isSel ? "#e25b43" : "text.primary"}
                    className="truncate pr-2"
                  >
                    {pitch.name}
                  </Typography>
                  <Checkbox
                    checked={isSel}
                    sx={{ "& .MuiSvgIcon-root": { fontSize: 16 }, padding: 0 }}
                  />
                </div>
                <Typography
                  fontSize="0.8rem"
                  color="text.secondary"
                  className="mt-2"
                >
                  {pitch.type.replace(/_/g, " ")} •{" "}
                  {pitch.price.toLocaleString("vi-VN")}₫
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        maxWidth="sm"
        fullWidth
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem", pb: 1 }}>
          Thêm sân mới
        </DialogTitle>
        <DialogContent className="flex flex-col gap-5 mt-2">
          <TextField
            label="Tên sân"
            fullWidth
            value={formData.name || ""}
            onChange={(e) =>
              setFormData((f: any) => ({ ...f, name: e.target.value }))
            }
          />
          <TextField
            select
            label="Loại sân"
            fullWidth
            value={formData.type || "FIVE_A_SIDE"}
            onChange={(e) =>
              setFormData((f: any) => ({ ...f, type: e.target.value as any }))
            }
          >
            <MenuItem value="FIVE_A_SIDE">5 người (FIVE A SIDE)</MenuItem>
            <MenuItem value="SEVEN_A_SIDE">7 người (SEVEN A SIDE)</MenuItem>
            <MenuItem value="ELEVEN_A_SIDE">11 người (ELEVEN A SIDE)</MenuItem>
          </TextField>
          <TextField
            label="Giá (VNĐ)"
            type="number"
            fullWidth
            value={formData.price === 0 ? "" : formData.price}
            onChange={(e) =>
              setFormData((f: any) => ({
                ...f,
                price: e.target.value ? Number(e.target.value) : 0,
              }))
            }
          />
          <TextField
            select
            label="Môi trường"
            fullWidth
            value={formData.environment || "OUTDOOR"}
            onChange={(e) =>
              setFormData((f: any) => ({ ...f, environment: e.target.value }))
            }
          >
            <MenuItem value="OUTDOOR">Ngoài trời (OUTDOOR)</MenuItem>
            <MenuItem value="INDOOR">Trong nhà (INDOOR)</MenuItem>
          </TextField>
          <TextField
            label="Mô tả"
            fullWidth
            multiline
            rows={3}
            value={formData.description || ""}
            onChange={(e) =>
              setFormData((f: any) => ({ ...f, description: e.target.value }))
            }
          />

          <div className="flex flex-col gap-2 mt-2">
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: "bold", color: "#475569" }}
            >
              Ảnh đại diện sân (Có thể tải lên nhiều ảnh)
            </Typography>
            <div className="flex flex-wrap items-center gap-4">
              {formData.imageUrls?.map(
                (url: string | undefined, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview-${index}`}
                      className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                    />
                    <div
                      className="absolute -top-2 -right-2 bg-white rounded-full cursor-pointer shadow-md text-red-500 hover:text-red-700 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const newUrls = [...(formData.imageUrls || [])];
                        newUrls.splice(index, 1);
                        setFormData((f: any) => ({ ...f, imageUrls: newUrls }));
                      }}
                    >
                      <CancelIcon sx={{ fontSize: 20 }} />
                    </div>
                  </div>
                ),
              )}
              <ImageEditorUploader onUploadSuccess={handleImageUpload} />
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setOpenAdd(false)}
            color="inherit"
            sx={{ fontWeight: "bold" }}
          >
            Hủy
          </Button>
          <Button
            onClick={saveAdd}
            disabled={!formData.name.trim()}
            variant="contained"
            sx={{
              bgcolor: "#e25b43",
              "&:hover": { bgcolor: "#c84b35" },
              fontWeight: "bold",
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        maxWidth="sm"
        fullWidth
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem", pb: 1 }}>
          Chỉnh sửa sân
        </DialogTitle>
        <DialogContent className="flex flex-col gap-5 mt-2">
          <TextField
            label="Tên sân"
            fullWidth
            value={formData.name || ""}
            onChange={(e) =>
              setFormData((f: any) => ({ ...f, name: e.target.value }))
            }
          />
          <TextField
            select
            label="Loại sân"
            fullWidth
            value={formData.type || "FIVE_A_SIDE"}
            onChange={(e) =>
              setFormData((f: any) => ({ ...f, type: e.target.value as any }))
            }
          >
            <MenuItem value="FIVE_A_SIDE">5 người (FIVE A SIDE)</MenuItem>
            <MenuItem value="SEVEN_A_SIDE">7 người (SEVEN A SIDE)</MenuItem>
            <MenuItem value="ELEVEN_A_SIDE">11 người (ELEVEN A SIDE)</MenuItem>
          </TextField>
          <TextField
            label="Giá (VNĐ)"
            type="number"
            fullWidth
            value={formData.price === 0 ? "" : formData.price}
            onChange={(e) =>
              setFormData((f: any) => ({
                ...f,
                price: e.target.value ? Number(e.target.value) : 0,
              }))
            }
          />
          <TextField
            select
            label="Môi trường"
            fullWidth
            value={formData.environment || "OUTDOOR"}
            onChange={(e) =>
              setFormData((f: any) => ({ ...f, environment: e.target.value }))
            }
          >
            <MenuItem value="OUTDOOR">Ngoài trời (OUTDOOR)</MenuItem>
            <MenuItem value="INDOOR">Trong nhà (INDOOR)</MenuItem>
          </TextField>
          <TextField
            label="Mô tả"
            fullWidth
            multiline
            rows={3}
            value={formData.description || ""}
            onChange={(e) =>
              setFormData((f: any) => ({ ...f, description: e.target.value }))
            }
          />

          <div className="flex flex-col gap-2 mt-2">
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: "bold", color: "#475569" }}
            >
              Ảnh đại diện sân (Có thể tải lên nhiều ảnh)
            </Typography>
            <div className="flex flex-wrap items-center gap-4">
              {formData.imageUrls?.map(
                (url: string | undefined, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview-${index}`}
                      className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                    />
                    <div
                      className="absolute -top-2 -right-2 bg-white rounded-full cursor-pointer shadow-md text-red-500 hover:text-red-700 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const newUrls = [...(formData.imageUrls || [])];
                        newUrls.splice(index, 1);
                        setFormData((f: any) => ({ ...f, imageUrls: newUrls }));
                      }}
                    >
                      <CancelIcon sx={{ fontSize: 20 }} />
                    </div>
                  </div>
                ),
              )}
              <ImageEditorUploader onUploadSuccess={handleImageUpload} />
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setOpenEdit(false)}
            color="inherit"
            sx={{ fontWeight: "bold" }}
          >
            Hủy
          </Button>
          <Button
            onClick={saveEdit}
            disabled={!formData.name.trim()}
            variant="contained"
            sx={{
              bgcolor: "#e25b43",
              "&:hover": { bgcolor: "#c84b35" },
              fontWeight: "bold",
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle sx={{ fontWeight: "bold" }}>Xác nhận xóa sân</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa sân <strong>{selectedPitch?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenDelete(false)}
            color="inherit"
            sx={{ fontWeight: "bold" }}
          >
            Hủy
          </Button>
          <Button
            color="error"
            onClick={confirmDelete}
            variant="contained"
            sx={{ fontWeight: "bold" }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PitchInfo;
