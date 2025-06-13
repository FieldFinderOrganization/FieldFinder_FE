"use client";

import React from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import HistoryIcon from "@mui/icons-material/History";
import RateReviewIcon from "@mui/icons-material/RateReview";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Typography } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { setShowSidebar } from "../redux/features/authSlice";

interface SidebarProps {
  tabs: { label: string; value: number }[];
  initTab: number;
  handleChangeTab: (event: React.SyntheticEvent, newValue: number) => void;
  handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  tabs,
  initTab,
  handleChangeTab,
  handleLogout,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const show = useSelector((state: RootState) => state.auth.showSidebar);

  const isActive = (path: string) => pathname === path;

  const handleShow = () => {
    dispatch(setShowSidebar(!show));
  };

  return (
    <div className="bg-white w-[23%] flex flex-col items-start justify-start rounded-br-lg shadow-md py-6 px-12 left-sidebar gap-y-[2.5rem]">
      <div
        className="flex items-center justify-start gap-x-[1rem] cursor-pointer"
        onClick={() => router.push("/profile")}
      >
        <SettingsIcon
          className="text-[1rem]"
          sx={{ color: isActive("/profile/") ? "black" : "gray" }}
        />
        <Typography
          sx={{
            fontWeight: "bold",
            fontSize: "1rem",
            color: isActive("/profile") ? "black" : "gray",
          }}
          className="cursor-pointer"
        >
          Cài đặt
        </Typography>
        <div onClick={handleShow}>
          {show ? (
            <KeyboardArrowUpIcon className="text-[1.5rem] hover:cursor-pointer hover:bg-gray-200 hover:rounded-full" />
          ) : (
            <KeyboardArrowDownIcon className="text-[1.5rem] hover:cursor-pointer hover:bg-gray-200 hover:rounded-full" />
          )}
        </div>
      </div>
      {show && (
        <div className="flex flex-col items-start ml-[2.5rem] gap-y-[0.8rem]">
          {tabs.map((tab, index) => (
            <div
              key={index}
              className={`${
                initTab === tab.value
                  ? "bg-[#0093FF] rounded-lg shadow-md hover:bg-blue-500"
                  : ""
              } px-4 py-2 w-fit cursor-pointer`}
              onClick={(event) => handleChangeTab(event, tab.value)}
            >
              <Typography
                sx={{
                  fontWeight: "medium",
                  color: `${initTab === tab.value ? "white" : "black"}`,
                }}
              >
                {tab.label}
              </Typography>
            </div>
          ))}
        </div>
      )}
      <div
        className="flex items-center justify-start gap-x-[1rem] cursor-pointer"
        onClick={() => router.push("/bookingHistory")}
      >
        <HistoryIcon
          className="text-[1rem]"
          sx={{ color: isActive("/bookingHistory") ? "black" : "gray" }}
        />
        <Typography
          sx={{
            color: isActive("/bookingHistory") ? "black" : "gray",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
          className="cursor-pointer"
        >
          Lịch sử đặt sân
        </Typography>
      </div>
      <div
        className="flex items-center justify-start gap-x-[1rem] cursor-pointer"
        onClick={() => router.push("/reviewHistory")}
      >
        <RateReviewIcon
          className="text-[1rem]"
          sx={{ color: isActive("/reviewHistory") ? "black" : "gray" }}
        />
        <Typography
          variant="h6"
          sx={{
            color: isActive("/reviewHistory") ? "black" : "gray",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
          className="cursor-pointer"
        >
          Lịch sử đánh giá
        </Typography>
      </div>
      <div
        className="flex items-center justify-start gap-x-[1rem] cursor-pointer"
        onClick={handleLogout}
      >
        <LogoutIcon className="text-[1rem]" sx={{ color: "red" }} />
        <Typography
          variant="h6"
          sx={{ color: "red", fontSize: "1rem", fontWeight: "bold" }}
        >
          Đăng xuất
        </Typography>
      </div>
    </div>
  );
};

export default Sidebar;
