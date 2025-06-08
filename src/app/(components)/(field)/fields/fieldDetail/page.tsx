"use client";

import Header from "@/utils/header";
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
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
import BookingModal from "@/utils/bookingModal";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { toast } from "react-toastify";
import { getBookingSlot } from "@/services/booking";

const FieldDetail: React.FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const name = searchParams.get("name");
  const type = searchParams.get("type");
  const price = searchParams.get("price");
  const description = searchParams.get("description");
  const address = searchParams.get("address");
  const rating = searchParams.get("rating");
  const [date, setDate] = useState<dayjs.Dayjs | null>(dayjs());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    setSelectedTimeSlots([]);
  }, [date]);

  const fieldData = {
    id: id ?? "",
    name: name ?? "",
    type: type ?? "",
    price: price ?? "",
    description: description ?? "",
    date: date ? date.format("DD/MM/YYYY") : "",
    time: selectedTimeSlots.join(", "),
  };

  useEffect(() => {
    const loadData = async () => {
      if (id && date) {
        await fetchBookedSlots();
      }
    };
    loadData();
  }, [date, id]);

  const [isModalBookingOpen, setIsModalBookingOpen] = useState(false);
  const handleOpen = () => setIsModalBookingOpen(true);
  const handleClose = () => setIsModalBookingOpen(false);

  const toggleTimeSlot = (slot: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const removeTimeSlot = (slot: string) => {
    setSelectedTimeSlots((prev) => prev.filter((s) => s !== slot));
  };

  const [currentPage, setCurrentPage] = useState(0);
  const reviewsPerPage = 8;
  const startIndex = currentPage * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;

  const handleImageClick = (imageSrc: any) => {
    setSelectedImage(imageSrc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const openTimeModal = async () => {
    if (!date || !id) {
      toast.error("Vui lòng chọn ngày trước khi đặt giờ");
      return;
    }

    if (date.isBefore(dayjs(), "day")) {
      toast.error("Không thể đặt sân cho ngày đã qua");
      return;
    }

    try {
      setIsLoadingSlots(true);
      const formattedDate = date.format("YYYY-MM-DD");
      const response = await getBookingSlot(id, formattedDate);
      setBookedSlots(response);
      setIsTimeModalOpen(true);
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast.error("Không thể tải thông tin khung giờ");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const closeTimeModal = () => {
    setIsTimeModalOpen(false);
  };

  const [reviewsRef, reviewsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const reviewsData = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "/images/lc1.jpg",
      rating: 4.5,
      comment:
        "Tôi đã đặt 1 chiếc du thuyền ở đây vào ngay hôm qua, tôi sẽ ghé lại khi có cơ hội",
      time: "9h trước",
    },
    {
      id: 2,
      name: "Trần Thị B",
      avatar: "/images/lc2.jpg",
      rating: 3,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 3,
      name: "Trần Thị C",
      avatar: "/images/lc3.jpg",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 4,
      name: "Trần Thị B",
      avatar: "/images/lc4.jpg",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 5,
      name: "Trần Thị B",
      avatar: "/images/lc5.jpg",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 6,
      name: "Trần Thị B",
      avatar: "/images/lc6.jpg",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 7,
      name: "Trần Thị B",
      avatar: "/images/lc7.jpg",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 8,
      name: "Trần Thị B",
      avatar: "/images/lc8.jpg",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 9,
      name: "Nguyễn Văn S",
      avatar: "/images/lc1.jpg",
      rating: 5,
      comment:
        "Tôi đã đặt 1 chiếc du thuyền ở đây vào ngay hôm qua, tôi sẽ ghé lại khi có cơ hội",
      time: "9h trước",
    },
    {
      id: 10,
      name: "Trần Thị R",
      avatar: "/images/lc2.jpg",
      rating: 4.5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 11,
      name: "Trần Thị M",
      avatar: "/images/lc3.jpg",
      rating: 4,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 12,
      name: "Trần T B",
      avatar: "/images/lc4.jpg",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 13,
      name: "T Thị B",
      avatar: "/images/lc5.jpg",
      rating: 4,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 14,
      name: "Trần Thị B",
      avatar: "/images/lc6.jpg",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 15,
      name: "B",
      avatar: "/images/lc7.jpg",
      rating: 3,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 16,
      name: "Trần Thị",
      avatar: "/images/lc8.jpg",
      rating: 4.5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
  ];

  const currentReviews = reviewsData.slice(startIndex, endIndex);

  const handlePrevRe = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextRe = () => {
    if ((currentPage + 1) * reviewsPerPage < reviewsData.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderStars = (ratingValue: number): React.ReactNode[] => {
    const stars: React.ReactNode[] = [];
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar key={`full-${i}`} className="text-green-600 text-[1rem]" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FaStarHalfAlt key="half" className="text-green-600 text-[1rem]" />
      );
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <CiStar key={`empty-${i}`} className="text-[1rem] text-green-600" />
      );
    }

    return stars;
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

  const timeSlots = [
    "6:00 - 7:00",
    "7:00 - 8:00",
    "8:00 - 9:00",
    "9:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00",
    "18:00 - 19:00",
    "19:00 - 20:00",
    "20:00 - 21:00",
    "21:00 - 22:00",
    "22:00 - 23:00",
    "23:00 - 24:00",
  ];

  const getSlotNumber = (timeSlot: string) => {
    return timeSlots.indexOf(timeSlot) + 1;
  };

  const isSlotBooked = (timeSlot: string) => {
    return bookedSlots.includes(getSlotNumber(timeSlot));
  };

  const fetchBookedSlots = async () => {
    if (!id || !date) return;

    try {
      const formattedDate = date.format("YYYY-MM-DD");
      const response = await getBookingSlot(id, formattedDate);
      setBookedSlots(response);
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast.error("Không thể cập nhật khung giờ");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 mx-auto px-4 sm:px-8 flex flex-col space-y-[1rem] sm:space-y-[2rem] pt-[100px] pb-[100px]">
      <Header />
      <div className="main flex gap-x-[2rem] max-w-7xl w-full px-4 mt-[2rem] flex-col mx-auto">
        <div className="inline-flex items-start gap-[1rem] relative ml-[1.8rem]">
          <p
            className="relative w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#188862] text-[1.3rem] tracking-[0] leading-[normal] whitespace-nowrap cursor-pointer"
            onClick={() => window.history.back()}
          >
            Danh sách sân
          </p>
          <KeyboardArrowRightOutlinedIcon className="text-[#188862] mt-[-1.00px]" />
          <p className="relative w-fit [font-family:'Inter-Regular',Helvetica] font-normal text-black text-[1.3rem] tracking-[0] leading-[normal]">
            Chi tiết sân
          </p>
        </div>
        <div className="pitch-card max-w-5xl mx-auto flex items-center bg-white p-12 rounded-md max-h-[500px] shadow-md gap-x-[5rem] mt-[2rem]">
          <div className="left-content flex flex-col gap-y-[1.2rem]">
            <div className="flex items-center gap-x-[2rem]">
              <Typography variant="h4" fontWeight={700}>
                Sân {name || "Sân không xác định"}
              </Typography>
              <div className="ratings flex items-center justify-center gap-x-[0.5rem]">
                {rating ? renderStars(Number(rating)) : "Chưa có đánh giá"}
              </div>
            </div>
            <div className="flex items-center gap-x-[2.4rem]">
              <div className="bg-blue-600 text-white font-bold rounded-md py-[0.3rem] px-[0.3rem] text-[0.8rem] w-[50px] flex-shrink-0 text-center">
                {rating ? `${Math.round(Number(rating) * 2)}/10` : "N/A"}
              </div>
              <div className="field-info text-[1rem] flex-1 font-bold">
                {description || "Không có mô tả"}
              </div>
            </div>

            <div className="flex items-center gap-x-[4rem]">
              <BsPinMap className="text-[1.5rem] text-gray-600 cursor-pointer" />
              <div className="field-info text-[1rem] flex-1">
                {address || "Lỗi lấy địa chỉ"}
              </div>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Ngày đặt"
                  value={date}
                  onChange={(newValue) => {
                    if (newValue && newValue.isBefore(dayjs(), "day")) return;
                    setDate(newValue);
                  }}
                  format="DD/MM/YYYY"
                  slots={{
                    openPickerIcon: CalendarTodayIcon,
                  }}
                  slotProps={{
                    textField: {
                      sx: { width: { xs: "100%", sm: "200px" } },
                    },
                    actionBar: {
                      actions: ["clear", "today"],
                    },
                  }}
                  disablePast
                />
              </LocalizationProvider>
            </div>

            <div className="flex flex-col gap-y-4">
              <div className="flex items-center gap-x-4">
                <Typography variant="body1" fontWeight={600}>
                  Khung giờ
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AccessTimeIcon fontSize="small" />}
                  onClick={openTimeModal}
                  sx={{
                    width: "fit-content",
                    py: 0.5,
                    px: 2,
                    fontSize: "0.875rem",
                    textTransform: "none",
                    bgcolor: "#188862",
                  }}
                >
                  Chọn khung giờ
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {selectedTimeSlots.length > 0 ? (
                  selectedTimeSlots.map((slot) => (
                    <div
                      key={slot}
                      className="bg-[#188862] text-white font-bold rounded-md px-3 py-1 text-sm flex items-center justify-between"
                    >
                      <span>{slot}</span>
                      <button
                        onClick={() => removeTimeSlot(slot)}
                        className="hover:text-red-200 ml-2 cursor-pointer"
                      >
                        <CloseIcon fontSize="small" />
                      </button>
                    </div>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Chưa chọn khung giờ
                  </Typography>
                )}
              </div>
            </div>

            <div className="flex items-center gap-x-[6.1rem]">
              <div className="flex items-center gap-x-[1.4rem]">
                <div className="field-info text-[1rem] font-bold">
                  Loại sân:
                </div>
                <div className="field-info text-[1rem] flex-1">
                  {type ? getPitchType(type as string) : "Không xác định"}
                </div>
              </div>
              <div className="flex items-center gap-x-[1.5rem]">
                <div className="field-info text-[1rem] font-bold">Giá:</div>
                <div className="field-info text-[1rem] flex-1">
                  {price ? `${price} VNĐ` : "Không xác định"}
                </div>
              </div>
            </div>
          </div>
          <div className="right-content images relative">
            <Image
              src="/images/field3.jpg"
              width={240}
              height={240}
              className="rounded-md rotate-[-3deg] cursor-pointer"
              style={{
                position: "absolute",
                top: "-10px",
                left: "-20px",
                zIndex: 2,
              }}
              alt="Field 3"
              onClick={() => handleImageClick("/images/field3.jpg")}
            />
            <Image
              src="/images/field1.jpg"
              width={248}
              height={248}
              className="rounded-md cursor-pointer"
              style={{ zIndex: 1, position: "relative" }}
              alt="Field 5"
              onClick={() => handleImageClick("/images/field1.jpg")}
            />
          </div>
        </div>
        <div
          ref={reviewsRef}
          className={`discounts mt-[2rem] ${reviewsInView ? "animate-fadeSlideUp" : "opacity-0"}`}
        >
          <div className="flex items-center justify-center mb-[2rem] relative">
            <Typography
              variant="h3"
              sx={{ fontWeight: "bold", textAlign: "center" }}
            >
              Nhận xét
            </Typography>
            <div className="flex items-end icons absolute right-4 gap-[1.5rem]">
              <div
                className={`rounded-full bg-gray-200 flex items-center justify-center ${
                  currentPage === 0 ? "opacity-50" : "cursor-pointer"
                }`}
                onClick={handlePrevRe}
              >
                <MdKeyboardArrowLeft className="text-[2.5rem]" />
              </div>
              <div
                className={`rounded-full bg-gray-200 flex items-center justify-center ${
                  endIndex >= reviewsData.length
                    ? "opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={handleNextRe}
              >
                <MdKeyboardArrowRight className="text-[2.5rem]" />
              </div>
            </div>
          </div>
          <div className="reviews-cards space-y-[2rem]">
            <div className="mx-auto gap-4 flex items-center flex-wrap max-7-xl">
              {currentReviews.map((review, index) => (
                <Card
                  key={index}
                  sx={{
                    maxWidth: "250px",
                    height: "250px",
                    position: "relative",
                    paddingBottom: "50px",
                  }}
                  className="mx-auto"
                >
                  <CardContent
                    sx={{
                      padding: "1rem",
                      height: "100%",
                      display: "flex",
                      gap: "1rem",
                      flexDirection: "column",
                    }}
                  >
                    <div className="header flex items-center gap-[1rem]">
                      <img
                        src={review.avatar}
                        className="rounded-full h-12 w-12 object-cover"
                      />
                      <div className="flex flex-col gap-y-[0.4rem] pb-[0.2rem]">
                        <p className="font-bold text-[1.2rem]">{review.name}</p>
                        <div className="stars flex items-start gap-x-[0.5rem]">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <p
                      className="font-medium text-[0.9rem] text-justify"
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        marginTop: "0.5rem",
                      }}
                    >
                      {review.comment}
                    </p>
                  </CardContent>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "0 1rem 1rem 1rem",
                    }}
                  >
                    <Divider
                      sx={{
                        borderColor: "#ccc",
                        borderWidth: "1px",
                        marginBottom: "0.5rem",
                      }}
                    />
                    <p className="text-[1rem] text-justify">
                      Đã đánh giá vào{" "}
                      <span className="font-bold">{review.time}</span>
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Button
            sx={{
              bgcolor: "#188862",
              color: "white",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              fontSize: "1.5rem",
              width: "400px",
              height: "50px",
              marginTop: "3rem",
            }}
            onClick={handleOpen}
          >
            Đặt ngay
          </Button>
          <BookingModal
            open={isModalBookingOpen}
            onClose={handleClose}
            fieldData={fieldData}
            onBookingSuccess={fetchBookedSlots}
            resetSelectedSlots={() => setSelectedTimeSlots([])}
          />
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={selectedImage || "/images/field1.jpg"}
              layout="fill"
              objectFit="contain"
              className="rounded-md"
              alt="Zoomed Image"
            />
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={closeModal}
            >
              <CloseIcon fontSize="large" />
            </button>
          </div>
        </div>
      )}
      {isTimeModalOpen && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-[90%] max-w-[900px] ">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6" fontWeight="bold">
                Chọn khung giờ
              </Typography>
              <IconButton onClick={closeTimeModal}>
                <CloseIcon />
              </IconButton>
            </div>

            {isLoadingSlots ? (
              <div className="flex justify-center items-center h-32">
                <CircularProgress />
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-3">
                {timeSlots.map((slot, index) => {
                  const isBooked = isSlotBooked(slot);
                  const isPast = date?.isBefore(dayjs(), "day");

                  const isToday = date?.isSame(dayjs(), "day");
                  let isDisabledByTime = false;

                  if (isToday) {
                    const now = dayjs();
                    const currentHour = now.hour();
                    const currentMinute = now.minute();

                    const [start] = slot.split(" - ");
                    const [slotHour] = start.split(":").map(Number);

                    if (slotHour < currentHour + 1) {
                      isDisabledByTime = true;
                    } else if (
                      slotHour === currentHour + 1 &&
                      currentMinute > 30
                    ) {
                      isDisabledByTime = true;
                    }
                  }

                  const isDisabled = isBooked || isPast || isDisabledByTime;

                  return (
                    <Button
                      key={index}
                      variant={
                        selectedTimeSlots.includes(slot)
                          ? "contained"
                          : "outlined"
                      }
                      color="primary"
                      onClick={() => !isDisabled && toggleTimeSlot(slot)}
                      sx={{
                        textTransform: "none",
                        py: 1.5,
                        ...(isBooked && {
                          backgroundColor: "silver",
                          color: "white",
                        }),
                        ...(selectedTimeSlots.includes(slot) && {
                          backgroundColor: "#188862",
                          color: "white",
                          "&:hover": { backgroundColor: "#126d4e" },
                        }),
                        ...(isDisabled && {
                          pointerEvents: "none",
                          opacity: 0.6,
                        }),
                      }}
                      disabled={isDisabled}
                    >
                      {slot}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldDetail;
