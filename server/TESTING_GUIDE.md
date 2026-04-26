# 🧪 Guia de Teste - Kalq Intelligence API

## ✅ Servidor está rodando!

O servidor está ativo em `http://localhost:3005`

---

## 🔍 Testando a API

### **Opção 1: Usando o Navegador (Mais Simples)**

1. **Faça login no sistema** através do frontend:
   - Acesse: `http://localhost:5173` (ou a porta do seu Vite)
   - Faça login com suas credenciais
   - Abra o Console do Navegador (F12)

2. **Execute este código no Console:**

```javascript
// Pegar o token do localStorage
const token = localStorage.getItem('token');

// Chamar a API de análise
fetch('http://localhost:3005/api/ai-analysis', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('📊 ANÁLISE COMPLETA:', data);
  console.log('\n🎯 Score:', data.data.score_saude_financeira);
  console.log('\n📝 Análise:', data.data.analise_executiva);
  console.log('\n💡 Insights:', data.data.insights_estrategicos);
  console.log('\n⚖️ Veredito:', data.data.veredito_cfo);
})
.catch(err => console.error('❌ Erro:', err));
```

---

### **Opção 2: Usando PowerShell**

```powershell
# 1. Fazer login e pegar o token
$loginBody = @{
    email = "thiagoimob2026@gmail.com"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3005/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token

# 2. Chamar a API de análise
$headers = @{
    Authorization = "Bearer $token"
}

$analysis = Invoke-RestMethod -Uri "http://localhost:3005/api/ai-analysis" -Method GET -Headers $headers

# 3. Exibir resultados
Write-Host "📊 Score de Saúde: $($analysis.data.score_saude_financeira)/100" -ForegroundColor Green
Write-Host "`n📝 Análise Executiva:" -ForegroundColor Cyan
Write-Host $analysis.data.analise_executiva

Write-Host "`n💡 Insights Estratégicos:" -ForegroundColor Yellow
$analysis.data.insights_estrategicos | ForEach-Object {
    Write-Host "`n[$($_.tipo)] $($_.titulo)" -ForegroundColor Magenta
    Write-Host "   $($_.descricao)"
    Write-Host "   ✅ Ação: $($_.acao_recomendada)" -ForegroundColor Green
}

Write-Host "`n⚖️ Veredito do CFO:" -ForegroundColor Cyan
Write-Host $analysis.data.veredito_cfo
```

---

### **Opção 3: Usando Postman / Insomnia**

#### **Passo 1: Login**
```
POST http://localhost:3005/api/auth/login
Content-Type: application/json

{
  "email": "thiagoimob2026@gmail.com",
  "password": "admin123"
}
```

**Copie o `token` da resposta.**

#### **Passo 2: Análise Financeira**
```
GET http://localhost:3005/api/ai-analysis
Authorization: Bearer SEU_TOKEN_AQUI
```

#### **Passo 3: System Instruction**
```
GET http://localhost:3005/api/ai-analysis/system-instruction
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 📊 Exemplo de Resposta Esperada

```json
{
  "success": true,
  "data": {
    "analise_executiva": "Situação financeira estável com 2 pontos de atenção identificados. Há oportunidades claras de otimização.",
    "score_saude_financeira": 75,
    "insights_estrategicos": [
      {
        "tipo": "OPORTUNIDADE",
        "titulo": "Oportunidade de Economia Tributária",
        "descricao": "Você está pagando R$ 12.345,00 em impostos como PF. Migrando para PJ (Anexo III), pagaria apenas R$ 7.407,00.",
        "acao_recomendada": "Economize 40.00% (R$ 4.938,00) migrando para PJ. Consulte um contador para análise detalhada."
      }
    ],
    "veredito_cfo": "Seu negócio é viável no longo prazo, mas precisa de ajustes estratégicos...",
    "kpis": {
      "totalRevenue": 50000,
      "totalExpenses": 30000,
      "netProfit": 20000,
      "hhi": "0.1500",
      "maxCustomerShare": "35.00",
      "burnRate": "10000.00",
      "volatility": "2500.00",
      "fixedCostRatio": "45.00",
      "deductibleRatio": "72.00"
    }
  }
}
```

---

## ✅ Verificações Rápidas

### **1. Servidor está rodando?**
Abra o navegador e acesse: `http://localhost:3005`
- Deve mostrar: "API is running"

### **2. Rota de ping funciona?**
Acesse: `http://localhost:3005/api/ping`
- Deve retornar: `{"msg":"pong"}`

### **3. Tem dados para analisar?**
- Você precisa ter transações importadas no sistema
- Se não tiver, a API retornará uma mensagem informando que não há dados suficientes

---

## 🎯 Próximos Passos

Depois de testar a API, você pode:

1. **Criar uma página no frontend** para exibir a análise
2. **Integrar com Gemini/OpenAI** para análises mais sofisticadas
3. **Adicionar gráficos** para visualizar os KPIs
4. **Configurar alertas** automáticos baseados nos insights

---

## 🆘 Problemas Comuns

### **"Unauthorized" / 401**
- Verifique se o token está correto
- Faça login novamente para obter um token válido

### **"Dados Insuficientes"**
- Importe transações bancárias primeiro
- Vá para a página de Transações e faça upload de um CSV

### **Servidor não responde**
- Verifique se `npm start` está rodando
- Confirme que está na porta 3005

---

**🎉 Divirta-se testando o Kalq Intelligence!**
