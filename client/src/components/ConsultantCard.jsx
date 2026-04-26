import React from 'react';

const ConsultantCard = ({ analysis }) => {
    if (!analysis) return null;

    const { analise_despesas, saude_financeira, insight_estrategico } = analysis;

    return (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 text-white mb-8 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold">Consultor IA - Análise Inteligente</h2>
                    <p className="text-slate-400 text-sm">Auditoria em tempo real das suas transações</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Card Estratégico */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors">
                    <h3 className="text-blue-400 font-semibold mb-2 text-sm uppercase tracking-wider">💡 Insight Principal</h3>
                    <p className="text-lg font-bold mb-2">{insight_estrategico.titulo}</p>
                    <p className="text-slate-300 text-sm mb-4">{insight_estrategico.corpo}</p>
                    <button className="text-xs bg-blue-600 hover:bg-blue-700 py-1.5 px-3 rounded text-white font-medium transition-colors">
                        {insight_estrategico.acao_sugerida}
                    </button>
                </div>

                {/* 2. Top Despesas do Mês */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-purple-500 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-purple-400 font-semibold text-sm uppercase tracking-wider">📉 Top Despesas</h3>
                    </div>

                    {analise_despesas.top_despesas.length > 0 ? (
                        <div className="space-y-3">
                            <p className="text-xs text-slate-300">Onde você mais gastou neste mês:</p>
                            <ul className="text-sm space-y-2 max-h-24 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600">
                                {analise_despesas.top_despesas.map((item, idx) => (
                                    <li key={idx} className="flex justify-between items-center text-slate-200 bg-slate-800/80 p-1.5 rounded">
                                        <span className="truncate flex-1 max-w-[120px]" title={item.categoria}>{item.categoria}</span>
                                        <span className="text-red-400 font-medium">
                                            {Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-2 text-right">
                                <span className="text-xs text-slate-400">Total: </span>
                                <span className="text-sm text-slate-200 font-bold">
                                    {Number(analise_despesas.total_despesas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-2 text-center mt-2 h-full">
                            <span className="text-2xl mb-1">🎉</span>
                            <p className="text-slate-300 text-sm font-medium">Sem Despesas</p>
                            <p className="text-slate-500 text-xs">Nenhuma saída registrada neste mês.</p>
                        </div>
                    )}
                </div>

                {/* 3. Saúde Financeira */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-green-500 transition-colors">
                    <h3 className="text-green-400 font-semibold mb-2 text-sm uppercase tracking-wider">🏥 Saúde Financeira</h3>

                    {/* Alert for Negative Balance - highest priority */}
                    {analysis?.insight_estrategico?.titulo === "Atenção ao Caixa" && (
                        <div className="mb-3 p-2 bg-red-600/20 border border-red-500/50 rounded animate-pulse">
                            <p className="text-xs text-red-300 font-bold mb-1">🚨 Saldo Negativo</p>
                            <p className="text-xs text-red-200 leading-relaxed">
                                Sua empresa fechou o mês no vermelho. Priorize a análise de fluxo de caixa.
                            </p>
                        </div>
                    )}

                    {saude_financeira.total_gastos_pessoais_detectados > 0 && (
                        <div className="mb-3 p-2 bg-red-900/30 border border-red-900/50 rounded">
                            <p className="text-xs text-red-300 font-bold mb-1">Mistura PF x PJ Detectada!</p>
                            <p className="text-xs text-red-200 leading-relaxed">
                                Aprox. {saude_financeira.total_gastos_pessoais_detectados.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} em gastos pessoais (Netflix, Mercado, etc.).
                            </p>
                        </div>
                    )}

                    {saude_financeira.status_teto_mei !== "N/A" && (
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Monitoramento MEI</p>
                            <p className={`text-sm font-semibold ${saude_financeira.status_teto_mei === 'Seguro' ? 'text-green-400' : 'text-yellow-400'}`}>
                                {saude_financeira.mensagem_mei}
                            </p>
                        </div>
                    )}

                    {saude_financeira.total_gastos_pessoais_detectados === 0 && saude_financeira.status_teto_mei === "N/A" && analysis?.insight_estrategico?.titulo !== "Atenção ao Caixa" && (
                        <div className="flex flex-col items-center justify-center p-2 text-center">
                            <span className="text-2xl mb-1">✅</span>
                            <p className="text-slate-300 text-sm font-medium">Conta da Empresa Segregada</p>
                            <p className="text-slate-500 text-xs">Nenhum gasto pessoal detectado.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConsultantCard;
