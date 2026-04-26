# Kalq Intelligence - AI Financial Analysis

## 📊 Visão Geral

O **Kalq Intelligence** é um sistema de análise financeira baseado em IA que atua como um CFO Sênior, Especialista Tributário e Auditor Forense. Diferente de ferramentas tradicionais que apenas somam receitas e despesas, o Kalq Intelligence cruza indicadores financeiros, fiscais e comportamentais para identificar:

1. **Riscos Ocultos** (Insolvência, Dependência de Cliente, Passivo Trabalhista)
2. **Oportunidades Tributárias** (Migração PF → PJ, Uso do Fator R)
3. **Padrões de Comportamento Nocivos** (Lifestyle Creep, Inelasticidade de Custos)

---

## 🎯 Modelos Mentais Aplicados

### 1. **Regra da Fragilidade (HHI & Concentração)**
- **Métrica**: Índice Herfindahl-Hirschman (HHI)
- **Alerta**: HHI > 0.25 ou cliente único > 40% da receita
- **Diagnóstico**: "Emprego disfarçado", não um negócio sustentável
- **Ação**: Diversificar base de clientes

### 2. **Elasticidade de Custo (Rigidez Orçamentária)**
- **Métrica**: Proporção Custos Fixos vs. Variáveis
- **Alerta**: Fixos > 70% + Alta Volatilidade de Receita
- **Diagnóstico**: Risco de Ruína
- **Ação**: Variabilizar custos (ex: salários → comissões)

### 3. **Eficiência Tributária (PF vs PJ)**
- **Métrica**: Comparação imposto PF vs. Simples Nacional
- **Alerta**: Diferença > 15%
- **Diagnóstico**: Ineficiência tributária
- **Ação**: Migração para PJ ou planejamento com Fator R

### 4. **Auditoria Forense (Anomalias)**
- **Métrica**: Lei de Benford, Transações Redondas
- **Alerta**: Múltiplas transações redondas (ex: R$ 5.000,00)
- **Diagnóstico**: Risco de Malha Fina
- **Ação**: Manter documentação comprobatória

---

## 🔌 API Endpoints

### **GET /api/ai-analysis**
Gera análise financeira completa para o usuário autenticado.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analise_executiva": "Situação financeira estável com 3 pontos de atenção identificados...",
    "score_saude_financeira": 75,
    "insights_estrategicos": [
      {
        "tipo": "OPORTUNIDADE",
        "titulo": "Oportunidade de Economia Tributária",
        "descricao": "Você está pagando R$ 45.000 em impostos como PF. Migrando para PJ (Anexo III), pagaria apenas R$ 27.000.",
        "acao_recomendada": "Economize 40% (R$ 18.000) migrando para PJ. Consulte um contador para análise detalhada."
      },
      {
        "tipo": "RISCO",
        "titulo": "Alta Concentração de Clientes",
        "descricao": "Seu HHI é 0.4200 (acima de 0.25). Seu maior cliente representa 65% da receita...",
        "acao_recomendada": "Diversifique sua base de clientes. Meta: nenhum cliente deve representar mais de 30% da receita."
      }
    ],
    "veredito_cfo": "Seu negócio é viável no longo prazo, mas precisa de ajustes estratégicos...",
    "kpis": {
      "totalRevenue": 150000,
      "totalExpenses": 90000,
      "netProfit": 60000,
      "hhi": "0.4200",
      "maxCustomerShare": "65.00",
      "burnRate": "15000.00",
      "volatility": "8500.00",
      "fixedCostRatio": "45.00",
      "deductibleRatio": "72.00",
      "transactionCount": 245,
      "customerCount": 8
    },
    "taxScenarios": {
      "imposto_atual_pf": "45000.00",
      "simulacao_simples_nacional": "27000.00",
      "economia_potencial": "18000.00",
      "economia_percentual": "40.00",
      "fator_r": "0.6000",
      "recomendacao_anexo": "Anexo III (Fator R)"
    },
    "anomalies": [
      {
        "type": "BENFORD_VIOLATION",
        "description": "8 transações com valores redondos (múltiplos de R$ 1.000). Possível risco de malha fina.",
        "severity": "MEDIUM"
      }
    ]
  }
}
```

### **GET /api/ai-analysis/system-instruction**
Retorna a System Instruction completa para integração com APIs externas (Gemini, OpenAI).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "systemInstruction": "# ROLE & OBJECTIVE\nVocê é o \"Kalq Intelligence\"..."
}
```

---

## 📈 KPIs Calculados

| KPI | Descrição | Fórmula |
|-----|-----------|---------|
| **HHI** | Índice de Concentração de Clientes | Σ(share_cliente²) |
| **Max Customer Share** | % do maior cliente na receita | (receita_maior_cliente / receita_total) × 100 |
| **Burn Rate** | Média mensal de gastos | total_despesas / meses_com_despesas |
| **Volatility** | Desvio padrão da receita mensal | √(Σ(receita_mês - média)² / n) |
| **Fixed Cost Ratio** | % de custos fixos | (custos_fixos / total_despesas) × 100 |
| **Deductible Ratio** | % de despesas dedutíveis | (despesas_dedutíveis / total_despesas) × 100 |

---

## 🧠 Integração com IA Externa (Gemini/OpenAI)

Para integrar com APIs de IA externas, use a System Instruction fornecida:

### Exemplo com Google Gemini:
```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeWithGemini(inputData) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-pro',
    systemInstruction: AIFinancialAnalysisService.getSystemInstruction()
  });

  const prompt = JSON.stringify(inputData);
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
```

### Exemplo com OpenAI:
```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function analyzeWithOpenAI(inputData) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: AIFinancialAnalysisService.getSystemInstruction()
      },
      {
        role: 'user',
        content: JSON.stringify(inputData)
      }
    ],
    response_format: { type: 'json_object' }
  });

  return JSON.parse(completion.choices[0].message.content);
}
```

---

## 🎨 Frontend Integration

### Exemplo de chamada no React:
```javascript
import { useState, useEffect } from 'react';

function AIAnalysisDashboard() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3005/api/ai-analysis', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAnalysis(data.data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Analisando seus dados...</div>;

  return (
    <div className="ai-analysis">
      <h1>Kalq Intelligence</h1>
      
      {/* Score de Saúde Financeira */}
      <div className="health-score">
        <h2>Score de Saúde: {analysis.score_saude_financeira}/100</h2>
        <p>{analysis.analise_executiva}</p>
      </div>

      {/* Insights Estratégicos */}
      <div className="insights">
        {analysis.insights_estrategicos.map((insight, idx) => (
          <div key={idx} className={`insight ${insight.tipo.toLowerCase()}`}>
            <span className="badge">{insight.tipo}</span>
            <h3>{insight.titulo}</h3>
            <p>{insight.descricao}</p>
            <button>{insight.acao_recomendada}</button>
          </div>
        ))}
      </div>

      {/* Veredito do CFO */}
      <div className="veredito">
        <h3>Veredito do CFO</h3>
        <p>{analysis.veredito_cfo}</p>
      </div>
    </div>
  );
}
```

---

## 🔐 Segurança

- Todas as rotas requerem autenticação via JWT
- Análises são geradas apenas para dados do usuário autenticado
- Dados sensíveis não são armazenados em cache

---

## 🚀 Próximos Passos

1. **Integração com IA Real**: Substituir `generateMockAnalysis` por chamadas reais ao Gemini/OpenAI
2. **Histórico de Análises**: Salvar análises anteriores para comparação temporal
3. **Alertas Proativos**: Notificar usuário quando novos riscos forem detectados
4. **Recomendações Personalizadas**: Sugestões específicas por profissão (Médico, Advogado, etc.)

---

## 📞 Suporte

Para dúvidas ou sugestões sobre o Kalq Intelligence, entre em contato com a equipe de desenvolvimento.
