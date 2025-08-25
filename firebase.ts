// Import các hàm cần thiết từ Firebase SDK
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

// TODO: Thay thế đối tượng sau bằng cấu hình project Firebase của bạn
// Bạn có thể lấy thông tin này từ Firebase Console:
// Project settings > General > Your apps > SDK setup and configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCH4k-wwmAGCKpV3K7L3RnxiRQvOTjyZKY",
  authDomain: "bspace-740d7.firebaseapp.com",
  projectId: "bspace-740d7",
  storageBucket: "bspace-740d7.firebasestorage.app",
  messagingSenderId: "659259162192",
  appId: "1:659259162192:web:f5a2113486573e6dcedb55",
  measurementId: "G-9KQ19MNWRN"
};

// Khởi tạo Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


// Khởi tạo và export các dịch vụ Firebase bạn muốn sử dụng
export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;