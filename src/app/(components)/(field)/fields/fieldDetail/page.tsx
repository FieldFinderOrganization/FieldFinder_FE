"use client";
import Header from "@/utils/header";
import { Button, Card, CardContent, Divider, Typography } from "@mui/material";
import React, { useState } from "react";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { CiStar } from "react-icons/ci";
import { BsPinMap } from "react-icons/bs";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";
import { useInView } from "react-intersection-observer";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

const FieldDetail: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

  const currentReviews = reviewsData.slice(
    currentPage * reviewsPerPage,
    (currentPage + 1) * reviewsPerPage
  );

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

  const renderStars = (rating: number): React.ReactNode[] => {
    const stars: React.ReactNode[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar key={`full-${i}`} className="text-green-600 text-[0.7rem]" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FaStarHalfAlt key="half" className="text-green-600 text-[0.7rem]" />
      );
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <CiStar key={`empty-${i}`} className="text-[0.8rem] text-green-600" />
      );
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-100 mx-auto px-4 sm:px-8 flex flex-col space-y-[1rem] sm:space-y-[2rem] pt-[100px] pb-[100px]">
      <Header />
      <div className="main flex gap-x-[2rem] max-w-7xl w-full px-4 mt-[2rem] flex-col">
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
            <div className="flex items-center gap-x-[2rem] ">
              <Typography variant="h4" fontWeight={700}>
                Sân Gò Trạch
              </Typography>
              <div className="ratings flex items-center justify-center gap-x-[0.5rem]">
                <FaStar className="text-green-600 text-[1rem]" />
                <FaStar className="text-green-600 text-[1rem]" />
                <FaStar className="text-green-600 text-[1rem]" />
                <FaStar className="text-green-600 text-[1rem]" />
                <CiStar className="text-[1rem] text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-x-[2.4rem]">
              <div className="bg-blue-600 text-white font-bold rounded-md py-[0.3rem] px-[0.3rem] text-[0.8rem] w-[50px] flex-shrink-0 text-center">
                8/10
              </div>
              <div className="field-info text-[1rem] flex-1 font-bold">
                Hú khẹt
              </div>
            </div>
            <div className="flex items-center gap-x-[4rem]">
              <BsPinMap className="text-[1.5rem] text-gray-600 cursor-pointer" />
              <div className="field-info text-[1rem] flex-1 ">Hú khẹt</div>
            </div>
            <div className="flex items-center gap-x-[3rem]">
              <div className="flex items-center gap-x-[1.5rem]">
                <div className="field-info text-[1rem] font-bold">Chủ sân:</div>
                <div className="field-info text-[1rem] flex-1">Chủ sân</div>
              </div>
              <div className="flex items-center gap-x-[1.5rem]">
                <div className="field-info text-[1rem] font-bold">
                  Loại sân:
                </div>
                <div className="field-info text-[1rem] flex-1">Chủ sân</div>
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
              sx={{
                fontWeight: "bold",
                textAlign: "center",
              }}
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
                className={`rounded-full bg-gray-200 flex items-center justify-center  ${
                  endIndex >= reviewsData.length
                    ? "opacity-50 "
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
              //   fontWeight: "bold",
              borderRadius: "0.5rem",
              padding: "0.5rem rem",
              fontSize: "1.5rem",
              width: "400px",
              height: "50px",
              marginTop: "3rem",
            }}
          >
            Đặt ngay
          </Button>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={selectedImage ?? ""}
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
    </div>
  );
};

export default FieldDetail;
