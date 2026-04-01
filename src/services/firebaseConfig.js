import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 🔐 Your Firebase config (safe to keep in frontend)
const firebaseConfig = {
  apiKey: "AIzaSyDPGwyEOFBBHMtaoxQgdHqeAtIhaPf_1y0",
  authDomain: "skill-hub-f58ce.firebaseapp.com",
  projectId: "skill-hub-f58ce",
  storageBucket: "skill-hub-f58ce.firebasestorage.app",
  messagingSenderId: "676736161120",
  appId: "1:676736161120:web:2d690863b0bb55de07fa05",
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔑 Initialize Auth
const auth = getAuth(app);

export { app, auth };