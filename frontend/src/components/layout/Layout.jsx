import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './Layout.css';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="layout">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className={`layout-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <TopBar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="layout-content">
                    <Outlet />
                </main>
            </div>

            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;
