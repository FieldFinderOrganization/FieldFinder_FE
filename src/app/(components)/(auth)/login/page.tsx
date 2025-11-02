"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaEye } from "react-icons/fa";
import { LuEyeClosed } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../redux/store";
import { loginStart, loginSuccess } from "../../../../redux/features/authSlice";
import { login, loginSocial } from "../../../../services/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  FacebookAuthProvider,
} from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { forgotPassword, googleLogin } from "@/services/firebaseAuth";
import { auth } from "@/services/firebaseAuth";
import ForgotPasswordModal from "@/utils/forgotPasswordModal";
import OtpModal from "@/utils/otpModal";
import { sendOtp } from "@/services/otpservice";

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const MIN_PASSWORD_LENGTH = 6;

const Login: React.FC = () => {
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (!value) {
      setEmailError("Email không được để trống.");
    } else if (!isValidEmail(value)) {
      setEmailError("Định dạng email không hợp lệ.");
    } else {
      setEmailError(null);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (!value) {
      setPasswordError("Mật khẩu không được để trống.");
    } else if (value.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(
        `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`
      );
    } else {
      setPasswordError(null);
    }
  };

  const isFormInvalid = useMemo(() => {
    const hasError = emailError !== null || passwordError !== null;
    const isMissingField = !email || !password;
    return hasError || isMissingField;
  }, [email, password, emailError, passwordError]);

  const handleShowPassword = (): void => {
    setShowPassword((prev) => !prev);
  };

  const [isOtpOpen, setIsOtpOpen] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isFormInvalid) {
      if (!email || !password) {
        toast.error("Vui lòng nhập đủ Email và Mật khẩu!");
      } else if (emailError || passwordError) {
        toast.error("Vui lòng sửa các lỗi trong form.");
      }
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      const res = await login(idToken);

      if (res?.data?.user) {
        await sendOtp(email);
        toast.info("OTP đã được gửi tới email của bạn!");
        setIsOtpOpen(true);
      } else {
        toast.error("Đăng nhập không thành công. Vui lòng thử lại!");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Login error:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        toast.error("Sai email hoặc mật khẩu!");
      } else if (error.code === "auth/too-many-requests") {
        toast.error(
          "Tài khoản bị tạm khóa do quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau."
        );
      } else if (error.response?.status === 401) {
        toast.error("Tài khoản không tồn tại. Vui lòng đăng ký.");
      } else if (error.response?.status === 403) {
        toast.error("Tài khoản của bạn đã bị khóa.");
      } else {
        toast.error("Đăng nhập thất bại, vui lòng thử lại.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { idToken, user } = await googleLogin();
      const res = await login(idToken);

      if (res && res.data) {
        const email = res.data.user.email;

        if (email) {
          await sendOtp(email);
          toast.info(`OTP đã được gửi tới email ${email}`);
          setEmail(email);
          setIsOtpOpen(true);
        } else {
          toast.error("Không tìm thấy email từ Google.");
          setLoading(false);
        }
      }
    } catch (err: any) {
      console.error("Google login error:", err);

      if (err.code === "auth/popup-closed-by-user") {
        toast.info("Bạn đã đóng cửa sổ đăng nhập Google.");
      } else if (err.code === "auth/cancelled-popup-request") {
        toast.info("Đang có một cửa sổ đăng nhập khác, vui lòng thử lại.");
      } else {
        toast.error("Đăng nhập Google thất bại");
      }

      toast.error("Đăng nhập Google thất bại");
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    signInWithRedirect(auth, provider);
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
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="Điền email của bạn"
                className={`w-full px-5 py-2 border rounded-lg ${
                  emailError ? "border-red-500" : ""
                }`}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>
            <div className="pass relative">
              <label className="block text-sm font-medium mb-2">Mật khẩu</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Điền mật khẩu của bạn"
                className={`w-full px-5 py-2 border rounded-lg ${
                  passwordError ? "border-red-500" : ""
                }`}
              />
              {showPassword ? (
                <LuEyeClosed
                  className="absolute top-[68%] right-3 transform -translate-y-1/2 cursor-pointer text-[1.2rem]"
                  onClick={handleShowPassword}
                />
              ) : (
                <FaEye
                  className="absolute top-[68%] right-3 transform -translate-y-1/2 cursor-pointer text-[1.2rem]"
                  onClick={handleShowPassword}
                />
              )}
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
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
                  onClick={() => router.push("/signup")}
                >
                  Đăng ký ngay →
                </motion.span>
              </p>
              <p
                className="text-red-500 font-bold cursor-pointer mt-1 text-xl"
                onClick={() => setIsForgotOpen(true)}
              >
                Quên mật khẩu?
              </p>
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center gap-2 border px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100 w-full justify-center mt-4"
            >
              <img src="/GG.png" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
          </div>
        </div>
      </form>

      <OtpModal
        email={email}
        isOpen={isOtpOpen}
        onClose={() => {
          setIsOtpOpen(false);
          setLoading(false);
        }}
        onSuccess={(token) => {
          localStorage.setItem("token", token);
          toast.success("Đăng nhập thành công!");
        }}
      />

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />

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
