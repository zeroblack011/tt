# 🚀 INSTALAÇÃO RÁPIDA - 5 MINUTOS

## ⚠️ VOCÊ ESTÁ NO LUGAR ERRADO!

Se você está vendo erro de "clonagem do git", é porque está tentando usar **Cloudflare Pages**.

**Este projeto é para Cloudflare WORKERS, não Pages!**

---

## ✅ SOLUÇÃO: Deploy em 5 Passos

### **PASSO 1: Criar KV Storage**

1. Acesse: https://dash.cloudflare.com
2. Menu lateral: **Workers & Pages**
3. Clique na aba **KV**
4. Botão **Create a namespace**
5. Nome: `TIKTOK_ORDERS`
6. Clique **Add**
7. **COPIE O ID** que aparece (vai precisar depois)

---

### **PASSO 2: Criar Worker**

1. Ainda em **Workers & Pages**
2. Clique em **Create application**
3. Escolha **Create Worker** (NÃO Pages!)
4. Nome: `tiktok-checkout` (ou qualquer nome)
5. Clique **Deploy**

---

### **PASSO 3: Copiar o Código**

1. Na tela do Worker, clique **Quick Edit**
2. **APAGUE TODO** o código que está lá
3. **Abra o arquivo `worker.js`** deste repositório
4. **COPIE TODO** o conteúdo
5. **COLE** no editor do Cloudflare
6. Clique **Save and Deploy**

---

### **PASSO 4: Configurar Variáveis**

1. Saia do editor (voltar para página do Worker)
2. Clique em **Settings**
3. Role até **Variables**

**4.1 - Adicionar KV Namespace:**
- Seção: **KV Namespace Bindings**
- Clique **Add binding**
- Variable name: `TIKTOK_ORDERS`
- KV namespace: Selecione `TIKTOK_ORDERS`
- Clique **Save**

**4.2 - Adicionar API Key:**
- Seção: **Environment Variables**
- Clique **Add variable**
- Variable name: `ASAAS_API_KEY`
- Value: (sua chave da API Asaas)
- Tipo: **Encrypt** (deixe marcado)
- Clique **Save**

---

### **PASSO 5: Configurar Senha Admin**

1. Volte para **Quick Edit**
2. Encontre a linha (aproximadamente linha 6):
   ```javascript
   const ADMIN_PASSWORD = 'aDMIN173@';
   ```
3. **TROQUE** para uma senha forte:
   ```javascript
   const ADMIN_PASSWORD = 'MinhaS3nh@F0rt3!';
   ```
4. Clique **Save and Deploy**

---

## 🎉 PRONTO!

Seu sistema está no ar! Acesse:

- **Checkout:** `https://tiktok-checkout.seu-nome.workers.dev/checkout`
- **Admin:** `https://tiktok-checkout.seu-nome.workers.dev/admin`
- **Afiliados:** `https://tiktok-checkout.seu-nome.workers.dev/affiliate`

*(substitua `tiktok-checkout.seu-nome` pela URL real do seu worker)*

---

## 🔧 Configurar Asaas (Pagamento Automático)

### **1. Pegar API Key:**
1. Acesse https://www.asaas.com
2. Login na sua conta
3. Menu: **Configurações → Integrações**
4. Copie sua **API Key**

### **2. Configurar Webhook:**
1. Ainda em Integrações, vá em **Webhooks**
2. Clique **Adicionar**
3. URL: `https://tiktok-checkout.seu-nome.workers.dev/api/webhook/asaas`
4. Marque os eventos:
   - ✅ `PAYMENT_RECEIVED`
   - ✅ `PAYMENT_CONFIRMED`
5. Salve

---

## ❌ NÃO USE CLOUDFLARE PAGES!

Se você vê esta tela:

```
┌─────────────────────────────────┐
│  Connect to Git repository      │  ← ERRADO!
│  ○ GitHub                        │
│  ○ GitLab                        │
└─────────────────────────────────┘
```

**Você está no lugar errado!**

### ✅ Use esta tela (Workers):

```
┌─────────────────────────────────┐
│  Create Worker                   │  ← CERTO!
│  [Nome do Worker]                │
│  [Deploy]                        │
└─────────────────────────────────┘
```

---

## 🆘 Problemas Comuns

### **"Configure o KV Namespace"**
- Certifique-se de que o nome é EXATAMENTE `TIKTOK_ORDERS`
- Verifique em Settings > Variables

### **"QR Code não aparece"**
- Verifique se a `ASAAS_API_KEY` está configurada
- Para testar: use `https://sandbox.asaas.com/api/v3/payments`
- Para produção: use `https://api.asaas.com/api/v3/payments`

### **"Webhook não funciona"**
- URL deve ser: `https://SEU-WORKER.workers.dev/api/webhook/asaas`
- Teste no painel do Asaas: Integrações > Webhooks > Testar

---

## 📱 Testar Sistema

### **1. Testar Checkout:**
```
https://seu-worker.workers.dev/checkout
```

### **2. Testar Admin:**
```
https://seu-worker.workers.dev/admin
Senha: (a que você configurou)
```

### **3. Testar Afiliado:**
```
https://seu-worker.workers.dev/affiliate/register
```

---

## 🎯 Próximos Passos

1. ✅ Cadastre-se como afiliado teste
2. ✅ Aprove no admin
3. ✅ Teste uma compra com link de afiliado
4. ✅ Veja as comissões sendo calculadas
5. ✅ Configure domínio customizado (opcional)

---

## 💡 Dicas

- Use a API **Sandbox** do Asaas para testar
- Só mude para **Produção** quando tudo estiver funcionando
- Configure webhook DEPOIS de testar os pagamentos
- Faça backup dos dados importantes do KV

---

## 📞 Precisa de Ajuda?

**Documentação:**
- Workers: https://developers.cloudflare.com/workers/
- KV: https://developers.cloudflare.com/kv/
- Asaas: https://docs.asaas.com

---

**Boa sorte! 🚀**
