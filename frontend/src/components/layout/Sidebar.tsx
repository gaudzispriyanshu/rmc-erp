import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { APP_NAME, APP_VERSION, COPYRIGHT } from '../../version';
import './Sidebar.css';

const navSections = [
    {
        title: 'Operations',
        links: [
            { to: '/', icon: '📊', label: 'Dashboard' },
            { to: '/orders', icon: '📋', label: 'Orders' },
            { to: '/trips', icon: '🗺️', label: 'Trips' },
            { to: '/dispatch', icon: '🚚', label: 'Dispatch' },
            { to: '/quality', icon: '🧪', label: 'Quality' },
        ],
    },
    {
        title: 'Masters',
        links: [
            { to: '/customers', icon: '🤝', label: 'Customers' },
            { to: '/drivers', icon: '👤', label: 'Drivers' },
            { to: '/vehicles', icon: '🚛', label: 'Vehicles' },
            { to: '/inventory', icon: '📦', label: 'Inventory' },
            { to: '/mix-designs', icon: '🧱', label: 'Mix Designs' },
        ],
    },
];

const adminSubLinks = [
    { to: '/administration/security-roles', label: 'Security Roles' },
    { to: '/administration/workflows', label: 'Workflows' },
    { to: '/administration/users', label: 'Users' },
    { to: '/administration/settings', label: 'System Settings' },
];

interface SidebarProps {
    isOpen: boolean;
    setIsOpen?: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
    const location = useLocation();
    const isAdminActive = location.pathname.startsWith('/administration');
    const [adminOpen, setAdminOpen] = useState(isAdminActive);

    // Close sidebar on mobile when navigating
    const handleNavClick = () => {
        if (window.innerWidth <= 1024 && setIsOpen) {
            setIsOpen(false);
        }
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
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
                                onClick={handleNavClick}
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
                                    onClick={handleNavClick}
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
                        onClick={handleNavClick}
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
                <div className="sidebar-footer-version">{APP_NAME} v{APP_VERSION}</div>
                <div className="sidebar-footer-copyright">{COPYRIGHT}</div>
            </div>
        </aside>
    );
};

export default Sidebar;
