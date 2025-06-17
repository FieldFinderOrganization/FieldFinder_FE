import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Divider,
  TextField,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getAllDiscounts } from "@/services/discount";
import { discountRes } from "@/services/discount";

interface DiscountModalProps {
  open: boolean;
  onClose: () => void;
  selectedDiscounts: discountRes[];
  setSelectedDiscounts: (discounts: discountRes[]) => void;
}

const DiscountModal: React.FC<DiscountModalProps> = ({
  open,
  onClose,
  selectedDiscounts,
  setSelectedDiscounts,
}) => {
  const [discounts, setDiscounts] = useState<discountRes[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDiscounts = async () => {
      setLoading(true);
      try {
        const data = await getAllDiscounts();
        const currentDate = new Date();

        setDiscounts(
          data.filter((discount) => {
            const isActive = discount.status === "ACTIVE";
            const startDate = new Date(discount.startDate);
            const endDate = new Date(discount.endDate);
            const isValidDate =
              currentDate >= startDate && currentDate <= endDate;

            return isActive && isValidDate;
          })
        );
      } catch (error) {
        console.error("Error fetching discounts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchDiscounts();
    }
  }, [open]);

  const toggleDiscountSelection = (discount: discountRes) => {
    const isSelected = selectedDiscounts.some((d) => d.id === discount.id);
    if (isSelected) {
      setSelectedDiscounts(
        selectedDiscounts.filter((d) => d.id !== discount.id)
      );
    } else {
      setSelectedDiscounts([...selectedDiscounts, discount]);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Chọn mã khuyến mãi</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {loading ? (
          <Typography>Đang tải mã khuyến mãi...</Typography>
        ) : discounts.length === 0 ? (
          <Typography>Hiện không có mã khuyến mãi khả dụng</Typography>
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 2,
                mb: 3,
              }}
            >
              {discounts.map((discount) => (
                <Box
                  key={discount.id}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: selectedDiscounts.some(
                      (d) => d.id === discount.id
                    )
                      ? "#FE2A00"
                      : "#e0e0e0",
                    borderRadius: 1,
                    cursor: "pointer",
                    backgroundColor: selectedDiscounts.some(
                      (d) => d.id === discount.id
                    )
                      ? "#fff5f3"
                      : "white",
                  }}
                  onClick={() => toggleDiscountSelection(discount)}
                >
                  <Typography fontWeight="bold">{discount.code}</Typography>
                  <Typography color="#FE2A00">
                    Giảm {discount.percentage}%
                  </Typography>
                  <Typography variant="body2">
                    {new Date(discount.startDate).toLocaleDateString()} -{" "}
                    {new Date(discount.endDate).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={onClose}
                sx={{ bgcolor: "#FE2A00", "&:hover": { bgcolor: "#d92300" } }}
              >
                Xác nhận
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default DiscountModal;
