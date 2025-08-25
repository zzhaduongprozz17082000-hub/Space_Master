import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import firebase from 'firebase/compat/app';
import { User } from 'firebase/auth';
import { auth } from './firebase';
import Auth from './Auth';
import './index.css';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        // Cleanup subscription on unmount
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

    return (
        <main>
            <header>
                <h1>Space Master</h1>
                <p>Nền tảng lưu trữ đám mây cá nhân của bạn.</p>
            </header>
            
            {user ? (
                <div className="content-area">
                    <p className="welcome-message">Chào mừng, {user.email}!</p>
                    {/* Các component cho trình duyệt file sẽ được thêm vào đây */}
                    <button onClick={handleLogout} className="button">Đăng xuất</button>
                </div>
            ) : (
                <Auth />
            )}
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
