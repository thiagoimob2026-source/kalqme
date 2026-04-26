import React, { useState } from 'react';
import './AIAnalysis.css';
import { Link } from 'react-router-dom';
import { API_URL } from '../utils/api';

const KPICard = ({ label, value, status, description, interpretation }) => {
    const [showInfo, setShowInfo] = useState(false);

    const getStatusColor = (s) => {
        if (s === 'danger') return 'var(--ai-danger)';
        if (s === 'warning') return 'var(--ai-warning)';
        if (s === 'success') return 'var(--ai-success)';
        return 'var(--ai-text-main)';
    };

    return (
        <div
            className="kpi-card-interactive"
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
            onClick={() => setShowInfo(!showInfo)}
        >
            <div className="kpi-header">
                <span className="kpi-label">{label}</span>
                <span className="info-icon">ℹ️</span>
            </div>

            <div className="kpi-value" style={{ color: getStatusColor(status) }}>
                {value}
            </div>

            <div className={`kpi-explanation ${showInfo ? 'visible' : ''}`}>
                <p className="kpi-desc"><strong>O que é:</strong> {description}</p>
                <p className="kpi-interp"><strong>Como ler:</strong> {interpretation}</p>
            </div>
        </div>
    );
};

const AIAnalysis = () => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/ai-analysis`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                throw new Error('Sessão expirada. Faça login novamente.');
            }

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success === false) {
                throw new Error(data.error || 'Erro desconhecido ao analisar dados.');
            }

            setAnalysis(data.data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--ai-success)';
        if (score >= 50) return 'var(--ai-warning)';
        return 'var(--ai-danger)';
    };

    if (loading) {
        return (
            <div className="ai-analysis-container loading-container">
                <div className="spinner"></div>
                <p>O Kalq Intelligence está escaneando suas transações...</p>
                <small>Calculando Margens, Risco MEI e Fluxo de Caixa.</small>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ai-analysis-container">
                <div className="error-container">
                    <h2>⚠️ Não foi possível gerar a análise</h2>
                    <p>{error}</p>
                    <button onClick={fetchAnalysis} className="btn-primary" style={{ marginTop: '1rem' }}>
                        Tentar Novamente
                    </button>
                    <div style={{ marginTop: '1rem' }}>
                        <Link to="/dashboard" style={{ color: 'var(--ai-primary)' }}>Voltar para Conta</Link>
                    </div>
                </div>
            </div>
        );
    }

    // ON-DEMAND START SCREEN
    if (!analysis) {
        return (
            <div className="ai-analysis-container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                <header className="analysis-header">
                    <h1>🧠 Kalq Intelligence</h1>
                    <p className="subtitle">Auditoria de Fluxo de Caixa e Limites MEI</p>
                </header>

                <div className="ai-on-demand-prompt" style={{ textAlign: 'center', margin: 'auto', maxWidth: '600px', background: 'rgba(30, 41, 59, 0.5)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔬</div>
                    <h2>Audite seu Fluxo de Caixa</h2>
                    <p style={{ color: 'var(--ai-text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                        Clique no botão abaixo para rodar nossa inteligência artificial com exclusividade sobre os seus dados brutos de caixa.
                        Nós cruzaremos suas entradas e saídas e avaliaremos seu distanciamento do Limite de Faturamento MEI (R$ 81k/ano).
                    </p>
                    <button onClick={fetchAnalysis} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(16,185,129,0.3)', width: '100%', cursor: 'pointer' }}>
                        ✨ Iniciar Análise Automática
                    </button>
                    <div style={{ marginTop: '2rem' }}>
                        <Link to="/dashboard" style={{ color: 'var(--ai-primary)', textDecoration: 'none' }}>
                            ← Voltar para Resultados Anteriores
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const scoreColor = getScoreColor(analysis.score_saude_financeira);
    const gaugeStyle = {
        background: `conic-gradient(
            ${scoreColor} 0deg ${analysis.score_saude_financeira * 3.6}deg, 
            rgba(255,255,255,0.1) ${analysis.score_saude_financeira * 3.6}deg 360deg
        )`
    };

    return (
        <div className="ai-analysis-container">
            <header className="analysis-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>🧠 Kalq Intelligence</h1>
                    <p className="subtitle">Relatório Final do Algoritmo</p>
                </div>
                <button onClick={() => setAnalysis(null)} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                    Nova Análise
                </button>
            </header>

            <div className="health-score-card">
                <h2>Score de Saúde Financeira</h2>
                <div className="score-gauge" style={gaugeStyle}>
                    <div className="score-value">{analysis.score_saude_financeira}</div>
                    <div className="score-label">/100</div>
                </div>
                <p className="executive-summary">
                    {analysis.analise_executiva}
                </p>
            </div>

            {/* SEÇÃO MEI */}
            {analysis.status_mei && (
                <div className="cfo-verdict" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: analysis.status_mei.percentual_utilizado > 90 ? '#ef4444' : '#10b981' }}>
                    <h2 style={{ color: analysis.status_mei.percentual_utilizado > 90 ? '#ef4444' : '#10b981' }}>📊 Radar de Faturamento MEI ({new Date().getFullYear()})</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                        <div>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>FATURAMENTO ACUMULADO</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>R$ {parseFloat(analysis.status_mei.faturamento_acumulado).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                            <small>Soma das Receitas no Ano</small>
                        </div>
                        <div>
                            <p style={{ color: analysis.status_mei.percentual_utilizado > 90 ? '#ef4444' : '#10b981', fontSize: '0.9rem' }}>TETO E RISCO</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: analysis.status_mei.percentual_utilizado > 90 ? '#ef4444' : '#10b981' }}>{analysis.status_mei.percentual_utilizado}% utilizado do limite</p>
                            <small style={{ color: analysis.status_mei.percentual_utilizado > 90 ? '#ef4444' : '#10b981' }}>{analysis.status_mei.status_risco}</small>
                        </div>
                    </div>
                    {analysis.status_mei.percentual_utilizado > 70 && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#f87171' }}>
                            <strong>Atenção:</strong> Restam apenas R$ {parseFloat(analysis.status_mei.margem_seguranca).toLocaleString('pt-BR', {minimumFractionDigits: 2})} para desenquadrar do limite de 81k da sua MEI.
                        </div>
                    )}
                </div>
            )}

            {/* ANOMALIAS */}
            {analysis.anomalies && analysis.anomalies.length > 0 && (
                <div className="anomalies-banner" style={{
                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--ai-danger)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', color: 'var(--ai-danger)'
                }}>
                    <h3>🚨 Atenção: Anomalias Detectadas pelo Algoritmo</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {analysis.anomalies.map((anom, idx) => (
                            <li key={idx} style={{ marginTop: '0.5rem' }}>
                                <strong>{anom.type}:</strong> {anom.description}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* CLASSIFICAÇÃO / CATEGORIAS */}
            {analysis.dados_classificacao && (
                <div className="classification-section" style={{ marginBottom: '2rem', background: 'rgba(30,41,59,0.5)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0 }}>🗂️ Análise de Categorias</h2>
                        {analysis.dados_classificacao.transacoes_nao_classificadas > 0 && (
                            <span style={{ background: 'var(--ai-danger)', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                {analysis.dados_classificacao.transacoes_nao_classificadas} Lançamentos Sem Categoria
                            </span>
                        )}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
                        {/* Receitas */}
                        <div>
                            <h3 style={{ color: 'var(--ai-success)', borderBottom: '1px solid rgba(16,185,129,0.2)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Maiores Fontes de Receita</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {Object.keys(analysis.dados_classificacao.receitas_por_categoria || {}).length === 0 ? (
                                    <li style={{ color: 'var(--ai-text-muted)', fontStyle: 'italic' }}>Nenhuma receita classificada.</li>
                                ) : (
                                    Object.entries(analysis.dados_classificacao.receitas_por_categoria)
                                        .sort((a,b) => b[1] - a[1])
                                        .map(([cat, amt]) => (
                                            <li key={cat} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '6px' }}>
                                                <strong style={{ color: 'var(--ai-text-main)' }}>{cat}</strong>
                                                <span style={{ color: 'var(--ai-success)' }}>R$ {parseFloat(amt).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                            </li>
                                        ))
                                )}
                            </ul>
                        </div>
                        {/* Despesas */}
                        <div>
                            <h3 style={{ color: 'var(--ai-danger)', borderBottom: '1px solid rgba(239,68,68,0.2)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Maiores Fontes de Despesa</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {Object.keys(analysis.dados_classificacao.despesas_por_categoria || {}).length === 0 ? (
                                    <li style={{ color: 'var(--ai-text-muted)', fontStyle: 'italic' }}>Nenhuma despesa classificada.</li>
                                ) : (
                                    Object.entries(analysis.dados_classificacao.despesas_por_categoria)
                                        .sort((a,b) => b[1] - a[1])
                                        .map(([cat, amt]) => (
                                            <li key={cat} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '6px' }}>
                                                <strong style={{ color: 'var(--ai-text-main)' }}>{cat}</strong>
                                                <span style={{ color: 'var(--ai-danger)' }}>R$ {parseFloat(amt).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                            </li>
                                        ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="insights-section">
                <h2>💡 Insights Estratégicos</h2>
                <div className="insights-grid">
                    {(!analysis.insights_estrategicos || analysis.insights_estrategicos.length === 0) ? (
                        <p className="text-muted">Nenhum insight crítico encontrado no momento.</p>
                    ) : (
                        analysis.insights_estrategicos.map((insight, idx) => (
                            <div key={idx} className="insight-card opportunity">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="insight-badge">{insight.tipo.replace('_', ' ')}</span>
                                </div>
                                <h3>{insight.titulo}</h3>
                                <p className="insight-description">{insight.descricao}</p>
                                <div className="insight-action">
                                    <strong>✅ Ação Recomendada:</strong>
                                    <p>{insight.acao_recomendada}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="cfo-verdict">
                <h2>⚖️ Veredito de Longevidade MEI</h2>
                <p>"{analysis.veredito_cfo}"</p>
            </div>

            {analysis.kpis && (
                <div className="kpis-section kpis-educational" style={{ marginTop: '4rem' }}>
                    <div className="section-header">
                        <h2>📈 Indicadores Chave de Performance (KPIs)</h2>
                        <p className="section-subtitle">O coração financeiro do seu MEI</p>
                    </div>

                    <div className="kpis-grid">
                        <KPICard
                            label="Ticket Médio"
                            value={`R$ ${analysis.kpis.averageTicket}`}
                            status="info"
                            description="Qual a média monetária das suas vendas/entradas."
                            interpretation="Um ticket médio maior indica menor esforço de atração de clientes pra bater a meta."
                        />
                         <KPICard
                            label="Margem Operacional"
                            value={`${analysis.kpis.operationalMargin}%`}
                            status={parseFloat(analysis.kpis.operationalMargin) < 15 ? 'danger' : 'success'}
                            description="Quanto da receita bruta sobra como lucro caixa."
                            interpretation="Se a margem for abaixo de 15%, seu negócio corre risco alto num mês de poucas vendas."
                        />
                        <KPICard
                            label="HHI (Concentração)"
                            value={analysis.kpis.hhi}
                            status={parseFloat(analysis.kpis.hhi) > 0.25 ? 'danger' : 'success'}
                            description="Mede o risco de depender de poucos pagadores."
                            interpretation="Se a maior parte da grana vem de 1 cliente, a saída dele causa falência."
                        />
                        <KPICard
                            label="Desvio de Caixa"
                            value={`R$ ${analysis.kpis.volatility}`}
                            status="warning"
                            description="O quão drástica é a oscilação de receita real mês a mês."
                            interpretation="Muita oscilação exige fundos de reserva altos."
                        />
                    </div>
                </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.6 }}>
                <p style={{ fontSize: '0.8rem' }}>
                    * Esta análise é gerada por Inteligência Artificial Especialista. Exerça responsabilidade sobre decisões fiscais.
                </p>
            </div>
        </div>
    );
};

export default AIAnalysis;
