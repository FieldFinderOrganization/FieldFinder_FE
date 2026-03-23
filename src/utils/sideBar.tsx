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

  const handleNonShowTabClick = (path: string) => {
    dispatch(setShowSidebar(false));
    router.push(path);
  };

  const handleLogoutClick = () => {
    dispatch(setShowSidebar(false));
    handleLogout();
  };

  return (
    <div className="bg-white w-full md:w-[280px] lg:w-[300px] flex flex-col rounded-2xl shadow-lg py-6 px-4 gap-y-2 md:sticky md:top-[100px] h-fit border border-gray-100 transition-all">
      {/* Cài đặt */}
      <div className="flex flex-col">
        <div
          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
            isActive("/profile")
              ? "bg-blue-50 text-[#0093FF]"
              : "hover:bg-gray-100 text-gray-700"
          }`}
          onClick={handleShow}
        >
          <div
            className="flex items-center gap-x-3 flex-1"
            onClick={(e) => {
              e.stopPropagation();
              router.push("/profile");
            }}
          >
            <SettingsIcon
              className={
                isActive("/profile") ? "text-[#0093FF]" : "text-gray-500"
              }
            />
            <Typography sx={{ fontWeight: "bold", fontSize: "1rem" }}>
              Cài đặt
            </Typography>
          </div>
          <div className="p-1 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center">
            {show ? (
              <KeyboardArrowUpIcon className="text-gray-500" fontSize="small" />
            ) : (
              <KeyboardArrowDownIcon
                className="text-gray-500"
                fontSize="small"
              />
            )}
          </div>
        </div>

        {/* Sub-tabs của Cài đặt */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            show ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-y-1 pl-11 pr-3">
            {tabs.map((tab, index) => (
              <div
                key={index}
                className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${
                  initTab === tab.value
                    ? "bg-[#0093FF] text-white shadow-md shadow-blue-200"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                onClick={(event) => handleChangeTab(event, tab.value)}
              >
                <Typography
                  sx={{
                    fontWeight: initTab === tab.value ? "bold" : "medium",
                    fontSize: "0.9rem",
                  }}
                >
                  {tab.label}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-300 my-2 w-full"></div>

      {/* Lịch sử đặt sân */}
      <div
        className={`flex items-center gap-x-3 p-3 rounded-xl cursor-pointer transition-colors ${
          isActive("/bookingHistory")
            ? "bg-blue-50 text-[#0093FF]"
            : "hover:bg-gray-100 text-gray-700"
        }`}
        onClick={() => handleNonShowTabClick("/bookingHistory")}
      >
        <HistoryIcon
          className={
            isActive("/bookingHistory") ? "text-[#0093FF]" : "text-gray-500"
          }
        />
        <Typography sx={{ fontWeight: "bold", fontSize: "1rem" }}>
          Lịch sử đặt sân
        </Typography>
      </div>

      {/* Lịch sử đánh giá */}
      <div
        className={`flex items-center gap-x-3 p-3 rounded-xl cursor-pointer transition-colors ${
          isActive("/reviewHistory")
            ? "bg-blue-50 text-[#0093FF]"
            : "hover:bg-gray-100 text-gray-700"
        }`}
        onClick={() => handleNonShowTabClick("/reviewHistory")}
      >
        <RateReviewIcon
          className={
            isActive("/reviewHistory") ? "text-[#0093FF]" : "text-gray-500"
          }
        />
        <Typography sx={{ fontWeight: "bold", fontSize: "1rem" }}>
          Lịch sử đánh giá
        </Typography>
      </div>

      <div className="h-px bg-gray-300 my-2 w-full"></div>

      {/* Đăng xuất */}
      <div
        className="flex items-center gap-x-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-red-50 text-red-600"
        onClick={handleLogoutClick}
      >
        <LogoutIcon />
        <Typography sx={{ fontWeight: "bold", fontSize: "1rem" }}>
          Đăng xuất
        </Typography>
      </div>
    </div>
  );
};

export default Sidebar;
