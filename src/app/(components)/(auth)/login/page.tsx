"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaEye } from "react-icons/fa";
import { LuEyeClosed } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../redux/store";
import { loginStart, loginSuccess } from "../../../../redux/features/authSlice";
import { login } from "../../../../services/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/services/firebaseConfig";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleShowPassword = (): void => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      // console.log("👉 Email:", email, "👉 Password:", password);

      // 🔹 Login với Firebase (Email/Password)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 🔹 Lấy Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      // 🔹 Gửi idToken sang BE
      const res = await login(idToken);

      if (res && res.data && res.data.user) {
        const userData = {
          userId: res.data.user.userId,
          name: res.data.user.name,
          email: res.data.user.email,
          phone: res.data.user.phone,
          role: res.data.user.role,
          cardNumber: "",
          bank: "",
          providerId: "",
          addresses: [] as { providerAddressId: string; address: string }[],
        };

        // 🔹 Lưu vào Redux + localStorage
        dispatch(loginSuccess(userData));
        localStorage.setItem("authState", JSON.stringify({ user: userData }));

        toast.success("Đăng nhập thành công");

        // 🔹 Redirect theo role
        switch (userData.role) {
          case "USER":
            router.push("/home");
            break;
          case "PROVIDER":
            router.push("/profile");
            break;
          case "ADMIN":
            router.push("/dashboard");
            break;
          default:
            router.push("/home");
        }
      } else {
        toast.error("Phản hồi từ server không hợp lệ");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === "auth/invalid-email") {
        toast.error("Email không hợp lệ");
      } else if (error.code === "auth/user-not-found") {
        toast.error("Tài khoản không tồn tại");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Sai mật khẩu");
      } else {
        toast.error("Đăng nhập thất bại");
      }
    }
  };

  const provider = new GoogleAuthProvider();

  const handleGoogleLogin = () => {
    signInWithRedirect(auth, provider);
  };

  // Ở useEffect hoặc khi component load
  useEffect(() => {
    const checkLogin = async () => {
      const result = await getRedirectResult(auth);
      if (result) {
        const idToken = await result.user.getIdToken();
        const res = await login(idToken);
        if (res && res.data) {
          toast.success("Đăng nhập Google thành công");
        }
      }
    };
    checkLogin();
  }, []);

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
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center gap-2 border px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100 w-full justify-center mt-4"
            >
              <img src="/GG2.png" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
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
