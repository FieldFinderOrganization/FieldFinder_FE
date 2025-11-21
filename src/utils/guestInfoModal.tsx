"use client";

import React, { useState } from "react";
import {
  Button,
  Modal,
  Box,
  Typography,
  TextField,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";

interface GuestInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
}

interface GuestInfoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (info: GuestInfo) => void;
}

const GuestInfoModal: React.FC<GuestInfoModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [formData, setFormData] = useState<GuestInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc (*)!");
      return;
    }
    onConfirm(formData);
    setFormData({ name: "", email: "", phone: "", address: "" });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6" fontWeight={700}>
            Thông tin khách hàng
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>

        <div className="flex flex-col gap-4">
          <TextField
            label="Họ và tên *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Số điện thoại *"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Địa chỉ nhận hàng"
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
            size="small"
            multiline
            rows={2}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            sx={{
              mt: 2,
              bgcolor: "black",
              color: "white",
              fontWeight: "bold",
              "&:hover": { bgcolor: "#333" },
            }}
          >
            Tiếp tục thanh toán
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default GuestInfoModal;
