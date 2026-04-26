import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/api';
import './Login.css';

// Custom SVG Icons
const Mail = ({ size = 20, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);

const Lock = ({ size = 20, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);

const Eye = ({ size = 20, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
);

const EyeOff = ({ size = 20, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
);

const Shield = ({ size = 20, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
);

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        general: ''
    });

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        setErrors(prev => ({
            ...prev,
            [name]: '',
            general: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email é obrigatório';
        else if (!validateEmail(formData.email)) newErrors.email = 'Email inválido';
        if (!formData.password) newErrors.password = 'Senha é obrigatória';

        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...newErrors }));
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, formData);

            const { accessToken, user } = response.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(user));

            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }

            navigate('/dashboard');
        } catch (error) {
            const message = error.response?.data?.error || 'Erro ao entrar. Verifique suas credenciais.';
            setErrors(prev => ({
                ...prev,
                general: message
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Implementar login com Google
        console.log('Login com Google');
    };

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Side - Branding */}
                <div className="auth-branding">
                    <div className="auth-logo">
                        <span className="text-gradient">Kalq.me</span>
                    </div>

                    <h1 className="auth-title">Pare de Organizar. <br /> Comece a Lucrar.</h1>
                    <p className="auth-subtitle">
                        Seu Carnê-Leão Auditado e Otimizado. <br /> Sem você tocar em uma planilha.
                    </p>

                    <div className="auth-features">
                        <div className="auth-comparison">
                            <div className="comparison-header">
                                <span className="old-way">O "Velho Jeito"</span>
                                <span className="new-way">Jeito Kalq (A Nova Era)</span>
                            </div>

                            <div className="comparison-item">
                                <div className="comparison-row">
                                    <span className="old">❌ Você digita cada gasto manualmente.</span>
                                    <span className="new">✅ Zero Digitação: Arraste o CSV e pronto.</span>
                                </div>
                            </div>

                            <div className="comparison-item">
                                <div className="comparison-row">
                                    <span className="old">❌ Você decide se é dedutível (e erra).</span>
                                    <span className="new">✅ IA Auditora: Aplica a lei e decide por você.</span>
                                </div>
                            </div>

                            <div className="comparison-item">
                                <div className="comparison-row">
                                    <span className="old">❌ Gráficos bonitos de quanto gastou.</span>
                                    <span className="new">✅ Alerta de Risco: Avisa se você está gastando demais.</span>
                                </div>
                            </div>

                            <div className="comparison-item">
                                <div className="comparison-row">
                                    <span className="old">❌ Você está sozinho contra a Receita.</span>
                                    <span className="new">✅ Blindagem: Validado por contadores reais.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-form-container">
                    <div className="auth-form-wrapper">
                        <div className="auth-form-header">
                            <h2>Entrar na sua conta</h2>
                            <p>
                                Não tem conta?{' '}
                                <a href="/register" className="auth-link">
                                    Criar conta
                                </a>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            {errors.general && (
                                <div className="error-message general-error" style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    marginBottom: '1rem',
                                    textAlign: 'center',
                                    display: 'block'
                                }}>
                                    {errors.general}
                                </div>
                            )}
                            {/* Email Input */}
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    Email
                                </label>
                                <div className="input-wrapper">
                                    <Mail className="input-icon" size={20} />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="seu@email.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={errors.email ? 'input-error' : ''}
                                    />
                                </div>
                                {errors.email && (
                                    <span className="error-message">{errors.email}</span>
                                )}
                            </div>

                            {/* Password Input */}
                            <div className="form-group">
                                <label htmlFor="password" className="form-label">
                                    Senha
                                </label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={20} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={errors.password ? 'input-error' : ''}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={togglePassword}
                                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} />
                                        ) : (
                                            <Eye size={20} />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <span className="error-message">{errors.password}</span>
                                )}
                            </div>

                            {/* Options */}
                            <div className="form-options">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className="checkbox-text">Lembrar de mim</span>
                                </label>
                                <a href="/forgot-password" className="auth-link">
                                    Esqueceu a senha?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn-primary btn-full"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Entrando...' : 'Entrar'}
                            </button>

                            {/* Divider */}
                            <div className="divider">
                                <span>ou continue com</span>
                            </div>

                            {/* Social Login */}
                            <button
                                type="button"
                                className="btn-social"
                                onClick={handleGoogleLogin}
                            >
                                <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Entrar com Google
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
