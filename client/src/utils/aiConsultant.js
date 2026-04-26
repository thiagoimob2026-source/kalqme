/**
 * AI Consultant - Heuristic Engine
 * Analyzes transactions to provide strategic, fiscal, and management insights.
 */

export const analyzeFinancialHealth = (transactions, userTaxType, summary) => {

    // Initial State
    const analysis = {
        analise_despesas: {
            top_despesas: [],
            total_despesas: 0
        },
        saude_financeira: {
            total_gastos_pessoais_detectados: 0,
            alerta_mistura_pf_pj: null,
            status_teto_mei: "N/A",
            mensagem_mei: ""
        },
        insight_estrategico: {
            titulo: "Análise Mensal",
            corpo: "Processando...",
            acao_sugerida: "Verificar Lançamentos",
            dica_de_ouro: "" 
        }
    };

    if (!transactions || transactions.length === 0) {
        analysis.insight_estrategico.corpo = "Aguardando importação de dados para este mês.";
        analysis.insight_estrategico.acao_sugerida = "Importar CSV";
        analysis.insight_estrategico.titulo = "Sem Movimento";
        return analysis;
    }

    // --- Helpers ---
    const parseMoney = (val) => {
        if (typeof val === 'number') return val;
        return parseFloat((val || "0").replace(/\./g, '').replace(',', '.'));
    };

    // Calculate Totals
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalDeductible = 0;
    let unclassifiedCount = 0;

    transactions.forEach(tx => {
        const amt = parseMoney(tx.TRANSACTION_NET_AMOUNT);
        if (amt > 0) totalRevenue += amt;
        else {
            totalExpenses += Math.abs(amt);
            if (tx.classification?.isDeductible) totalDeductible += Math.abs(amt);
        }

        if (!tx.classification) unclassifiedCount++;
    });

    const netAmount = totalRevenue - totalExpenses;

    // --- 1. Resumo de Despesas (O novo Card do Meio) ---
    const expensesByCategory = {};
    
    transactions.forEach(tx => {
        const amount = parseMoney(tx.TRANSACTION_NET_AMOUNT);
        const isExpense = amount < 0;
        const cat = tx.classification?.category || 'Outros';

        if (isExpense) {
            expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Math.abs(amount);
        }
    });

    // Sort to get top 3 expenses
    const sortedExpenses = Object.entries(expensesByCategory)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 3)
        .map(([categoria, valor]) => ({ categoria, valor }));

    analysis.analise_despesas.top_despesas = sortedExpenses;
    analysis.analise_despesas.total_despesas = totalExpenses;
    
    // --- 2. Separação PF/PJ ---
    const personalKeywords = /(netflix|spotify|disney|hbo|prime|amazon video|playstation|xbox|steam|supermercado|extra|carrefour|pao de acucar|dia|assai|atacadao|atacadão|ifood|uber eats|rappi|zara|renner|riachuelo|cea|shein|centauro|decathlon|escola|colegio|faculdade|universidade|mensalidade|baba|babá|cinema|ingresso|farmacia|drogaria)/i;

    let totalPersonal = 0;
    transactions.forEach(tx => {
        const amount = parseMoney(tx.TRANSACTION_NET_AMOUNT);
        const descriptionToCheck = tx.classification?.subCategory || tx.classification?.category || tx.TRANSACTION_TYPE || "";
        if (amount < 0 && personalKeywords.test(descriptionToCheck)) {
            totalPersonal += Math.abs(amount);
        }
    });

    analysis.saude_financeira.total_gastos_pessoais_detectados = totalPersonal;
    if (totalPersonal > 0) {
        analysis.saude_financeira.alerta_mistura_pf_pj = `Detectamos R$ ${totalPersonal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em possíveis gastos pessoais.`;
    }

    // --- 3. Radar MEI (Visão Mensal) ---
    // User requested the main AI page to do total yearly, but this widget to do focused MONTHLY summarized info.
    const proportionLimit = 6750.00;
    if (totalRevenue > proportionLimit) {
        analysis.saude_financeira.status_teto_mei = "Alerta";
        analysis.saude_financeira.mensagem_mei = `Atenção: A receita do mês (R$ ${totalRevenue.toLocaleString('pt-BR')}) excedeu a média base mensal de R$ 6.750 do MEI.`
    } else if (totalRevenue > (proportionLimit * 0.9)) {
        analysis.saude_financeira.status_teto_mei = "Atenção";
        analysis.saude_financeira.mensagem_mei = `Receita próxima do teto médio mensal do MEI (R$ 6.750).`;
    } else {
        analysis.saude_financeira.status_teto_mei = "Seguro";
        analysis.saude_financeira.mensagem_mei = "Arrecadação mensal saudável dentro da margem.";
    }

    // --- 4. Dica de Ouro & Strategic Insight ---
    
    // First Priority: Unclassified data
    if (unclassifiedCount > 0) {
        analysis.insight_estrategico.titulo = "Caixa Desorganizado";
        analysis.insight_estrategico.corpo = `Você tem ${unclassifiedCount} lançamentos soltos neste mês sem categoria.`;
        analysis.insight_estrategico.acao_sugerida = "Classificar Transações";
        analysis.insight_estrategico.dica_de_ouro = "A inteligência será mais precisa quando você classificar 100% dos lançamentos abaixo.";
    } 
    // Second Priority: Negative month
    else if (netAmount < 0) {
        analysis.insight_estrategico.titulo = "Mês no Vermelho";
        analysis.insight_estrategico.corpo = `Sua operação gastou R$ ${Math.abs(netAmount).toLocaleString('pt-BR')} a mais do que faturou neste mês.`;
        analysis.insight_estrategico.acao_sugerida = "Revisar Custos";
        analysis.insight_estrategico.dica_de_ouro = "Se este padrão continuar por mais 2 meses, a operação pode se tornar insustentável.";
    } 
    // Third Priority: Mistura Patrimonial 
    else if (totalPersonal > (totalExpenses * 0.2)) {
        analysis.insight_estrategico.titulo = "Mistura Patrimonial";
        analysis.insight_estrategico.corpo = "Muitos gastos pessoais suspeitos (mercado, assinaturas) pagos com dinheiro da empresa.";
        analysis.insight_estrategico.acao_sugerida = "Separar Contas";
        analysis.insight_estrategico.dica_de_ouro = "Defina um 'Pró-Labore' fixo mensal, transfira para sua conta da Pessoa Física e pague seus boletos lá.";
    } 
    // Fourth Priority: All Good
    else {
        analysis.insight_estrategico.titulo = "Mês Muito Positivo";
        analysis.insight_estrategico.corpo = `Mês excelente! Saldo de caixa de R$ ${netAmount.toLocaleString('pt-BR')} e contas organizadas.`;
        analysis.insight_estrategico.acao_sugerida = "Investir Sobras";
        analysis.insight_estrategico.dica_de_ouro = "Com o caixa positivo, considere criar uma Reserva de Emergência na empresa com rendimento seguro (CDB).";
    }

    return analysis;
};
