// Import các hàm cần thiết từ Firebase SDK
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

// TODO: Thay thế đối tượng sau bằng cấu hình project Firebase của bạn
// Bạn có thể lấy thông tin này từ Firebase Console:
// Project settings > General > Your apps > SDK setup and configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqVHi4MqllhOXUdLZxmqR_Wqu7pbPtY9g",
  authDomain: "space-master-701f9.firebaseapp.com",
  projectId: "space-master-701f9",
  storageBucket: "space-master-701f9.firebasestorage.app",
  messagingSenderId: "648794372233",
  appId: "1:648794372233:web:776b4733e4cb2cb5c56e58",
  measurementId: "G-EVT2JTXL78"
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