"use client";
import {
  Button,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  MenuList,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { GoHeart } from "react-icons/go";
import { BsCart2 } from "react-icons/bs";
import ava from "../../public/images/20.png";
import { IoIosArrowUp } from "react-icons/io";
import { useCart } from "@/context/CartContext";
import { useFavourite } from "@/context/FavouriteContext";
import Link from "next/link";
import { useProductContext } from "@/context/ProductContext";
import { useRouter } from "next/navigation";
import { IoMdHeart } from "react-icons/io";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { logout, setShowSidebar } from "@/redux/features/authSlice";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import HistoryIcon from "@mui/icons-material/History";
import RateReviewIcon from "@mui/icons-material/RateReview";
import LogoutIcon from "@mui/icons-material/Logout";
import LineAxisOutlinedIcon from "@mui/icons-material/LineAxisOutlined";
import FlutterDashOutlinedIcon from "@mui/icons-material/FlutterDashOutlined";

interface TopBarProps {
  groupedCategories?: Record<string, string[]>; // 👈 Đã sửa (optional)
  groupedBrands?: Record<string, string[]>; // 👈 Đã sửa (optional)
  onCategoryClick?: (item: string) => void; // 👈 Đã sửa (optional)
}

const TopBar: React.FC<TopBarProps> = ({
  groupedCategories,
  groupedBrands,
  onCategoryClick,
}) => {
  const { searchTerm, setSearchTerm } = useProductContext();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [activeMenu, setActiveMenu] = React.useState<
    "product" | "brand" | null
  >(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const { getFavouriteCount } = useFavourite();
  const favCount = getFavouriteCount();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".menu-toggle") && !target.closest(".menu-content")) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuItemClick = (item: string) => {
    if (onCategoryClick) {
      onCategoryClick(item);
    }
    setActiveMenu(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/sportShop/product");
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    router.push("/login"); // Giả sử trang login ở /login
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

  return (
    <div className="flex flex-wrap items-center px-6 py-6 lg:px-10 lg:py-8 justify-between">
      <div className="flex items-center md:gap-[10rem] gap-[5rem]">
        <Typography variant="h4" className="font-bold text-xl md:text-2xl">
          MTKICKs
        </Typography>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 md:gap-x-[8rem]">
          <div
            className="flex items-center md:gap-[1rem] cursor-pointer transition menu-toggle"
            onClick={() =>
              setActiveMenu((prev) => (prev === "product" ? null : "product"))
            }
          >
            <Typography
              variant="h6"
              className={`text-[1rem] whitespace-nowrap transition-all duration-200 ${
                activeMenu === "product"
                  ? "font-extrabold text-blue-600 scale-110"
                  : "font-normal text-gray-800"
              }`}
            >
              Product
            </Typography>
            {activeMenu === "product" ? (
              <IoIosArrowUp
                size={18}
                className="text-blue-600 transition-transform"
              />
            ) : (
              <IoIosArrowDown size={18} className="transition-transform" />
            )}
          </div>

          <div
            className="flex items-center md:gap-x-[1rem] cursor-pointer transition menu-toggle"
            onClick={() =>
              setActiveMenu((prev) => (prev === "brand" ? null : "brand"))
            }
          >
            <Typography
              variant="h6"
              className={`text-[1rem] whitespace-nowrap transition-all duration-200 ${
                activeMenu === "brand"
                  ? "font-extrabold text-blue-600 scale-110"
                  : "font-normal text-gray-800"
              }`}
            >
              Brand
            </Typography>
            {activeMenu === "brand" ? (
              <IoIosArrowUp
                size={18}
                className="text-blue-600 transition-transform"
              />
            ) : (
              <IoIosArrowDown size={18} className="transition-transform" />
            )}
          </div>
        </div>

        {/* --- Product Menu --- */}
        {activeMenu === "product" && groupedCategories && (
          <div
            className={`absolute left-0 top-[6rem] w-full bg-white shadow-lg border-t border-gray-200 px-[8rem] py-8 flex justify-between gap-10 z-50 menu-content transition-all duration-300 ease-out ${
              activeMenu === "product"
                ? "opacity-100 translate-y-0 visible"
                : "opacity-0 -translate-y-4 invisible pointer-events-none"
            }`}
          >
            {Object.entries(groupedCategories).map(([title, items]) => (
              <div key={title} className="flex flex-col gap-2 min-w-[160px]">
                <Typography
                  variant="subtitle1"
                  className="font-bold text-[1rem]"
                >
                  {title}
                </Typography>
                {items.map((item) => (
                  <Typography
                    key={item}
                    variant="body2"
                    className="text-gray-700 hover:text-blue-600 cursor-pointer"
                    // 🚨 Dùng handler mới
                    onClick={() => handleMenuItemClick(item)}
                  >
                    {item}
                  </Typography>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* --- Brand Menu --- */}
        {activeMenu === "brand" && groupedBrands && (
          <div
            className={`absolute left-0 top-[6rem] w-full bg-white shadow-lg border-t border-gray-200 px-[8rem] py-8 flex justify-between gap-10 z-50 menu-content transition-all duration-300 ease-out ${
              activeMenu === "brand"
                ? "opacity-100 translate-y-0 visible"
                : "opacity-0 -translate-y-4 invisible pointer-events-none"
            }`}
          >
            {Object.entries(groupedBrands).map(([title, items]) => (
              <div key={title} className="flex flex-col gap-2 min-w-[160px]">
                <Typography
                  variant="subtitle1"
                  className="font-bold text-[1rem]"
                >
                  {title}
                </Typography>
                {items.map((item) => (
                  <Typography
                    key={item}
                    variant="body2"
                    className="text-gray-700 hover:text-blue-600 cursor-pointer"
                    // 🚨 Dùng handler mới (giả sử click brand cũng dùng logic này)
                    onClick={() => handleMenuItemClick(item)}
                  >
                    {item}
                  </Typography>
                ))}
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSearch}
          className="hidden lg:flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 min-w-[280px] max-w-[600px] flex-1"
        >
          <button type="submit" onClick={handleSearch}>
            <CiSearch size={20} className="cursor-pointer" />
          </button>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none bg-transparent text-sm flex-1"
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/sportShop/favourites">
          <Tooltip title="Favourites">
            <Button className="relative">
              {isMounted && favCount > 0 ? (
                <IoMdHeart size={22} className="cursor-pointer text-red-600" />
              ) : (
                <GoHeart size={22} className="cursor-pointer text-gray-700" />
              )}
              {isMounted && favCount > 0 && (
                <span className="absolute top-0 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white">
                  {favCount}
                </span>
              )}
            </Button>
          </Tooltip>
        </Link>

        <Link href="/sportShop/cart">
          <Tooltip title="Cart">
            <Button className="relative">
              <BsCart2 size={22} className="cursor-pointer text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-xs font-medium text-white">
                  {cartCount}
                </span>
              )}
            </Button>
          </Tooltip>
        </Link>

        {isAuthenticated ? (
          <div>
            <Tooltip title="Tài khoản">
              <Button
                id="user-menu-button"
                aria-controls={open ? "user-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleMenuClick}
                sx={{ padding: 0, minWidth: 0, borderRadius: "50%" }}
              >
                <img
                  src={ava.src}
                  alt="Avatar"
                  className="rounded-full overflow-hidden w-10 h-10 cursor-pointer object-cover"
                />
              </Button>
            </Tooltip>
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
                  <img src={ava.src} className="w-10 h-10 rounded-full" />
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
                <Divider sx={{ borderWidth: "1px" }} />
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
        ) : (
          <Button
            variant="contained"
            onClick={() => router.push("/login")}
            sx={{
              backgroundColor: "black",
              color: "white",
              borderRadius: "20px",
              padding: "6px 20px",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#333",
              },
            }}
          >
            Đăng nhập
          </Button>
        )}
      </div>
    </div>
  );
};

export default TopBar;
