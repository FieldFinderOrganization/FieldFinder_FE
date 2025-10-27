import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCMTDFqqGcOy-ewVn5yjbKPzKPJ4oyMIxM",
  authDomain: "fieldfinder-c3a4b.firebaseapp.com",
  projectId: "fieldfinder-c3a4b",
  storageBucket: "fieldfinder-c3a4b.firebasestorage.app",
  messagingSenderId: "306952863181",
  appId: "1:306952863181:web:7f105b610291b67f6ad884",
  measurementId: "G-0JF0QSMVSH",
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  return { user: result.user, idToken };
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
