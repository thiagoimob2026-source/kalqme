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

const User = ({ size = 20, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

const Building = ({ size = 20, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" /><path d="M15 11h.01" /></svg>
);

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({
        name: '',
        company: '',
        email: '',
        password: '',
        confirmPassword: '',
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
        if (!formData.name) newErrors.name = 'Nome é obrigatório';
        if (!formData.company) newErrors.company = 'Nome da empresa é obrigatório';
        if (!formData.email) newErrors.email = 'Email é obrigatório';
        else if (!validateEmail(formData.email)) newErrors.email = 'Email inválido';
        if (!formData.password) newErrors.password = 'Senha é obrigatória';
        else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem';

        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...newErrors }));
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/register`, {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                companyName: formData.company,
                taxType: 'MEI' // Default
            });

            // Auto login after register? Or just redirect to login
            navigate('/login');
        } catch (error) {
            const message = error.response?.data?.error || 'Erro ao registrar account.';
            setErrors(prev => ({
                ...prev,
                general: message
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        // Implementar registro com Google
        console.log('Registro com Google');
    };

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
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
                            <h2>Criar sua conta</h2>
                            <p>
                                Já tem uma conta?{' '}
                                <a href="/login" className="auth-link">
                                    Fazer login
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
                            {/* Name Input */}
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">
                                    Nome completo
                                </label>
                                <div className="input-wrapper">
                                    <User className="input-icon" size={20} />
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="João Silva"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={errors.name ? 'input-error' : ''}
                                    />
                                </div>
                                {errors.name && (
                                    <span className="error-message">{errors.name}</span>
                                )}
                            </div>

                            {/* Company Input */}
                            <div className="form-group">
                                <label htmlFor="company" className="form-label">
                                    Nome da empresa
                                </label>
                                <div className="input-wrapper">
                                    <Building className="input-icon" size={20} />
                                    <input
                                        type="text"
                                        id="company"
                                        name="company"
                                        placeholder="Minha Empresa Ltda"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        className={errors.company ? 'input-error' : ''}
                                    />
                                </div>
                                {errors.company && (
                                    <span className="error-message">{errors.company}</span>
                                )}
                            </div>

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
                                        placeholder="Mínimo 6 caracteres"
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

                            {/* Confirm Password Input */}
                            <div className="form-group">
                                <label htmlFor="confirmPassword" className="form-label">
                                    Confirmar senha
                                </label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={20} />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        placeholder="Digite a senha novamente"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className={errors.confirmPassword ? 'input-error' : ''}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={toggleConfirmPassword}
                                        aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={20} />
                                        ) : (
                                            <Eye size={20} />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <span className="error-message">{errors.confirmPassword}</span>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn-primary btn-full"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Criando conta...' : 'Criar conta'}
                            </button>

                            {/* Terms */}
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '-0.5rem' }}>
                                Ao criar uma conta, você concorda com nossos{' '}
                                <a href="/terms" className="auth-link">Termos de Uso</a> e{' '}
                                <a href="/privacy" className="auth-link">Política de Privacidade</a>
                            </p>

                            {/* Divider */}
                            <div className="divider">
                                <span>ou registre-se com</span>
                            </div>

                            {/* Social Login */}
                            <button
                                type="button"
                                className="btn-social"
                                onClick={handleGoogleRegister}
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
                                Registrar com Google
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
