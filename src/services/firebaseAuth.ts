import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  UserCredential,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCMTDFqqGcOy-ewVn5yjbKPzKPJ4oyMIxM",
  authDomain: "fieldfinder-c3a4b.firebaseapp.com",
  projectId: "fieldfinder-c3a4b",
  storageBucket: "fieldfinder-c3a4b.firebasestorage.app",
  messagingSenderId: "306952863181",
  appId: "1:306952863181:web:7f105b610291b67f6ad884",
  measurementId: "G-0JF0QSMVSH",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result: UserCredential = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    return {
      idToken,
      user: result.user,
    };
  } catch (error: any) {
    console.error("Google login error:", error);
    throw new Error(error.message || "Đăng nhập Google thất bại");
  }
};

export const facebookLogin = async () => {
  try {
    const provider = new FacebookAuthProvider();
    const result: UserCredential = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    return {
      idToken,
      user: result.user,
    };
  } catch (error: any) {
    console.error("Facebook login error:", error);
    throw new Error(error.message || "Đăng nhập Facebook thất bại");
  }
};

export const forgotPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: "http://localhost:3000/login",
      handleCodeInApp: true,
    });
    console.log("Đã gửi email reset mật khẩu tới:", email);
  } catch (error: any) {
    console.error("Lỗi gửi email reset mật khẩu:", error);
    throw new Error("Không thể gửi email đặt lại mật khẩu");
  }
};

export const logoutFirebase = async () => {
  try {
    await signOut(auth);
    console.log("Đã đăng xuất Firebase");
  } catch (error: any) {
    console.error("Lỗi khi đăng xuất:", error);
  }
};
