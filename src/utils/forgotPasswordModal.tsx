"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { forgotPassword } from "@/services/firebaseAuth";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");

  const handleSendEmail = async () => {
    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    try {
      await forgotPassword(email);
      toast.success("Email đặt lại mật khẩu đã được gửi!");
      onClose();
    } catch (err: any) {
      //   console.error(err);
      if (err.code === "auth/user-not-found") {
        toast.error("Email này chưa được đăng ký");
      } else if (err.code === "auth/invalid-email") {
        toast.error("Email không hợp lệ");
      } else {
        toast.error("Gửi email thất bại");
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-lg p-6 w-[400px]"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Quên mật khẩu</h2>
        <p className="text-gray-600 text-sm mb-4 text-center">
          Nhập email của bạn để nhận link đặt lại mật khẩu
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Điền email của bạn"
          className="w-full px-4 py-2 border rounded-lg mb-4"
        />
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSendEmail}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
          >
            Gửi email
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordModal;
