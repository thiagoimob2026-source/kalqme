import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/ai-analysis', icon: '🧠', label: 'CFO Intelligence' },
        { path: '/gamification', icon: '🎮', label: 'Gamificação' },
        { path: '/customers', icon: '👥', label: 'Clientes' },
        { path: '/budget', icon: '💰', label: 'Orçamento' },
        { path: '/services', icon: '👑', label: 'Serviços Premium' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>📈 Kalq</h2>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
