import React from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import DiscountIcon from "@mui/icons-material/Discount";
import HistoryIcon from "@mui/icons-material/History";
import RateReviewIcon from "@mui/icons-material/RateReview";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Typography } from "@mui/material";

interface SidebarProps {
  tabs: { label: string; value: number }[];
  show: boolean;
  handleShow: (event: React.MouseEvent<HTMLElement>) => void;
  initTab: number;
  handleChangeTab: (event: React.SyntheticEvent, newValue: number) => void;
  handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  tabs,
  show,
  handleShow,
  initTab,
  handleChangeTab,
  handleLogout,
}) => {
  return (
    <div className="bg-white w-[23%] flex flex-col items-start justify-start rounded-br-lg shadow-md py-6 px-8 left-sidebar gap-y-[1.5rem]">
      <div className="flex items-center justify-start gap-x-[1rem]">
        <SettingsIcon className="text-[1rem]" />
        <Typography
          sx={{ fontWeight: "bold", fontSize: "1rem" }}
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
      <div className="flex items-center justify-start gap-x-[1rem]">
        <DiscountIcon className="text-[1rem]" sx={{ color: "gray" }} />
        <Typography
          sx={{ color: "gray", fontSize: "1rem" }}
          className="cursor-pointer"
        >
          Mã khuyến mãi
        </Typography>
      </div>
      <div className="flex items-center justify-start gap-x-[1rem]">
        <HistoryIcon className="text-[1rem]" sx={{ color: "gray" }} />
        <Typography
          //   variant="h6"
          sx={{ color: "gray", fontSize: "1rem" }}
          className="cursor-pointer"
        >
          Lịch sử đặt sân
        </Typography>
      </div>
      <div className="flex items-center justify-start gap-x-[1rem]">
        <RateReviewIcon className="text-[1rem]" sx={{ color: "gray" }} />
        <Typography
          variant="h6"
          sx={{ color: "gray", fontSize: "1rem" }}
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
        <Typography variant="h6" sx={{ color: "red", fontSize: "1rem" }}>
          Đăng xuất
        </Typography>
      </div>
    </div>
  );
};

export default Sidebar;
