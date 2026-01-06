/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Header from "@/utils/header";
import {
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { CiStar } from "react-icons/ci";
import { BsPinMap } from "react-icons/bs";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";
import { useInView } from "react-intersection-observer";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useSearchParams } from "next/navigation";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { toast } from "react-toastify";

import { getBookingSlot } from "@/services/booking";
import { getReviewByPitch } from "@/services/review";
import { getAllUsers } from "@/services/user";
import BookingModal from "@/utils/bookingModal";
import f from "../../../../../../public/images/field3.jpg";

interface reviewResponseDTO {
  reviewId: string;
  pitchId: string;
  userId: string;
  rating: number;
  comment: string;
  createat: string;
}

interface User {
  name: string;
  email: string;
  phone: string;
}

const FieldDetail: React.FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const name = searchParams.get("name");
  const type = searchParams.get("type");
  const price = searchParams.get("price");
  const description = searchParams.get("description");
  const address = searchParams.get("address");
  const rating = searchParams.get("rating");
  const parsedRating = rating ? parseFloat(rating) : null;

  const [date, setDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [reviews, setReviews] = useState<reviewResponseDTO[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});

  const [isModalOpen, setIsModalOpen] = useState(false); // Modal zoom ảnh
  const [selectedImage, setSelectedImage] = useState(null);

  const [isModalBookingOpen, setIsModalBookingOpen] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  const fieldData = {
    id: id ?? "",
    name: name ?? "",
    type: type ?? "",
    price: price ?? "",
    description: description ?? "",
    date: date ? date.format("DD/MM/YYYY") : "",
    time: "",
  };

  useEffect(() => {
    setSelectedTimeSlots([]);
  }, [date]);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const [pitchReviews, usersData] = await Promise.all([
          getReviewByPitch(id),
          getAllUsers(),
        ]);

        setReviews(pitchReviews);
        const userMap: { [key: string]: User } = {};
        usersData.forEach((user) => {
          userMap[user.userId] = user;
        });
        setUsers(userMap);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải dữ liệu sân");
      }
    };
    loadData();
  }, [id]);

  const fetchBookedSlots = async () => {
    if (!id || !date) return;
    try {
      setIsLoadingSlots(true);
      const formattedDate = date.format("YYYY-MM-DD");
      const response = await getBookingSlot(id, formattedDate);
      setBookedSlots(response);
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast.error("Không thể cập nhật khung giờ");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleOpenBooking = async () => {
    if (!date) {
      toast.warn("Vui lòng chọn ngày trước");
      return;
    }
    if (date.isBefore(dayjs(), "day")) {
      toast.warn("Không thể đặt sân cho ngày đã qua");
      return;
    }
    await fetchBookedSlots();
    setIsModalBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsModalBookingOpen(false);
    setSelectedTimeSlots([]);
  };

  const handleBookingSuccess = () => {
    fetchBookedSlots();
    setSelectedTimeSlots([]);
  };

  const toggleTimeSlot = (slot: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const [currentPage, setCurrentPage] = useState(0);
  const reviewsPerPage = 8;
  const startIndex = currentPage * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const [reviewsRef, reviewsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleImageClick = (imageSrc: any) => {
    setSelectedImage(imageSrc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const handlePrevRe = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextRe = () => {
    if ((currentPage + 1) * reviewsPerPage < reviews.length)
      setCurrentPage(currentPage + 1);
  };

  const getPitchType = (pitchType: string) => {
    switch (pitchType) {
      case "FIVE_A_SIDE":
        return "Sân 5";
      case "SEVEN_A_SIDE":
        return "Sân 7";
      case "ELEVEN_A_SIDE":
        return "Sân 11";
      default:
        return "Không xác định";
    }
  };

  const renderStars = (rating: number | null): React.ReactNode[] => {
    const stars: React.ReactNode[] = [];
    const starRating = rating ? rating / 2 : 0;
    const fullStars = Math.floor(starRating);
    const hasHalfStar = starRating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars)
        stars.push(
          <FaStar key={`full-${i}`} className="text-green-600 text-[0.7rem]" />
        );
      else if (i === fullStars && hasHalfStar)
        stars.push(
          <FaStarHalfAlt key="half" className="text-green-600 text-[0.7rem]" />
        );
      else
        stars.push(
          <CiStar key={`empty-${i}`} className="text-[0.8rem] text-green-600" />
        );
    }
    return stars;
  };

  const truncateName = (name: string, maxLength: number = 15) => {
    if (name.length > maxLength) return name.substring(0, 12) + "...";
    return name;
  };

  return (
    <div className="min-h-screen bg-gray-100 mx-auto px-4 sm:px-8 flex flex-col space-y-[1rem] sm:space-y-[2rem] pt-[100px] pb-[100px]">
      <Header />
      <div className="main flex gap-y-8 max-w-7xl w-full px-0 sm:px-4 mt-[2rem] flex-col mx-auto">
        <div className="inline-flex items-center gap-[1rem] relative ml-0 sm:ml-[1.8rem] flex-wrap">
          <p
            className="relative w-fit mt-[-1.00px] font-bold text-[#188862] text-[1.1rem] sm:text-[1.3rem] cursor-pointer hover:underline"
            onClick={() => window.history.back()}
          >
            Danh sách sân
          </p>
          <KeyboardArrowRightOutlinedIcon className="text-[#188862]" />
          <p className="relative w-fit font-normal text-black text-[1.1rem] sm:text-[1.3rem]">
            Chi tiết sân
          </p>
        </div>

        <div className="pitch-card w-full max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center bg-white p-6 sm:p-12 rounded-2xl shadow-lg gap-8 lg:gap-x-[5rem] mt-[1rem]">
          <div className="left-content w-full lg:flex-1 flex flex-col gap-y-[1.5rem]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-x-[2rem]">
              <Typography
                variant="h4"
                fontWeight={800}
                className="text-2xl sm:text-3xl text-gray-800"
              >
                Sân {name || "Sân không xác định"}
              </Typography>
              <div className="flex items-center gap-x-[0.5rem] bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                {parsedRating !== null
                  ? renderStars(parsedRating)
                  : "Chưa có đánh giá"}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="bg-[#188862] text-white font-bold rounded-lg py-1 px-3 text-sm shadow-md">
                {parsedRating !== null ? parsedRating.toFixed(1) : "0"}/10
              </div>
              <div className="text-gray-600 flex-1 font-medium break-words italic">
                {description || "Chưa có mô tả cho sân này."}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-x-[3rem]">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-blue-100 p-2 rounded-full">
                  <BsPinMap className="text-[1.2rem] text-blue-600" />
                </div>
                <div className="text-[1rem] font-medium text-gray-700 break-words">
                  {address || "Đang cập nhật địa chỉ..."}
                </div>
              </div>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Chọn ngày đặt sân"
                  value={date}
                  onChange={(newValue) => setDate(newValue)}
                  format="DD/MM/YYYY"
                  slots={{ openPickerIcon: CalendarTodayIcon }}
                  slotProps={{
                    textField: {
                      variant: "outlined",
                      sx: {
                        bgcolor: "white",
                        width: "100%",
                        minWidth: "220px",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          "&.Mui-focused fieldset": { borderColor: "#188862" },
                        },
                      },
                    },
                  }}
                  disablePast
                />
              </LocalizationProvider>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">
                  Loại sân
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {type ? getPitchType(type as string) : "..."}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">
                  Đơn giá
                </p>
                <p className="text-lg font-extrabold text-[#FE2A00]">
                  {price ? `${parseInt(price).toLocaleString()} VNĐ` : "..."}{" "}
                  <span className="text-xs font-normal text-gray-400">
                    /giờ
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="right-content relative w-full max-w-[320px] h-[300px] lg:w-[400px] lg:h-[350px] flex-shrink-0 mx-auto mt-4 lg:mt-0">
            <div className="relative w-full h-full group">
              <Image
                src="/images/field3.jpg"
                width={240}
                height={240}
                className="rounded-2xl rotate-[-6deg] cursor-pointer object-cover shadow-xl border-4 border-white absolute top-0 left-2 z-20 transition-transform group-hover:rotate-0 group-hover:scale-105 duration-300"
                style={{ width: "85%", height: "auto", aspectRatio: "1/1" }}
                alt="Field Main"
                onClick={() => handleImageClick("/images/field3.jpg")}
              />
              <Image
                src="/images/field1.jpg"
                width={248}
                height={248}
                className="rounded-2xl cursor-pointer object-cover shadow-lg border-4 border-gray-100 absolute top-8 left-8 z-10 opacity-90"
                style={{ width: "85%", height: "auto", aspectRatio: "1/1" }}
                alt="Field Sub"
                onClick={() => handleImageClick("/images/field1.jpg")}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mt-4">
          <Button
            sx={{
              bgcolor: "#188862",
              color: "white",
              borderRadius: "50px",
              padding: "0.8rem 4rem",
              fontSize: { xs: "1.1rem", sm: "1.3rem" },
              fontWeight: "bold",
              boxShadow: "0 10px 25px -5px rgba(24, 136, 98, 0.4)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "#146c4e",
                transform: "translateY(-2px)",
                boxShadow: "0 15px 30px -5px rgba(24, 136, 98, 0.5)",
              },
            }}
            onClick={handleOpenBooking}
          >
            ĐẶT LỊCH NGAY
          </Button>

          <BookingModal
            open={isModalBookingOpen}
            onClose={handleCloseBooking}
            fieldData={fieldData}
            onBookingSuccess={handleBookingSuccess}
            selectedTimeSlots={selectedTimeSlots}
            onToggleTimeSlot={toggleTimeSlot}
            bookedSlots={bookedSlots}
            isLoadingSlots={isLoadingSlots}
          />
        </div>

        <div
          ref={reviewsRef}
          className={`reviews mt-[4rem] transition-opacity duration-700 ${reviewsInView ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex items-center justify-between mb-[2rem] px-4">
            <Typography variant="h4" sx={{ fontWeight: "800", color: "#333" }}>
              Đánh giá từ khách hàng
            </Typography>
            <div className="flex gap-2">
              <IconButton
                onClick={handlePrevRe}
                disabled={currentPage === 0}
                sx={{ bgcolor: "white", boxShadow: 1 }}
              >
                <MdKeyboardArrowLeft />
              </IconButton>
              <IconButton
                onClick={handleNextRe}
                disabled={endIndex >= reviews.length}
                sx={{ bgcolor: "white", boxShadow: 1 }}
              >
                <MdKeyboardArrowRight />
              </IconButton>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
            {currentReviews.length > 0 ? (
              currentReviews.map((review, index) => (
                <Card
                  key={index}
                  className="w-full h-full min-h-[220px] rounded-xl hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                >
                  <CardContent className="h-full flex flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={f.src}
                          className="rounded-full h-10 w-10 object-cover border border-gray-200"
                          alt="avatar"
                        />
                        <div>
                          <p className="font-bold text-sm text-gray-800">
                            {truncateName(
                              users[review.userId]?.name || "Người dùng ẩn danh"
                            )}
                          </p>
                          <div className="flex gap-0.5">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-4 italic">
                        {review.comment || "Không có nội dung"}"
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 text-right">
                      {dayjs(review.createat).format("DD/MM/YYYY")}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">
                  Chưa có đánh giá nào cho sân này.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative w-full max-w-5xl h-auto max-h-[90vh]">
            <Image
              src={selectedImage || "/images/field1.jpg"}
              width={1000}
              height={800}
              objectFit="contain"
              className="rounded-lg shadow-2xl mx-auto"
              alt="Zoomed"
            />
            <button className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors">
              <CloseIcon fontSize="large" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldDetail;
