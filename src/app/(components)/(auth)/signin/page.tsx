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
import { useDispatch } from "react-redux";
import { registerSuccess } from "@/redux/features/authSlice";

const Signin: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [role, setRole] = useState<string>("USER");
  const router = useRouter();
  const dispatch = useDispatch();

  const handleShowPassword = (): void => {
    setShowPassword((prev) => !prev);
  };

  const handleChangeRole = (event: SelectChangeEvent) => {
    setRole(event.target.value as string);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const user = { name, email, phone, password, role };
    try {
      const res = await register(user);
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
          const providerData = {
            cardNumber: "",
            bank: "",
          };
          const providerRes = await addProvider(providerData, res.data.userId);
          if (providerRes && providerRes.providerId) {
            userData = {
              ...userData,
              providerId: providerRes.providerId,
            };
          }
        }
        dispatch(registerSuccess(userData));

        toast.success("Đăng ký thành công");
        router.push("/login");
      } else {
        toast.error("Đăng ký thất bại");
      }
    } catch (error) {
      toast.error("Đăng ký thất bại");
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
            <div className="name-email flex items-center gap-x-[1rem]">
              <div className="name">
                <label className="block text-sm mb-2 font-medium">Tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Điền tên của bạn"
                  className="w-full px-5 py-2 border rounded-lg"
                />
              </div>
              <div className="email">
                <label className="block text font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Điền email của bạn"
                  className="w-full px-5 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="phone-pass flex items-center gap-x-[1rem] mb-[1.5rem]">
              <div className="phone">
                <label className="block text-sm mb-2 font-medium">
                  Số điện thoại
                </label>
                <input
                  type="string"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Điền số điện thoại"
                  className="w-full px-5 py-2 border rounded-lg"
                />
              </div>
              <div className="pass">
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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Điền mật khẩu"
                  className="w-full px-5 py-2 border rounded-lg"
                />
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
                  <MenuItem value={"PROVIDER"}>Nhà cung cấp</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <div className="footer">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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

export default Signin;
