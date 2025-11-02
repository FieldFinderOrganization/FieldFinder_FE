"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { verifyOtp } from "@/services/otpservice";
import { toast } from "react-toastify";
import { login } from "@/services/auth";
import { auth } from "@/services/firebaseAuth";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/redux/features/authSlice";
import { useRouter } from "next/navigation";

interface OtpModalProps {
  email: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

const OtpModal: React.FC<OtpModalProps> = ({
  email,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!otp) return toast.error("Vui lòng nhập mã OTP");
    setLoading(true);

    try {
      await verifyOtp(email, otp);

      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        toast.error("Không thể lấy token từ Firebase!");
        setLoading(false);
        return;
      }

      const res = await login(idToken);

      if (res.data && res.data.user) {
        const u = res.data.user;

        const userData = {
          userId: u.userId || "",
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          role: u.role || "",
        };

        dispatch(loginSuccess(userData));
        localStorage.setItem("authState", JSON.stringify({ user: userData }));

        onSuccess(idToken);
        onClose();
        router.push("/home");
      } else {
        toast.error("Phản hồi từ server không hợp lệ!");
      }
    } catch (err) {
      toast.error("OTP không hợp lệ hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-6 shadow-xl w-[350px]"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Nhập mã OTP</h2>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Nhập mã OTP 6 số"
          className="border rounded-lg px-4 py-2 w-full mb-4"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className={`${
            loading ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
          } text-white px-4 py-2 rounded-lg w-full cursor-pointer`}
        >
          {loading ? "Đang xác thực..." : "Xác nhận"}
        </button>

        <p
          onClick={onClose}
          className="text-center text-gray-500 text-sm mt-3 cursor-pointer hover:underline"
        >
          Hủy
        </p>
      </motion.div>
    </div>
  );
};

export default OtpModal;
