import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

// Custom SVG Icons to avoid dependency issues
const Mail = ({ size = 20, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);

const Shield = ({ size = 20, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
);

const ArrowLeft = ({ size = 20, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
);

const CheckCircle = ({ size = 20, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
);

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validação
        if (!email) {
            setError('Email é obrigatório');
            return;
        }

        if (!validateEmail(email)) {
            setError('Email inválido');
            return;
        }

        // Simular loading
        setIsLoading(true);

        try {
            // Aqui você faria a chamada real à API
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simular sucesso
            setIsSuccess(true);
        } catch (error) {
            setError('Erro ao enviar email. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setEmail(e.target.value);
        if (error) {
            setError('');
        }
    };

    if (isSuccess) {
        return (
            <div className="auth-page">
                <div className="auth-container" style={{ gridTemplateColumns: '1fr', maxWidth: '600px' }}>
                    <div className="auth-form-container" style={{ textAlign: 'center', padding: '4rem' }}>
                        <CheckCircle size={64} style={{ color: 'var(--color-success)', margin: '0 auto 2rem' }} />
                        <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                            Email enviado!
                        </h2>
                        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
                            Enviamos um link de recuperação para <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
                            Verifique sua caixa de entrada e spam.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="btn-primary"
                            style={{ maxWidth: '300px', margin: '0 auto' }}
                        >
                            Voltar para o login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container" style={{ gridTemplateColumns: '1fr', maxWidth: '600px' }}>
                <div className="auth-form-container">
                    <div className="auth-form-wrapper">
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                marginBottom: '2rem',
                                padding: '0.5rem 0',
                                transition: 'var(--transition-fast)'
                            }}
                            onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                        >
                            <ArrowLeft size={20} />
                            Voltar para o login
                        </button>

                        <div className="auth-form-header">
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <Shield size={48} style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <h2>Esqueceu sua senha?</h2>
                            <p>
                                Sem problemas! Digite seu email e enviaremos instruções para redefinir sua senha.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
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
                                        value={email}
                                        onChange={handleInputChange}
                                        className={error ? 'input-error' : ''}
                                        autoFocus
                                    />
                                </div>
                                {error && (
                                    <span className="error-message">{error}</span>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn-primary btn-full"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
