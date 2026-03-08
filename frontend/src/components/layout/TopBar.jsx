import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './TopBar.css';

const TopBar = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="topbar">
            {/* Hamburger (mobile only) */}
            <button className="topbar-hamburger" onClick={toggleSidebar}>
                ☰
            </button>

            {/* Search */}
            <div className="topbar-search">
                <span className="topbar-search-icon">🔍</span>
                <input type="text" placeholder="Search orders, inventory..." />
            </div>

            {/* Right side */}
            <div className="topbar-right">
                {/* Notifications */}
                <button className="topbar-icon-btn" title="Notifications">
                    🔔
                    <span className="topbar-notification-dot"></span>
                </button>

                <div className="topbar-divider"></div>

                {/* User profile */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                    <div
                        className="topbar-user"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <div className="topbar-user-info">
                            <div className="topbar-user-name">{user?.name || 'User'}</div>
                            <div className="topbar-user-role">{user?.role || 'Staff'}</div>
                        </div>
                        <div className="topbar-avatar">{getInitials(user?.name)}</div>
                    </div>

                    {/* Dropdown */}
                    {dropdownOpen && (
                        <div className="topbar-dropdown">
                            <button className="topbar-dropdown-item">
                                👤 My Profile
                            </button>
                            <button className="topbar-dropdown-item">
                                ⚙️ Settings
                            </button>
                            <button
                                className="topbar-dropdown-item danger"
                                onClick={logout}
                            >
                                🚪 Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
