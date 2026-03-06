import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navSections = [
    {
        title: 'Operations',
        links: [
            { to: '/', icon: '📊', label: 'Dashboard' },
            { to: '/orders', icon: '📋', label: 'Orders', badge: null },
            { to: '/inventory', icon: '📦', label: 'Inventory' },
            { to: '/vehicles', icon: '🚛', label: 'Vehicles' },
            { to: '/trips', icon: '🗺️', label: 'Trips' },
        ],
    },
    {
        title: 'System',
        links: [
            { to: '/administration', icon: '⚙️', label: 'Administration' },
            { to: '/reports', icon: '📈', label: 'Reports' },
        ],
    },
];

const Sidebar = () => {
    return (
        <aside className="sidebar">
            {/* Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">🏗️</div>
                <span className="sidebar-brand-text">ERP-RMC</span>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navSections.map((section) => (
                    <div className="sidebar-section" key={section.title}>
                        <div className="sidebar-section-title">{section.title}</div>
                        {section.links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.to === '/'}
                                className={({ isActive }) =>
                                    `sidebar-link${isActive ? ' active' : ''}`
                                }
                            >
                                <span className="sidebar-link-icon">{link.icon}</span>
                                {link.label}
                                {link.badge && (
                                    <span className="sidebar-link-badge">{link.badge}</span>
                                )}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="sidebar-footer-version">RMC ERP v1.0</div>
            </div>
        </aside>
    );
};

export default Sidebar;
