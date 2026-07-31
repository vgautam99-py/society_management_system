import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAqkBtnL01heXeV8Gi66V1RfgJyESfjpXM",
  authDomain: "apps-83831.firebaseapp.com",
  projectId: "apps-83831",
  storageBucket: "apps-83831.firebasestorage.app",
  messagingSenderId: "1052325363929",
  appId: "1:1052325363929:web:d1c220d646fd63695f3ec8",
  measurementId: "G-RYPRMMSN2K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
