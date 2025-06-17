"use client";

import React, { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { FaEye } from "react-icons/fa";
import { LuEyeClosed } from "react-icons/lu";
import { Checkbox } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../../redux/store";
import {
  loginStart,
  loginSuccess,
  update,
} from "../../../../redux/features/authSlice";
import { login } from "../../../../services/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { getAddress, getProvider } from "@/services/provider";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleShowPassword = (): void => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const res = await login(email, password);
      if (res && res.data) {
        let userData = {
          userId: res.data.userId,
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          role: res.data.role,
          cardNumber: "",
          bank: "",
          providerId: "",
          addresses: [] as { providerAddressId: string; address: string }[],
        };
        if (res.data.role === "PROVIDER") {
          try {
            const providerRes = await getProvider(res.data.userId);
            if (providerRes && providerRes.providerId) {
              userData = {
                ...userData,
                cardNumber: providerRes.cardNumber || "",
                bank: providerRes.bank || "",
                providerId: providerRes.providerId || "",
              };
            } else {
              // console.log(
              //   "Không có thông tin provider hợp lệ, bỏ qua cập nhật."
              // );
            }
            const addressRes = await getAddress(providerRes.providerId);
            userData = {
              ...userData,
              addresses: addressRes.map((addr) => ({
                providerAddressId: addr.providerAddressId,
                address: addr.address,
              })),
            };
          } catch (providerError) {
            console.error("Lỗi khi lấy thông tin provider:", providerError);
          }
        }
        dispatch(loginSuccess(userData));
        localStorage.setItem("authState", JSON.stringify({ user: userData }));
        toast.success("Đăng nhập thành công");

        switch (userData.role) {
          case "USER": {
            router.push("/home");
            break;
          }
          case "PROVIDER": {
            router.push("/profile");
            break;
          }
          case "ADMIN": {
            router.push("/dashboard");
            break;
          }
          default:
            router.push("/home");
        }
      }
    } catch (error) {
      toast.error("Đăng nhập thất bại");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.5 }}
      className="h-screen flex"
    >
      <form
        className="w-1/2 min-h-screen flex items-center justify-center bg-white p-4"
        onSubmit={handleSubmit}
      >
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Xin chào</h1>
            <p className="text-gray-600">
              Chào mừng bạn trở lại! Hãy đăng nhập ngay nhé!
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Điền email của bạn"
                className="w-full px-5 py-2 border rounded-lg"
              />
            </div>
            <div className="pass relative">
              <label className="block text-sm font-medium mb-2">Mật khẩu</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Điền mật khẩu của bạn"
                className="w-full px-5 py-2 border rounded-lg"
              />
              {showPassword ? (
                <LuEyeClosed
                  className="absolute top-[70%] right-3 transform -translate-y-1/2 cursor-pointer text-[1.2rem]"
                  onClick={handleShowPassword}
                />
              ) : (
                <FaEye
                  className="absolute top-[70%] right-3 transform -translate-y-1/2 cursor-pointer text-[1.2rem]"
                  onClick={handleShowPassword}
                />
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-red-600 text-white px-5 py-2 rounded-lg font-bold text-center cursor-pointer hover:bg-red-700 disabled:bg-gray-400"
            >
              {" "}
              Đăng nhập
            </motion.button>
            <div className="footer mt-[0.4rem] text-center">
              <p className="text-xl">
                Bạn chưa có tài khoản?{" "}
                <motion.span
                  className="text-purple-600 font-bold cursor-pointer ml-[0.5rem]"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/signin")}
                >
                  Đăng ký ngay →
                </motion.span>
              </p>
            </div>
          </div>
        </div>
      </form>

      <div className="w-1/2 h-screen relative overflow-hidden bg-container">
        <motion.img
          src="/images/login.jpg"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};

export default Login;
