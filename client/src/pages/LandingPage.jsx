import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-container">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="logo">
                    <div className="logo-icon-wrapper">
                        <span className="logo-icon-bg">K</span>
                        <span className="logo-icon-fg">🧮</span>
                    </div>
                    <span className="logo-text">Kalq<span>.me</span></span>
                </div>
                <div className="nav-links">
                    <a href="#features">Recursos</a>
                    <a href="#pricing">Planos</a>
                    <Link to="/login" className="btn-secondary">Entrar</Link>
                    <Link to="/register" className="btn-primary">Testar Grátis</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero">
                <div className="hero-content">
                    <div className="hero-tag">✨ Contabilidade e Gestão Especializada para todo o Brasil</div>
                    <h1 className="hero-title">
                        A solução definitiva para o <span className="gradient-text">Microempreendedor Individual.</span>
                    </h1>
                    <p className="hero-subtitle">
                        Foque no seu negócio e deixe a burocracia conosco. 
                        A plataforma ideal para <strong>Microempreendedores Individuais</strong> em todo o Brasil.
                        Organize seu fluxo de caixa, emita DASN, eSocial e gerencie seu IRPF com suporte contábil especializado.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn-hero-primary">Começar Agora - R$ 54,90/mês</Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <svg className="connection-lines" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
                        <line x1="50%" y1="50%" x2="90%" y2="15%" />
                        <line x1="50%" y1="50%" x2="15%" y2="95%" />
                        <line x1="50%" y1="50%" x2="10%" y2="15%" />
                        <line x1="50%" y1="50%" x2="95%" y2="85%" />
                        <line x1="50%" y1="50%" x2="5%"  y2="50%" />
                        <line x1="50%" y1="50%" x2="95%" y2="45%" />
                        <line x1="50%" y1="50%" x2="60%" y2="105%" />
                    </svg>
                    <div className="dashboard-preview" style={{ zIndex: 5, position: 'relative' }}>
                        <div className="preview-header"></div>
                        <div className="preview-body">
                            <div className="preview-upload-box">
                                <span className="upload-icon">📄</span>
                                <div className="upload-texts">
                                    <p className="upload-title">Anexar Extrato Bancário</p>
                                    <p className="upload-sub">Formatos .csv, .xlsx suportados</p>
                                </div>
                                <div className="upload-progress"></div>
                            </div>
                            <div className="preview-process-tag">
                                <span className="process-icon">🤖</span>
                                <span>IA processando...</span>
                            </div>
                            <div className="preview-report-card">
                                <div className="report-header">
                                    <span>📊 Novo Relatório Gerado</span>
                                    <span className="report-badge">PDF</span>
                                </div>
                                <div className="report-lines">
                                    <div className="report-line"></div>
                                    <div className="report-line"></div>
                                    <div className="report-line w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="floating-badge badge-1">✅ DASN Descomplicada</div>
                    <div className="floating-badge badge-2">📊 Fluxo de Caixa Pronto</div>
                    <div className="floating-badge badge-3">👷 eSocial Simplificado</div>
                    <div className="floating-badge badge-4">⚖️ Regularização Fiscal</div>
                    <div className="floating-badge badge-5">💰 Gestão Financeira</div>
                    <div className="floating-badge badge-6">📍 Atendimento em todo o Brasil</div>
                    <div className="floating-badge badge-7">🧠 Consultor IA</div>
                </div>
            </header>

            {/* Stats Section */}
                <div className="stat-item">
                    <h3>100% Digital</h3>
                    <p>Atendimento Online</p>
                </div>
                <div className="stat-item">
                    <h3>Todo o Brasil</h3>
                    <p>Suporte Nacional</p>
                </div>
                <div className="stat-item">
                    <h3>Segurança</h3>
                    <p>Dados Criptografados</p>
                </div>



            {/* Niches Section */}
            <section className="niches">
                <h2 className="section-title">Serviços Contábeis para o <span className="gradient-text">MEI Brasileiro</span></h2>
                <div className="niches-chips">
                    <span>Abertura de MEI</span>
                    <span>Declaração Anual (DASN)</span>
                    <span>Benefícios INSS</span>
                    <span>Solução de Malha Fiscal</span>
                    <span>Fluxo de Caixa</span>
                    <span>Imposto de Renda (IRPF)</span>
                    <span>eSocial (1 Empregado)</span>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features">
                <h2 className="section-title">Gestão Simplificada para o seu <span className="gradient-text">Dia a Dia</span></h2>
                <div className="features-grid">
                    <div className="feature-card" style={{ background: 'var(--gradient-accent)', borderColor: 'var(--primary)' }}>
                        <div className="feature-icon">🤝</div>
                        <h3>Acompanhamento de Ponta a Ponta</h3>
                        <p>Desde a abertura até a entrega de obrigações acessórias, regularização e dúvidas diretamente com um <strong>especialista em MEI</strong>.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Fluxo de Caixa Ágil</h3>
                        <p>Registre receitas e despesas do seu negócio de forma rápida. Acompanhe se você está perto do limite de faturamento do MEI.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⏰</div>
                        <h3>Alerta de Obrigações</h3>
                        <p>Não perca o prazo da sua DASN ou do eSocial. Controle toda sua agenda tributária no mesmo painel.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📂</div>
                        <h3>Relatórios Profissionais</h3>
                        <p>Saiba exatamente quanto sua empresa lucra por mês com relatórios visuais prontos para exportação em PDF.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🧠</div>
                        <h3>Consultor IA Financeiro</h3>
                        <p>Nossa IA analisa seus dados e sugere formas de reduzir custos e otimizar seu faturamento.</p>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing">
                <div className="pricing-grid" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>
                    {/* Plan 1: Software Only (Yearly) */}
                    <div className="pricing-card featured" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div className="promo-badge">OFERTA DE LANÇAMENTO</div>
                        <div className="pricing-header">
                            <div className="card-tag">Gestão Inteligente Pessoal</div>
                            <h3>Kalq MEI Premium</h3>
                            <p className="price-old">Assinatura acessível para qualquer MEI</p>
                            <p className="price">R$ 54,90<span className="price-label">/MÊS</span></p>
                            <p className="one-time-text">ou R$ 490,00/ano à vista.</p>
                        </div>
                        <ul className="pricing-features">
                            <li>✓ Fluxo de Caixa Ilimitado</li>
                            <li>✓ Importação de Extratos Bancários</li>
                            <li>✓ Consultor IA Financeiro</li>
                            <li>✓ Alertas de Riscos e Vencimentos</li>
                            <li>✓ Emissão de Relatórios Gerenciais (PDF)</li>
                            <li>✓ Atendimento Especializado Nacional</li>
                        </ul>
                        <Link to="/register" className="btn-pricing btn-gradient">Acessar a Plataforma</Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="cta-content">
                    <h2>Gestão e Contabilidade MEI em todo o Brasil.</h2>
                    <p>Foque em vender e crescer enquanto cuidamos da sua conformidade fiscal.</p>
                    <Link to="/register" className="btn-hero-primary">Criar Minha Conta Agora</Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="logo mb-4">
                            <div className="logo-icon-wrapper scale-75">
                                <span className="logo-icon-bg">K</span>
                                <span className="logo-icon-fg">🧮</span>
                            </div>
                            <span className="logo-text text-white">Kalq<span>.me</span></span>
                        </div>
                        <p>A solução contábil definitiva para o MEI.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Serviços</h4>
                        <a href="#">Abertura de MEI</a>
                        <a href="#">Alteração de Dados</a>
                        <a href="#">Declaração Anual</a>
                    </div>
                    <div className="footer-links">
                        <h4>Produto</h4>
                        <a href="#features">Recursos</a>
                        <a href="#pricing">Preço Único</a>
                    </div>
                    <div className="footer-links">
                        <h4>Contato</h4>
                        <a href="mailto:contato@kalq.me">contato@kalq.me</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Kalq. Atendimento especializado em todo o Brasil.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
