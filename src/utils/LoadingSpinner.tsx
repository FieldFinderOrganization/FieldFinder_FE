"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  fullScreen?: boolean; // Nếu true sẽ hiển thị che toàn màn hình (dùng cho PersistGate)
  size?: number; // Kích thước (px)
  color?: string; // Màu sắc (class tailwind hoặc mã màu)
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  size = 40,
  color = "border-red-600", // Màu chủ đạo (theo code Login của bạn)
}) => {
  // Config animation xoay vòng
  const spinTransition = {
    repeat: Infinity,
    ease: "linear",
    duration: 1, // Thời gian 1 vòng xoay
  };

  // Component Spinner cốt lõi
  const SpinnerCore = (
    <motion.div
      className={`relative rounded-full border-4 border-t-transparent ${color}`}
      style={{
        width: size,
        height: size,
        borderColor: "rgba(0,0,0,0.1)", // Màu viền mờ
        borderTopColor: "currentColor", // Màu viền chính (sẽ lấy từ class text-... hoặc style)
      }}
      animate={{ rotate: 360 }}
      transition={spinTransition}
    >
      {/* (Tuỳ chọn) Thêm một chấm tròn nhỏ xoay cùng cho đẹp */}
      <div className="absolute top-0 left-0 w-full h-full rotate-45">
        <div className="w-2 h-2 bg-red-600 rounded-full absolute top-[-4px] left-[50%] -translate-x-1/2 shadow-md"></div>
      </div>
    </motion.div>
  );

  // Nếu là chế độ Full Screen (cho PersistGate)
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-red-600">{SpinnerCore}</div>
        <p className="mt-4 text-gray-600 font-medium animate-pulse">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  // Chế độ thường (nhúng vào button hoặc div nhỏ)
  return <div className="text-red-600">{SpinnerCore}</div>;
};

export default LoadingSpinner;
