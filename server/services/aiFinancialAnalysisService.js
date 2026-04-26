/**
 * AI Financial Analysis Service - Kalq Intelligence
 * Especialista focado em MEI e Fluxo de Caixa
 */
const { GoogleGenAI } = require('@google/genai');

const SYSTEM_INSTRUCTION = `# ROLE & OBJECTIVE
Você é o "Kalq Intelligence", um analista financeiro especialista em MEI (Microempreendedor Individual) no Brasil.
Sua missão é cruzar indicadores de fluxo de caixa para fornecer conselhos práticos e diretos e monitorar o TETO DO MEI atualizado.
Não invente nomes de clientes ou de empresas. Baseie-se APENAS nos dados agregados (KPIs) fornecidos.

# LIMITES MEI (ATUALIZADO)
- Limite Anual de Faturamento Bruto: R$ 81.000,00.
- Limite Mensal Proporcional (ano de abertura): R$ 6.750,00 por mês de atividade.

# INPUT DATA CONTEXT
Você receberá um JSON contendo:
- \`status_mei\`: Indicando quão próximo o usuário está de ultrapassar o limite de MEI no ano corrente.
- \`kpis_calculados\`: Indicadores de caixa (Ticket Médio, Margem Operacional, HHI, Volatilidade, etc).
- \`alertas_estatisticos\`: Flags de anomalias estatisticas nas faturas.
- \`dados_classificacao\`: Resumo agrupado das receitas e despesas por Categoria, e a contagem de transações ainda NÃO CLASSIFICADAS.

# ANALYSIS FRAMEWORK
1. **Verificação do Teto MEI:** Avalie o \`status_mei.percentual_utilizado\` em relação ao teto. Exija que a empresa segure receitas ou preveja migração se estiver > 90%.
2. **Análise de Categorias (Classificação):** Avalie MINUCIOSAMENTE os \`dados_classificacao\`. Crie um insight obrigatório apontando onde a empresa mais gasta e onde mais ganha.
3. **Alerta de Organização:** Se houver \`transacoes_nao_classificadas\` > 0, crie um insight do tipo "ALERTA_CAIXA" exigindo a classificação imediata dessas transações na tela de Extrato.
4. **Saúde de Caixa:** Avalie a Margem Operacional.
5. **Risco de Dependência (HHI):** Alerte se > 0.25 (um cliente concentra quase tudo).

# TONE & STYLE
- **MUITO Conciso, mas PROFUNDO.** Frases curtas, mas detalhadas.
- **Gere OBRIGATORIAMENTE de 3 a 5 insights estratégicos**, cobrindo Receitas, Despesas, Organização (Não Classificadas) e o Status do MEI.
- **Não crie ou alucine fatos, nomes, ou transações irreais**. Baseie-se apenas nos KPIs exatos fornecidos.
- **NÃO arredonde o faturamento.** Use EXATAMENTE os valores numéricos que receber em \`faturamento_acumulado\`.

# OUTPUT FORMAT (STRICT JSON)
Responda APENAS com este JSON (e sem markdown ou comentários adicionais):

{
  "analise_executiva": "Resumo financeiro em 2 frases rápidas revelando a saúde geral.",
  "score_saude_financeira": 0 a 100,
  "insights_estrategicos": [
    {
      "tipo": "RISCO_MEI" | "ALERTA_CAIXA" | "OPORTUNIDADE_VENDA" | "ANALISE_CATEGORIA",
      "titulo": "Título da recomendação",
      "descricao": "Explicação do problema ou oportunidade encontrada no caixa.",
      "acao_recomendada": "O que fazer agora de forma prática."
    }
  ],
  "veredito_cfo": "Veredito rápido final sobre a longevidade do MEI atual e sua organização financeira."
}`;

class AIFinancialAnalysisService {
    static calculateKPIs(transactions, customers) {
        const revenues = transactions.filter(t => parseFloat(t.amount) > 0);
        const expenses = transactions.filter(t => parseFloat(t.amount) < 0);

        const totalRevenue = revenues.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0));
        const netProfit = totalRevenue - totalExpenses;

        // Margem Operacional
        const rawOperationalMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
        const operationalMargin = rawOperationalMargin.toFixed(2);

        // Ticket Médio
        const averageTicket = revenues.length > 0 ? (totalRevenue / revenues.length).toFixed(2) : "0.00";

        // HHI Concentração
        const revenueByCustomer = {};
        revenues.forEach(t => {
            const cId = t.customerId || 'sem_cliente';
            revenueByCustomer[cId] = (revenueByCustomer[cId] || 0) + parseFloat(t.amount);
        });
        const customerShares = Object.values(revenueByCustomer).map(r => r / totalRevenue);
        const hhi = customerShares.reduce((s, sh) => s + (sh * sh), 0).toFixed(4);
        const maxCustomerShare = (Math.max(...customerShares, 0) * 100).toFixed(2);

        // Volatilidade da Receita
        const revenueByMonth = {};
        revenues.forEach(t => {
            let y, m;
            if (t.releaseDate.includes('-')) {
                [y, m] = t.releaseDate.split('-');
            } else if (t.releaseDate.includes('/')) {
                const parts = t.releaseDate.split('/');
                y = parts[2];
                m = parts[1];
            } else {
                 y = "2026"; m = "01";
            }
            const key = `${y}-${m}`;
            revenueByMonth[key] = (revenueByMonth[key] || 0) + parseFloat(t.amount);
        });
        const monthlyRevenues = Object.values(revenueByMonth);
        const avgRev = monthlyRevenues.length > 0 ? monthlyRevenues.reduce((a, b) => a + b, 0) / monthlyRevenues.length : 0;
        const volatility = Math.sqrt(monthlyRevenues.length > 0 ? monthlyRevenues.reduce((s, r) => s + Math.pow(r - avgRev, 2), 0) / monthlyRevenues.length : 0).toFixed(2);

        // Faturamento Anual MEI Acumulado 
        const currentYear = new Date().getFullYear().toString();
        let faturamentoAnual = 0;
        revenues.forEach(t => {
            if (t.releaseDate.includes(currentYear)) {
                faturamentoAnual += parseFloat(t.amount);
            }
        });
        
        // Categorias e Classificação
        let unclassifiedCount = 0;
        const expensesByCategory = {};
        const revenueByCategory = {};
        
        transactions.forEach(t => {
            if (!t.classificationType || t.classificationType.trim() === '') {
                unclassifiedCount++;
                return;
            }
            
            const cat = t.category || 'Outros';
            const amt = Math.abs(parseFloat(t.amount));
            
            if (parseFloat(t.amount) > 0) {
                revenueByCategory[cat] = (revenueByCategory[cat] || 0) + amt;
            } else {
                expensesByCategory[cat] = (expensesByCategory[cat] || 0) + amt;
            }
        });

        // Format object for cleaner display in prompt
        const formatCategoryObj = (obj) => {
             const res = {};
             for (let prop in obj) {
                 res[prop] = parseFloat(obj[prop]).toFixed(2);
             }
             return res;
        };

        const dados_classificacao = {
            transacoes_nao_classificadas: unclassifiedCount,
            receitas_por_categoria: formatCategoryObj(revenueByCategory),
            despesas_por_categoria: formatCategoryObj(expensesByCategory)
        };

        return {
            totalRevenue,
            totalExpenses,
            netProfit,
            operationalMargin,
            averageTicket,
            hhi,
            maxCustomerShare,
            volatility,
            faturamentoAnual: faturamentoAnual.toFixed(2),
            transactionCount: transactions.length,
            customerCount: Object.keys(revenueByCustomer).length,
            dados_classificacao
        };
    }

    static checkMEIStatus(faturamentoAnual) {
        const limiteAnual = 81000;
        const percentualUtilizado = ((faturamentoAnual / limiteAnual) * 100).toFixed(2);
        
        let statusRisco = "Baixo Risco";
        if (percentualUtilizado > 90) statusRisco = "Risco Crítico (Descredeniamento Próximo)";
        else if (percentualUtilizado > 70) statusRisco = "Atenção (Projetar Migração)";

        return {
            limite_anual_mei: "81000.00",
            faturamento_acumulado: faturamentoAnual.toString(),
            percentual_utilizado: percentualUtilizado,
            status_risco: statusRisco,
            margem_seguranca: (limiteAnual - faturamentoAnual).toFixed(2)
        };
    }

    static detectAnomalies(transactions) {
        const alerts = [];
        const roundTransactions = transactions.filter(t => Math.abs(parseFloat(t.amount)) % 1000 === 0 && Math.abs(parseFloat(t.amount)) >= 1000);
        if (roundTransactions.length > 5) {
            alerts.push({ type: 'BENFORD_VIOLATION', description: `${roundTransactions.length} valores redondos.`, severity: 'MEDIUM' });
        }
        return alerts;
    }

    static async generateAnalysis(userId, transactions, customers, userProfile) {
        try {
            const kpis = this.calculateKPIs(transactions, customers);
            const anomalies = this.detectAnomalies(transactions);
            const status_mei = this.checkMEIStatus(parseFloat(kpis.faturamentoAnual));

            // Extrair classificação
            const dados_classificacao = kpis.dados_classificacao;
            // Remover dos kpis para não duplicar no prompt longo
            delete kpis.dados_classificacao;

            const inputData = { status_mei, kpis_calculados: kpis, alertas_estatisticos: anomalies, dados_classificacao };

            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: JSON.stringify(inputData),
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    responseMimeType: "application/json",
                }
            });

            // strip out any characters before/after the json curly braces
            let cleanResponse = response.text;
            if(cleanResponse.includes("\`\`\`json")) {
                cleanResponse = cleanResponse.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
            }

            const parsedResponse = JSON.parse(cleanResponse);

            return {
                success: true,
                data: {
                    ...parsedResponse,
                    kpis,
                    status_mei,
                    anomalies,
                    dados_classificacao
                }
            };
        } catch (error) {
            console.error('Error generating AI analysis:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static getSystemInstruction() {
        return SYSTEM_INSTRUCTION;
    }
}

module.exports = { AIFinancialAnalysisService };
