/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Box,
  Tab,
  Tabs,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  MenuList,
  Link,
  Tooltip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { logout, setShowSidebar } from "../redux/features/authSlice";
import Divider from "@mui/material/Divider";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import HistoryIcon from "@mui/icons-material/History";
import RateReviewIcon from "@mui/icons-material/RateReview";
import LogoutIcon from "@mui/icons-material/Logout";
import ava from "../../public/images/20.png";
import LineAxisOutlinedIcon from "@mui/icons-material/LineAxisOutlined";
import FlutterDashOutlinedIcon from "@mui/icons-material/FlutterDashOutlined";
import MenuIcon from "@mui/icons-material/Menu"; // Icon 3 gạch
import CloseIcon from "@mui/icons-material/Close"; // Icon đóng
import { IoCartOutline } from "react-icons/io5";
import { useCart } from "@/context/CartContext";
import { useFavourite } from "@/context/FavouriteContext";
import { IoMdHeart } from "react-icons/io";
import { GoHeart } from "react-icons/go";
import { BsCart2 } from "react-icons/bs";
import { CiDiscount1 } from "react-icons/ci";

interface TabItem {
  label: React.ReactNode;
  path: string;
}

const Header: React.FC = () => {
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  ) as { user: any; isAuthenticated: boolean };

  const [mobileOpen, setMobileOpen] = useState(false);

  const defaultTabItems: TabItem[] = [
    { label: "Trang chủ", path: "/home" },
    { label: "Giới thiệu", path: "/about" },
    { label: "Danh sách sân", path: "/fields" },
    { label: "Đăng nhập", path: "/login" },
    { label: "Đăng ký", path: "/signup" },
    { label: "Cửa hàng", path: "/sportShop/product" },
  ];

  const authenticatedTabItems: TabItem[] = [
    { label: "Trang chủ", path: "/home" },
    { label: "Cửa hàng", path: "/sportShop/product" },
    { label: "Giới thiệu", path: "/about" },
    { label: "Danh sách sân", path: "/fields" },
  ];

  const tabItems = isAuthenticated ? authenticatedTabItems : defaultTabItems;
  const currentTabIndex = tabItems.findIndex((item) => item.path === pathname);
  const value = currentTabIndex !== -1 ? currentTabIndex : false;

  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const { getFavouriteCount } = useFavourite();
  const favCount = getFavouriteCount();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    router.push(tabItems[newValue].path);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          MTKICKS
        </Typography>
        <CloseIcon />
      </Box>
      <Divider />
      <List>
        {tabItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={pathname === item.path}
              onClick={() => router.push(item.path)}
              sx={{
                textAlign: "center",
                "&.Mui-selected": {
                  color: "#188862",
                  fontWeight: "bold",
                  backgroundColor: "rgba(24, 136, 98, 0.08)",
                },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    router.push("/login");
  };

  const handleProfile = () => {
    handleMenuClose();
    dispatch(setShowSidebar(true));
    router.push("/profile?tab=0");
  };

  const handlePitchInfo = () => {
    handleMenuClose();
    dispatch(setShowSidebar(true));
    router.push("/profile?tab=1");
  };

  const handleReview = () => {
    handleMenuClose();
    dispatch(setShowSidebar(false));
    router.push("/reviewHistory");
  };

  const handleBooking = () => {
    handleMenuClose();
    dispatch(setShowSidebar(false));
    router.push("/bookingHistory");
  };

  const handleDashboard = () => {
    handleMenuClose();
    dispatch(setShowSidebar(false));
    router.push("/dashboard");
  };

  const handleOrderHistory = () => {
    handleMenuClose();
    router.push("/orderHistory");
  };

  const handleDiscountWallet = () => {
    handleMenuClose();
    router.push("/discount");
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-md h-[80px] flex items-center`}
    >
      <div className="header flex items-center justify-between mx-auto max-w-7xl w-full px-4 sm:px-8">
        {/* LEFT SECTION: Hamburger (Mobile) + Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Nút Hamburger chỉ hiện trên Mobile (md:hidden) */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <div
            className="logo flex items-center space-x-[0.5rem] cursor-pointer"
            onClick={() => router.push("/home")}
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="h-8 w-8 sm:h-10 sm:w-10 md:h-15 md:w-15 object-contain"
            />
            {/* Tên Logo ẩn trên mobile quá nhỏ nếu cần thiết, hoặc để nguyên */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2.125rem" }, // Responsive Font Size
              }}
            >
              MTKICKS
            </Typography>
          </div>
        </div>

        {/* MIDDLE SECTION: Tabs (Chỉ hiện trên Desktop - hidden on mobile) */}
        <Box className="hidden md:flex items-center justify-center flex-1 px-4">
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "#000000",
                height: "2px",
              },
              "& .MuiTab-root": {
                fontSize: "0.9rem",
                textTransform: "none",
                fontWeight: "500",
                minWidth: "auto",
                px: 2,
                "&:hover": { color: "#188862" },
              },
              "& .Mui-selected": {
                color: "#000000 !important",
                fontWeight: "bold !important",
              },
            }}
          >
            {tabItems.map((item, index) => (
              <Tab key={index} label={item.label} />
            ))}
          </Tabs>
        </Box>

        {/* RIGHT SECTION: Icons & User Menu */}
        <Box className="flex items-center gap-1 sm:gap-2">
          {isAuthenticated && (
            <>
              <Link href="/sportShop/favourites">
                <Tooltip title="Favourites">
                  <Button sx={{ minWidth: "40px", px: 1 }}>
                    {isMounted && favCount > 0 ? (
                      <IoMdHeart size={22} className="text-red-600" />
                    ) : (
                      <GoHeart size={22} className="text-gray-700" />
                    )}
                    {isMounted && favCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-medium text-white">
                        {favCount}
                      </span>
                    )}
                  </Button>
                </Tooltip>
              </Link>

              <Link href="/sportShop/cart">
                <Tooltip title="Cart">
                  <Button sx={{ minWidth: "40px", px: 1 }}>
                    <BsCart2 size={22} className="text-gray-700" />
                    {cartCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[10px] font-medium text-white">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Tooltip>
              </Link>

              <Button
                id="user-menu-button"
                aria-controls={open ? "user-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleMenuClick}
                sx={{
                  textTransform: "none",
                  padding: "4px",
                  minWidth: 0,
                  ml: { xs: 0, sm: 1 },
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-[0.9rem] hidden lg:block">
                    Xin chào,
                  </span>
                  <img
                    src={ava.src}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                </div>
              </Button>

              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                disableScrollLock={true}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    borderRadius: "8px",
                    minWidth: 200,
                    overflow: "visible",
                    "&:before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                }}
              >
                <div className="px-4 py-3 flex items-center gap-3">
                  <img
                    src={ava.src}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border"
                  />
                  <div>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {user?.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      noWrap
                      sx={{ maxWidth: 120 }}
                    >
                      {user?.email}
                    </Typography>
                  </div>
                </div>
                <Divider />
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <PersonOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Thông tin cá nhân</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleOrderHistory}>
                  <ListItemIcon>
                    <IoCartOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Lịch sử đặt hàng</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDiscountWallet}>
                  <ListItemIcon>
                    <CiDiscount1 fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Mã giảm giá</ListItemText>
                </MenuItem>
                {user?.role === "PROVIDER" && (
                  <MenuItem onClick={handlePitchInfo}>
                    <ListItemIcon>
                      <FlutterDashOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Thông tin sân</ListItemText>
                  </MenuItem>
                )}
                {user?.role === "ADMIN" && (
                  <MenuItem onClick={handleDashboard}>
                    <ListItemIcon>
                      <LineAxisOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Thống kê</ListItemText>
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleBooking}>
                  <ListItemIcon>
                    <HistoryIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Lịch sử đặt sân</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleReview}>
                  <ListItemIcon>
                    <RateReviewIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Lịch sử đánh giá</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Đăng xuất</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </div>

      {/* MOBILE DRAWER (Menu trượt bên trái) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </div>
  );
};

export default Header;
