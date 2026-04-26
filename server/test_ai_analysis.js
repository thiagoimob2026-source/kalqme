/**
 * Script de teste para a API de Análise Financeira com IA
 * Execute: node test_ai_analysis.js
 */

const BASE_URL = 'http://localhost:3005/api';

// Credenciais de teste (ajuste conforme necessário)
const TEST_USER = {
    email: 'thiagoimob2026@gmail.com',
    password: 'admin123'
};

async function testAIAnalysis() {
    try {
        console.log('🧪 Iniciando testes da API de Análise Financeira com IA...\n');

        // 1. Login
        console.log('1️⃣ Fazendo login...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });

        if (!loginRes.ok) {
            throw new Error(`Login falhou: ${loginRes.status}`);
        }

        const { accessToken } = await loginRes.json();
        const token = accessToken; // alias for the rest of the script
        console.log('✅ Login bem-sucedido!\n');

        // 2. Buscar System Instruction
        console.log('2️⃣ Buscando System Instruction...');
        const instructionRes = await fetch(`${BASE_URL}/ai-analysis/system-instruction`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!instructionRes.ok) {
            throw new Error(`Falha ao buscar instruction: ${instructionRes.status}`);
        }

        const { systemInstruction } = await instructionRes.json();
        console.log('✅ System Instruction obtida!');
        console.log(`📄 Tamanho: ${systemInstruction.length} caracteres\n`);

        // 3. Gerar Análise Financeira
        console.log('3️⃣ Gerando análise financeira...');
        const analysisRes = await fetch(`${BASE_URL}/ai-analysis`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!analysisRes.ok) {
            throw new Error(`Falha ao gerar análise: ${analysisRes.status}`);
        }

        const analysis = await analysisRes.json();
        console.log('✅ Análise gerada com sucesso!\n');

        // 4. Exibir Resultados
        console.log('📊 RESULTADOS DA ANÁLISE:');
        console.log('═'.repeat(80));
        console.log(`\n🎯 Score de Saúde Financeira: ${analysis.data.score_saude_financeira}/100`);
        console.log(`\n📝 Análise Executiva:\n${analysis.data.analise_executiva}`);

        console.log(`\n💡 Insights Estratégicos (${analysis.data.insights_estrategicos.length}):`);
        analysis.data.insights_estrategicos.forEach((insight, idx) => {
            console.log(`\n${idx + 1}. [${insight.tipo}] ${insight.titulo}`);
            console.log(`   📌 ${insight.descricao}`);
            console.log(`   ✅ Ação: ${insight.acao_recomendada}`);
        });

        console.log(`\n⚖️ Veredito do CFO:\n${analysis.data.veredito_cfo}`);

        // 5. Exibir KPIs
        if (analysis.data.kpis) {
            console.log('\n\n📈 KPIs CALCULADOS:');
            console.log('═'.repeat(80));
            console.log(`Receita Total: R$ ${analysis.data.kpis.totalRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
            console.log(`Despesas Totais: R$ ${analysis.data.kpis.totalExpenses?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
            console.log(`Lucro Líquido: R$ ${analysis.data.kpis.netProfit?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
            console.log(`HHI (Concentração): ${analysis.data.kpis.hhi}`);
            console.log(`Maior Cliente: ${analysis.data.kpis.maxCustomerShare}%`);
            console.log(`Burn Rate: R$ ${analysis.data.kpis.burnRate}`);
            console.log(`Volatilidade: R$ ${analysis.data.kpis.volatility}`);
            console.log(`Custos Fixos: ${analysis.data.kpis.fixedCostRatio}%`);
            console.log(`Despesas Dedutíveis: ${analysis.data.kpis.deductibleRatio}%`);
        }

        // 6. Exibir Simulações Fiscais
        if (analysis.data.taxScenarios) {
            console.log('\n\n💰 SIMULAÇÕES FISCAIS:');
            console.log('═'.repeat(80));
            console.log(`Imposto Atual (PF): R$ ${analysis.data.taxScenarios.imposto_atual_pf}`);
            console.log(`Simples Nacional (PJ): R$ ${analysis.data.taxScenarios.simulacao_simples_nacional}`);
            console.log(`Economia Potencial: R$ ${analysis.data.taxScenarios.economia_potencial} (${analysis.data.taxScenarios.economia_percentual}%)`);
            console.log(`Fator R: ${analysis.data.taxScenarios.fator_r}`);
            console.log(`Recomendação: ${analysis.data.taxScenarios.recomendacao_anexo}`);
        }

        // 7. Exibir Anomalias
        if (analysis.data.anomalies && analysis.data.anomalies.length > 0) {
            console.log('\n\n⚠️ ANOMALIAS DETECTADAS:');
            console.log('═'.repeat(80));
            analysis.data.anomalies.forEach((anomaly, idx) => {
                console.log(`\n${idx + 1}. [${anomaly.severity}] ${anomaly.type}`);
                console.log(`   ${anomaly.description}`);
            });
        }

        console.log('\n\n✅ Todos os testes passaram com sucesso!');

    } catch (error) {
        console.error('\n❌ Erro durante os testes:', error.message);
        console.error(error);
    }
}

// Executar testes
testAIAnalysis();
