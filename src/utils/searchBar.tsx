"use client";

import React, { useState } from "react";
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
import dayjs from "dayjs";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";

interface SearchBarProps {
  inView: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ inView }) => {
  const locations = [
    "45 Tân Lập",
    "Sân Gò Trạch",
    "Sân Kiên Định",
    "123 Nguyễn Huệ",
    "456 Lê Lợi",
  ];

  const fieldTypes = ["Sân 5", "Sân 7", "Sân 11"];

  const [location, setLocation] = useState<string | null>(null);
  const [date, setDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [fieldType, setFieldType] = useState<string>("Sân 5");

  const handleSearch = () => {
    console.log("Tìm kiếm:", { location, date, fieldType });
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
        <Autocomplete
          options={locations}
          value={location}
          onChange={(event, newValue) => setLocation(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Bạn muốn đặt sân ở đâu ?"
              placeholder="Nhập khu vực"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <LocationOnIcon sx={{ color: "gray", mr: 1 }} />
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
              sx={{ width: { xs: "100%", sm: "300px" } }}
            />
          )}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Ngày đặt"
            value={date}
            onChange={(newValue) => setDate(newValue)}
            format="DD/MM/YYYY"
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
        <FormControl sx={{ width: { xs: "100%", sm: "200px" } }}>
          <InputLabel>Loại sân</InputLabel>
          <Select
            value={fieldType}
            onChange={(event) => setFieldType(event.target.value as string)}
            label="Loại sân"
            startAdornment={<GroupIcon sx={{ color: "gray", mr: 1 }} />}
          >
            {fieldTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
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
