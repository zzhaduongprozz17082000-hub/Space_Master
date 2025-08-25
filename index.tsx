import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import firebase from 'firebase/compat/app';
import { auth, firestore } from './firebase';
import Auth from './components/Auth';
import MySpace from './pages/MySpace';
import './index.css';

const App: React.FC = () => {
    const [user, setUser] = useState<firebase.User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                try {
                    const userRef = firestore.collection('users').doc(currentUser.uid);
                    await userRef.set({
                        email: currentUser.email,
                        uid: currentUser.uid,
                    }, { merge: true });
                } catch (error) {
                    console.error("Lỗi khi cập nhật thông tin người dùng:", error);
                }
            }
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
        }
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    if (user) {
      return <MySpace user={user} handleLogout={handleLogout} />
    }
    
    return (
        <main>
            <header>
                <h1>Space Master</h1>
                <p>Nền tảng lưu trữ đám mây cá nhân của bạn.</p>
            </header>
            <Auth />
        </main>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error('Không tìm thấy phần tử gốc (root element).');
}
