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
} from "@mui/material";
import { LuBellRing } from "react-icons/lu";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { logout } from "../redux/features/authSlice";
import Divider from "@mui/material/Divider";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import HistoryIcon from "@mui/icons-material/History";
import RateReviewIcon from "@mui/icons-material/RateReview";
import LogoutIcon from "@mui/icons-material/Logout";
import f from "../../public/images/field3.jpg";

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
  );

  const defaultTabItems: TabItem[] = [
    { label: "Trang chủ", path: "/home" },
    { label: "Giới thiệu", path: "/about" },
    { label: "Danh sách sân", path: "/fields" },
    { label: "Đăng nhập", path: "/login" },
    { label: "Đăng ký", path: "/signin" },
  ];

  const authenticatedTabItems: TabItem[] = [
    { label: "Trang chủ", path: "/home" },
    { label: "Giới thiệu", path: "/about" },
    { label: "Danh sách sân", path: "/fields" },
  ];

  const tabItems = isAuthenticated ? authenticatedTabItems : defaultTabItems;
  const currentTabIndex = tabItems.findIndex((item) => item.path === pathname);
  const value = currentTabIndex !== -1 ? currentTabIndex : false;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    router.push(tabItems[newValue].path);
  };

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
    router.push("/profile");
  };

  const handleReview = () => {
    handleMenuClose();
    router.push("/reviewHistory");
  };

  const handleBooking = () => {
    handleMenuClose();
    router.push("/bookingHistory");
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-md h-[80px]
      flex items-center`}
    >
      <div className="header flex items-center justify-between space-x-[1rem] mx-auto sm:space-x-[4rem] max-w-7xl w-full px-4 sm:px-8">
        <div
          className="logo flex items-center space-x-[0.5rem] sm:space-x-[1rem]"
          onClick={() => router.push("/home")}
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-10 sm:h-15 sm:w-15"
          />
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", cursor: "pointer" }}
          >
            MTKICKS
          </Typography>
        </div>
        <Box className="flex items-center space-x-4">
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "#000000",
                height: "2px",
              },
              "& .MuiTab-root": {
                fontSize: { xs: "0.7rem", sm: "0.9rem" },
                paddingX: { xs: 1, sm: 3 },
                marginX: { xs: 0.25, sm: 0.5 },
                minWidth: 0,
              },
              "& .MuiTabs-scrollButtons": {
                display: { xs: "flex", sm: "none" },
              },
            }}
          >
            {tabItems.map((item, index) => (
              <Tab
                key={index}
                label={item.label}
                className="text-black"
                sx={{
                  fontWeight: value === index ? "bold" : "normal",
                  "&.Mui-selected": {
                    color: "#000000",
                  },
                }}
              />
            ))}
          </Tabs>
          {isAuthenticated && (
            <div>
              <Button
                id="user-menu-button"
                aria-controls={open ? "user-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleMenuClick}
                sx={{ textTransform: "none", padding: 0, minWidth: 0 }}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 text-[1.2rem]">Xin chào,</span>
                  <img
                    src={f.src}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                </div>
              </Button>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                disableScrollLock={true}
                MenuListProps={{
                  "aria-labelledby": "user-menu-button",
                }}
                sx={{
                  borderRadius: "8px",
                  padding: "0.3rem",
                  "& .MuiMenuItem-root": {
                    "&:hover": {
                      "& .MuiMenuItem-root": {
                        "&:hover": { backgroundColor: "#E5E9FF" },
                      },
                      "& .MuiListItemIcon-root": { color: "#6922FF" },
                      "& .MuiListItemText-primary": { color: "#6922FF" },
                    },
                  },
                }}
              >
                <MenuList>
                  <div className="header-content flex items-center px-4 gap-x-[1.5rem] mb-[0.5rem]">
                    <img src={f.src} className="w-10 h-10 rounded-full" />
                    <div className="flex items-start flex-col">
                      <span className="text-gray-700 text-[1rem] font-bold">
                        {user?.name}
                      </span>
                      <span className="text-gray-500 text-[0.8rem]">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                  <Divider sx={{ borderWidth: "1px" }} />
                  <MenuItem onClick={handleProfile}>
                    <ListItemIcon>
                      <PersonOutlineIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Thông tin cá nhân</ListItemText>
                  </MenuItem>
                  <Divider sx={{ borderWidth: "1px" }} />
                  <MenuItem onClick={handleReview}>
                    <ListItemIcon>
                      <RateReviewIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Lịch sử đánh giá</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleBooking}>
                    <ListItemIcon>
                      <HistoryIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Lịch sử đặt sân</ListItemText>
                  </MenuItem>
                  <Divider sx={{ borderWidth: "1px" }} />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Đăng xuất</ListItemText>
                  </MenuItem>
                </MenuList>
              </Menu>
            </div>
          )}
        </Box>
      </div>
    </div>
  );
};

export default Header;
