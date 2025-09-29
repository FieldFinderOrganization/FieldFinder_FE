import { auth } from "@/services/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth";

export const googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  // Lấy ID token từ Firebase để gửi về BE
  const idToken = await result.user.getIdToken();
  return {
    idToken,
    user: result.user,
  };
};

export const forgotPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email, {
    url: "http://localhost:3000/login",
    handleCodeInApp: true,
  });
};
