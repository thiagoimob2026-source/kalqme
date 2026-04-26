import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <div className="navbar-brand">
                    <h1 onClick={() => navigate('/dashboard')}>📈 Kalq</h1>
                    <p className="navbar-subtitle">Fluxo de Caixa Inteligente</p>
                </div>

                <div className="navbar-user">
                    <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-company">{user.companyName}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        Sair
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
