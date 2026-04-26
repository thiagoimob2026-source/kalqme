import React from 'react';
import './Paywall.css';

const Paywall = () => {
    return (
        <div className="paywall-overlay">
            <div className="paywall-card">
                <div className="paywall-icon">🔓</div>
                <h2>Acesso Pendente</h2>
                <p>
                    Libere agora o seu acesso vitalício ao <strong>LiberaFin</strong>.
                    Organize suas finanças de forma profissional por um preço único.
                </p>

                <div className="paywall-offer">
                    <span className="old-price">R$ 120,00</span>
                    <span className="current-price">R$ 79,90</span>
                    <span className="badge">Plano Anual - 12 Meses</span>
                </div>

                <ul className="paywall-benefits">
                    <li>✓ Fluxo de Caixa Ilimitado</li>
                    <li>✓ Relatórios Profissionais</li>
                    <li>✓ Consultor IA Financeiro</li>
                    <li>✓ Suporte Especializado</li>
                </ul>

                <button className="btn-paynow" onClick={() => window.open('SEU_LINK_DE_PAGAMENTO', '_blank')}>
                    Ativar Acesso 12 Meses
                </button>

                <p className="paywall-footer">
                    Já pagou? O acesso é liberado automaticamente após a confirmação.
                </p>
            </div>
        </div>
    );
};

export default Paywall;
