# TikTok Shop UK - Sistema Completo de Checkout + Afiliados

Sistema completo de checkout com integração Asaas PIX e programa de afiliados para venda de produtos/serviços.

## 🚀 Funcionalidades

### Para Clientes
- ✅ Checkout responsivo e otimizado
- ✅ Pagamento via PIX com QR Code (integração Asaas)
- ✅ Rastreamento de afiliado via link `?ref=CODIGO`
- ✅ Confirmação automática de pagamento via webhook

### Para Afiliados
- ✅ Sistema de cadastro de afiliados
- ✅ Painel completo com estatísticas em tempo real
- ✅ Link único de afiliado para rastreamento
- ✅ Visualização de vendas e comissões
- ✅ Comissão configurável por afiliado (padrão 30%)

### Para Administradores
- ✅ Painel admin com gestão completa
- ✅ Gerenciamento de pedidos
- ✅ Aprovação/bloqueio de afiliados
- ✅ Ajuste de comissões individuais
- ✅ Exportação de dados em CSV
- ✅ Estatísticas detalhadas

## 📋 Pré-requisitos

1. **Conta Cloudflare**
2. **Conta Asaas** ([criar conta](https://asaas.com))
3. **API Key da Asaas**

## ⚙️ Configuração no Cloudflare

### 1. Criar KV Namespace

No painel do Cloudflare Workers:

```bash
# No Dashboard Cloudflare:
Workers > KV > Criar namespace
Nome: TIKTOK_ORDERS
```

### 2. Criar Worker

1. Acesse **Workers & Pages**
2. Clique em **Create Application**
3. Escolha **Create Worker**
4. Cole o código do arquivo `worker.js`

### 3. Configurar Variáveis de Ambiente

No Worker, vá em **Settings > Variables**:

**Environment Variables:**
```
ASAAS_API_KEY = sua_chave_api_asaas_aqui
```

**KV Namespace Bindings:**
```
Variable name: TIKTOK_ORDERS
KV namespace: TIKTOK_ORDERS (o que você criou no passo 1)
```

### 4. Configurar Rotas (Custom Domain - Opcional)

Se você tem um domínio no Cloudflare:

1. **Workers > Triggers > Add route**
2. Configure: `seudominio.com/*`

## 🔐 Configurações no Código

Edite o início do `worker.js`:

```javascript
const ADMIN_PASSWORD = 'SUA_SENHA_ADMIN_AQUI'; // MUDE ISSO!
const PRODUCT_PRICE = 47.00; // Preço do produto
const DEFAULT_COMMISSION_PERCENT = 30; // Comissão padrão (30%)
```

## 🔗 Integração com Asaas

### 1. Obter API Key

1. Acesse [Asaas](https://asaas.com)
2. Vá em **Integrações > API Key**
3. Copie sua chave de produção

### 2. Configurar Webhook

No Asaas, configure o webhook para receber confirmações de pagamento:

**URL do Webhook:**
```
https://seu-worker.workers.dev/api/webhook/asaas
```

**Eventos a serem enviados:**
- ✅ PAYMENT_RECEIVED
- ✅ PAYMENT_CONFIRMED

**IMPORTANTE:** Use a API de Produção quando for ao ar!

## 📍 Rotas Disponíveis

### Páginas

| Rota | Descrição |
|------|-----------|
| `/` ou `/checkout` | Página de checkout para clientes |
| `/checkout?ref=CODIGO` | Checkout com rastreamento de afiliado |
| `/admin` | Painel administrativo |
| `/affiliate` | Login do painel de afiliados |
| `/affiliate/register` | Cadastro de novos afiliados |

### APIs (Internas)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/create-order` | POST | Criar novo pedido |
| `/api/webhook/asaas` | POST | Webhook Asaas (confirmação de pagamento) |
| `/api/affiliate/register` | POST | Registrar afiliado |
| `/api/affiliate/login` | POST | Login de afiliado |
| `/api/affiliate/stats` | POST | Estatísticas do afiliado |
| `/api/affiliate/sales` | POST | Vendas do afiliado |
| `/api/admin/orders` | POST | Listar pedidos (admin) |
| `/api/admin/affiliates` | POST | Listar afiliados (admin) |
| `/api/admin/update-commission` | POST | Atualizar comissão |
| `/api/admin/toggle-affiliate` | POST | Aprovar/bloquear afiliado |
| `/api/admin/mark-paid` | POST | Marcar como pago manualmente |
| `/api/admin/delete-order` | POST | Deletar pedido |
| `/api/admin/export` | POST | Exportar CSV |

## 💡 Como Usar

### Fluxo de Compra

1. Cliente acessa `/checkout` ou `/checkout?ref=CODIGO_AFILIADO`
2. Preenche dados (nome, email, WhatsApp)
3. Recebe QR Code PIX da Asaas
4. Paga via PIX
5. **Sistema detecta pagamento automaticamente via webhook**
6. Comissão é creditada ao afiliado (se houver)

### Fluxo de Afiliado

1. Afiliado se cadastra em `/affiliate/register`
2. **Admin aprova o cadastro** no painel
3. Afiliado recebe código único (ex: `JOAO123`)
4. Compartilha link: `seusite.com/checkout?ref=JOAO123`
5. Acompanha vendas em tempo real em `/affiliate`

### Fluxo Administrativo

1. Acesse `/admin` com a senha configurada
2. **Aba PEDIDOS:** Veja todos os pedidos, confirme pagamentos manualmente se necessário
3. **Aba AFILIADOS:** Aprove novos afiliados, ajuste comissões, bloqueie/ative
4. Exporte relatórios em CSV

## 🔒 Segurança

### Melhorias Recomendadas

1. **Senhas:** Troque `ADMIN_PASSWORD` por algo forte
2. **Hash de Senhas:** O sistema atual usa Base64 (NÃO É SEGURO!)
   - Para produção, use bcrypt ou Argon2
3. **Rate Limiting:** Adicione proteção contra spam
4. **Secrets:** Mova todas as senhas para Environment Variables

### Exemplo de Hash Seguro (Recomendado)

```javascript
// Use uma biblioteca como bcryptjs ou @noble/hashes
import bcrypt from 'bcryptjs';

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
```

## 📊 Estrutura de Dados (KV)

| Key | Valor |
|-----|-------|
| `ORDER_{id}` | Dados do pedido |
| `ORDER_LIST` | Array de IDs de pedidos |
| `STATS` | Estatísticas globais |
| `AFFILIATE:{code}` | Dados do afiliado |
| `AFFILIATE_LIST` | Array de códigos de afiliados |
| `AFFILIATE_SALES:{id}` | Array de pedidos do afiliado |

## 🎨 Personalização

### Alterar Preço

```javascript
const PRODUCT_PRICE = 97.00; // Mude aqui
```

### Alterar Comissão Padrão

```javascript
const DEFAULT_COMMISSION_PERCENT = 40; // 40% de comissão
```

### Personalizar Visual

As páginas usam **Tailwind CSS** via CDN. Edite diretamente os HTMLs nas constantes:
- `CHECKOUT_HTML` (função `getCheckoutHTML`)
- `ADMIN_HTML`
- `AFFILIATE_PANEL_HTML`
- `AFFILIATE_REGISTER_HTML`

## 🐛 Troubleshooting

### Pagamento não confirma automaticamente

1. ✅ Verifique se o webhook está configurado corretamente no Asaas
2. ✅ Confirme que a URL é `https://seu-worker.workers.dev/api/webhook/asaas`
3. ✅ Teste o webhook no painel Asaas
4. ✅ Verifique logs do Worker no Cloudflare

### "Configure o KV Namespace"

1. ✅ Certifique-se de criar o KV namespace
2. ✅ Vincule-o ao Worker em **Settings > Variables**
3. ✅ O nome da binding deve ser **exatamente** `TIKTOK_ORDERS`

### QR Code não aparece

1. ✅ Verifique se `ASAAS_API_KEY` está configurada
2. ✅ Teste com a API sandbox primeiro: `https://sandbox.asaas.com`
3. ✅ Para produção, troque para: `https://api.asaas.com`

## 📈 Próximos Passos

- [ ] Implementar notificações por email (SendGrid, Mailgun)
- [ ] Adicionar sistema de cupons de desconto
- [ ] Múltiplos produtos
- [ ] Dashboard com gráficos
- [ ] Integração com WhatsApp Business API

## 📝 Licença

Este projeto é de código aberto. Use e modifique como quiser!

## 🤝 Suporte

Para dúvidas sobre:
- **Asaas:** [Documentação Asaas](https://docs.asaas.com)
- **Cloudflare Workers:** [Documentação Cloudflare](https://developers.cloudflare.com/workers/)
- **Este código:** Abra uma issue no repositório

---

**Feito com ❤️ para vendedores do TikTok Shop UK**
