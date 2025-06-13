"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Typography,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import { getAllAddresses } from "@/services/provider";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { getAvailablePitches } from "@/services/booking";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  inView: boolean;
}

interface Address {
  providerAddressId: string;
  address: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ inView }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const router = useRouter();
  const now = dayjs();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const addressesData = await getAllAddresses();
        setAddresses(addressesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 24; hour++) {
      times.push(`${hour}:00`);
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const [date, setDate] = useState<Dayjs | null>(now);
  const [startTime, setStartTime] = useState<string>("6:00");
  const [endTime, setEndTime] = useState<string>("7:00");
  const [timeError, setTimeError] = useState<string | null>(null);

  const calculateSlots = () => {
    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);

    if (endHour <= startHour) {
      setTimeError("Giờ kết thúc phải sau giờ bắt đầu");
      return [];
    }

    setTimeError(null);
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(hour - 6 + 1);
    }
    return slots;
  };

  const isPastTime = (selectedDate: Dayjs, selectedTime: string) => {
    const selectedHour = parseInt(selectedTime.split(":")[0]);
    const selectedDateTime = selectedDate
      .hour(selectedHour)
      .minute(0)
      .second(0);

    return selectedDateTime.isBefore(now);
  };

  const handleSearch = async () => {
    if (!date) {
      alert("Vui lòng chọn ngày đặt sân");
      return;
    }

    // Kiểm tra giờ bắt đầu có trong quá khứ không
    if (date.isSame(now, "day") && isPastTime(date, startTime)) {
      alert(
        "Không thể đặt sân trong quá khứ. Vui lòng chọn giờ bắt đầu sau giờ hiện tại."
      );
      return;
    }

    // Tính toán các slot
    const slots = calculateSlots();

    if (slots.length === 0) {
      if (!timeError) {
        alert("Vui lòng chọn khoảng thời gian hợp lệ");
      }
      return;
    }

    const formattedDate = date.format("YYYY-MM-DD");

    try {
      const availablePitchIds = await getAvailablePitches(formattedDate, slots);

      const queryParams = new URLSearchParams({
        date: formattedDate,
        slots: slots.join(","),
        pitchIds: availablePitchIds.join(","),
      });

      router.push(`/fields?${queryParams.toString()}`);
    } catch (error) {
      console.error("Lỗi khi lấy sân khả dụng:", error);
      alert("Đã có lỗi xảy ra khi tìm sân. Vui lòng thử lại.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="flex flex-col sm:flex-row items-center gap-2 max-w-[1200px] mx-auto mt-2"
    >
      <motion.div variants={itemVariants}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Ngày đặt"
            value={date}
            onChange={(newValue) => setDate(newValue)}
            format="DD/MM/YYYY"
            minDate={now}
            slots={{
              openPickerIcon: CalendarTodayIcon,
            }}
            slotProps={{
              textField: {
                sx: { width: { xs: "100%", sm: "200px" } },
              },
            }}
            disablePast
          />
        </LocalizationProvider>
      </motion.div>

      <motion.div variants={itemVariants}>
        <FormControl sx={{ width: { xs: "100%", sm: "150px" } }}>
          <InputLabel>Bắt đầu</InputLabel>
          <Select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value as string)}
            label="Bắt đầu"
            startAdornment={<AccessTimeIcon sx={{ color: "gray", mr: 1 }} />}
          >
            {timeOptions.map((time) => (
              <MenuItem
                key={`start-${time}`}
                value={time}
                disabled={date?.isSame(now, "day") && isPastTime(now, time)}
              >
                {time}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </motion.div>

      <motion.div variants={itemVariants}>
        <FormControl sx={{ width: { xs: "100%", sm: "150px" } }}>
          <InputLabel>Kết thúc</InputLabel>
          <Select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value as string)}
            label="Kết thúc"
            startAdornment={<AccessTimeIcon sx={{ color: "gray", mr: 1 }} />}
            error={!!timeError}
          >
            {timeOptions.map((time) => (
              <MenuItem
                key={`end-${time}`}
                value={time}
                disabled={
                  parseInt(time.split(":")[0]) <=
                  parseInt(startTime.split(":")[0])
                }
              >
                {time}
              </MenuItem>
            ))}
          </Select>
          {timeError && (
            <Typography variant="caption" color="error">
              {timeError}
            </Typography>
          )}
        </FormControl>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            backgroundColor: "#2E7D32",
            color: "white",
            fontWeight: "bold",
            textTransform: "uppercase",
            px: 5,
            py: 2,
            "&:hover": {
              backgroundColor: "#1B5E20",
            },
            width: { xs: "200%", sm: "auto" },
            mt: timeError ? 3 : 0,
          }}
        >
          <Typography sx={{ fontWeight: "bold" }}>Tìm kiếm</Typography>
          <FaSearch className="ml-[1rem]" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default SearchBar;
