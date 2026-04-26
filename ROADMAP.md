# 🗺️ Roadmap - Kalq MEI (Marketplace & Gestão)

## 🚀 Fases do Projeto

### Fase 1: Fundação & Ajuste de Rota (✅ Concluído)
- [x] Autenticação e Rotas Base (Login/Registro).
- [x] Funcionalidade de Fluxo de Caixa via Importação de Banco (CSV).
- [x] Pivotagem: Criação do "Portal do MEI" focado em serviços e didática.
- [x] Criação do Marketplace de Serviços (Abertura, DASN, IRPF, Malha Fiscal, etc.) enviando leads para o WhatsApp.

### Fase 2: Gestão de Obrigações e Benefícios (✅ Concluído)
- [x] Painel interativo para acompanhamento do limite de faturamento anual do MEI.
- [x] Módulos de Cartões de Serviço com explicações didáticas.
- [x] Algoritmo Rápido ("Heurística Mensal") para avisar sobre saldo, organização e teto direto no Dashboard.

### Fase 3: Integração com IA Especialista (✅ Concluído)
- [x] Assistente virtual integrado (Google Gemini) focado 100% num "Consultor do MEI".
- [x] Varredura e Agrupamento de Categorias de Despesas.
- [x] Geração de Insights Estratégicos obrigatórios anti-alucinação.
- [x] Visão detalhada do Radar do MEI.

### Fase 4: O Que Falta Até o Deploy (🟡 Pendente)
- [ ] **Recuperação de Senha Completa:** Criar a rota no backend para gerar token de reset, enviar o email real (via Nodemailer/SendGrid) e a página de criação de nova senha. (Atualmente é apenas um mockup de UI).
- [ ] **Revisão de Segurança (CORS/Tokens):** Garantir que a API só aceita conexões do domínio de produção.
- [ ] **Hospedagem de Banco de Dados:** Migrar de SQLite local para um PostgreSQL em nuvem (ex: Supabase, Render, Railway).
- [ ] **Deploy Frontend:** Hospedar o React App na Vercel ou Netlify.
- [ ] **Deploy Backend:** Hospedar o Node App no Render ou Railway.
