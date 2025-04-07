import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig"; // Assuming firebaseConfig is in a separate file

// 클라이언트 사이드에서만 Firebase 초기화
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let _db: Firestore | undefined; // 밑줄 추가

// 클라이언트 사이드에서만 실행
if (typeof window !== "undefined") {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    _db = getFirestore(app); // 밑줄 추가
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    console.error("Firebase Config:", JSON.stringify(firebaseConfig, null, 2));
  }
}

export { app, auth, _db as db }; // 내보낼 때 이름 변경
