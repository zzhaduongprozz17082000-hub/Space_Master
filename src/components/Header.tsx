import React from 'react';
import firebase from 'firebase/compat/app';
import { UserIcon, SearchIcon } from './icons';

interface HeaderProps {
    user: firebase.User;
    handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, handleLogout }) => {
    return (
        <header className="main-header">
            <div className="search-bar">
                <span className="search-icon"><SearchIcon /></span>
                <input type="text" placeholder="Search in Drive" className="search-input" />
            </div>
            <div className="header-controls">
                <div className="user-profile">
                    <span>{user.displayName || user.email}</span>
                    <UserIcon />
                    <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                </div>
            </div>
        </header>
    );
};

export default Header;
