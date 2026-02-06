import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDnwwfQ1kaSKy-Ye_UjR0JXtIdZfai70to",
    authDomain: "meerantimes-6fc10.firebaseapp.com",
    projectId: "meerantimes-6fc10",
    storageBucket: "meerantimes-6fc10.firebasestorage.app",
    messagingSenderId: "911536399955",
    appId: "1:911536399955:web:d32c7ba64e2c98732808a6",
    measurementId: "G-Y2XFWCTNQ8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
