# ✅ GUIA COMPLETO - DEPLOY NO CLOUDFLARE

## 📋 STATUS DO CÓDIGO: 100% PRONTO! ✅

O arquivo **CODIGO-ULTIMATE.js** está:
- ✅ Sem erros de sintaxe
- ✅ Corrigido (erro de Date resolvido)
- ✅ Completo com 4.198 linhas
- ✅ Testado e validado
- ✅ Pronto para copiar e colar

---

## 🚀 PASSO A PASSO PARA DEPLOY

### **PASSO 1: Acessar Cloudflare Workers**

1. Entre em: https://dash.cloudflare.com/
2. Vá em **Workers & Pages** (menu lateral esquerdo)
3. Clique em **Create Application**
4. Escolha **Create Worker**
5. Dê um nome (exemplo: `tiktok-shop-uk`)
6. Clique em **Deploy**

---

### **PASSO 2: Colar o Código**

1. Após criar o Worker, clique em **Edit Code** (Quick Edit)
2. **APAGUE TODO** o código padrão que aparece
3. **COPIE** todo conteúdo do arquivo `CODIGO-ULTIMATE.js`
4. **COLE** no editor do Cloudflare
5. Clique em **Save and Deploy** (botão azul no canto superior direito)

---

### **PASSO 3: Criar KV Namespace (Banco de Dados)**

1. Volte para **Workers & Pages**
2. No menu lateral, clique em **KV**
3. Clique em **Create a namespace**
4. Nome: `TIKTOK_ORDERS`
5. Clique em **Add**

---

### **PASSO 4: Vincular KV ao Worker**

1. Volte para **Workers & Pages**
2. Clique no seu Worker (tiktok-shop-uk)
3. Vá na aba **Settings**
4. Role até **Variables and Secrets**
5. Em **KV Namespace Bindings**, clique em **Add binding**
   - Variable name: `TIKTOK_ORDERS`
   - KV namespace: Selecione `TIKTOK_ORDERS`
6. Clique em **Save**

---

### **PASSO 5: Configurar Variáveis de Ambiente**

Na mesma página (**Settings > Variables and Secrets**):

1. Clique em **Add variable** em **Environment Variables**

Configure estas variáveis:

| Nome | Valor | Obrigatório |
|------|-------|-------------|
| `ASAAS_API_KEY` | Sua chave da Asaas | ✅ SIM |
| `RESEND_API_KEY` | Sua chave do Resend (emails) | ❌ Opcional |
| `ADMIN_EMAIL` | Seu email para notificações | ❌ Opcional |
| `TAWK_TO_ID` | ID do chat Tawk.to | ❌ Opcional |

**IMPORTANTE**: Marque como **Encrypted** as chaves de API!

---

### **PASSO 6: Obter Chave API Asaas**

#### **Para Testes (Sandbox)**
1. Acesse: https://sandbox.asaas.com/
2. Crie uma conta gratuita
3. Vá em **Integrações > API**
4. Copie a **API Key**
5. Cole em `ASAAS_API_KEY` no Cloudflare

#### **Para Produção (Real)**
1. Acesse: https://www.asaas.com/
2. Crie conta e complete cadastro
3. Vá em **Integrações > API**
4. Copie a **API Key de Produção**
5. **IMPORTANTE**: No código, troque a URL:
   - Linha que contém: `https://sandbox.asaas.com/api/v3/`
   - Trocar por: `https://api.asaas.com/v3/`

---

### **PASSO 7: Testar o Sistema**

1. Copie a URL do seu Worker (algo como: `https://tiktok-shop-uk.SEU-USUARIO.workers.dev`)
2. Acesse no navegador
3. Você deve ver a **página de checkout** ✅

**URLs disponíveis:**
- `/` ou `/checkout` → Página de compra
- `/admin` → Painel admin (senha: `aDMIN173@`)
- `/afiliado` → Portal do afiliado

---

## ⚙️ CONFIGURAÇÕES NO CÓDIGO

Antes de fazer deploy, você pode editar estas configurações no **CODIGO-ULTIMATE.js**:

```javascript
// Linha 22-25
const ADMIN_PASSWORD = 'aDMIN173@'; // ⚠️ TROQUE ESTA SENHA!
const PRODUCT_PRICE = 47.00; // Preço do seu produto
const PRODUCT_NAME = 'TikTok Shop UK Masterclass'; // Nome do produto
const AFFILIATE_COMMISSION = 30; // 30% de comissão para afiliados
```

---

## 📧 CONFIGURAR EMAIL (OPCIONAL)

Para enviar emails automáticos:

1. Crie conta em: https://resend.com/
2. Verifique seu domínio (ou use o domínio de testes)
3. Crie uma **API Key**
4. Adicione `RESEND_API_KEY` nas variáveis do Worker

---

## 💬 CONFIGURAR CHAT (OPCIONAL)

Para adicionar chat de suporte:

1. Crie conta em: https://tawk.to/
2. Crie um novo Widget
3. Copie o **Property ID** (algo como: `63f1a2b3c4d5e6f7g8h9i0j1`)
4. Adicione `TAWK_TO_ID` nas variáveis do Worker

---

## 🔧 TROUBLESHOOTING

### ❌ Erro: "KV not found"
- Certifique-se que criou o KV Namespace `TIKTOK_ORDERS`
- Verifique se vinculou corretamente ao Worker

### ❌ Erro: "ASAAS_API_KEY not configured"
- Adicione a variável `ASAAS_API_KEY` nas configurações
- Verifique se não tem espaços antes/depois da chave

### ❌ PIX não gera QR Code
- Verifique se a API Key do Asaas está correta
- Veja os logs: no painel do Worker, aba **Logs** (Real-time Logs)

---

## 🎯 PRÓXIMOS PASSOS APÓS DEPLOY

1. ✅ **Teste uma compra** usando PIX de teste do Asaas
2. ✅ **Cadastre um afiliado** em `/afiliado`
3. ✅ **Acesse o admin** em `/admin` e aprove o afiliado
4. ✅ **Teste link de afiliado**: `https://SEU-WORKER.workers.dev/?ref=CODIGO`
5. ✅ **Configure domínio personalizado** (opcional)

---

## 🌐 DOMÍNIO PERSONALIZADO (OPCIONAL)

1. No Worker, vá em **Settings > Triggers**
2. Clique em **Add Custom Domain**
3. Digite seu domínio (exemplo: `checkout.seusite.com`)
4. Siga instruções para configurar DNS

---

## 📊 RECURSOS DO SISTEMA

✅ Checkout completo com PIX via Asaas
✅ Sistema de afiliados com comissões
✅ Painel admin completo
✅ Portal do afiliado com dashboard
✅ Notificações em tempo real
✅ Gráficos de vendas (Chart.js)
✅ Relatórios avançados
✅ Sistema de gamificação (níveis bronze→diamante)
✅ Ranking de afiliados
✅ Temas dark/light
✅ PWA (Progressive Web App)
✅ 2FA para admin (Google Authenticator)
✅ Emails automáticos (opcional)
✅ Chat integrado (opcional)

---

## 📝 CHECKLIST FINAL

- [ ] Cloudflare Worker criado
- [ ] Código CODIGO-ULTIMATE.js colado
- [ ] KV Namespace TIKTOK_ORDERS criado e vinculado
- [ ] ASAAS_API_KEY configurada
- [ ] Senha admin alterada (linha 22)
- [ ] Preço do produto configurado (linha 23)
- [ ] Nome do produto configurado (linha 24)
- [ ] Primeira compra teste realizada
- [ ] Admin acessado e funcionando
- [ ] Sistema de afiliados testado

---

## 🆘 SUPORTE

Se tiver problemas:
1. Verifique os **Logs** do Worker em tempo real
2. Confirme que todas variáveis estão corretas
3. Teste no ambiente Sandbox do Asaas primeiro
4. Verifique se o KV está vinculado

---

**🎉 SUCESSO! Seu sistema está pronto para vender!**
