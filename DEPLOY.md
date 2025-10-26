# 🚀 Guia de Deploy - Cloudflare Workers

## ❌ Problema: "Failed: error occurred while fetching repository"

Se você está vendo esse erro, é porque o Cloudflare está tentando clonar o repositório Git e falhando.

---

## ✅ Solução: Deploy Manual via Dashboard

O jeito mais simples é fazer o deploy **copiando e colando** o código diretamente no dashboard do Cloudflare.

### **Passo a Passo Completo:**

#### **1. Criar KV Namespace**

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Vá em **Workers & Pages**
3. Clique em **KV**
4. Clique em **Create a namespace**
5. Nome: `TIKTOK_ORDERS`
6. Clique em **Add**
7. **Copie o ID do namespace** (você vai precisar)

---

#### **2. Criar o Worker**

1. Ainda em **Workers & Pages**
2. Clique em **Create application**
3. Escolha **Create Worker**
4. Dê um nome (ex: `tiktok-shop-checkout`)
5. Clique em **Deploy**

---

#### **3. Colar o Código**

1. Na página do Worker que acabou de criar
2. Clique em **Quick Edit** (ou **Edit Code**)
3. **Apague todo o código** que está lá
4. **Copie TODO o conteúdo** do arquivo `worker.js`
5. **Cole** no editor
6. Clique em **Save and Deploy**

---

#### **4. Configurar KV Namespace**

1. Na página do Worker, vá em **Settings**
2. Role até **Variables**
3. Na seção **KV Namespace Bindings**, clique em **Add binding**
4. Configure:
   - **Variable name:** `TIKTOK_ORDERS`
   - **KV namespace:** Selecione `TIKTOK_ORDERS` (que você criou no passo 1)
5. Clique em **Save**

---

#### **5. Configurar API Key do Asaas**

1. Ainda em **Settings > Variables**
2. Na seção **Environment Variables**, clique em **Add variable**
3. Configure:
   - **Variable name:** `ASAAS_API_KEY`
   - **Value:** Sua chave da API Asaas
   - **Type:** Secret (deixe marcado "Encrypt")
4. Clique em **Save**

---

#### **6. Editar Configurações no Código**

Volte ao editor (**Quick Edit**) e edite essas linhas no início:

```javascript
const ADMIN_PASSWORD = 'SUA_SENHA_FORTE_AQUI'; // MUDE ISSO!
const PRODUCT_PRICE = 47.00;
const DEFAULT_COMMISSION_PERCENT = 30;
```

Salve novamente.

---

#### **7. Testar o Worker**

1. Clique no botão **Preview** ou acesse a URL do Worker
2. Você verá a página de checkout
3. Teste acessando:
   - `/checkout` - Página de checkout
   - `/admin` - Painel admin (use a senha que configurou)
   - `/affiliate` - Painel de afiliados
   - `/affiliate/register` - Cadastro de afiliados

---

#### **8. Configurar Webhook no Asaas**

1. Acesse [Asaas.com](https://asaas.com)
2. Vá em **Configurações > Integrações > Webhooks**
3. Adicione novo webhook:
   - **URL:** `https://seu-worker.workers.dev/api/webhook/asaas`
   - **Eventos:**
     - ✅ `PAYMENT_RECEIVED`
     - ✅ `PAYMENT_CONFIRMED`
4. Salve

---

#### **9. (Opcional) Adicionar Domínio Customizado**

1. No Worker, vá em **Settings > Triggers**
2. Clique em **Add Custom Domain**
3. Digite seu domínio (ex: `checkout.seusite.com`)
4. Siga as instruções para configurar DNS

---

## 🔧 Alternativa: Deploy via Wrangler CLI

Se preferir usar linha de comando:

### **Instalar Wrangler**

```bash
npm install -g wrangler
```

### **Login no Cloudflare**

```bash
wrangler login
```

### **Editar wrangler.toml**

Abra o arquivo `wrangler.toml` e **substitua** `preview_id` pelo **ID real** do seu KV namespace:

```toml
kv_namespaces = [
  { binding = "TIKTOK_ORDERS", id = "SEU_ID_AQUI_DO_KV" }
]
```

### **Criar .dev.vars** (para secrets locais)

```bash
echo "ASAAS_API_KEY=sua_chave_aqui" > .dev.vars
```

### **Deploy**

```bash
wrangler deploy
```

### **Configurar Secrets**

```bash
wrangler secret put ASAAS_API_KEY
# Cole sua chave quando solicitado
```

---

## 🐛 Troubleshooting

### **"Configure o KV Namespace TIKTOK_ORDERS no Worker"**

- ✅ Certifique-se de que o binding está correto
- ✅ O nome deve ser EXATAMENTE `TIKTOK_ORDERS`
- ✅ Verifique em Settings > Variables

### **QR Code não aparece**

- ✅ Verifique se `ASAAS_API_KEY` está configurada
- ✅ Use a API **sandbox** primeiro: `https://sandbox.asaas.com`
- ✅ Para produção: `https://api.asaas.com`

### **Webhook não funciona**

- ✅ Verifique se a URL está correta
- ✅ Teste o webhook no painel do Asaas
- ✅ Veja os logs do Worker: Settings > Logs

---

## 📋 Checklist Rápido

- [ ] KV Namespace criado e vinculado
- [ ] Código do worker.js colado no editor
- [ ] ADMIN_PASSWORD alterado
- [ ] ASAAS_API_KEY configurada
- [ ] Webhook configurado no Asaas
- [ ] Teste realizado em /checkout

---

## ✅ Pronto!

Seu sistema está no ar! Acesse:

- **Checkout:** `https://seu-worker.workers.dev/checkout`
- **Admin:** `https://seu-worker.workers.dev/admin`
- **Afiliados:** `https://seu-worker.workers.dev/affiliate`

---

## 🆘 Precisa de Ajuda?

- **Cloudflare Workers:** https://developers.cloudflare.com/workers/
- **Asaas API:** https://docs.asaas.com
- **KV Storage:** https://developers.cloudflare.com/kv/

---

**Boa sorte com as vendas! 🚀💰**
