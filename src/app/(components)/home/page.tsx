/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Button, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Divider from "@mui/material/Divider";
import { CiStar } from "react-icons/ci";
import { FaStar } from "react-icons/fa6";
import { FaStarHalfAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { GiSoccerField } from "react-icons/gi";
import SearchBar from "@/utils/searchBar";
import {} from "@mui/material";
import { toast } from "react-toastify";
import "react-multi-carousel/lib/styles.css";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import {
  discountRes,
  getAllDiscounts,
  saveDiscountToWallet,
} from "@/services/discount";
import Header from "@/utils/header";
import { useSelector } from "react-redux";

interface Field {
  image: string;
  rating: number;
  name: string;
  address: string;
  score: string;
  info: string;
}

interface CardData {
  frontTitle: string;
  backContent: string;
}

interface DisplayDiscount extends discountRes {
  displayImage: string;
  displayText: string;
}

const Home: React.FC = () => {
  const userId = useSelector((state: any) => state.auth.user?.userId);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const reviewsPerPage = 8;
  const startIndex = currentPage * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const [searchBarRef, searchBarInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });
  const [whyMtkicksRef, whyMtkicksInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [discountsRef, discountsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [reviewsRef, reviewsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [realDiscounts, setRealDiscounts] = useState<DisplayDiscount[]>([]);
  const [discountSwiper, setDiscountSwiper] = useState<SwiperType | null>(null);

  const fallbackImages = [
    "/images/sale1.jpg",
    "/images/sale2.jpg",
    "/images/sale3.jpg",
    "/images/sale4.jpg",
    "/images/sale5.jpg",
    "/images/sale6.jpg",
  ];

  const reviewsData = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "./images/lc1.jpg",
      rating: 4.5,
      comment:
        "Tôi đã đặt 1 chiếc du thuyền ở đây vào ngay hôm qua, tôi sẽ ghé lại khi có cơ hội",
      time: "9h trước",
    },
    {
      id: 2,
      name: "Trần Thị B",
      avatar: "./images/lc2.jpg",
      rating: 3,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 3,
      name: "Trần Thị C",
      avatar: "./images/lc3.jpg",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 4,
      name: "Trần Thị B",
      avatar: "./images/lc4.jpg",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 5,
      name: "Trần Thị B",
      avatar: "./images/lc5.jpg",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 6,
      name: "Trần Thị B",
      avatar: "./images/lc6.jpg",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 7,
      name: "Trần Thị B",
      avatar: "./images/lc7.jpg",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 8,
      name: "Trần Thị B",
      avatar: "./images/lc8.jpg",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 9,
      name: "Nguyễn Văn S",
      avatar: "./images/lc1.jpg",
      rating: 5,
      comment:
        "Tôi đã đặt 1 chiếc du thuyền ở đây vào ngay hôm qua, tôi sẽ ghé lại khi có cơ hội",
      time: "9h trước",
    },
    {
      id: 10,
      name: "Trần Thị R",
      avatar: "./images/lc2.jpg",
      rating: 4.5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 11,
      name: "Trần Thị M",
      avatar: "./images/lc3.jpg",
      rating: 4,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 12,
      name: "Trần T B",
      avatar: "./images/lc4.jpg",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 13,
      name: "T Thị B",
      avatar: "./images/lc5.jpg",
      rating: 4,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 14,
      name: "Trần Thị B",
      avatar: "./images/lc6.jpg",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 15,
      name: "B",
      avatar: "./images/lc7.jpg",
      rating: 3,
      comment: "Dịch vụ tuyệt vời, tôi rất hài lòng!",
      time: "10h trước",
    },
    {
      id: 16,
      name: "Trần Thị",
      avatar: "./images/lc8.jpg",
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

  const initialImages = [
    { src: "/images/lc1.jpg", text: "Quận 1" },
    { src: "/images/lc2.jpg", text: "Quận 2" },
    { src: "/images/lc3.jpg", text: "Quận 3" },
    { src: "/images/lc4.jpg", text: "Gò Vấp" },
    { src: "/images/lc5.jpg", text: "Quận 5" },
    { src: "/images/lc6.jpg", text: "Tân Phú" },
    { src: "/images/lc7.jpg", text: "Bình Dương" },
    { src: "/images/lc8.jpg", text: "Quận 8" },
  ];
  const [imagesLoaded, setImagesLoaded] = useState<number>(0);

  const initialState = {
    left: [initialImages[0]],
    middle: [initialImages[1], initialImages[2]],
    right: [initialImages[3]],
  };

  const [sections, setSections] = useState(initialState);
  const [history, setHistory] = useState([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllDiscounts();
        const now = new Date();
        const activeDiscounts = data.filter((d) => {
          const endDate = new Date(d.endDate);
          if (d.endDate.length <= 10) {
            endDate.setHours(23, 59, 59, 999);
          }

          return d.status === "ACTIVE" && endDate >= now;
        });

        const mappedData: DisplayDiscount[] = activeDiscounts.map(
          (d, index) => ({
            ...d,
            displayImage: fallbackImages[index % fallbackImages.length],
            displayText: d.description || `Mã giảm giá ${d.code}`,
          })
        );

        setRealDiscounts(mappedData);
      } catch (error) {
        console.error("Failed to fetch discounts:", error);
      }
    };
    fetchData();
  }, []);

  const discountSlides = [];
  for (let i = 0; i < realDiscounts.length; i += 3) {
    discountSlides.push(realDiscounts.slice(i, i + 3));
  }
  const handleSaveDiscount = async (code: string) => {
    if (!userId) {
      alert("Vui lòng đăng nhập để lưu mã!");
      return;
    }

    try {
      await saveDiscountToWallet(userId, { discountCode: code });
      toast.success("Lưu mã thành công!");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Lỗi khi lưu mã";
      toast.success("Đã xảy ra lỗi trong quá trình lưu mã!");
    }
  };

  const fields: Field[] = [
    {
      image: "/images/field3.jpg",
      rating: 4.5,
      name: "Sân Gò Trạch",
      address: "45 Tân Lập",
      score: "9.5/10",
      info: "Sân rộng rãi, thoáng mát",
    },
    {
      image: "/images/field4.jpg",
      rating: 4,
      name: "Sân Kiên Định",
      address: "45 Tân Lập",
      score: "8/10",
      info: "Mặt cỏ đẹp, vệ sinh sạch sẽ",
    },
    {
      image: "/images/field5.jpg",
      rating: 5,
      name: "Sân Gò Trạch",
      address: "45 Tân Lập",
      score: "10/10",
      info: "Sân rộng rãi, thoáng mát",
    },
  ];

  const cardData: CardData[] = [
    {
      frontTitle: "Hệ thống sân bãi đa dạng",
      backContent:
        "Chúng tôi cung cấp các sân bãi chất lượng cao, đa dạng loại hình từ sân 5 người, 7 người đến 11 người, phù hợp với mọi nhu cầu thi đấu và giải trí.",
    },
    {
      frontTitle: "Kinh nghiệm tổ chức giải đấu",
      backContent:
        "Đội ngũ của chúng tôi có nhiều năm kinh nghiệm tổ chức các giải đấu lớn nhỏ, đảm bảo sự chuyên nghiệp và thành công cho mọi sự kiện.",
    },
    {
      frontTitle: "Thành tích nổi bật",
      backContent:
        "MTKICKs đã đạt được nhiều giải thưởng uy tín và được khách hàng đánh giá cao nhờ dịch vụ chất lượng và đáng tin cậy.",
    },
    {
      frontTitle: "Công nghệ hiện đại",
      backContent:
        "Ứng dụng công nghệ tiên tiến trong quản lý sân bãi và đặt lịch, mang đến trải nghiệm tiện lợi và nhanh chóng cho khách hàng.",
    },
    {
      frontTitle: "Chất lượng đảm bảo",
      backContent:
        "Cam kết mang đến sân bãi đạt tiêu chuẩn cao, được bảo trì thường xuyên để đảm bảo trải nghiệm tốt nhất cho người chơi.",
    },
    {
      frontTitle: "Đội ngũ R&D mạnh mẽ",
      backContent:
        "Đội ngũ nghiên cứu và phát triển của chúng tôi không ngừng đổi mới để cải thiện dịch vụ và đáp ứng nhu cầu của khách hàng.",
    },
  ];

  const discounts = [
    {
      image: "/images/sale1.jpg",
      text: "Chào mừng bạn mới, nhận ngay 15% ưu đãi",
    },
    { image: "/images/sale2.jpg", text: "Giảm 20% cho lần đặt sân thứ hai" },
    { image: "/images/sale3.jpg", text: "Ưu đãi 10% khi đặt sân vào thứ 4" },
    { image: "/images/sale4.jpg", text: "Giảm 25% cho nhóm 5 người" },
    { image: "/images/sale5.jpg", text: "Ưu đãi 30% cuối tuần" },
    { image: "/images/sale6.jpg", text: "Miễn phí nước khi đặt trước" },
    { image: "/images/sale7.jpg", text: "Giảm 15% cho sinh viên" },
    { image: "/images/sale8.jpg", text: "Ưu đãi 20% giờ vàng" },
    { image: "/images/sale9.jpg", text: "Mua 5 tặng 1" },
  ];

  const slides = [];
  for (let i = 0; i < discounts.length; i += 3) {
    slides.push(discounts.slice(i, i + 3));
  }

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

  const handleMouseEnter = (index: number) => {
    setHoveredCard(index);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % fields.length);
    }, 2000);

    const timer = setTimeout(() => {
      setIsLoading(false);
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [fields.length]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/10">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(5px)" }}
            transition={{
              duration: 1.2,
              ease: [0.33, 1, 0.68, 1],
            }}
            className="relative w-full h-screen"
          >
            <Image
              src={fields[currentImage].image}
              alt="Splash Image"
              fill
              quality={90}
              priority
              className="object-cover object-center"
              sizes="100vw"
              style={{
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  const getIndex = (image: { src: unknown; text?: string }) =>
    initialImages.findIndex((img) => img.src === image.src);

  const handlePrev = () => {
    const currentLeftIndex = getIndex(sections.left[0]);
    const totalImages = initialImages.length;

    const newLeftIndex = (currentLeftIndex - 1 + totalImages) % totalImages;
    const newMiddleIndex = currentLeftIndex;
    const newRightIndex = sections.middle[0]
      ? getIndex(sections.middle[0])
      : newMiddleIndex;

    let newState;
    if (sections.left.length === 1) {
      newState = {
        left: [
          initialImages[(newLeftIndex - 1 + totalImages) % totalImages],
          initialImages[newLeftIndex],
        ],
        middle: sections.left,
        right: sections.middle,
      };
    } else {
      newState = {
        left: [initialImages[newLeftIndex]],
        middle: sections.left,
        right: sections.middle,
      };
    }

    setSections(newState);
    setHistory([...history.slice(0, historyIndex + 1), newState]);
    setHistoryIndex(historyIndex + 1);
  };

  const handleNext = () => {
    const currentRightIndex = getIndex(
      sections.right[sections.right.length - 1]
    );
    const totalImages = initialImages.length;

    const newRightIndex = (currentRightIndex + 1) % totalImages;
    const newMiddleIndex = sections.right[0]
      ? getIndex(sections.right[0])
      : newRightIndex;

    let newState;
    if (sections.right.length === 1) {
      newState = {
        left: sections.middle,
        middle: sections.right,
        right: [
          initialImages[newRightIndex],
          initialImages[(newRightIndex + 1) % totalImages],
        ],
      };
    } else {
      newState = {
        left: sections.middle,
        middle: sections.right,
        right: [initialImages[newRightIndex]],
      };
    }

    setSections(newState);
    setHistory([...history.slice(0, historyIndex + 1), newState]);
    setHistoryIndex(historyIndex + 1);
  };

  const SwiperPrevBtn = ({
    className,
    handlePrev,
  }: {
    className?: string;
    handlePrev?: () => void;
  }) => (
    <button
      className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full cursor-pointer shadow-md hover:bg-gray-200 transition-all ${className}`}
      onClick={handlePrev}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-black"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>
  );

  const SwiperNextBtn = ({
    className,
    handleNext,
  }: {
    className?: string;
    handleNext?: () => void;
  }) => (
    <button
      className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full cursor-pointer shadow-md hover:bg-gray-200 transition-all ${className}`}
      onClick={handleNext}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-black"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );

  const handleImageLoad = () => {
    setImagesLoaded((prev) => prev + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gray-100 mx-auto px-4 sm:px-8 flex flex-col space-y-[1rem] sm:space-y-[2rem] pt-[100px] pb-[100px] relative"
    >
      <Header />
      {/* Hero Section */}
      <div className="best-locations flex items-center justify-center flex-col lg:flex-row gap-[2rem] lg:gap-[1rem] max-w-7xl mx-auto w-full">
        <div className="w-full lg:w-[55%] flex flex-col-reverse sm:flex-row items-center justify-between max-w-5xl mx-auto gap-6 sm:gap-0">
          <div className="flex flex-col gap-y-[1rem] sm:gap-y-[2rem] text-center sm:text-left">
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "#FE2A00",
              }}
            >
              Đặt sân, chạm bóng, cháy hết mình
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#000000",
              }}
            >
              ⚽ Sân chơi chất lượng - Giá cả hợp lý ⚽ - Ưu đãi 15% cho lần đầu
            </Typography>
          </div>
          <Image
            src="/images/fp.png"
            alt="Homepage Image"
            width={600}
            height={600}
            className="object-cover w-auto h-auto max-w-[80%] sm:max-w-[50%]"
          />
        </div>
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            display: { xs: "none", lg: "block" },
            borderColor: "black",
            borderWidth: "1px",
          }}
        />
        <Divider
          orientation="horizontal"
          flexItem
          sx={{
            display: { xs: "block", lg: "none" },
            width: "100%",
            my: 2,
            borderColor: "black",
          }}
        />
        <div className="flex items-center justify-center flex-col gap-y-[1.5rem] w-full lg:max-w-[45%] mx-auto">
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Các sân phổ biến
          </Typography>
          <div className="field-list space-y-[1.5rem] w-full">
            {fields.map((field, index) => (
              <div
                className="field flex space-x-[1rem] items-stretch h-[100px]"
                key={index}
              >
                <div className="relative w-28 h-full flex-shrink-0 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-110">
                  <Image
                    src={field.image}
                    alt={`Ảnh sân ${index + 1}`}
                    fill
                    quality={85}
                    className="object-cover"
                    sizes="(max-width: 768px) 112px, 112px"
                    style={{
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden",
                    }}
                  />
                </div>

                <div className="field-detail flex flex-col justify-between flex-1">
                  <div>
                    <div className="rating flex items-start gap-x-[0.5rem]">
                      {renderStars(field.rating)}
                    </div>
                    <p className="name font-bold text-[1rem] sm:text-[1.2rem]">
                      {field.name}
                    </p>
                    <p className="address font-light text-[0.9rem] sm:text-[1rem]">
                      {field.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-x-[0.5rem]">
                    <div className="bg-blue-600 text-white font-bold rounded-md py-[0.3rem] px-[0.3rem] text-[0.8rem] w-[50px] flex-shrink-0 text-center">
                      {field.score}
                    </div>
                    <div className="field-info font-bold text-[0.9rem] sm:text-[1rem] flex-1 truncate">
                      {field.info}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <motion.div
        ref={searchBarRef}
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={
          searchBarInView
            ? {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 120,
                  damping: 15,
                  duration: 0.5,
                },
              }
            : { opacity: 0, y: 50, scale: 0.95 }
        }
        className="searchBar flex items-center justify-center w-full sm:w-fit mx-auto bg-white rounded-lg shadow-md py-5 px-7 mt-[2rem]"
      >
        <SearchBar inView={searchBarInView} />
      </motion.div>

      {/* Why MTKicks */}
      <motion.div
        ref={whyMtkicksRef}
        initial={{ opacity: 0, y: 50 }}
        animate={
          whyMtkicksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
        }
        transition={{
          duration: 0.8,
          ease: "easeOut",
        }}
        className="why-mtkicks max-w-7xl mt-[2rem] space-y-[2rem] mx-auto w-full"
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "3rem",
            fontSize: { xs: "2rem", md: "3rem" },
          }}
        >
          Tại sao là MTKICKs
        </Typography>
        <div className="card1 flex items-center justify-center flex-wrap mx-auto gap-6 sm:gap-10 lg:gap-20">
          {cardData.slice(0, 3).map((card, index) => (
            <Card
              key={index}
              sx={{
                width: "100%",
                maxWidth: 350,
                height: 250,
                backgroundColor: "#1ea0ff",
              }}
              className="mx-auto flex items-center justify-center flex-col relative overflow-hidden cursor-pointer"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className={`absolute inset-0 bg-[#1ea0ff] transition-transform duration-1200 ease-in-out ${
                    hoveredCard === index ? "translate-y-full" : "translate-y-0"
                  }`}
                />
                <div
                  className={`relative flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out delay-400 ${
                    hoveredCard === index ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <CardContent>
                    <GiSoccerField className="text-white text-[6rem] mx-auto font-black" />
                  </CardContent>
                  <Typography
                    variant="h5"
                    sx={{
                      color: "white",
                      mb: 1.5,
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {card.frontTitle}
                  </Typography>
                </div>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className={`absolute inset-0 bg-white transition-transform duration-800 ease-in-out ${
                    hoveredCard === index
                      ? "translate-y-0"
                      : "-translate-y-full"
                  }`}
                />
                <div
                  className={`relative flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out delay-300 ${
                    hoveredCard === index ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <CardContent>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "black",
                        textAlign: "center",
                        padding: "1rem",
                      }}
                    >
                      {card.backContent}
                    </Typography>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="card2 flex items-center justify-center flex-wrap mx-auto gap-6 sm:gap-10 lg:gap-20">
          {cardData.slice(3, 6).map((card, index) => (
            <Card
              key={index + 3}
              sx={{
                width: "100%",
                maxWidth: 350,
                height: 250,
                backgroundColor: "#1ea0ff",
              }}
              className="mx-auto flex items-center justify-center flex-col relative overflow-hidden cursor-pointer"
              onMouseEnter={() => handleMouseEnter(index + 3)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className={`absolute inset-0 bg-[#1ea0ff] transition-transform duration-1200 ease-in-out ${
                    hoveredCard === index + 3
                      ? "translate-y-full"
                      : "translate-y-0"
                  }`}
                />
                <div
                  className={`relative flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out delay-400 ${
                    hoveredCard === index + 3 ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <CardContent>
                    <GiSoccerField className="text-white text-[6rem] mx-auto font-black" />
                  </CardContent>
                  <Typography
                    variant="h5"
                    sx={{
                      color: "white",
                      mb: 1.5,
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {card.frontTitle}
                  </Typography>
                </div>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className={`absolute inset-0 bg-white transition-transform duration-800 ease-in-out ${
                    hoveredCard === index + 3
                      ? "translate-y-0"
                      : "-translate-y-full"
                  }`}
                />
                <div
                  className={`relative flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out delay-300 ${
                    hoveredCard === index + 3 ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <CardContent>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "black",
                        textAlign: "center",
                        padding: "1rem",
                      }}
                    >
                      {card.backContent}
                    </Typography>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Popular Locations Swiper */}
      <div className="popular-locations mt-[2rem]">
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "3rem",
            fontSize: { xs: "2rem", md: "3rem" },
          }}
        >
          Vị trí sân phổ biến
        </Typography>
        <div className="relative group max-w-7xl mx-auto w-full">
          <Swiper
            modules={[Navigation]}
            spaceBetween={20}
            slidesPerView={1}
            loop={true}
            navigation={{
              nextEl: ".image-swiper-button-next",
              prevEl: ".image-swiper-button-prev",
            }}
            className="px-4 py-4"
          >
            <SwiperSlide>
              <div className="flex items-center flex-wrap mx-auto gap-4 justify-center">
                <div className="flex flex-col gap-4 mx-auto w-full sm:w-auto">
                  {sections.left.map((image, index) => (
                    <div key={index} className="relative w-full sm:w-auto">
                      <img
                        src={image.src}
                        style={{
                          width: "100%",
                          maxWidth: 350,
                          height: sections.left.length === 1 ? "auto" : 190,
                          objectFit: "cover",
                        }}
                        className="mx-auto rounded-md"
                        onLoad={handleImageLoad}
                      />
                      <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white font-bold bg-black bg-opacity-50 px-2 py-1 rounded">
                        {image.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4 mx-auto w-full sm:w-auto">
                  {sections.middle.map((image, index) => (
                    <div key={index} className="relative w-full sm:w-auto">
                      <img
                        src={image.src}
                        style={{
                          width: "100%",
                          maxWidth: 350,
                          height: sections.middle.length === 1 ? "auto" : 190,
                          objectFit: "cover",
                        }}
                        className="mx-auto rounded-md"
                        onLoad={handleImageLoad}
                      />
                      <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white font-bold bg-black bg-opacity-50 px-2 py-1 rounded">
                        {image.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4 mx-auto w-full sm:w-auto">
                  {sections.right.map((image, index) => (
                    <div key={index} className="relative w-full sm:w-auto">
                      <img
                        src={image.src}
                        style={{
                          width: "100%",
                          maxWidth: 350,
                          height: sections.right.length === 1 ? "auto" : 190,
                          objectFit: "cover",
                        }}
                        className="mx-auto rounded-md"
                        onLoad={handleImageLoad}
                      />
                      <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white font-bold bg-black bg-opacity-50 px-2 py-1 rounded">
                        {image.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </SwiperSlide>
          </Swiper>

          <SwiperPrevBtn
            className="image-swiper-button-prev left-2"
            handlePrev={handlePrev}
          />
          <SwiperNextBtn
            className="image-swiper-button-next right-2"
            handleNext={handleNext}
          />
        </div>
      </div>

      {/* Discounts Section */}
      <div
        ref={discountsRef}
        className={`discounts mt-[2rem] ${
          discountsInView ? "animate-fadeSlideUp" : "opacity-0 "
        }`}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "3rem",
            fontSize: { xs: "2rem", md: "3rem" },
          }}
        >
          Ưu đãi hấp dẫn
        </Typography>

        <div className="relative group max-w-7xl mx-auto w-full">
          {realDiscounts.length > 0 ? (
            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              slidesPerView={1}
              loop={true}
              onSwiper={(swiper) => setDiscountSwiper(swiper)}
              className="pb-8"
            >
              {discountSlides.map((slide, slideIndex) => (
                <SwiperSlide key={slideIndex}>
                  <div className="flex items-center flex-wrap justify-center gap-6">
                    {slide.map((discount) => (
                      <Card
                        key={discount.id}
                        sx={{
                          width: "100%",
                          maxWidth: 350,
                          height: 320,
                          backgroundColor: "white",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                        className="flex flex-col relative overflow-hidden mx-auto rounded-lg transition-transform hover:scale-105"
                      >
                        <div className="w-full h-[55%] overflow-hidden relative">
                          <img
                            src={discount.displayImage}
                            className="w-full h-full object-cover object-center"
                            alt={discount.code}
                          />
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                            {discount.discountType === "PERCENTAGE"
                              ? `-${discount.value}%`
                              : `-${discount.value}k`}
                          </div>
                        </div>
                        <CardContent
                          sx={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                            padding: "1rem",
                            width: "100%",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                color: "#000",
                                marginBottom: "0.2rem",
                                fontSize: "1.1rem",
                              }}
                            >
                              {discount.displayText}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Code:{" "}
                              <span className="font-mono font-bold text-blue-600">
                                {discount.code}
                              </span>
                            </Typography>
                            {discount.minOrderValue && (
                              <Typography
                                variant="caption"
                                display="block"
                                color="text.secondary"
                              >
                                Đơn tối thiểu:{" "}
                                {discount.minOrderValue.toLocaleString()}đ
                              </Typography>
                            )}
                          </div>

                          <Button
                            onClick={() => handleSaveDiscount(discount.code)}
                            variant="contained"
                            fullWidth
                            sx={{
                              backgroundColor: "#ff0000",
                              color: "#ffffff",
                              fontWeight: "bold",
                              textTransform: "none",
                              marginTop: "1rem",
                              "&:hover": { backgroundColor: "#cc0000" },
                            }}
                          >
                            Lưu mã ngay
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="text-center text-gray-500 py-10">
              Hiện chưa có mã giảm giá nào.
            </div>
          )}

          <SwiperPrevBtn
            className="discount-swiper-button-prev left-[-1rem]"
            handlePrev={() => discountSwiper?.slidePrev()}
          />
          <SwiperNextBtn
            className="discount-swiper-button-next right-[-1rem]"
            handleNext={() => discountSwiper?.slideNext()}
          />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="flex gap-x-[2rem] max-w-7xl w-full px-4 mt-[2rem] flex-col mx-auto">
        <div
          ref={reviewsRef}
          className={`reviews mt-[2rem] ${
            reviewsInView ? "animate-fadeSlideUp" : "opacity-0 "
          }`}
        >
          <div className="flex items-center justify-center mb-[2rem] relative">
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                textAlign: "center",
                fontSize: { xs: "2rem", md: "3rem" },
              }}
            >
              Nhận xét
            </Typography>
            <div className="flex items-end icons absolute right-4 gap-[1rem] sm:gap-[1.5rem]">
              <div
                className={`rounded-full bg-gray-200 flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto ${
                  currentPage === 0 ? "opacity-50" : "cursor-pointer"
                }`}
                onClick={handlePrevRe}
              >
                <MdKeyboardArrowLeft className="text-[2rem] sm:text-[2.5rem]" />
              </div>
              <div
                className={`rounded-full bg-gray-200 flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto ${
                  endIndex >= reviewsData.length
                    ? "opacity-50 "
                    : "cursor-pointer"
                }`}
                onClick={handleNextRe}
              >
                <MdKeyboardArrowRight className="text-[2rem] sm:text-[2.5rem]" />
              </div>
            </div>
          </div>
          <div className="reviews-cards space-y-[2rem]">
            <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-[1rem]">
              {currentReviews.map((review, index) => (
                <Card
                  key={index}
                  sx={{
                    width: "100%",
                    maxWidth: { xs: "100%", sm: "250px" },
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
      </div>
    </motion.div>
  );
};

export default Home;
