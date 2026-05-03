import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAnQOF5PLxh-Q3ffG0QqmLn9uxW1VDHOFw",
  authDomain: "health-37caa.firebaseapp.com",
  databaseURL: "https://health-37caa-default-rtdb.firebaseio.com",
  projectId: "health-37caa",
  storageBucket: "health-37caa.firebasestorage.app",
  messagingSenderId: "176669098529",
  appId: "1:176669098529:web:a61d79a5e9514ca8749960"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
