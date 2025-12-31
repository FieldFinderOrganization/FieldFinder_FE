/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { FaEye } from "react-icons/fa";
import { LuEyeClosed } from "react-icons/lu";
import { register } from "../../../../services/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Box } from "@mui/material";
import { addProvider } from "@/services/provider";

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

const Signup: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [role, setRole] = useState<string>("USER");
  const [status, setStatus] = useState("ACTIVE");
  const router = useRouter();

  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleShowPassword = (): void => {
    setShowPassword((prev) => !prev);
  };

  const handleChangeRole = (event: SelectChangeEvent) => {
    setRole(event.target.value as string);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Vui lòng nhập tên của bạn.";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập email.";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email không đúng định dạng.";
      isValid = false;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại.";
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = "SĐT không hợp lệ (VD: 0901234567).";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu.";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    const user = { name, email, phone, password, role, status };
    try {
      const res = await register(user);
      if (res && res.data) {
        if (res.data.role === "PROVIDER") {
          const providerData = {
            cardNumber: "",
            bank: "",
          };
          await addProvider(providerData, res.data.userId);
        }

        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        router.push("/login");
      } else {
        toast.error("Đăng ký thất bại");
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Đăng ký thất bại. Vui lòng thử lại sau.");
      }
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="h-screen flex"
    >
      <div className="w-1/2 h-screen relative overflow-hidden bg-container">
        <motion.img
          src="/images/field2.jpg"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>

      <form
        className="w-1/2 min-h-screen flex items-center justify-center bg-white p-4"
        onSubmit={handleSubmit}
      >
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-[400px]"
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Xin chào</h1>
            <p className="text-gray-600">
              Chào mừng bạn! Hãy đăng ký ngay nhé!
            </p>
          </div>

          <div className="space-y-4">
            <div className="name-email flex items-start gap-x-[1rem]">
              <div className="name w-1/2">
                <label className="block text-sm mb-2 font-medium">Tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined }); // Xóa lỗi khi user nhập lại
                  }}
                  placeholder="Điền tên của bạn"
                  className={`w-full px-5 py-2 border rounded-lg outline-none ${
                    errors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div className="email w-1/2">
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email)
                      setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="Điền email của bạn"
                  className={`w-full px-5 py-2 border rounded-lg outline-none ${
                    errors.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="phone-pass flex items-start gap-x-[1rem] mb-[1.5rem]">
              <div className="phone w-1/2">
                <label className="block text-sm mb-2 font-medium">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone)
                      setErrors({ ...errors, phone: undefined });
                  }}
                  placeholder="Điền số điện thoại"
                  className={`w-full px-5 py-2 border rounded-lg outline-none ${
                    errors.phone
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div className="pass w-1/2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Mật khẩu</label>
                  {showPassword ? (
                    <LuEyeClosed
                      className="cursor-pointer text-[1.2rem]"
                      onClick={handleShowPassword}
                    />
                  ) : (
                    <FaEye
                      className="cursor-pointer text-[1.2rem]"
                      onClick={handleShowPassword}
                    />
                  )}
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="Điền mật khẩu"
                  className={`w-full px-5 py-2 border rounded-lg outline-none ${
                    errors.password
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
            </div>

            <Box className="role">
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Bạn là?</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={role}
                  label="Bạn là?"
                  onChange={handleChangeRole}
                  sx={{ width: "100%" }}
                >
                  <MenuItem value={"USER"}>Người dùng</MenuItem>
                  <MenuItem value={"PROVIDER"}>Chủ sân</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <div className="footer">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                name="Signup"
                className="w-full bg-red-600 text-white px-5 py-2 rounded-lg font-bold text-center cursor-pointer hover:bg-red-700"
              >
                Đăng ký
              </motion.button>
              <div className="mt-[1rem] text-center">
                <p className="text-xl">
                  Bạn đã có tài khoản?{" "}
                  <motion.span
                    className="text-purple-600 font-bold cursor-pointer ml-[0.5rem]"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/login")}
                  >
                    Đăng nhập ngay →
                  </motion.span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default Signup;
