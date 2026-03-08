import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

const navSections = [
    {
        title: 'Operations',
        links: [
            { to: '/', icon: '📊', label: 'Dashboard' },
            { to: '/orders', icon: '📋', label: 'Orders' },
            { to: '/inventory', icon: '📦', label: 'Inventory' },
            { to: '/vehicles', icon: '🚛', label: 'Vehicles' },
            { to: '/trips', icon: '🗺️', label: 'Trips' },
        ],
    },
];

const adminSubLinks = [
    { to: '/administration/security-roles', label: 'Security Roles' },
    { to: '/administration/users', label: 'Users' },
    { to: '/administration/settings', label: 'System Settings' },
];

const Sidebar = () => {
    const location = useLocation();
    const isAdminActive = location.pathname.startsWith('/administration');
    const [adminOpen, setAdminOpen] = useState(isAdminActive);

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
                            </NavLink>
                        ))}
                    </div>
                ))}

                {/* System section with expandable Administration */}
                <div className="sidebar-section">
                    <div className="sidebar-section-title">System</div>

                    {/* Administration — expandable */}
                    <div
                        className={`sidebar-link sidebar-expandable${isAdminActive ? ' active' : ''}`}
                        onClick={() => setAdminOpen(!adminOpen)}
                    >
                        <span className="sidebar-link-icon">⚙️</span>
                        Administration
                        <span className={`sidebar-expand-arrow${adminOpen ? ' open' : ''}`}>▾</span>
                    </div>

                    {adminOpen && (
                        <div className="sidebar-sublinks">
                            {adminSubLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `sidebar-sublink${isActive ? ' active' : ''}`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>
                    )}

                    {/* Reports */}
                    <NavLink
                        to="/reports"
                        className={({ isActive }) =>
                            `sidebar-link${isActive ? ' active' : ''}`
                        }
                    >
                        <span className="sidebar-link-icon">📈</span>
                        Reports
                    </NavLink>
                </div>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="sidebar-footer-version">RMC ERP v1.0</div>
            </div>
        </aside>
    );
};

export default Sidebar;
