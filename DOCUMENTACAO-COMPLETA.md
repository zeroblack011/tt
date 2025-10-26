# 📚 DOCUMENTAÇÃO COMPLETA - TIKTOK SHOP UK SISTEMA ULTIMATE 2.0

## 🎯 VISÃO GERAL DO SISTEMA

Sistema completo de vendas online com checkout PIX (Asaas), programa de afiliados com gamificação, painel administrativo avançado e portal do afiliado.

---

## 📋 ÍNDICE

1. [Arquitetura do Sistema](#arquitetura)
2. [Fluxo de Dados](#fluxo-de-dados)
3. [Funcionalidades Detalhadas](#funcionalidades)
4. [API Endpoints](#api-endpoints)
5. [Banco de Dados (KV)](#banco-de-dados)
6. [Integração Asaas](#integracao-asaas)
7. [Sistema de Afiliados](#sistema-afiliados)
8. [Sistema de Gamificação](#gamificacao)
9. [Sistema de Notificações](#notificacoes)
10. [Sistema 2FA](#sistema-2fa)
11. [Emails Automáticos](#emails)
12. [PWA (Progressive Web App)](#pwa)
13. [Segurança](#seguranca)

---

## 🏗️ ARQUITETURA DO SISTEMA {#arquitetura}

### **Tecnologias Utilizadas**

```yaml
Plataforma: Cloudflare Workers (Serverless)
Linguagem: JavaScript (ES2020+)
Banco de Dados: Cloudflare KV (Key-Value Store)
Pagamento: Asaas API (PIX)
Email: Resend API (Opcional)
Chat: Tawk.to (Opcional)
Gráficos: Chart.js
2FA: TOTP (Google Authenticator)
```

### **Componentes Principais**

```
┌─────────────────────────────────────────────────────┐
│                 CLOUDFLARE WORKER                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   Checkout   │  │    Admin     │  │ Afiliado │ │
│  │   (HTML/JS)  │  │  Panel (JS)  │  │ Portal   │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │           API HANDLERS (22 endpoints)       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │         HELPER FUNCTIONS (15+)              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
           │                    │
           ▼                    ▼
    ┌─────────────┐      ┌─────────────┐
    │ Cloudflare  │      │  Asaas API  │
    │     KV      │      │   (PIX)     │
    └─────────────┘      └─────────────┘
```

---

## 🔄 FLUXO DE DADOS {#fluxo-de-dados}

### **1. Fluxo de Compra (Cliente)**

```
1. Cliente acessa /checkout?ref=CODIGO_AFILIADO
   ↓
2. Sistema registra clique do afiliado
   ↓
3. Cliente preenche: Nome, Email, WhatsApp
   ↓
4. POST /api/create-order
   ↓
5. Worker cria pedido no KV
   ↓
6. Worker chama API Asaas para gerar PIX
   ↓
7. Asaas retorna: pixCode, pixQrCode
   ↓
8. Cliente vê QR Code PIX
   ↓
9. Cliente paga PIX
   ↓
10. Asaas envia webhook /api/webhook/asaas
    ↓
11. Worker marca pedido como PAGO
    ↓
12. Worker credita comissão ao afiliado
    ↓
13. Worker envia notificações (admin + afiliado)
    ↓
14. Worker envia emails (opcional)
```

### **2. Fluxo de Afiliado**

```
1. Pessoa se cadastra em /afiliado
   ↓
2. POST /api/affiliate/register
   ↓
3. Worker gera código único (ex: JOAOSILVA1234)
   ↓
4. Status inicial: PENDING
   ↓
5. Admin acessa painel → Afiliados
   ↓
6. Admin aprova afiliado (status → ACTIVE)
   ↓
7. Afiliado recebe notificação + email
   ↓
8. Afiliado compartilha link: /checkout?ref=CODIGO
   ↓
9. Vendas são creditadas automaticamente
   ↓
10. Admin paga comissões manualmente
```

### **3. Fluxo de Webhook Asaas**

```
Asaas detecta pagamento
   ↓
POST /api/webhook/asaas
   ↓
{
  "event": "PAYMENT_CONFIRMED",
  "payment": {
    "id": "pay_xxx",
    "status": "RECEIVED"
  }
}
   ↓
Worker busca pedido pelo asaasId
   ↓
Atualiza pedido.status = "paid"
   ↓
Atualiza stats globais
   ↓
Se tem afiliado:
  - Incrementa totalSales
  - Adiciona comissão pendente
  - Verifica se subiu de nível
  - Envia notificação
   ↓
Envia emails (cliente + admin)
```

---

## 🎯 FUNCIONALIDADES DETALHADAS {#funcionalidades}

### **✅ 1. CHECKOUT PAGE**

**Arquivo**: Função `getCheckoutHTML(affiliateCode)`

**Recursos**:
- ✅ Design responsivo (mobile-first)
- ✅ Tema dark/light (salvo em localStorage)
- ✅ Countdown timer (15 minutos)
- ✅ Badge de afiliado (quando tem ?ref=)
- ✅ Validação de formulário
- ✅ Geração de PIX via Asaas
- ✅ QR Code + Código copia/cola
- ✅ Tracking UTM (source, medium, campaign)
- ✅ PWA manifest
- ✅ Service Worker (cache offline)
- ✅ Chat Tawk.to integrado

**Campos do Formulário**:
```javascript
{
  name: String,        // Nome completo
  email: String,       // Email válido
  whatsapp: String,    // Telefone
  affiliateCode: String, // Código do afiliado (opcional)
  utmSource: String,   // UTM tracking (opcional)
  utmMedium: String,
  utmCampaign: String
}
```

**Fluxo JavaScript**:
```javascript
// 1. Registrar clique de afiliado
if (refCode) {
  fetch('/api/affiliate/click', {
    method: 'POST',
    body: JSON.stringify({ code: refCode })
  });
}

// 2. Submit formulário
fetch('/api/create-order', {
  method: 'POST',
  body: JSON.stringify({
    name, email, whatsapp,
    affiliateCode, utmSource, utmMedium, utmCampaign
  })
});

// 3. Exibir PIX
modal.innerHTML = `
  <img src="data:image/png;base64,${pixQrCode}">
  <div>${pixCode}</div>
`;
```

---

### **✅ 2. PAINEL ADMIN**

**Arquivo**: Constante `ADMIN_HTML`

**Autenticação**:
```javascript
// Senha fixa (configurável)
const ADMIN_PASSWORD = 'aDMIN173@';

// 2FA opcional (TOTP)
if (env.TOTP_SECRET && tfaCode) {
  verify2FACode(env, tfaCode);
}
```

**Dashboard - Estatísticas**:
```javascript
{
  total: Number,       // Total de pedidos
  paid: Number,        // Pedidos pagos
  revenue: Number,     // Receita total (R$)
  commission: Number   // Comissões pagas (R$)
}
```

**Gráfico de Vendas** (Chart.js):
```javascript
// Últimos 7 dias
{
  labels: ['2024-01-01', '2024-01-02', ...],
  datasets: [
    {
      label: 'Vendas',
      data: [5, 8, 12, ...]
    },
    {
      label: 'Receita (R$)',
      data: [235, 376, 564, ...]
    }
  ]
}
```

**Tabs**:
1. **Pedidos**: Lista todos os pedidos com ações
2. **Afiliados**: Gerenciar afiliados
3. **Relatórios**: Relatórios avançados (diário/semanal/mensal)
4. **Configurações**: 2FA, tema

**Ações de Pedidos**:
- ✅ Marcar como pago (manual)
- ✅ Deletar pedido
- ✅ Exportar CSV
- ✅ Filtrar por status

**Ações de Afiliados**:
- ✅ Aprovar/Bloquear (toggle status)
- ✅ Pagar comissão
- ✅ Ver detalhes

**Notificações em Tempo Real**:
```javascript
// Campaninha com badge
🔔 [3]  // 3 não lidas

// Tipos de notificação:
- new_order: Novo pedido criado
- payment_confirmed: Pagamento confirmado
- new_affiliate: Novo afiliado cadastrado
```

---

### **✅ 3. PORTAL DO AFILIADO**

**Arquivo**: Constante `AFFILIATE_HTML`

**Autenticação**:
```javascript
// Login com email + senha
POST /api/affiliate/login
{
  email: String,
  password: String (Base64)
}
```

**Dashboard**:
```javascript
{
  clicks: Number,           // Total de cliques
  totalSales: Number,       // Total de vendas
  totalRevenue: Number,     // Receita gerada
  pendingCommission: Number, // Comissão pendente
  paidCommission: Number,   // Comissão paga
  level: String,            // bronze, silver, gold, platinum, diamond
  badge: String             // 🥉, 🥈, 🥇, 💎, 💠
}
```

**Barra de Progresso**:
```javascript
// Meta atual vs próximo nível
{
  bronze: 5 vendas,
  silver: 15 vendas,
  gold: 30 vendas,
  platinum: 50 vendas,
  diamond: 100 vendas
}

// Exemplo: 8 vendas (bronze)
Progresso: 8/15 = 53% para Prata
```

**Ranking de Afiliados**:
```javascript
// Top 10 afiliados ativos
[
  {
    position: 1,
    name: 'João Silva',
    badge: '💎',
    totalSales: 127,
    totalRevenue: 5969.00
  },
  ...
]
```

**Tabela de Vendas**:
```javascript
// Histórico completo
[
  {
    id: 'ORDER_xxx',
    txid: 'TRK123456',
    customerName: 'Maria Santos',
    amount: 47.00,
    commission: 14.10,  // 30%
    status: 'paid',
    createdAt: '2024-01-15T10:30:00Z',
    paidAt: '2024-01-15T10:35:00Z'
  }
]
```

**Link de Afiliado**:
```
https://seu-worker.workers.dev/checkout?ref=JOAOSILVA1234
```

**Informações de Pagamento**:
```javascript
// Textarea livre
paymentInfo: String
// Exemplo:
"PIX: 123.456.789-00
 Banco: 001
 Agência: 1234
 Conta: 12345-6"
```

---

## 🔌 API ENDPOINTS {#api-endpoints}

### **📦 CHECKOUT APIs**

#### **1. POST /api/create-order**
```javascript
// Request
{
  name: String,
  email: String,
  whatsapp: String,
  affiliateCode?: String,
  utmSource?: String,
  utmMedium?: String,
  utmCampaign?: String
}

// Response (success)
{
  success: true,
  orderId: 'ORDER_1705315200000_abc123',
  txid: 'TRK123456',
  pixCode: 'EMV PIX STRING...',
  pixQrCode: 'BASE64_IMAGE...',
  amount: 47.00
}

// Response (error)
{
  error: 'Dados incompletos'
}
```

**Lógica Interna**:
```javascript
1. Validar dados obrigatórios
2. Gerar orderId único
3. Gerar txid único
4. Buscar afiliado (se código fornecido)
5. Calcular comissão (30%)
6. Criar cobrança Asaas
7. Salvar pedido no KV
8. Atualizar ORDER_LIST
9. Atualizar STATS
10. Adicionar à AFFILIATE_SALES
11. Criar notificação admin
12. Enviar email (opcional)
13. Retornar PIX
```

#### **2. POST /api/webhook/asaas**
```javascript
// Request (Asaas)
{
  event: 'PAYMENT_RECEIVED' | 'PAYMENT_CONFIRMED',
  payment: {
    id: 'pay_xxx',
    value: 47.00,
    status: 'RECEIVED'
  }
}

// Response
{
  success: true
}
```

**Lógica Interna**:
```javascript
1. Buscar pedido pelo asaasId
2. Verificar se status = 'pending'
3. Atualizar status = 'paid'
4. Registrar paidAt
5. Atualizar STATS (paid++, revenue+=)
6. Se tem afiliado:
   a. Incrementar totalSales
   b. Adicionar totalRevenue
   c. Adicionar totalCommission
   d. Adicionar pendingCommission
   e. Verificar mudança de nível
   f. Criar notificação sale_confirmed
   g. Criar notificação level_up (se subiu)
7. Criar notificação payment_confirmed (admin)
8. Enviar emails
```

---

### **👥 AFFILIATE APIs**

#### **3. POST /api/affiliate/register**
```javascript
// Request
{
  name: String,
  email: String,
  whatsapp: String,
  password: String
}

// Response
{
  success: true,
  message: 'Cadastro enviado! Aguarde aprovação.',
  code: 'JOAOSILVA1234'
}
```

**Lógica de Geração de Código**:
```javascript
function generateAffiliateCode(name) {
  // Nome sem espaços + 4 chars aleatórios
  return name
    .replace(/\s+/g, '')
    .substring(0, 10)
    .toUpperCase()
    + Math.random().toString(36).substring(2, 6).toUpperCase();
}
// Exemplo: "João Silva" → "JOAOSILVA" + "AB12" → "JOAOSILVAAB12"
```

#### **4. POST /api/affiliate/login**
```javascript
// Request
{
  email: String,
  password: String
}

// Response
{
  success: true,
  affiliate: {
    id: 'AFF_xxx',
    code: 'JOAOSILVA1234',
    name: 'João Silva',
    email: 'joao@email.com',
    status: 'active',
    totalSales: 12,
    totalRevenue: 564.00,
    totalCommission: 169.20,
    pendingCommission: 42.30,
    paidCommission: 126.90,
    clicks: 85,
    level: 'bronze',
    badge: '🥉'
    // password removido por segurança
  }
}
```

#### **5. POST /api/affiliate/details**
```javascript
// Request
{
  email: String,
  password: String
}

// Response
{
  success: true,
  affiliate: {
    ...dados_basicos,
    affiliateLink: 'https://worker.dev/checkout?ref=CODE',
    orders: [
      {
        id: 'ORDER_xxx',
        txid: 'TRK123',
        customerName: 'Maria',
        amount: 47.00,
        commission: 14.10,
        status: 'paid',
        createdAt: '...',
        paidAt: '...'
      }
    ]
  }
}
```

#### **6. POST /api/affiliate/update-payment**
```javascript
// Request
{
  email: String,
  password: String,
  paymentInfo: String
}

// Response
{
  success: true,
  message: 'Informações de pagamento atualizadas!'
}
```

#### **7. POST /api/affiliate/click**
```javascript
// Request
{
  code: String
}

// Response
{
  success: true
}

// Lógica: incrementa affiliate.clicks
```

#### **8. GET /api/affiliate/ranking**
```javascript
// Response
{
  success: true,
  ranking: [
    {
      code: 'JOAO1234',
      name: 'João Silva',
      totalSales: 127,
      totalRevenue: 5969.00,
      level: 'diamond',
      badge: '💠'
    },
    ...
  ]
}
```

#### **9. POST /api/affiliate/update-goal**
```javascript
// Request
{
  email: String,
  password: String,
  goal: Number  // Meta personalizada
}

// Response
{
  success: true,
  message: 'Meta atualizada com sucesso!'
}
```

---

### **🔐 ADMIN APIs**

#### **10. POST /api/admin/orders**
```javascript
// Request
{
  password: String,
  tfaCode?: String  // Se 2FA habilitado
}

// Response
{
  success: true,
  orders: [...],
  stats: {
    total: 50,
    paid: 42,
    revenue: 1974.00,
    commission: 592.20
  }
}
```

#### **11. POST /api/admin/affiliates**
```javascript
// Request
{
  password: String
}

// Response
{
  success: true,
  affiliates: [...]
}
```

#### **12. POST /api/admin/toggle-affiliate**
```javascript
// Request
{
  password: String,
  code: String  // Código do afiliado
}

// Response
{
  success: true,
  newStatus: 'active' | 'blocked' | 'pending'
}

// Lógica toggle:
pending → active
active → blocked
blocked → active
```

#### **13. POST /api/admin/pay-commission**
```javascript
// Request
{
  password: String,
  code: String
}

// Response
{
  success: true,
  message: 'Comissão paga com sucesso!'
}

// Lógica:
1. Pegar affiliate.pendingCommission
2. Zerar pendingCommission
3. Adicionar ao paidCommission
4. Marcar todos pedidos como commissionPaid=true
5. Criar notificação commission_paid
6. Enviar email
```

#### **14. POST /api/admin/mark-paid**
```javascript
// Request
{
  password: String,
  orderId: String
}

// Response
{
  success: true
}

// Lógica: marca pedido como pago manualmente
```

#### **15. POST /api/admin/delete-order**
```javascript
// Request
{
  password: String,
  orderId: String
}

// Response
{
  success: true
}
```

#### **16. POST /api/admin/export**
```javascript
// Request
{
  password: String
}

// Response: CSV file
Content-Type: text/csv
Content-Disposition: attachment; filename="pedidos.csv"

ID,TXID,Nome,Email,WhatsApp,Valor,Status,Afiliado,Comissao,Data,Pago Em
ORDER_xxx,TRK123,João,joao@email.com,(11)99999-9999,47.00,paid,MARIA1234,14.10,2024-01-15,2024-01-15
...
```

#### **17. POST /api/admin/reports**
```javascript
// Request
{
  password: String,
  period: 'daily' | 'weekly' | 'monthly'
}

// Response
{
  success: true,
  report: {
    period: 'weekly',
    total: 25,        // Total de pedidos no período
    paid: 20,         // Pagos
    pending: 5,       // Pendentes
    revenue: 940.00,  // Receita
    commission: 282.00, // Comissões
    conversionRate: '80.00', // Taxa de conversão %
    orders: [...]     // Lista filtrada
  }
}

// Lógica de filtro:
daily: últimas 24h
weekly: últimos 7 dias
monthly: últimos 30 dias
```

#### **18. POST /api/admin/dashboard-stats**
```javascript
// Request
{
  password: String
}

// Response
{
  success: true,
  chartData: {
    labels: ['2024-01-10', '2024-01-11', ...], // últimos 7 dias
    sales: [5, 8, 12, 7, 15, 10, 9],
    revenue: [235, 376, 564, 329, 705, 470, 423]
  }
}
```

---

### **🔐 2FA APIs**

#### **19. POST /api/admin/2fa/setup**
```javascript
// Request
{
  password: String
}

// Response
{
  success: true,
  secret: 'ABCD1234EFGH5678...',  // 32 chars Base32
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?data=otpauth://...'
}

// Lógica:
1. Gerar secret aleatório (Base32)
2. Salvar em KV: TOTP_SECRET
3. Gerar otpauth URL
4. Retornar QR Code
```

#### **20. POST /api/admin/2fa/verify**
```javascript
// Request
{
  password: String,
  code: String  // 6 dígitos
}

// Response
{
  success: true,
  message: '2FA ativado com sucesso!'
}

// Lógica TOTP:
1. Pegar TOTP_SECRET do KV
2. Calcular token atual (time-based)
3. Comparar com código fornecido
4. Janela de 30 segundos
```

#### **21. POST /api/admin/2fa/disable**
```javascript
// Request
{
  password: String
}

// Response
{
  success: true,
  message: '2FA desativado'
}

// Lógica: deletar TOTP_SECRET do KV
```

---

### **🔔 NOTIFICATION APIs**

#### **22. POST /api/notifications**
```javascript
// Request
{
  recipient: 'admin' | 'AFF_xxx'
}

// Response
{
  success: true,
  notifications: [
    {
      id: 'NOTIF_xxx',
      type: 'new_order',
      title: 'Novo Pedido',
      message: 'Pedido TRK123 de João - R$ 47.00',
      data: { orderId: '...', txid: '...' },
      read: false,
      createdAt: '2024-01-15T10:30:00Z'
    }
  ]
}
```

#### **23. POST /api/notifications/read**
```javascript
// Request
{
  notificationId: String
}

// Response
{
  success: true
}
```

#### **24. POST /api/notifications/clear**
```javascript
// Request
{
  recipient: String
}

// Response
{
  success: true
}
```

---

### **🎨 THEME API**

#### **25. POST /api/theme/save**
```javascript
// Request
{
  userId: String,
  theme: 'dark' | 'light'
}

// Response
{
  success: true,
  theme: 'dark'
}
```

---

## 💾 BANCO DE DADOS (KV) {#banco-de-dados}

### **Estrutura de Chaves**

```javascript
// PEDIDOS
ORDER_xxx                → JSON do pedido
ORDER_LIST              → Array de IDs ['ORDER_1', 'ORDER_2', ...]

// AFILIADOS
AFFILIATE:CODIGO        → JSON do afiliado
AFFILIATE_LIST          → Array de códigos ['JOAO1234', 'MARIA5678', ...]
AFFILIATE_SALES:AFF_xxx → Array de pedidos do afiliado

// ESTATÍSTICAS
STATS                   → JSON { total, paid, revenue, commission }

// NOTIFICAÇÕES
NOTIF_xxx              → JSON da notificação
NOTIFICATIONS:admin    → Array de IDs de notificações
NOTIFICATIONS:AFF_xxx  → Array de IDs

// 2FA
TOTP_SECRET            → String Base32

// TEMA
THEME:admin            → 'dark' | 'light'
THEME:AFF_xxx          → 'dark' | 'light'
```

### **Modelos de Dados**

#### **Order (Pedido)**
```javascript
{
  id: 'ORDER_1705315200000_abc123',
  txid: 'TRK123456',
  asaasId: 'pay_xxx',
  name: 'João Silva',
  email: 'joao@email.com',
  whatsapp: '(11) 99999-9999',
  amount: 47.00,
  status: 'pending' | 'paid',
  pixCode: 'EMV PIX STRING...',
  pixQrCode: 'BASE64...',
  createdAt: '2024-01-15T10:30:00.000Z',
  paidAt: '2024-01-15T10:35:00.000Z' | null,
  ip: '192.168.1.1',
  affiliateCode: 'JOAO1234' | null,
  affiliateId: 'AFF_xxx' | null,
  commission: 14.10,
  commissionPaid: false,
  utmSource: 'facebook' | null,
  utmMedium: 'cpc' | null,
  utmCampaign: 'lancamento' | null
}
```

#### **Affiliate (Afiliado)**
```javascript
{
  id: 'AFF_1705315200000_abc123',
  code: 'JOAOSILVA1234',
  name: 'João Silva',
  email: 'joao@email.com',
  whatsapp: '(11) 99999-9999',
  password: 'BASE64_ENCODED',  // btoa(senha)
  status: 'pending' | 'active' | 'blocked',
  totalSales: 12,
  totalRevenue: 564.00,
  totalCommission: 169.20,
  pendingCommission: 42.30,
  paidCommission: 126.90,
  clicks: 85,
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond',
  badge: '🥉' | '🥈' | '🥇' | '💎' | '💠',
  goal: 15,  // Meta personalizada
  createdAt: '2024-01-15T10:00:00.000Z',
  paymentInfo: 'PIX: 123.456.789-00\nBanco: 001...'
}
```

#### **Stats (Estatísticas Globais)**
```javascript
{
  total: 50,        // Total de pedidos criados
  paid: 42,         // Pedidos pagos
  revenue: 1974.00, // Receita total
  commission: 592.20 // Comissões totais pagas
}
```

#### **Notification (Notificação)**
```javascript
{
  id: 'NOTIF_1705315200000_abc123',
  type: 'new_order' | 'payment_confirmed' | 'new_affiliate' |
        'sale_confirmed' | 'level_up' | 'status_change' |
        'commission_paid',
  title: 'Novo Pedido',
  message: 'Pedido TRK123 de João - R$ 47.00',
  data: { orderId: '...', txid: '...', ... },
  recipient: 'admin' | 'AFF_xxx',
  read: false,
  createdAt: '2024-01-15T10:30:00.000Z'
}
```

---

## 💳 INTEGRAÇÃO ASAAS {#integracao-asaas}

### **API Endpoint**

```javascript
// SANDBOX (Testes)
https://sandbox.asaas.com/api/v3/payments

// PRODUÇÃO
https://api.asaas.com/v3/payments
```

### **Criar Cobrança PIX**

```javascript
async function createAsaasCharge(env, data) {
  const response = await fetch('https://sandbox.asaas.com/api/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': env.ASAAS_API_KEY
    },
    body: JSON.stringify({
      customer: data.customer.name,
      billingType: 'PIX',
      value: 47.00,
      dueDate: '2024-01-16',
      description: 'TikTok Shop UK Masterclass - TRK123456',
      externalReference: 'ORDER_xxx'
    })
  });

  const result = await response.json();

  return {
    success: true,
    data: {
      id: 'pay_xxx',
      pixCode: 'EMV_STRING...',
      pixQrCode: 'BASE64_IMAGE...'
    }
  };
}
```

### **Webhook Events**

```javascript
// Eventos que o sistema escuta:
- PAYMENT_RECEIVED   → Pagamento recebido
- PAYMENT_CONFIRMED  → Pagamento confirmado

// Eventos ignorados (não processados):
- PAYMENT_CREATED
- PAYMENT_OVERDUE
- PAYMENT_DELETED
```

### **Configurar Webhook no Asaas**

```
1. Acesse: https://sandbox.asaas.com/
2. Menu: Integrações > Webhooks
3. Adicionar Webhook:
   URL: https://seu-worker.workers.dev/api/webhook/asaas
   Eventos: PAYMENT_RECEIVED, PAYMENT_CONFIRMED
4. Salvar
```

---

## 👥 SISTEMA DE AFILIADOS {#sistema-afiliados}

### **Status do Afiliado**

```javascript
PENDING → Aguardando aprovação do admin
ACTIVE  → Aprovado, pode vender
BLOCKED → Bloqueado pelo admin
```

### **Fluxo de Aprovação**

```
1. Afiliado se cadastra
   ↓ status = PENDING
2. Admin recebe notificação
   ↓
3. Admin acessa painel → Afiliados
   ↓
4. Admin clica "Toggle Status"
   ↓ PENDING → ACTIVE
5. Afiliado recebe notificação + email
   ↓
6. Afiliado pode compartilhar link
```

### **Cálculo de Comissão**

```javascript
// Configuração
const AFFILIATE_COMMISSION = 30; // 30%
const PRODUCT_PRICE = 47.00;

// Cálculo
commission = PRODUCT_PRICE * (AFFILIATE_COMMISSION / 100);
// = 47.00 * 0.30
// = 14.10
```

### **Quando a Comissão é Creditada**

```javascript
// ✅ SIM - Comissão é creditada:
if (affiliate.status === 'active' && order.status === 'paid') {
  affiliate.pendingCommission += commission;
}

// ❌ NÃO - Comissão NÃO é creditada:
if (affiliate.status === 'pending') {
  // Afiliado ainda não aprovado
}
if (affiliate.status === 'blocked') {
  // Afiliado bloqueado
}
if (order.status === 'pending') {
  // Pedido ainda não foi pago
}
```

### **Pagamento de Comissões**

```javascript
// Admin acessa painel → Afiliados
// Clica em "Pagar" no afiliado

1. Transfere pendingCommission → paidCommission
2. Marca todos pedidos como commissionPaid = true
3. Cria notificação para afiliado
4. Envia email (opcional)

// ⚠️ Processo manual!
// O sistema NÃO transfere dinheiro automaticamente
// Admin deve fazer pagamento manualmente via PIX/TED
```

---

## 🎮 SISTEMA DE GAMIFICAÇÃO {#gamificacao}

### **Níveis e Metas**

```javascript
const AFFILIATE_GOALS = {
  bronze: {
    sales: 5,       // 5 vendas
    badge: '🥉',
    name: 'Bronze'
  },
  silver: {
    sales: 15,      // 15 vendas
    badge: '🥈',
    name: 'Prata'
  },
  gold: {
    sales: 30,      // 30 vendas
    badge: '🥇',
    name: 'Ouro'
  },
  platinum: {
    sales: 50,      // 50 vendas
    badge: '💎',
    name: 'Platina'
  },
  diamond: {
    sales: 100,     // 100 vendas
    badge: '💠',
    name: 'Diamante'
  }
};
```

### **Progressão de Nível**

```javascript
function getAffiliateLevel(salesCount) {
  if (salesCount >= 100) return 'diamond';
  if (salesCount >= 50) return 'platinum';
  if (salesCount >= 30) return 'gold';
  if (salesCount >= 15) return 'silver';
  return 'bronze';
}

// Exemplo:
// 0-4 vendas   → Bronze 🥉
// 5-14 vendas  → Bronze 🥉
// 15-29 vendas → Prata 🥈
// 30-49 vendas → Ouro 🥇
// 50-99 vendas → Platina 💎
// 100+ vendas  → Diamante 💠
```

### **Detecção de Mudança de Nível**

```javascript
// No webhook, quando pedido é confirmado:

const oldLevel = getAffiliateLevel(affiliate.totalSales - 1);
const newLevel = getAffiliateLevel(affiliate.totalSales);

if (oldLevel !== newLevel) {
  // SUBIU DE NÍVEL!

  affiliate.level = newLevel;
  affiliate.badge = AFFILIATE_GOALS[newLevel].badge;

  // Criar notificação
  createNotification(env, {
    type: 'level_up',
    title: '🎉 Novo Nível Alcançado!',
    message: `Parabéns! Você alcançou o nível ${AFFILIATE_GOALS[newLevel].name} ${AFFILIATE_GOALS[newLevel].badge}`,
    recipient: affiliate.id
  });
}
```

### **Barra de Progresso**

```javascript
// No portal do afiliado

// Exemplo: 8 vendas, nível Bronze
const currentSales = 8;
const currentLevel = 'bronze';
const nextTarget = AFFILIATE_GOALS.silver.sales; // 15

const progress = (currentSales / nextTarget) * 100;
// = (8 / 15) * 100
// = 53.33%

// Exibir:
"8/15 vendas para Prata 🥈"
[████████████░░░░░░░░] 53%
```

### **Ranking**

```javascript
// Ordenação:
affiliates.sort((a, b) => b.totalSales - a.totalSales);

// Top 10 afiliados
// Destacar Top 3 com estilo especial
```

---

## 🔔 SISTEMA DE NOTIFICAÇÕES {#notificacoes}

### **Tipos de Notificação**

```javascript
// ADMIN recebe:
- new_order         → Novo pedido criado
- payment_confirmed → Pagamento confirmado
- new_affiliate     → Novo afiliado cadastrado

// AFILIADO recebe:
- sale_confirmed    → Venda confirmada
- level_up          → Subiu de nível
- status_change     → Status alterado (aprovado/bloqueado)
- commission_paid   → Comissão paga
```

### **Criar Notificação**

```javascript
async function createNotification(env, notificationData) {
  // 1. Gerar ID único
  const notifId = 'NOTIF_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);

  // 2. Criar objeto
  const notification = {
    id: notifId,
    type: notificationData.type,
    title: notificationData.title,
    message: notificationData.message,
    data: notificationData.data || {},
    recipient: notificationData.recipient, // 'admin' ou 'AFF_xxx'
    read: false,
    createdAt: new Date().toISOString()
  };

  // 3. Salvar notificação
  await env.TIKTOK_ORDERS.put(notifId, JSON.stringify(notification));

  // 4. Adicionar à lista do destinatário
  let notificationsList = await env.TIKTOK_ORDERS.get('NOTIFICATIONS:' + notificationData.recipient);
  notificationsList = notificationsList ? JSON.parse(notificationsList) : [];
  notificationsList.unshift(notifId);

  // 5. Limitar a 100 notificações
  if (notificationsList.length > 100) {
    notificationsList = notificationsList.slice(0, 100);
  }

  // 6. Salvar lista atualizada
  await env.TIKTOK_ORDERS.put('NOTIFICATIONS:' + notificationData.recipient, JSON.stringify(notificationsList));
}
```

### **Exibir Notificações**

```javascript
// No painel (admin ou afiliado)

// 1. Buscar lista
const notificationsList = await KV.get('NOTIFICATIONS:admin');
const notifIds = JSON.parse(notificationsList);

// 2. Buscar cada notificação
const notifications = [];
for (const notifId of notifIds.slice(0, 50)) { // últimas 50
  const notifData = await KV.get(notifId);
  notifications.push(JSON.parse(notifData));
}

// 3. Contar não lidas
const unreadCount = notifications.filter(n => !n.read).length;

// 4. Exibir badge
🔔 [5] // 5 não lidas
```

### **Marcar como Lida**

```javascript
async function markAsRead(notifId) {
  const notifData = await KV.get(notifId);
  const notification = JSON.parse(notifData);

  notification.read = true;

  await KV.put(notifId, JSON.stringify(notification));
}
```

---

## 🔐 SISTEMA 2FA {#sistema-2fa}

### **Algoritmo TOTP (Time-Based OTP)**

```javascript
// Time-based One-Time Password
// RFC 6238

// Janela de tempo: 30 segundos
const timeStep = 30;
const time = Math.floor(Date.now() / 1000 / timeStep);

// Secret: 32 caracteres Base32
const secret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Gerar token de 6 dígitos
const token = generateTOTP(secret);
// Exemplo: "123456"
```

### **Gerar Secret**

```javascript
function generateTOTPSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; // Base32
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}
```

### **Gerar QR Code**

```javascript
// OTPAuth URL format
const issuer = 'TikTok Shop';
const accountName = 'admin';
const secret = 'ABCD1234...';

const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;

// Usar API externa para gerar QR Code
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;

// Admin escaneia com Google Authenticator
```

### **Verificar Código**

```javascript
async function verify2FACode(env, code) {
  // 1. Buscar secret
  const secret = await env.TIKTOK_ORDERS.get('TOTP_SECRET');
  if (!secret) return false;

  // 2. Gerar token atual
  const token = await generateTOTP(secret);

  // 3. Comparar
  return code === token;
}
```

### **Login com 2FA**

```javascript
// 1. Admin digita senha
if (password !== ADMIN_PASSWORD) {
  return { error: 'Senha incorreta' };
}

// 2. Se 2FA habilitado, pedir código
if (env.TOTP_SECRET && !tfaCode) {
  return { error: 'Código 2FA necessário' };
}

// 3. Verificar código 2FA
if (env.TOTP_SECRET && tfaCode) {
  const isValid = await verify2FACode(env, tfaCode);
  if (!isValid) {
    return { error: 'Código 2FA inválido' };
  }
}

// 4. Login bem-sucedido
return { success: true };
```

---

## 📧 EMAILS AUTOMÁTICOS {#emails}

### **Configuração Resend API**

```javascript
// 1. Criar conta: https://resend.com/
// 2. Verificar domínio (ou usar resend.dev)
// 3. Criar API Key
// 4. Adicionar variável: RESEND_API_KEY
```

### **Enviar Email**

```javascript
async function sendEmail(env, emailData) {
  if (!env.RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + env.RESEND_API_KEY
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html
    })
  });

  const result = await response.json();
  return { success: true, data: result };
}
```

### **Templates de Email**

#### **1. Pedido Recebido**
```html
Assunto: Pedido TRK123456 - TikTok Shop UK Masterclass

Olá João Silva,

Seu pedido foi recebido com sucesso!

ID do Pedido: TRK123456
Produto: TikTok Shop UK Masterclass
Valor: R$ 47,00
Status: Aguardando pagamento

Realize o pagamento via PIX para confirmar seu pedido.
```

#### **2. Pagamento Confirmado**
```html
Assunto: ✅ Pagamento Confirmado - TRK123456

Olá João Silva,

Seu pagamento foi confirmado com sucesso!

ID do Pedido: TRK123456
Valor: R$ 47,00
Pago em: 15/01/2024 às 10:35

Obrigado pela sua compra!
```

#### **3. Novo Afiliado (Boas-vindas)**
```html
Assunto: Bem-vindo ao Programa de Afiliados - TikTok Shop UK

Olá João Silva,

Seu cadastro foi recebido com sucesso!

Seu código de afiliado: JOAOSILVA1234
Status: Aguardando aprovação do administrador

Assim que seu cadastro for aprovado, você poderá começar
a divulgar e ganhar comissões!

Comissão por venda: 30%
```

#### **4. Status Atualizado**
```html
Assunto: Status Atualizado - TikTok Shop UK

Olá João Silva,

✅ Seu cadastro foi APROVADO!

Você já pode divulgar seu link de afiliado e começar a ganhar comissões.

Seu link:
https://worker.dev/checkout?ref=JOAOSILVA1234
```

#### **5. Comissão Paga**
```html
Assunto: 💰 Comissão Paga - TikTok Shop UK

Olá João Silva,

Sua comissão foi paga com sucesso!

Valor pago: R$ 42,30

Obrigado por fazer parte do nosso programa de afiliados!
```

#### **6. Notificação para Admin**
```html
Assunto: 💰 Novo Pagamento - TRK123456

Cliente: João Silva
Email: joao@email.com
WhatsApp: (11) 99999-9999
Pedido: TRK123456
Valor: R$ 47,00
Afiliado: MARIA1234
Comissão: R$ 14,10
```

---

## 📱 PWA (PROGRESSIVE WEB APP) {#pwa}

### **Manifest.json**

```json
GET /manifest.json

{
  "name": "TikTok Shop UK Masterclass - Sistema de Vendas",
  "short_name": "TikTok Shop",
  "description": "Sistema completo de vendas com afiliados",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#6366f1",
  "icons": [
    {
      "src": "https://cdn-icons-png.flaticon.com/512/3046/3046120.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "https://cdn-icons-png.flaticon.com/512/3046/3046120.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### **Service Worker**

```javascript
GET /sw.js

const CACHE_NAME = 'tiktok-shop-v1';
const urlsToCache = [
  '/',
  '/checkout',
  '/admin',
  '/afiliado'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch (cache-first)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Activate (limpar caches antigos)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### **Registrar Service Worker**

```javascript
// Em todas as páginas HTML

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### **Instalar como App**

```
1. Acessar site no Chrome mobile
2. Menu → "Adicionar à tela inicial"
3. App abre em modo standalone (sem barra do navegador)
4. Funciona offline (cache)
```

---

## 🔒 SEGURANÇA {#seguranca}

### **1. Autenticação Admin**

```javascript
// Senha fixa (configurável)
const ADMIN_PASSWORD = 'aDMIN173@';

// ⚠️ TROCAR ANTES DE PRODUÇÃO!
// Linha 22 do código

// 2FA opcional (TOTP)
// Adiciona camada extra de segurança
```

### **2. Autenticação Afiliado**

```javascript
// Email + Senha (Base64)
password: btoa('senha123') // 'c2VuaGExMjM='

// ⚠️ EM PRODUÇÃO, USE BCRYPT!
// Base64 NÃO é criptografia, apenas encoding
```

### **3. Validação de Dados**

```javascript
// Sempre validar dados do cliente

if (!data.name || !data.email || !data.whatsapp) {
  return jsonResponse({ error: 'Dados incompletos' }, 400, corsHeaders);
}

// Validar formato email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return { error: 'Email inválido' };
}
```

### **4. CORS Headers**

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Preflight
if (request.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

### **5. Rate Limiting**

```javascript
// ⚠️ NÃO IMPLEMENTADO
// Cloudflare Workers tem rate limiting automático

// Para adicionar:
// 1. Usar KV para contar requests por IP
// 2. Bloquear após X tentativas
// 3. Usar Cloudflare Rate Limiting Rules
```

### **6. Proteção Webhook**

```javascript
// ⚠️ IMPORTANTE: Validar webhook Asaas

// Opção 1: IP Allowlist
const asaasIPs = ['IP_ASAAS_1', 'IP_ASAAS_2'];
if (!asaasIPs.includes(request.headers.get('CF-Connecting-IP'))) {
  return new Response('Unauthorized', { status: 401 });
}

// Opção 2: Token secreto
const webhookToken = request.headers.get('X-Webhook-Token');
if (webhookToken !== env.WEBHOOK_SECRET) {
  return new Response('Unauthorized', { status: 401 });
}
```

### **7. Sanitização HTML**

```javascript
// Template literals são seguros
document.getElementById('name').innerHTML = `
  <h1>${name}</h1>
`;

// ⚠️ name pode conter XSS!

// Melhor:
document.getElementById('name').textContent = name;

// Ou escapar HTML:
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

### **8. Variáveis de Ambiente**

```javascript
// NUNCA commitar no código:
❌ const ASAAS_API_KEY = 'abc123';

// SEMPRE usar variáveis de ambiente:
✅ env.ASAAS_API_KEY

// No Cloudflare:
// Settings → Variables → Environment Variables
// Marcar como "Encrypted"
```

---

## 🎨 TEMAS (DARK/LIGHT)

### **Implementação**

```javascript
// Salvar preferência
function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
  localStorage.setItem('theme', theme);
}

// Carregar ao iniciar
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light-theme');
}
```

### **CSS**

```css
/* Dark (padrão) */
body {
  background: #0f172a;
  color: #e2e8f0;
}

/* Light */
body.light-theme {
  background: #f8fafc;
  color: #1e293b;
}
```

---

## 📊 MÉTRICAS E ANÁLISES

### **Dados Coletados**

```javascript
// Por Pedido:
- IP do cliente
- UTM parameters (source, medium, campaign)
- Código de afiliado
- Timestamp criação
- Timestamp pagamento

// Agregados:
- Total de pedidos
- Taxa de conversão
- Receita total
- Comissões pagas
- Vendas por afiliado
- Vendas por dia/semana/mês
```

### **Relatórios Disponíveis**

```javascript
// 1. Dashboard
- Total pedidos
- Pedidos pagos
- Receita total
- Comissões pagas
- Gráfico últimos 7 dias

// 2. Relatórios Avançados
- Diário (24h)
- Semanal (7 dias)
- Mensal (30 dias)
- Taxa de conversão
- Pedidos pending vs paid

// 3. Exportação
- CSV completo
- Todos os campos
- Filtros personalizados
```

---

## 🚀 DEPLOY E CONFIGURAÇÃO

### **Passo a Passo Completo**

```yaml
1. Criar Worker:
   - Acesse: https://dash.cloudflare.com/
   - Workers & Pages → Create Worker
   - Nome: tiktok-shop
   - Deploy

2. Criar KV Namespace:
   - KV → Create namespace
   - Nome: TIKTOK_ORDERS
   - Create

3. Vincular KV ao Worker:
   - Worker → Settings → Variables
   - KV Namespace Bindings → Add binding
   - Variable name: TIKTOK_ORDERS
   - KV namespace: TIKTOK_ORDERS
   - Save

4. Adicionar Variáveis:
   - Settings → Variables → Environment Variables
   - Add variable:
     * ASAAS_API_KEY (obrigatório)
     * RESEND_API_KEY (opcional)
     * ADMIN_EMAIL (opcional)
     * TAWK_TO_ID (opcional)
   - Marcar como "Encrypted"
   - Save

5. Configurar Asaas:
   - Criar conta: https://sandbox.asaas.com/
   - Copiar API Key
   - Menu: Integrações → Webhooks
   - Adicionar webhook:
     URL: https://worker.dev/api/webhook/asaas
     Eventos: PAYMENT_RECEIVED, PAYMENT_CONFIRMED

6. Editar Código:
   - Worker → Edit Code
   - Apagar código padrão
   - Colar código do CODIGO-ULTIMATE.js
   - Save and Deploy

7. Testar:
   - Acessar: https://worker.dev/
   - Fazer compra teste
   - Verificar admin: https://worker.dev/admin
```

---

## 📞 SUPORTE E TROUBLESHOOTING

### **Erros Comuns**

#### **1. "KV not found"**
```
Causa: KV não criado ou não vinculado
Solução:
1. Criar TIKTOK_ORDERS
2. Vincular ao Worker
3. Verificar nome exato
```

#### **2. "ASAAS_API_KEY not configured"**
```
Causa: Variável não adicionada
Solução:
1. Settings → Variables
2. Add variable: ASAAS_API_KEY
3. Valor: sua chave Asaas
4. Marcar "Encrypted"
5. Save
```

#### **3. "Syntax error at line X"**
```
Causa: Erro no código
Solução:
1. Verificar aspas dentro de template literals
2. Usar aspas simples em HTML: class='...'
3. Validar com: node --check arquivo.js
```

#### **4. Webhook não funciona**
```
Causa: URL incorreta ou eventos errados
Solução:
1. Verificar URL: https://worker.dev/api/webhook/asaas
2. Eventos: PAYMENT_RECEIVED, PAYMENT_CONFIRMED
3. Testar com PIX real (sandbox pode demorar)
```

#### **5. Emails não enviam**
```
Causa: RESEND_API_KEY não configurado
Solução:
1. Criar conta Resend
2. Criar API Key
3. Adicionar variável: RESEND_API_KEY
4. Emails são opcionais, sistema funciona sem
```

---

## 🎯 PRÓXIMOS PASSOS

### **Melhorias Sugeridas**

```javascript
// 1. Segurança
✅ Implementar bcrypt para senhas
✅ Rate limiting por IP
✅ Validar webhook Asaas
✅ CSP headers

// 2. Funcionalidades
✅ Múltiplos produtos
✅ Cupons de desconto
✅ Boleto bancário
✅ Cartão de crédito

// 3. Analytics
✅ Google Analytics
✅ Facebook Pixel
✅ Hotjar

// 4. Performance
✅ CDN para assets
✅ Minificação
✅ Lazy loading

// 5. UX
✅ Animações
✅ Loader states
✅ Error boundaries
✅ Toast notifications
```

---

## 📝 CHANGELOG

```
v2.0 - 2024-01-15
✅ Sistema completo de afiliados
✅ Gamificação com níveis
✅ Ranking de afiliados
✅ Notificações em tempo real
✅ 2FA para admin
✅ Relatórios avançados
✅ PWA
✅ Temas dark/light
✅ Chat integrado
✅ Emails automáticos

v1.0 - 2024-01-01
✅ Checkout com PIX
✅ Painel admin básico
✅ Sistema de afiliados básico
```

---

## 📄 LICENÇA

```
MIT License
Uso livre para projetos pessoais e comerciais
```

---

## 🙏 CRÉDITOS

```
Desenvolvido com Claude Code
Tecnologias: Cloudflare Workers, Asaas, Resend
Gráficos: Chart.js
Icons: Flaticon
```

---

**FIM DA DOCUMENTAÇÃO** 📚
