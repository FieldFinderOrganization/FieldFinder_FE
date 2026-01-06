/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  CircularProgress,
} from "@mui/material";
import Header from "@/utils/header";
import { useSelector } from "react-redux";
import {
  getAllDiscounts,
  getMyWallet,
  saveDiscountToWallet,
  discountRes,
  userDiscountRes,
} from "@/services/discount";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const MyVoucherCard = ({
  voucher,
  onCopy,
}: {
  voucher: userDiscountRes;
  onCopy: (code: string) => void;
}) => {
  const isExpired = dayjs().isAfter(dayjs(voucher.endDate).endOf("day"));
  const isUsed = voucher.status === "USED";

  let statusColor = "#188862";
  let statusText = "Có thể dùng";

  if (isUsed) {
    statusColor = "#A6A6A6";
    statusText = "Đã dùng";
  } else if (isExpired) {
    statusColor = "#FE2A00";
    statusText = "Hết hạn";
  }

  return (
    <Card
      sx={{
        display: "flex",
        height: "100%",
        borderRadius: "12px",
        border: "1px solid #e0e0e0",
        position: "relative",
        overflow: "visible",
        transition: "transform 0.2s",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 3 },
        opacity: isUsed || isExpired ? 0.7 : 1,
      }}
    >
      <Box
        sx={{
          width: "100px",
          bgcolor: statusColor,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderTopLeftRadius: "12px",
          borderBottomLeftRadius: "12px",
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            right: "-6px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "12px",
            height: "12px",
            bgcolor: "white",
            borderRadius: "50%",
          },
        }}
      >
        <CardGiftcardIcon sx={{ fontSize: "2rem", mb: 1 }} />
        <Typography variant="h6" fontWeight="bold">
          {voucher.type === "FIXED_AMOUNT" ? "GIẢM" : `${voucher.value}%`}
        </Typography>
      </Box>

      <CardContent sx={{ flex: 1, p: 2, pb: "16px !important" }}>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Chip
            label={statusText}
            size="small"
            sx={{
              bgcolor: isUsed || isExpired ? "#f5f5f5" : "#e8f5e9",
              color: statusColor,
              fontWeight: "bold",
              mb: 1,
            }}
          />
        </Box>

        <Typography variant="subtitle1" fontWeight="bold" noWrap>
          Mã: {voucher.discountCode}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            minHeight: "40px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {voucher.description || "Giảm giá đặc biệt cho bạn"}
        </Typography>

        <Box display="flex" alignItems="center" gap={0.5} mb={2}>
          <AccessTimeIcon sx={{ fontSize: "0.9rem", color: "gray" }} />
          <Typography variant="caption" color="text.secondary">
            HSD: {dayjs(voucher.endDate).format("DD/MM/YYYY")}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          fullWidth
          size="small"
          startIcon={<ContentCopyIcon />}
          onClick={() => onCopy(voucher.discountCode)}
          disabled={isUsed || isExpired}
          sx={{
            borderColor: "#188862",
            color: "#188862",
            "&:hover": { borderColor: "#146c4e", bgcolor: "#e8f5e9" },
          }}
        >
          Sao chép
        </Button>
      </CardContent>
    </Card>
  );
};

const MarketVoucherCard = ({
  voucher,
  onSave,
}: {
  voucher: discountRes;
  onSave: (code: string) => void;
}) => {
  return (
    <Card
      sx={{
        display: "flex",
        height: "100%",
        borderRadius: "12px",
        border: "1px solid #ffccbc",
        transition: "all 0.2s",
        "&:hover": { boxShadow: "0 4px 12px rgba(254, 42, 0, 0.15)" },
      }}
    >
      <Box
        sx={{
          width: "100px",
          background: "linear-gradient(135deg, #FE2A00 0%, #FF8A65 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderTopLeftRadius: "12px",
          borderBottomLeftRadius: "12px",
        }}
      >
        <LocalOfferIcon sx={{ fontSize: "2rem", mb: 1 }} />
        <Typography variant="h6" fontWeight="bold">
          {voucher.discountType === "FIXED_AMOUNT"
            ? `${(voucher.value / 1000).toFixed(0)}K`
            : `${voucher.value}%`}
        </Typography>
      </Box>

      <CardContent sx={{ flex: 1, p: 2, pb: "16px !important" }}>
        <Typography variant="subtitle1" fontWeight="bold" color="#FE2A00">
          {voucher.code}
        </Typography>

        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
          {voucher.description}
        </Typography>

        <Typography variant="caption" display="block" color="text.secondary">
          Đơn tối thiểu:{" "}
          {voucher.minOrderValue ? voucher.minOrderValue.toLocaleString() : "0"}
          đ
        </Typography>

        <Typography
          variant="caption"
          display="block"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          HSD: {dayjs(voucher.endDate).format("DD/MM/YYYY")}
        </Typography>

        <Button
          variant="contained"
          fullWidth
          size="small"
          onClick={() => onSave(voucher.code)}
          sx={{
            bgcolor: "#FE2A00",
            color: "white",
            fontWeight: "bold",
            "&:hover": { bgcolor: "#d92300" },
          }}
        >
          Lưu ngay
        </Button>
      </CardContent>
    </Card>
  );
};

const DiscountPage = () => {
  const user = useSelector((state: any) => state.auth.user);
  const [tabValue, setTabValue] = useState(0);
  const [myWallet, setMyWallet] = useState<userDiscountRes[]>([]);
  const [availableDiscounts, setAvailableDiscounts] = useState<discountRes[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const walletData = await getMyWallet(user.userId);
      setMyWallet(walletData);

      const allDiscounts = await getAllDiscounts();

      const now = dayjs();
      const mySavedCodes = new Set(walletData.map((d) => d.discountCode));

      const notSaved = allDiscounts.filter((d) => {
        const isSaved = mySavedCodes.has(d.code);
        const isActive = d.status === "ACTIVE";
        const isNotExpired = now.isBefore(dayjs(d.endDate).endOf("day"));
        const isStockAvailable = d.quantity > 0;
        return !isSaved && isActive && isNotExpired && isStockAvailable;
      });

      setAvailableDiscounts(notSaved);
    } catch (error) {
      console.error("Error fetching discounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã: ${code}`);
  };

  const handleSaveDiscount = async (code: string) => {
    if (!user?.userId) {
      toast.error("Vui lòng đăng nhập!");
      return;
    }
    try {
      await saveDiscountToWallet(user.userId, { discountCode: code });
      toast.success("Lưu mã thành công!");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu mã");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 pt-[100px]">
        <Header />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="50vh"
          flexDirection="column"
        >
          <Typography variant="h6" gutterBottom>
            Vui lòng đăng nhập để xem kho Voucher
          </Typography>
        </Box>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <Box sx={{ maxWidth: "1200px", mx: "auto", pt: "120px", pb: 8, px: 2 }}>
        {/* Header Section */}
        <Box mb={4} textAlign="center">
          <Typography variant="h4" fontWeight={800} color="#188862" mb={1}>
            KHO VOUCHER CỦA BẠN
          </Typography>
          <Typography color="text.secondary">
            Quản lý mã giảm giá và săn thêm nhiều ưu đãi hấp dẫn
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            textColor="primary"
            indicatorColor="primary"
            sx={{
              "& .MuiTab-root": {
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "none",
              },
              "& .Mui-selected": { color: "#188862 !important" },
              "& .MuiTabs-indicator": { backgroundColor: "#188862" },
            }}
          >
            <Tab
              icon={<CardGiftcardIcon />}
              iconPosition="start"
              label={`Ví của tôi (${myWallet.length})`}
            />
            <Tab
              icon={<LocalOfferIcon />}
              iconPosition="start"
              label={`Săn Voucher (${availableDiscounts.length})`}
            />
          </Tabs>
        </Box>

        {/* Content */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress sx={{ color: "#188862" }} />
          </Box>
        ) : (
          <Box>
            {/* TAB 0: VÍ CỦA TÔI */}
            {tabValue === 0 && (
              <Grid container spacing={3}>
                {myWallet.length > 0 ? (
                  myWallet.map((voucher) => (
                    <Grid
                      size={{ xs: 12, sm: 6, md: 4 }}
                      key={voucher.userDiscountId}
                    >
                      <MyVoucherCard
                        voucher={voucher}
                        onCopy={handleCopyCode}
                      />
                    </Grid>
                  ))
                ) : (
                  <Box width="100%" textAlign="center" py={5}>
                    <img
                      src="/images/empty-box.png"
                      alt="Empty"
                      style={{
                        width: "150px",
                        opacity: 0.5,
                        marginBottom: "1rem",
                      }}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <Typography color="text.secondary">
                      Bạn chưa lưu mã giảm giá nào.
                    </Typography>
                    <Button
                      variant="text"
                      onClick={() => setTabValue(1)}
                      sx={{ color: "#188862", fontWeight: "bold" }}
                    >
                      Săn mã ngay &rarr;
                    </Button>
                  </Box>
                )}
              </Grid>
            )}

            {/* TAB 1: SĂN VOUCHER */}
            {tabValue === 1 && (
              <Grid container spacing={3}>
                {availableDiscounts.length > 0 ? (
                  availableDiscounts.map((discount) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={discount.id}>
                      <MarketVoucherCard
                        voucher={discount}
                        onSave={handleSaveDiscount}
                      />
                    </Grid>
                  ))
                ) : (
                  <Box width="100%" textAlign="center" py={5}>
                    <CheckCircleIcon
                      sx={{ fontSize: "4rem", color: "#e0e0e0", mb: 2 }}
                    />
                    <Typography color="text.secondary" variant="h6">
                      Bạn đã lưu hết tất cả các mã hiện có!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hãy quay lại sau nhé.
                    </Typography>
                  </Box>
                )}
              </Grid>
            )}
          </Box>
        )}
      </Box>
    </div>
  );
};

export default DiscountPage;
