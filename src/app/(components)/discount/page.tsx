"use client";

import Header from "@/utils/header";
import {
  Tooltip,
  Typography,
  Box,
  Modal,
  Button,
  TextField,
  FormControlLabel,
  Switch,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { useEffect, useState } from "react";
import {
  discountReq,
  discountRes,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getAllDiscounts,
} from "@/services/discount";
import { toast } from "react-toastify";

const Discount: React.FC = () => {
  const [discounts, setDiscounts] = useState<discountRes[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<discountRes | null>(
    null
  );

  const handleSelectDiscount = (discount: discountRes) => {
    if (selectedDiscount?.id === discount.id) {
      setSelectedDiscount(null);
    } else {
      setSelectedDiscount({
        ...discount,
        startDate: discount.startDate || new Date().toISOString().split("T")[0],
        endDate:
          discount.endDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
      });
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [newDiscount, setNewDiscount] = useState<discountReq>({
    code: "",
    description: "",
    percentage: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    active: true,
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const data = await getAllDiscounts();
      setDiscounts(data);
      setSelectedDiscount(null);
    } catch (error) {
      console.error("Error fetching discounts:", error);
    }
  };

  const isDiscountCodeExist = (code: string, excludeId?: string): boolean => {
    return discounts.some(
      (discount) =>
        discount.code.toLowerCase() === code.toLowerCase() &&
        discount.id !== excludeId
    );
  };

  const handleAddDiscount = async () => {
    try {
      if (isDiscountCodeExist(newDiscount.code)) {
        toast.error("Mã khuyến mãi đã tồn tại!");
        return;
      }

      await createDiscount({
        ...newDiscount,
        active: newDiscount.active,
      });
      toast.success("Thêm mã khuyến mãi thành công!");
      setOpenAddModal(false);
      setNewDiscount({
        code: "",
        description: "",
        percentage: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        active: true,
      });
      fetchDiscounts();
    } catch (error) {
      console.error("Error adding discount:", error);
      toast.error("Có lỗi xảy ra khi thêm mã khuyến mãi");
    }
  };

  const handleEditDiscount = async () => {
    if (!selectedDiscount) return;
    try {
      if (isDiscountCodeExist(selectedDiscount.code, selectedDiscount.id)) {
        toast.error("Mã khuyến mãi đã tồn tại!");
        return;
      }

      await updateDiscount(
        {
          code: selectedDiscount.code,
          description: selectedDiscount.description,
          percentage: selectedDiscount.percentage,
          startDate: selectedDiscount.startDate,
          endDate: selectedDiscount.endDate,
          active: selectedDiscount.status === "ACTIVE",
        },
        selectedDiscount.id
      );
      toast.success("Sửa mã khuyến mãi thành công!");
      setOpenEditModal(false);
      setSelectedDiscount(null); // Add this line to deselect after edit
      fetchDiscounts();
    } catch (error) {
      console.error("Error updating discount:", error);
      toast.error("Có lỗi xảy ra khi sửa mã khuyến mãi");
    }
  };

  const handleDeleteDiscount = async () => {
    if (!selectedDiscount) return;
    try {
      await deleteDiscount(selectedDiscount.id);
      toast.success("Xóa mã giảm giá thành công!");
      setOpenDeleteModal(false);
      setSelectedDiscount(null);
      fetchDiscounts();
    } catch (error) {
      console.error("Error deleting discount:", error);
    }
  };

  const [activeDiscounts, expiredDiscounts] = discounts.reduce(
    (acc, discount) => {
      if (discount.status === "ACTIVE") {
        acc[0].push(discount);
      } else {
        acc[1].push(discount);
      }
      return acc;
    },
    [[], []] as [discountRes[], discountRes[]]
  );

  const filteredActiveDiscounts = activeDiscounts.filter((discount) =>
    discount.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExpiredDiscounts = expiredDiscounts.filter((discount) =>
    discount.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 mx-auto px-4 sm:px-8 flex flex-col space-y-[1rem] sm:space-y-[2rem] pt-[100px] pb-[100px]">
      <Header />
      <div className="main flex items-start justify-center gap-x-[2rem] max-w-7xl w-full px-4 mt-[1rem] mx-auto flex-col gap-y-[2rem]">
        <div className="action-bars flex items-center gap-x-[1rem]">
          <div className="rounded-md px-4 py-[0.3rem] border-1 bg-[#e25b43] text-white font-bold">
            {discounts.length} mã khuyến mãi
          </div>
          <div className="search px-4 py-[0.3rem] border-1 border-black rounded-sm flex items-center justify-between w-[320px]">
            <input
              placeholder="Nhập tên mã khuyến mãi"
              className="w-[100%] text-gray-600 focus:outline-none text-[0.9rem]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchOutlinedIcon
              sx={{ color: "black", cursor: "pointer" }}
              fontSize="small"
            />
          </div>
          <div className="flex items-center gap-x-[0.8rem]">
            <Tooltip title="Thêm mã khuyến mãi" arrow>
              <div
                className="bg-[#e25b43] text-white cursor-pointer w-8 h-8 flex items-center justify-center rounded-md"
                onClick={() => setOpenAddModal(true)}
              >
                <AddOutlinedIcon fontSize="medium" />
              </div>
            </Tooltip>
            <Tooltip title="Sửa mã khuyến mãi" arrow>
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-md ${
                  selectedDiscount
                    ? "bg-[#e25b43] cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                } text-white`}
                onClick={() => selectedDiscount && setOpenEditModal(true)}
              >
                <EditOutlinedIcon fontSize="medium" />
              </div>
            </Tooltip>

            {/* Nút Delete */}
            <Tooltip title="Xóa mã khuyến mãi" arrow>
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-md ${
                  selectedDiscount
                    ? "bg-[#e25b43] cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                } text-white`}
                onClick={() => selectedDiscount && setOpenDeleteModal(true)}
              >
                <DeleteOutlineOutlinedIcon fontSize="medium" />
              </div>
            </Tooltip>
          </div>
        </div>
        <Typography variant="h5" color="#e25b43" fontWeight="bold">
          Danh sách mã khuyến mãi hiện có
        </Typography>

        {filteredActiveDiscounts.length === 0 ? (
          <Typography>Chưa có mã khuyến mãi nào</Typography>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActiveDiscounts.map((discount) => (
              <div
                key={discount.id}
                className={`p-4 rounded-lg border cursor-pointer ${
                  selectedDiscount?.id === discount.id
                    ? "border-[#e25b43] bg-[#fff5f3]" // Khi được chọn
                    : "border-gray-300 bg-white" // Khi không được chọn
                } ${
                  selectedDiscount && selectedDiscount.id !== discount.id
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" // Khi có discount khác đang được chọn
                    : ""
                }`}
                onClick={() => handleSelectDiscount(discount)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CardGiftcardIcon sx={{ color: "#e25b43" }} />
                  <Typography variant="h6" fontWeight="bold">
                    {discount.code}
                  </Typography>
                </div>
                <Typography variant="body2" className="mb-2">
                  Mô tả: {discount.description}
                </Typography>
                <Typography variant="body2" className="text-green-600">
                  Giảm {discount.percentage}%
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  Ngày bắt đầu:{" "}
                  {new Date(discount.startDate).toLocaleDateString()} - Ngày kết
                  thúc: {new Date(discount.endDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  Trạng thái:{" "}
                  <span
                    className={
                      discount.status ? "text-green-600" : "text-red-600"
                    }
                  >
                    {discount.status ? "Đang hoạt động" : "Đã hết hạn"}
                  </span>
                </Typography>
              </div>
            ))}
          </div>
        )}
        <Typography variant="h5" color="#e25b43" fontWeight="bold">
          Danh sách mã khuyến mãi hết hạn
        </Typography>

        {filteredExpiredDiscounts.length === 0 ? (
          <Typography>Không có mã khuyến mãi hết hạn</Typography>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExpiredDiscounts.map((discount) => (
              <div
                key={discount.id}
                className={`p-4 rounded-lg border cursor-pointer ${
                  selectedDiscount?.id === discount.id
                    ? "border-[#e25b43] bg-[#fff5f3]"
                    : "border-gray-300 bg-gray-200"
                } ${
                  selectedDiscount && selectedDiscount.id !== discount.id
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : ""
                }`}
                onClick={() => handleSelectDiscount(discount)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CardGiftcardIcon sx={{ color: "#e25b43" }} />
                  <Typography variant="h6" fontWeight="medium">
                    {discount.code}
                  </Typography>
                </div>
                <Typography variant="body2" className="mb-2">
                  Mô tả: {discount.description}
                </Typography>
                <Typography variant="body2" className="text-green-600">
                  Giảm {discount.percentage}%
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  Ngày bắt đầu:{" "}
                  {new Date(discount.startDate).toLocaleDateString()} - Ngày kết
                  thúc: {new Date(discount.endDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  Trạng thái:{" "}
                  <span
                    className={
                      discount.status === "ACTIVE"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {discount.status === "ACTIVE"
                      ? "Đang hoạt động"
                      : "Đã hết hạn"}
                  </span>
                </Typography>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Discount Modal */}
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)}>
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
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            Thêm mã khuyến mãi mới
          </Typography>
          <TextField
            label="Mã khuyến mãi"
            fullWidth
            margin="normal"
            value={newDiscount.code}
            onChange={(e) =>
              setNewDiscount({ ...newDiscount, code: e.target.value })
            }
          />
          <TextField
            label="Mô tả"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={newDiscount.description}
            onChange={(e) =>
              setNewDiscount({ ...newDiscount, description: e.target.value })
            }
          />
          <TextField
            label="Phần trăm giảm giá"
            fullWidth
            margin="normal"
            type="number"
            value={newDiscount.percentage}
            onChange={(e) =>
              setNewDiscount({
                ...newDiscount,
                percentage: parseInt(e.target.value),
              })
            }
          />
          <TextField
            label="Ngày bắt đầu"
            fullWidth
            margin="normal"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newDiscount.startDate || ""}
            onChange={(e) =>
              setNewDiscount({ ...newDiscount, startDate: e.target.value })
            }
          />

          <TextField
            label="Ngày kết thúc"
            fullWidth
            margin="normal"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newDiscount.endDate || ""}
            onChange={(e) =>
              setNewDiscount({ ...newDiscount, endDate: e.target.value })
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={newDiscount.active}
                onChange={(e) =>
                  setNewDiscount({
                    ...newDiscount,
                    active: e.target.checked,
                  })
                }
              />
            }
            label="Hoạt động"
            sx={{ mt: 1 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={() => setOpenAddModal(false)} sx={{ mr: 1 }}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleAddDiscount}
              sx={{ bgcolor: "#e25b43", "&:hover": { bgcolor: "#c04b33" } }}
            >
              Thêm
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Edit Discount Modal */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
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
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            Chỉnh sửa mã khuyến mãi
          </Typography>
          {selectedDiscount && (
            <>
              <TextField
                label="Mã khuyến mãi"
                fullWidth
                margin="normal"
                value={selectedDiscount.code}
                onChange={(e) =>
                  setSelectedDiscount({
                    ...selectedDiscount,
                    code: e.target.value,
                  })
                }
              />
              <TextField
                label="Mô tả"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                value={selectedDiscount.description}
                onChange={(e) =>
                  setSelectedDiscount({
                    ...selectedDiscount,
                    description: e.target.value,
                  })
                }
              />
              <TextField
                label="Phần trăm giảm giá"
                fullWidth
                margin="normal"
                type="number"
                value={selectedDiscount.percentage}
                onChange={(e) =>
                  setSelectedDiscount({
                    ...selectedDiscount,
                    percentage: parseInt(e.target.value),
                  })
                }
              />
              <TextField
                label="Ngày bắt đầu"
                fullWidth
                margin="normal"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={selectedDiscount.startDate || ""}
                onChange={(e) =>
                  setSelectedDiscount({
                    ...selectedDiscount,
                    startDate: e.target.value,
                  })
                }
              />
              <TextField
                label="Ngày kết thúc"
                fullWidth
                margin="normal"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={selectedDiscount.endDate}
                onChange={(e) =>
                  setSelectedDiscount({
                    ...selectedDiscount,
                    endDate: e.target.value,
                  })
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedDiscount.status === "ACTIVE"}
                    onChange={(e) =>
                      setSelectedDiscount({
                        ...selectedDiscount,
                        status: e.target.checked ? "ACTIVE" : "INACTIVE",
                      })
                    }
                  />
                }
                label="Hoạt động"
                sx={{ mt: 1 }}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button onClick={() => setOpenEditModal(false)} sx={{ mr: 1 }}>
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  onClick={handleEditDiscount}
                  sx={{ bgcolor: "#e25b43", "&:hover": { bgcolor: "#c04b33" } }}
                >
                  Lưu
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      <Modal open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
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
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            Xóa mã khuyến mãi
          </Typography>
          {selectedDiscount && (
            <>
              <Typography>
                Bạn có chắc chắn muốn xóa mã khuyến mãi{" "}
                <strong>{selectedDiscount.code}</strong>?
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                  onClick={() => setOpenDeleteModal(false)}
                  sx={{ mr: 1 }}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  onClick={handleDeleteDiscount}
                  sx={{ bgcolor: "#e25b43", "&:hover": { bgcolor: "#c04b33" } }}
                >
                  Xóa
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default Discount;
