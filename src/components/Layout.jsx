import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Settings,
    LogOut,
    CreditCard,
    FileText,
    Menu,
    X,
    Truck,
    Bell,
    AlertTriangle,
    ArrowLeftRight,
    Camera
} from 'lucide-react';
import '../styles/Layout.css';

// Mock Low Stock Notification Data (In a real app, this comes from an inventory listener)
const LOW_STOCK_NOTIFICATIONS = [
    { id: 1, title: 'Low Stock Alert', msg: 'Casio Vintage (A168) is out of stock in Retail Shop 2.', time: '10 min ago', important: true },
    { id: 2, title: 'Stock Warning', msg: 'Titan Neo Splash is running low (5 left) in Retail Shop 2.', time: '1 hour ago', important: false },
    { id: 3, title: 'Stock Warning', msg: 'ThinkPad X1 Carbon is out of stock in Retail Shop 1.', time: '2 hours ago', important: false },
];

const Layout = () => {
    const { currentUser, userRole, logout } = useAuth();
    const { selectedShop, currentShop } = useShop();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Notification State
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState(LOW_STOCK_NOTIFICATIONS);
    const notifRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <div className="layout-container">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo-text">{currentShop.name}</div>
                    <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {userRole === 'admin' && (
                        <div className="nav-group">
                            <span className="group-label">Main</span>
                            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                <LayoutDashboard size={20} />
                                <span>Dashboard</span>
                            </NavLink>
                        </div>
                    )}

                    <div className="nav-group">
                        <span className="group-label">Operations</span>
                        <NavLink to="/pos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <CreditCard size={20} />
                            <span>Billing (POS)</span>
                        </NavLink>

                        <NavLink to="/sales" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <FileText size={20} />
                            <span>Sales History</span>
                        </NavLink>

                        <NavLink to="/smart-stock" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Camera size={20} />
                            <span>Check Stock</span>
                        </NavLink>

                        {/* Admin Only Modules */}
                        {userRole === 'admin' && (
                            <>
                                <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                    <Package size={20} />
                                    <span>Inventory</span>
                                </NavLink>
                                {selectedShop === 'wholesale' && (
                                    <NavLink to="/suppliers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        <Truck size={20} />
                                        <span>Suppliers</span>
                                    </NavLink>
                                )}
                                {selectedShop === 'wholesale' && (
                                    <NavLink to="/stock-transfers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        <ArrowLeftRight size={20} />
                                        <span>Stock Transfers</span>
                                    </NavLink>
                                )}
                                <NavLink to="/employees" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                    <Users size={20} />
                                    <span>Employees</span>
                                </NavLink>
                            </>
                        )}
                    </div>

                    <div className="nav-group">
                        <span className="group-label">System</span>
                        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Settings size={20} />
                            <span>Settings</span>
                        </NavLink>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="avatar">
                            {currentUser?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <span className="name">{currentUser?.displayName || 'Staff Member'}</span>
                            <span className="role" style={{ textTransform: 'capitalize', color: userRole === 'admin' ? '#7C3AED' : '#059669', fontWeight: 'bold' }}>
                                {userRole || 'Salesman'}
                            </span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="logout-btn" title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                <header className="top-baer">
                    <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <Menu size={24} />
                    </button>
                    <div className="header-actions" ref={notifRef}>
                        <button className="icon-btn" onClick={() => setIsNotifOpen(!isNotifOpen)}>
                            <Bell size={20} />
                            {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
                        </button>

                        {/* Notification Dropdown */}
                        {isNotifOpen && (
                            <div className="notification-dropdown">
                                <div className="notif-header">
                                    <span>Notifications</span>
                                    {notifications.length > 0 && (
                                        <button className="clear-btn" onClick={clearNotifications}>
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="notif-list">
                                    {notifications.length > 0 ? (
                                        notifications.map(notif => (
                                            <div key={notif.id} className="notif-item">
                                                <div className="notif-icon">
                                                    <AlertTriangle size={16} />
                                                </div>
                                                <div className="notif-content">
                                                    <div className="notif-title">{notif.title}</div>
                                                    <div className="notif-msg">{notif.msg}</div>
                                                    <span className="notif-time">{notif.time}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-notif">No new notifications</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <div className="content-wrapper">
                    <Outlet />
                </div>
            </main>
        </div >
    );
};

export default Layout;
