// ===========================================
// TIKTOK SHOP UK - SISTEMA COMPLETO
// ASAAS PIX + AFILIADOS COM APROVAÇÃO
// ===========================================

// ⚠️ CONFIGURAÇÕES - ALTERE AQUI
const ADMIN_PASSWORD = 'aDMIN173@'; // Senha do admin
const PRODUCT_PRICE = 47.00; // Preço do produto
const PRODUCT_NAME = 'TikTok Shop UK Masterclass';
const AFFILIATE_COMMISSION = 30; // 30% de comissão

// 📌 VOCÊ PRECISA CONFIGURAR NO CLOUDFLARE:
// Environment Variable: ASAAS_API_KEY (sua chave da API Asaas)
// KV Namespace: TIKTOK_ORDERS

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Verificar KV
    if (!env.TIKTOK_ORDERS && url.pathname.startsWith('/api/')) {
      return jsonResponse({ error: 'Configure o KV Namespace TIKTOK_ORDERS' }, 500, corsHeaders);
    }

    // ========== PÁGINAS HTML ==========

    if (url.pathname === '/' || url.pathname === '/checkout') {
      const affiliateCode = url.searchParams.get('ref') || '';
      return new Response(getCheckoutHTML(affiliateCode), {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    if (url.pathname === '/admin') {
      return new Response(ADMIN_HTML, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    if (url.pathname === '/afiliado' || url.pathname === '/affiliate') {
      return new Response(AFFILIATE_HTML, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    // ========== API: CHECKOUT ==========

    // Criar pedido com Asaas
    if (url.pathname === '/api/create-order' && request.method === 'POST') {
      return handleCreateOrder(request, env, corsHeaders);
    }

    // Webhook Asaas (confirmação automática)
    if (url.pathname === '/api/webhook/asaas' && request.method === 'POST') {
      return handleAsaasWebhook(request, env, corsHeaders);
    }

    // ========== API: AFILIADOS ==========

    // Registrar afiliado
    if (url.pathname === '/api/affiliate/register' && request.method === 'POST') {
      return handleAffiliateRegister(request, env, corsHeaders);
    }

    // Login afiliado
    if (url.pathname === '/api/affiliate/login' && request.method === 'POST') {
      return handleAffiliateLogin(request, env, corsHeaders);
    }

    // Detalhes do afiliado
    if (url.pathname === '/api/affiliate/details' && request.method === 'POST') {
      return handleAffiliateDetails(request, env, corsHeaders);
    }

    // Atualizar dados de pagamento do afiliado
    if (url.pathname === '/api/affiliate/update-payment' && request.method === 'POST') {
      return handleAffiliateUpdatePayment(request, env, corsHeaders);
    }

    // ========== API: ADMIN ==========

    // Listar pedidos
    if (url.pathname === '/api/admin/orders' && request.method === 'POST') {
      return handleAdminOrders(request, env, corsHeaders);
    }

    // Listar afiliados
    if (url.pathname === '/api/admin/affiliates' && request.method === 'POST') {
      return handleAdminAffiliates(request, env, corsHeaders);
    }

    // Aprovar/bloquear afiliado
    if (url.pathname === '/api/admin/toggle-affiliate' && request.method === 'POST') {
      return handleAdminToggleAffiliate(request, env, corsHeaders);
    }

    // Pagar comissão
    if (url.pathname === '/api/admin/pay-commission' && request.method === 'POST') {
      return handleAdminPayCommission(request, env, corsHeaders);
    }

    // Marcar pedido como pago (manual)
    if (url.pathname === '/api/admin/mark-paid' && request.method === 'POST') {
      return handleAdminMarkPaid(request, env, corsHeaders);
    }

    // Deletar pedido
    if (url.pathname === '/api/admin/delete-order' && request.method === 'POST') {
      return handleAdminDeleteOrder(request, env, corsHeaders);
    }

    // Exportar CSV
    if (url.pathname === '/api/admin/export' && request.method === 'POST') {
      return handleAdminExport(request, env, corsHeaders);
    }

    return new Response('404 Not Found', { status: 404 });
  }
};

// ===========================================
// HANDLERS: CHECKOUT
// ===========================================

async function handleCreateOrder(request, env, corsHeaders) {
  try {
    const data = await request.json();

    if (!data.name || !data.email || !data.whatsapp) {
      return jsonResponse({ error: 'Dados incompletos' }, 400, corsHeaders);
    }

    const orderId = 'ORDER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const txid = 'TRK' + Date.now().toString().slice(-6);

    // Verificar afiliado e se está ATIVO
    let affiliate = null;
    let commissionAmount = 0;

    if (data.affiliateCode) {
      const affiliateData = await env.TIKTOK_ORDERS.get('AFFILIATE:' + data.affiliateCode.toUpperCase());
      if (affiliateData) {
        affiliate = JSON.parse(affiliateData);

        // ⚠️ IMPORTANTE: Só credita comissão se afiliado estiver ATIVO
        if (affiliate.status === 'active') {
          commissionAmount = PRODUCT_PRICE * (AFFILIATE_COMMISSION / 100);
        }
      }
    }

    // Criar cobrança no Asaas
    const asaasResponse = await createAsaasCharge(env, {
      customer: {
        name: data.name,
        email: data.email,
        mobilePhone: data.whatsapp.replace(/\D/g, '')
      },
      billingType: 'PIX',
      value: PRODUCT_PRICE,
      dueDate: getDateInDays(1),
      description: `${PRODUCT_NAME} - ${txid}`,
      externalReference: orderId
    });

    if (!asaasResponse.success) {
      return jsonResponse({ error: 'Erro ao gerar PIX: ' + asaasResponse.error }, 500, corsHeaders);
    }

    const asaasData = asaasResponse.data;

    // Criar pedido
    const order = {
      id: orderId,
      txid: txid,
      asaasId: asaasData.id,
      name: data.name,
      email: data.email,
      whatsapp: data.whatsapp,
      amount: PRODUCT_PRICE,
      status: 'pending',
      pixCode: asaasData.pixCode || '',
      pixQrCode: asaasData.pixQrCode || '',
      createdAt: new Date().toISOString(),
      paidAt: null,
      ip: request.headers.get('CF-Connecting-IP') || 'unknown',
      affiliateCode: affiliate ? affiliate.code : null,
      affiliateId: affiliate ? affiliate.id : null,
      commission: commissionAmount,
      commissionPaid: false
    };

    await env.TIKTOK_ORDERS.put(orderId, JSON.stringify(order));

    // Atualizar lista de pedidos
    let ordersList = await env.TIKTOK_ORDERS.get('ORDER_LIST');
    ordersList = ordersList ? JSON.parse(ordersList) : [];
    ordersList.unshift(orderId);
    await env.TIKTOK_ORDERS.put('ORDER_LIST', JSON.stringify(ordersList));

    // Atualizar stats
    let stats = await env.TIKTOK_ORDERS.get('STATS');
    stats = stats ? JSON.parse(stats) : { total: 0, paid: 0, revenue: 0, commission: 0 };
    stats.total += 1;
    await env.TIKTOK_ORDERS.put('STATS', JSON.stringify(stats));

    // Se tem afiliado ATIVO, adicionar à lista de vendas dele
    if (affiliate && affiliate.status === 'active') {
      let affiliateSales = await env.TIKTOK_ORDERS.get('AFFILIATE_SALES:' + affiliate.id);
      affiliateSales = affiliateSales ? JSON.parse(affiliateSales) : [];
      affiliateSales.unshift(orderId);
      await env.TIKTOK_ORDERS.put('AFFILIATE_SALES:' + affiliate.id, JSON.stringify(affiliateSales));

      // Incrementar cliques
      affiliate.clicks = (affiliate.clicks || 0) + 1;
      await env.TIKTOK_ORDERS.put('AFFILIATE:' + affiliate.code, JSON.stringify(affiliate));
    }

    return jsonResponse({
      success: true,
      orderId: orderId,
      txid: txid,
      pixCode: order.pixCode,
      pixQrCode: order.pixQrCode,
      amount: PRODUCT_PRICE
    }, 200, corsHeaders);

  } catch (error) {
    console.error('Error creating order:', error);
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAsaasWebhook(request, env, corsHeaders) {
  try {
    const data = await request.json();

    if (data.event === 'PAYMENT_RECEIVED' || data.event === 'PAYMENT_CONFIRMED') {
      const asaasId = data.payment?.id;
      if (!asaasId) {
        return jsonResponse({ error: 'Payment ID not found' }, 400, corsHeaders);
      }

      // Buscar pedido pelo asaasId
      const ordersList = await env.TIKTOK_ORDERS.get('ORDER_LIST');
      const ordersIds = ordersList ? JSON.parse(ordersList) : [];

      for (const orderId of ordersIds) {
        const orderData = await env.TIKTOK_ORDERS.get(orderId);
        if (orderData) {
          const order = JSON.parse(orderData);

          if (order.asaasId === asaasId && order.status === 'pending') {
            // Marcar como pago
            order.status = 'paid';
            order.paidAt = new Date().toISOString();
            await env.TIKTOK_ORDERS.put(orderId, JSON.stringify(order));

            // Atualizar stats
            let stats = await env.TIKTOK_ORDERS.get('STATS');
            stats = stats ? JSON.parse(stats) : { total: 0, paid: 0, revenue: 0, commission: 0 };
            stats.paid += 1;
            stats.revenue += PRODUCT_PRICE;
            stats.commission += order.commission || 0;
            await env.TIKTOK_ORDERS.put('STATS', JSON.stringify(stats));

            // Atualizar stats do afiliado
            if (order.affiliateCode) {
              const affiliateData = await env.TIKTOK_ORDERS.get('AFFILIATE:' + order.affiliateCode);
              if (affiliateData) {
                const affiliate = JSON.parse(affiliateData);
                affiliate.totalSales = (affiliate.totalSales || 0) + 1;
                affiliate.totalRevenue = (affiliate.totalRevenue || 0) + PRODUCT_PRICE;
                affiliate.totalCommission = (affiliate.totalCommission || 0) + order.commission;
                affiliate.pendingCommission = (affiliate.pendingCommission || 0) + order.commission;
                await env.TIKTOK_ORDERS.put('AFFILIATE:' + order.affiliateCode, JSON.stringify(affiliate));
              }
            }

            break;
          }
        }
      }
    }

    return jsonResponse({ success: true }, 200, corsHeaders);
  } catch (error) {
    console.error('Webhook error:', error);
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

// ===========================================
// HANDLERS: AFILIADOS
// ===========================================

async function handleAffiliateRegister(request, env, corsHeaders) {
  try {
    const data = await request.json();

    if (!data.name || !data.email || !data.whatsapp || !data.password) {
      return jsonResponse({ error: 'Dados incompletos' }, 400, corsHeaders);
    }

    // Gerar código único
    const code = generateAffiliateCode(data.name);

    // Verificar se já existe
    const existing = await env.TIKTOK_ORDERS.get('AFFILIATE:' + code);
    if (existing) {
      return jsonResponse({ error: 'Código já existe. Tente outro nome.' }, 400, corsHeaders);
    }

    const affiliateId = 'AFF_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const affiliate = {
      id: affiliateId,
      code: code,
      name: data.name,
      email: data.email,
      whatsapp: data.whatsapp,
      password: btoa(data.password), // Base64 (em produção, use bcrypt!)
      status: 'pending', // ⚠️ AGUARDANDO APROVAÇÃO DO ADMIN
      totalSales: 0,
      totalRevenue: 0,
      totalCommission: 0,
      pendingCommission: 0,
      paidCommission: 0,
      clicks: 0,
      createdAt: new Date().toISOString(),
      pixKey: data.pixKey || '',
      paymentInfo: ''
    };

    await env.TIKTOK_ORDERS.put('AFFILIATE:' + code, JSON.stringify(affiliate));

    // Adicionar à lista
    let affiliatesList = await env.TIKTOK_ORDERS.get('AFFILIATE_LIST');
    affiliatesList = affiliatesList ? JSON.parse(affiliatesList) : [];
    affiliatesList.unshift(code);
    await env.TIKTOK_ORDERS.put('AFFILIATE_LIST', JSON.stringify(affiliatesList));

    // Criar lista de vendas vazia
    await env.TIKTOK_ORDERS.put('AFFILIATE_SALES:' + affiliateId, JSON.stringify([]));

    return jsonResponse({
      success: true,
      message: '⚠️ Cadastro enviado! Aguarde aprovação do administrador.',
      code: code
    }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAffiliateLogin(request, env, corsHeaders) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return jsonResponse({ error: 'Email e senha obrigatórios' }, 400, corsHeaders);
    }

    // Buscar afiliado por email
    let affiliatesList = await env.TIKTOK_ORDERS.get('AFFILIATE_LIST');
    affiliatesList = affiliatesList ? JSON.parse(affiliatesList) : [];

    for (const code of affiliatesList) {
      const affiliateData = await env.TIKTOK_ORDERS.get('AFFILIATE:' + code);
      if (affiliateData) {
        const affiliate = JSON.parse(affiliateData);

        if (affiliate.email === email && btoa(password) === affiliate.password) {
          // Login bem-sucedido
          delete affiliate.password; // Não enviar senha

          return jsonResponse({
            success: true,
            affiliate: affiliate
          }, 200, corsHeaders);
        }
      }
    }

    return jsonResponse({ error: 'Email ou senha incorretos' }, 401, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAffiliateDetails(request, env, corsHeaders) {
  try {
    const { email, password } = await request.json();

    // Buscar afiliado
    let affiliatesList = await env.TIKTOK_ORDERS.get('AFFILIATE_LIST');
    affiliatesList = affiliatesList ? JSON.parse(affiliatesList) : [];

    for (const code of affiliatesList) {
      const affiliateData = await env.TIKTOK_ORDERS.get('AFFILIATE:' + code);
      if (affiliateData) {
        const affiliate = JSON.parse(affiliateData);

        if (affiliate.email === email && btoa(password) === affiliate.password) {
          // Buscar vendas
          let salesIds = await env.TIKTOK_ORDERS.get('AFFILIATE_SALES:' + affiliate.id);
          salesIds = salesIds ? JSON.parse(salesIds) : [];

          const sales = [];
          for (const orderId of salesIds) {
            const orderData = await env.TIKTOK_ORDERS.get(orderId);
            if (orderData) {
              const order = JSON.parse(orderData);
              sales.push({
                id: order.id,
                txid: order.txid,
                customerName: order.name,
                amount: order.amount,
                commission: order.commission,
                status: order.status,
                createdAt: order.createdAt,
                paidAt: order.paidAt
              });
            }
          }

          delete affiliate.password;

          // Gerar link de afiliado
          const hostUrl = new URL(request.url).origin;
          affiliate.affiliateLink = `${hostUrl}/checkout?ref=${affiliate.code}`;
          affiliate.orders = sales;

          return jsonResponse({
            success: true,
            affiliate: affiliate
          }, 200, corsHeaders);
        }
      }
    }

    return jsonResponse({ error: 'Não autorizado' }, 401, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAffiliateUpdatePayment(request, env, corsHeaders) {
  try {
    const { email, password, paymentInfo } = await request.json();

    let affiliatesList = await env.TIKTOK_ORDERS.get('AFFILIATE_LIST');
    affiliatesList = affiliatesList ? JSON.parse(affiliatesList) : [];

    for (const code of affiliatesList) {
      const affiliateData = await env.TIKTOK_ORDERS.get('AFFILIATE:' + code);
      if (affiliateData) {
        const affiliate = JSON.parse(affiliateData);

        if (affiliate.email === email && btoa(password) === affiliate.password) {
          affiliate.paymentInfo = paymentInfo;
          await env.TIKTOK_ORDERS.put('AFFILIATE:' + code, JSON.stringify(affiliate));

          return jsonResponse({
            success: true,
            message: 'Informações de pagamento atualizadas!'
          }, 200, corsHeaders);
        }
      }
    }

    return jsonResponse({ error: 'Não autorizado' }, 401, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

// ===========================================
// HANDLERS: ADMIN
// ===========================================

async function handleAdminOrders(request, env, corsHeaders) {
  try {
    const { password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return jsonResponse({ error: 'Senha incorreta' }, 401, corsHeaders);
    }

    let ordersList = await env.TIKTOK_ORDERS.get('ORDER_LIST');
    ordersList = ordersList ? JSON.parse(ordersList) : [];

    const orders = [];
    for (const orderId of ordersList) {
      const orderData = await env.TIKTOK_ORDERS.get(orderId);
      if (orderData) {
        orders.push(JSON.parse(orderData));
      }
    }

    let stats = await env.TIKTOK_ORDERS.get('STATS');
    stats = stats ? JSON.parse(stats) : { total: 0, paid: 0, revenue: 0, commission: 0 };

    return jsonResponse({
      success: true,
      orders,
      stats
    }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAdminAffiliates(request, env, corsHeaders) {
  try {
    const { password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return jsonResponse({ error: 'Senha incorreta' }, 401, corsHeaders);
    }

    let affiliatesList = await env.TIKTOK_ORDERS.get('AFFILIATE_LIST');
    affiliatesList = affiliatesList ? JSON.parse(affiliatesList) : [];

    const affiliates = [];
    for (const code of affiliatesList) {
      const affiliateData = await env.TIKTOK_ORDERS.get('AFFILIATE:' + code);
      if (affiliateData) {
        const aff = JSON.parse(affiliateData);
        delete aff.password;
        affiliates.push(aff);
      }
    }

    return jsonResponse({
      success: true,
      affiliates
    }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAdminToggleAffiliate(request, env, corsHeaders) {
  try {
    const { password, code, status } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return jsonResponse({ error: 'Senha incorreta' }, 401, corsHeaders);
    }

    const affiliateData = await env.TIKTOK_ORDERS.get('AFFILIATE:' + code.toUpperCase());
    if (!affiliateData) {
      return jsonResponse({ error: 'Afiliado não encontrado' }, 404, corsHeaders);
    }

    const affiliate = JSON.parse(affiliateData);
    affiliate.status = status; // active, pending, blocked

    await env.TIKTOK_ORDERS.put('AFFILIATE:' + code.toUpperCase(), JSON.stringify(affiliate));

    return jsonResponse({ success: true }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAdminPayCommission(request, env, corsHeaders) {
  try {
    const { password, code } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return jsonResponse({ error: 'Senha incorreta' }, 401, corsHeaders);
    }

    const affiliateData = await env.TIKTOK_ORDERS.get('AFFILIATE:' + code.toUpperCase());
    if (!affiliateData) {
      return jsonResponse({ error: 'Afiliado não encontrado' }, 404, corsHeaders);
    }

    const affiliate = JSON.parse(affiliateData);

    // Transferir comissão pendente para paga
    affiliate.paidCommission = (affiliate.paidCommission || 0) + (affiliate.pendingCommission || 0);
    affiliate.pendingCommission = 0;
    affiliate.lastPaymentDate = new Date().toISOString();

    await env.TIKTOK_ORDERS.put('AFFILIATE:' + code.toUpperCase(), JSON.stringify(affiliate));

    return jsonResponse({
      success: true,
      message: 'Comissão marcada como paga!'
    }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAdminMarkPaid(request, env, corsHeaders) {
  try {
    const { password, orderId } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return jsonResponse({ error: 'Senha incorreta' }, 401, corsHeaders);
    }

    const orderData = await env.TIKTOK_ORDERS.get(orderId);
    if (!orderData) {
      return jsonResponse({ error: 'Pedido não encontrado' }, 404, corsHeaders);
    }

    const order = JSON.parse(orderData);
    const wasUnpaid = order.status === 'pending';

    order.status = 'paid';
    order.paidAt = new Date().toISOString();

    await env.TIKTOK_ORDERS.put(orderId, JSON.stringify(order));

    if (wasUnpaid) {
      let stats = await env.TIKTOK_ORDERS.get('STATS');
      stats = stats ? JSON.parse(stats) : { total: 0, paid: 0, revenue: 0, commission: 0 };
      stats.paid += 1;
      stats.revenue += PRODUCT_PRICE;
      stats.commission += order.commission || 0;
      await env.TIKTOK_ORDERS.put('STATS', JSON.stringify(stats));

      // Atualizar afiliado
      if (order.affiliateCode) {
        const affiliateData = await env.TIKTOK_ORDERS.get('AFFILIATE:' + order.affiliateCode);
        if (affiliateData) {
          const affiliate = JSON.parse(affiliateData);
          affiliate.totalSales = (affiliate.totalSales || 0) + 1;
          affiliate.totalRevenue = (affiliate.totalRevenue || 0) + PRODUCT_PRICE;
          affiliate.totalCommission = (affiliate.totalCommission || 0) + order.commission;
          affiliate.pendingCommission = (affiliate.pendingCommission || 0) + order.commission;
          await env.TIKTOK_ORDERS.put('AFFILIATE:' + order.affiliateCode, JSON.stringify(affiliate));
        }
      }
    }

    return jsonResponse({ success: true }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAdminDeleteOrder(request, env, corsHeaders) {
  try {
    const { password, orderId } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return jsonResponse({ error: 'Senha incorreta' }, 401, corsHeaders);
    }

    const orderData = await env.TIKTOK_ORDERS.get(orderId);
    if (orderData) {
      const order = JSON.parse(orderData);

      let stats = await env.TIKTOK_ORDERS.get('STATS');
      stats = stats ? JSON.parse(stats) : { total: 0, paid: 0, revenue: 0, commission: 0 };
      stats.total -= 1;
      if (order.status === 'paid') {
        stats.paid -= 1;
        stats.revenue -= PRODUCT_PRICE;
        stats.commission -= order.commission || 0;
      }
      await env.TIKTOK_ORDERS.put('STATS', JSON.stringify(stats));
    }

    await env.TIKTOK_ORDERS.delete(orderId);

    let ordersList = await env.TIKTOK_ORDERS.get('ORDER_LIST');
    ordersList = ordersList ? JSON.parse(ordersList) : [];
    ordersList = ordersList.filter(id => id !== orderId);
    await env.TIKTOK_ORDERS.put('ORDER_LIST', JSON.stringify(ordersList));

    return jsonResponse({ success: true }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAdminExport(request, env, corsHeaders) {
  try {
    const { password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return jsonResponse({ error: 'Senha incorreta' }, 401, corsHeaders);
    }

    let ordersList = await env.TIKTOK_ORDERS.get('ORDER_LIST');
    ordersList = ordersList ? JSON.parse(ordersList) : [];

    const orders = [];
    for (const orderId of ordersList) {
      const orderData = await env.TIKTOK_ORDERS.get(orderId);
      if (orderData) {
        orders.push(JSON.parse(orderData));
      }
    }

    let csv = 'Data,Codigo,Nome,WhatsApp,Email,Valor,Status,Afiliado,Comissao,IP\n';
    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleString('pt-BR');
      csv += `"${date}","${order.txid}","${order.name}","${order.whatsapp}","${order.email}","R$ ${PRODUCT_PRICE.toFixed(2)}","${order.status}","${order.affiliateCode || 'N/A'}","R$ ${(order.commission || 0).toFixed(2)}","${order.ip || 'N/A'}"\n`;
    });

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="pedidos-' + new Date().toISOString().split('T')[0] + '.csv"'
      }
    });

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

// ===========================================
// FUNÇÕES AUXILIARES
// ===========================================

async function createAsaasCharge(env, data) {
  try {
    const apiKey = env.ASAAS_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'ASAAS_API_KEY não configurada' };
    }

    const response = await fetch('https://sandbox.asaas.com/api/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.errors?.[0]?.description || 'Erro na API Asaas' };
    }

    // Buscar QR Code PIX
    let pixData = {};
    if (result.id) {
      const pixResponse = await fetch(`https://sandbox.asaas.com/api/v3/payments/${result.id}/pixQrCode`, {
        headers: {
          'access_token': apiKey
        }
      });

      if (pixResponse.ok) {
        pixData = await pixResponse.json();
      }
    }

    return {
      success: true,
      data: {
        id: result.id,
        invoiceUrl: result.invoiceUrl,
        pixCode: pixData.payload || '',
        pixQrCode: pixData.encodedImage || ''
      }
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

function generateAffiliateCode(name) {
  const cleaned = name.toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8);

  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return cleaned + random;
}

function getDateInDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function jsonResponse(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ===========================================
// HTML: CHECKOUT
// ===========================================

function getCheckoutHTML(affiliateCode) {
  const affiliateInput = affiliateCode ? `<input type="hidden" id="affiliateCode" value="${affiliateCode}">` : '<input type="hidden" id="affiliateCode" value="">';
  const affiliateBadge = affiliateCode ? `
    <div class="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
      <div class="flex items-center gap-2 text-green-400">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="font-bold">Link de Afiliado: ${affiliateCode}</span>
      </div>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout - ${PRODUCT_NAME}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        * { font-family: 'Inter', sans-serif; }
        body { background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); min-height: 100vh; }
        .glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); }
        .btn-primary { background: linear-gradient(135deg, #fff 0%, #e0e0e0 100%); color: #000; font-weight: 700; }
        .input-field { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white; }
        .input-field:focus { border-color: rgba(255,255,255,0.5); outline: none; }
    </style>
</head>
<body class="flex items-center justify-center p-4">
    <div class="max-w-2xl w-full my-8">
        <div id="step1" class="glass rounded-2xl p-8">
            ${affiliateBadge}
            <div class="text-center mb-8">
                <h1 class="text-4xl font-black text-white mb-2">${PRODUCT_NAME}</h1>
                <p class="text-gray-400">Acesso Vitalício + Grupo VIP</p>
                <div class="mt-6">
                    <span class="text-gray-500 line-through text-lg">R$ 2.997</span>
                    <span class="text-white text-5xl font-black ml-3">R$ ${PRODUCT_PRICE.toFixed(2).replace('.', ',')}</span>
                </div>
            </div>

            <form id="checkoutForm" class="space-y-5">
                ${affiliateInput}
                <div>
                    <label class="block text-white text-sm font-semibold mb-2">Nome Completo</label>
                    <input type="text" id="name" required placeholder="Seu nome" class="input-field w-full px-4 py-3 rounded-lg">
                </div>
                <div>
                    <label class="block text-white text-sm font-semibold mb-2">WhatsApp</label>
                    <input type="tel" id="whatsapp" required placeholder="(11) 98765-4321" class="input-field w-full px-4 py-3 rounded-lg">
                </div>
                <div>
                    <label class="block text-white text-sm font-semibold mb-2">Email</label>
                    <input type="email" id="email" required placeholder="seu@email.com" class="input-field w-full px-4 py-3 rounded-lg">
                </div>
                <button type="submit" class="btn-primary w-full py-4 rounded-lg text-lg">CONTINUAR PARA PAGAMENTO</button>
            </form>
        </div>

        <div id="step2" class="glass rounded-2xl p-8 hidden">
            <div class="text-center mb-8">
                <h2 class="text-3xl font-black text-white mb-2">Pague com PIX</h2>
                <p class="text-gray-400 mb-4">Escaneie o QR Code</p>
                <p class="text-white font-bold" id="displayTxid"></p>
            </div>
            <div class="bg-white rounded-2xl p-8 mb-6 flex justify-center">
                <img id="qrcode" class="w-full max-w-xs" alt="QR Code PIX">
            </div>
            <div class="bg-black/40 border border-white/10 rounded-xl p-5 mb-6">
                <p class="text-gray-400 text-xs mb-3">Código PIX Copia e Cola:</p>
                <div class="flex gap-3">
                    <input type="text" id="pixCode" readonly class="input-field flex-1 px-3 py-3 rounded-lg text-xs font-mono">
                    <button onclick="copyPix()" class="btn-primary px-6 py-3 rounded-lg">COPIAR</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const form = document.getElementById('checkoutForm');
        const whatsappInput = document.getElementById('whatsapp');

        whatsappInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            if (value.length > 6) {
                value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 7) + '-' + value.slice(7);
            } else if (value.length > 2) {
                value = '(' + value.slice(0, 2) + ') ' + value.slice(2);
            } else if (value.length > 0) {
                value = '(' + value;
            }
            e.target.value = value;
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            btn.disabled = true;
            btn.textContent = 'PROCESSANDO...';

            const formData = {
                name: document.getElementById('name').value,
                whatsapp: document.getElementById('whatsapp').value,
                email: document.getElementById('email').value,
                affiliateCode: document.getElementById('affiliateCode').value
            };

            try {
                const response = await fetch('/api/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (data.success) {
                    if (data.pixQrCode) {
                        document.getElementById('qrcode').src = 'data:image/png;base64,' + data.pixQrCode;
                    }
                    document.getElementById('pixCode').value = data.pixCode;
                    document.getElementById('displayTxid').textContent = data.txid;

                    document.getElementById('step1').classList.add('hidden');
                    document.getElementById('step2').classList.remove('hidden');
                } else {
                    alert('Erro: ' + data.error);
                    btn.disabled = false;
                    btn.textContent = 'CONTINUAR PARA PAGAMENTO';
                }
            } catch (error) {
                alert('Erro ao processar');
                btn.disabled = false;
                btn.textContent = 'CONTINUAR PARA PAGAMENTO';
            }
        });

        function copyPix() {
            const pixCode = document.getElementById('pixCode');
            pixCode.select();
            document.execCommand('copy');
            alert('Código copiado!');
        }
    </script>
</body>
</html>`;
}

// ===========================================
// HTML TEMPLATES: ADMIN & AFFILIATE PANELS
// ===========================================

const ADMIN_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - TikTok Shop UK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Inter', sans-serif; }
        body { background: #0a0a0a; }
        .glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
        .input-field { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white; }
        .input-field:focus { border-color: rgba(255,255,255,0.5); outline: none; }
        .btn { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; transition: all 0.2s; cursor: pointer; border: none; }
        .btn:hover { transform: translateY(-1px); }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-success { background: #22c55e; color: white; }
        .btn-danger { background: #ef4444; color: white; }
        .btn-secondary { background: rgba(255,255,255,0.1); color: white; }
        .badge { padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .badge-success { background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); }
        .badge-warning { background: rgba(234, 179, 8, 0.2); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.3); }
        .badge-pending { background: rgba(156, 163, 175, 0.2); color: #9ca3af; border: 1px solid rgba(156, 163, 175, 0.3); }
        .badge-blocked { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
        .tab { padding: 12px 24px; cursor: pointer; color: #9ca3af; font-weight: 600; border-bottom: 2px solid transparent; }
        .tab.active { color: white; border-bottom-color: #3b82f6; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
    </style>
</head>
<body class="min-h-screen p-4">

    <!-- LOGIN -->
    <div id="loginScreen" class="max-w-md mx-auto" style="margin-top: 15vh;">
        <div class="glass rounded-2xl p-8">
            <div class="text-center mb-8">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>
                <h1 class="text-2xl font-bold text-white mb-2">Admin Panel</h1>
                <p class="text-gray-400 text-sm">TikTok Shop UK Masterclass</p>
            </div>

            <input type="password" id="password" placeholder="Digite a senha de acesso"
                   class="input-field w-full px-4 py-3 rounded-lg mb-4"
                   onkeypress="if(event.key==='Enter') login()">

            <button onclick="login()" class="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition">
                ACESSAR PAINEL
            </button>
        </div>
    </div>

    <!-- DASHBOARD -->
    <div id="dashboard" class="hidden max-w-7xl mx-auto">

        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-3xl font-black text-white mb-1">Painel Administrativo</h1>
                <p class="text-gray-400 text-sm">TikTok Shop UK Masterclass</p>
            </div>
            <div class="flex gap-2">
                <button onclick="exportData()" class="btn btn-secondary">EXPORTAR CSV</button>
                <button onclick="refreshData()" class="btn btn-secondary">ATUALIZAR</button>
                <button onclick="logout()" class="btn btn-danger">SAIR</button>
            </div>
        </div>

        <!-- TABS -->
        <div class="glass rounded-xl mb-6">
            <div class="flex border-b border-white/10">
                <div class="tab active" onclick="switchTab('orders')">PEDIDOS</div>
                <div class="tab" onclick="switchTab('affiliates')">AFILIADOS</div>
            </div>
        </div>

        <!-- TAB: PEDIDOS -->
        <div id="tab-orders" class="tab-content active">
            <!-- STATS -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="glass rounded-xl p-6">
                    <p class="text-gray-400 text-sm mb-2">Total de Pedidos</p>
                    <p class="text-4xl font-black text-white" id="totalOrders">0</p>
                </div>
                <div class="glass rounded-xl p-6">
                    <p class="text-gray-400 text-sm mb-2">Confirmados</p>
                    <p class="text-4xl font-black text-green-400" id="paidOrders">0</p>
                </div>
                <div class="glass rounded-xl p-6">
                    <p class="text-gray-400 text-sm mb-2">Faturamento</p>
                    <p class="text-4xl font-black text-blue-400" id="revenue">R$ 0</p>
                </div>
                <div class="glass rounded-xl p-6">
                    <p class="text-gray-400 text-sm mb-2">Comissões Pagas</p>
                    <p class="text-4xl font-black text-yellow-400" id="totalCommission">R$ 0</p>
                </div>
            </div>

            <!-- TABELA PEDIDOS -->
            <div class="glass rounded-xl p-6">
                <h2 class="text-xl font-bold text-white mb-4">Pedidos</h2>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-white/5">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">DATA</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">CÓD</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">CLIENTE</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">CONTATO</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">AFILIADO</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">VALOR</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">STATUS</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody id="ordersTable" class="divide-y divide-white/5"></tbody>
                    </table>
                </div>
                <div id="emptyOrders" class="hidden text-center py-16">
                    <p class="text-gray-500">Nenhum pedido encontrado</p>
                </div>
            </div>
        </div>

        <!-- TAB: AFILIADOS -->
        <div id="tab-affiliates" class="tab-content">
            <div class="glass rounded-xl p-6">
                <h2 class="text-xl font-bold text-white mb-4">Gestão de Afiliados</h2>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-white/5">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">CÓDIGO</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">NOME</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">CONTATO</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">VENDAS</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">COMISSÃO</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">STATUS</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody id="affiliatesTable" class="divide-y divide-white/5"></tbody>
                    </table>
                </div>
                <div id="emptyAffiliates" class="hidden text-center py-16">
                    <p class="text-gray-500">Nenhum afiliado cadastrado</p>
                </div>
            </div>
        </div>

    </div>

    <script>
        let currentPassword = '';
        let allOrders = [];
        let allAffiliates = [];

        async function login() {
            const password = document.getElementById('password').value;
            if (!password) { alert('Digite a senha'); return; }

            try {
                const response = await fetch('/api/admin/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });

                const data = await response.json();

                if (data.success) {
                    currentPassword = password;
                    allOrders = data.orders;
                    document.getElementById('loginScreen').classList.add('hidden');
                    document.getElementById('dashboard').classList.remove('hidden');
                    loadOrders(data.orders, data.stats);
                    loadAffiliates();
                } else {
                    alert('Senha incorreta');
                }
            } catch (error) {
                alert('Erro ao conectar');
            }
        }

        function logout() {
            if (confirm('Deseja sair?')) {
                currentPassword = '';
                document.getElementById('loginScreen').classList.remove('hidden');
                document.getElementById('dashboard').classList.add('hidden');
            }
        }

        function switchTab(tab) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            event.target.classList.add('active');
            document.getElementById('tab-' + tab).classList.add('active');
        }

        async function refreshData() {
            const response = await fetch('/api/admin/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: currentPassword })
            });
            const data = await response.json();
            if (data.success) {
                allOrders = data.orders;
                loadOrders(data.orders, data.stats);
            }
            await loadAffiliates();
        }

        function loadOrders(orders, stats) {
            document.getElementById('totalOrders').textContent = stats.total;
            document.getElementById('paidOrders').textContent = stats.paid;
            document.getElementById('revenue').textContent = 'R$ ' + (stats.revenue || 0).toFixed(2);
            document.getElementById('totalCommission').textContent = 'R$ ' + (stats.commission || 0).toFixed(2);

            const tbody = document.getElementById('ordersTable');
            tbody.innerHTML = '';

            if (orders.length === 0) {
                document.getElementById('emptyOrders').classList.remove('hidden');
                return;
            }

            document.getElementById('emptyOrders').classList.add('hidden');

            orders.forEach(order => {
                const date = new Date(order.createdAt);
                const dateStr = date.toLocaleDateString('pt-BR');
                const whatsappClean = order.whatsapp.replace(/\\D/g, '');
                const statusBadge = order.status === 'paid'
                    ? '<span class="badge badge-success">PAGO</span>'
                    : '<span class="badge badge-warning">PENDENTE</span>';

                const row = document.createElement('tr');
                row.className = 'hover:bg-white/5';
                row.innerHTML = \`
                    <td class="px-4 py-3 text-sm text-white">\${dateStr}</td>
                    <td class="px-4 py-3 text-sm text-white font-bold">\${order.txid}</td>
                    <td class="px-4 py-3 text-sm text-white">\${order.name}</td>
                    <td class="px-4 py-3 text-sm text-white">\${order.whatsapp}</td>
                    <td class="px-4 py-3 text-sm text-blue-400">\${order.affiliateCode || 'N/A'}</td>
                    <td class="px-4 py-3 text-sm text-white">R$ \${order.amount.toFixed(2)}</td>
                    <td class="px-4 py-3">\${statusBadge}</td>
                    <td class="px-4 py-3">
                        <div class="flex gap-2">
                            <a href="https://wa.me/55\${whatsappClean}" target="_blank" class="btn btn-success">WhatsApp</a>
                            \${order.status === 'pending' ? \`
                                <button onclick="markAsPaid('\${order.id}')" class="btn btn-primary">Confirmar</button>
                            \` : ''}
                            <button onclick="deleteOrder('\${order.id}')" class="btn btn-danger">Excluir</button>
                        </div>
                    </td>
                \`;
                tbody.appendChild(row);
            });
        }

        async function loadAffiliates() {
            const response = await fetch('/api/admin/affiliates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: currentPassword })
            });
            const data = await response.json();

            if (!data.success) return;

            allAffiliates = data.affiliates;
            const tbody = document.getElementById('affiliatesTable');
            tbody.innerHTML = '';

            if (data.affiliates.length === 0) {
                document.getElementById('emptyAffiliates').classList.remove('hidden');
                return;
            }

            document.getElementById('emptyAffiliates').classList.add('hidden');

            data.affiliates.forEach(aff => {
                const statusBadge = aff.status === 'active'
                    ? '<span class="badge badge-success">ATIVO</span>'
                    : aff.status === 'pending'
                    ? '<span class="badge badge-pending">PENDENTE</span>'
                    : '<span class="badge badge-blocked">BLOQUEADO</span>';

                const row = document.createElement('tr');
                row.className = 'hover:bg-white/5';
                row.innerHTML = \`
                    <td class="px-4 py-3 text-sm text-white font-bold">\${aff.code}</td>
                    <td class="px-4 py-3 text-sm text-white">\${aff.name}</td>
                    <td class="px-4 py-3 text-sm text-white">\${aff.whatsapp}</td>
                    <td class="px-4 py-3 text-sm text-white">\${aff.totalSales || 0}</td>
                    <td class="px-4 py-3 text-sm text-white">
                        <input type="number" value="\${aff.commission}" onchange="updateCommission('\${aff.code}', this.value)"
                               class="input-field w-20 px-2 py-1 rounded text-sm">%
                    </td>
                    <td class="px-4 py-3">\${statusBadge}</td>
                    <td class="px-4 py-3">
                        <div class="flex gap-2">
                            \${aff.status !== 'active' ? \`
                                <button onclick="toggleAffiliate('\${aff.code}', 'active')" class="btn btn-success">Aprovar</button>
                            \` : \`
                                <button onclick="toggleAffiliate('\${aff.code}', 'blocked')" class="btn btn-danger">Bloquear</button>
                            \`}
                        </div>
                    </td>
                \`;
                tbody.appendChild(row);
            });
        }

        async function markAsPaid(orderId) {
            if (!confirm('Confirmar pagamento?')) return;
            await fetch('/api/admin/mark-paid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: currentPassword, orderId })
            });
            await refreshData();
        }

        async function deleteOrder(orderId) {
            if (!confirm('Excluir pedido?')) return;
            await fetch('/api/admin/delete-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: currentPassword, orderId })
            });
            await refreshData();
        }

        async function updateCommission(code, commission) {
            await fetch('/api/admin/update-commission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: currentPassword, code, commission })
            });
            alert('Comissão atualizada!');
        }

        async function toggleAffiliate(code, status) {
            await fetch('/api/admin/toggle-affiliate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: currentPassword, code, status })
            });
            await loadAffiliates();
        }

        async function exportData() {
            const response = await fetch('/api/admin/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: currentPassword })
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'pedidos-' + new Date().toISOString().split('T')[0] + '.csv';
            a.click();
        }
    </script>

</body>
</html>`;

const AFFILIATE_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel do Afiliado - TikTok Shop UK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Inter', sans-serif; }
        body { background: #0a0a0a; }
        .glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
        .input-field { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white; }
        .input-field:focus { border-color: rgba(255,255,255,0.5); outline: none; }
        .btn { padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; transition: all 0.2s; cursor: pointer; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-danger { background: #ef4444; color: white; }
        .badge { padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .badge-success { background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); }
        .badge-warning { background: rgba(234, 179, 8, 0.2); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.3); }
        .badge-pending { background: rgba(156, 163, 175, 0.2); color: #9ca3af; border: 1px solid rgba(156, 163, 175, 0.3); }
    </style>
</head>
<body class="min-h-screen p-4">

    <!-- LOGIN -->
    <div id="loginScreen" class="max-w-md mx-auto" style="margin-top: 15vh;">
        <div class="glass rounded-2xl p-8">
            <div class="text-center mb-8">
                <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                </div>
                <h1 class="text-2xl font-bold text-white mb-2">Painel do Afiliado</h1>
                <p class="text-gray-400 text-sm">TikTok Shop UK Masterclass</p>
            </div>

            <input type="text" id="loginCode" placeholder="Seu código de afiliado"
                   class="input-field w-full px-4 py-3 rounded-lg mb-3"
                   onkeypress="if(event.key==='Enter') document.getElementById('loginPassword').focus()">

            <input type="password" id="loginPassword" placeholder="Sua senha"
                   class="input-field w-full px-4 py-3 rounded-lg mb-4"
                   onkeypress="if(event.key==='Enter') login()">

            <button onclick="login()" class="btn-primary w-full py-3 rounded-lg font-bold">
                ACESSAR PAINEL
            </button>

            <div class="mt-6 text-center">
                <p class="text-gray-500 text-sm">Ainda não é afiliado?
                    <a href="/affiliate/register" class="text-blue-400 hover:underline">Cadastre-se</a>
                </p>
            </div>
        </div>
    </div>

    <!-- DASHBOARD -->
    <div id="dashboard" class="hidden max-w-7xl mx-auto">

        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-3xl font-black text-white mb-1">Painel do Afiliado</h1>
                <p class="text-gray-400 text-sm">Bem-vindo, <span id="affiliateName"></span></p>
            </div>
            <button onclick="logout()" class="btn btn-danger">SAIR</button>
        </div>

        <!-- STATUS -->
        <div id="statusAlert" class="glass rounded-xl p-6 mb-6 hidden">
            <div class="flex items-center gap-3">
                <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <div>
                    <p class="text-yellow-400 font-bold">Aguardando Aprovação</p>
                    <p class="text-gray-400 text-sm">Seu cadastro está em análise. Você será notificado quando for aprovado.</p>
                </div>
            </div>
        </div>

        <!-- LINK DE AFILIADO -->
        <div class="glass rounded-xl p-6 mb-6">
            <h2 class="text-white font-bold mb-4">Seu Link de Afiliado</h2>
            <div class="flex gap-3">
                <input type="text" id="affiliateLink" readonly
                       class="input-field flex-1 px-4 py-3 rounded-lg font-mono text-sm">
                <button onclick="copyLink()" class="btn btn-primary">COPIAR LINK</button>
            </div>
            <p class="text-gray-500 text-xs mt-2">Compartilhe este link para rastrear suas vendas</p>
        </div>

        <!-- STATS -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div class="glass rounded-xl p-6">
                <p class="text-gray-400 text-sm mb-2">Total de Vendas</p>
                <p class="text-4xl font-black text-white" id="totalSales">0</p>
            </div>
            <div class="glass rounded-xl p-6">
                <p class="text-gray-400 text-sm mb-2">Faturamento Gerado</p>
                <p class="text-4xl font-black text-blue-400" id="totalRevenue">R$ 0</p>
            </div>
            <div class="glass rounded-xl p-6">
                <p class="text-gray-400 text-sm mb-2">Comissão Pendente</p>
                <p class="text-4xl font-black text-yellow-400" id="pendingCommission">R$ 0</p>
            </div>
            <div class="glass rounded-xl p-6">
                <p class="text-gray-400 text-sm mb-2">Comissão Paga</p>
                <p class="text-4xl font-black text-green-400" id="paidCommission">R$ 0</p>
            </div>
        </div>

        <!-- VENDAS -->
        <div class="glass rounded-xl p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-white">Minhas Vendas</h2>
                <button onclick="refreshSales()" class="btn btn-primary">ATUALIZAR</button>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-white/5">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">DATA</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">CÓDIGO</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">CLIENTE</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">VALOR</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">COMISSÃO</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400">STATUS</th>
                        </tr>
                    </thead>
                    <tbody id="salesTable" class="divide-y divide-white/5"></tbody>
                </table>
            </div>

            <div id="emptySales" class="hidden text-center py-16">
                <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <p class="text-gray-500 font-semibold">Nenhuma venda ainda</p>
                <p class="text-gray-600 text-sm mt-1">Comece a divulgar seu link!</p>
            </div>
        </div>

    </div>

    <script>
        let currentAffiliate = null;

        async function login() {
            const code = document.getElementById('loginCode').value.toUpperCase();
            const password = document.getElementById('loginPassword').value;

            if (!code || !password) {
                alert('Preencha todos os campos');
                return;
            }

            try {
                const response = await fetch('/api/affiliate/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, password })
                });

                const data = await response.json();

                if (data.success) {
                    currentAffiliate = data.affiliate;
                    localStorage.setItem('affiliateCode', code);
                    localStorage.setItem('affiliatePassword', password);
                    showDashboard();
                } else {
                    alert('Erro: ' + data.error);
                }
            } catch (error) {
                alert('Erro ao fazer login');
            }
        }

        function logout() {
            if (confirm('Deseja sair?')) {
                localStorage.removeItem('affiliateCode');
                localStorage.removeItem('affiliatePassword');
                currentAffiliate = null;
                document.getElementById('loginScreen').classList.remove('hidden');
                document.getElementById('dashboard').classList.add('hidden');
            }
        }

        async function showDashboard() {
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');

            document.getElementById('affiliateName').textContent = currentAffiliate.name;
            document.getElementById('affiliateLink').value = window.location.origin + '/checkout?ref=' + currentAffiliate.code;

            if (currentAffiliate.status === 'pending') {
                document.getElementById('statusAlert').classList.remove('hidden');
            }

            await loadStats();
            await loadSales();
        }

        async function loadStats() {
            try {
                const response = await fetch('/api/affiliate/stats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: currentAffiliate.code,
                        password: localStorage.getItem('affiliatePassword')
                    })
                });

                const data = await response.json();
                if (data.success) {
                    document.getElementById('totalSales').textContent = data.stats.totalSales;
                    document.getElementById('totalRevenue').textContent = 'R$ ' + (data.stats.totalRevenue || 0).toFixed(2);
                    document.getElementById('pendingCommission').textContent = 'R$ ' + (data.stats.pendingCommission || 0).toFixed(2);
                    document.getElementById('paidCommission').textContent = 'R$ ' + (data.stats.paidCommission || 0).toFixed(2);
                }
            } catch (error) {
                console.error('Erro ao carregar stats:', error);
            }
        }

        async function loadSales() {
            try {
                const response = await fetch('/api/affiliate/sales', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: currentAffiliate.code,
                        password: localStorage.getItem('affiliatePassword')
                    })
                });

                const data = await response.json();
                if (data.success) {
                    const tbody = document.getElementById('salesTable');
                    tbody.innerHTML = '';

                    if (data.sales.length === 0) {
                        document.getElementById('emptySales').classList.remove('hidden');
                        return;
                    }

                    document.getElementById('emptySales').classList.add('hidden');

                    data.sales.forEach(sale => {
                        const date = new Date(sale.createdAt);
                        const dateStr = date.toLocaleDateString('pt-BR');
                        const statusBadge = sale.status === 'paid'
                            ? '<span class="badge badge-success">PAGO</span>'
                            : '<span class="badge badge-warning">PENDENTE</span>';

                        const row = document.createElement('tr');
                        row.className = 'hover:bg-white/5';
                        row.innerHTML = \`
                            <td class="px-4 py-3 text-sm text-white">\${dateStr}</td>
                            <td class="px-4 py-3 text-sm text-white font-bold">\${sale.txid}</td>
                            <td class="px-4 py-3 text-sm text-white">\${sale.customerName}</td>
                            <td class="px-4 py-3 text-sm text-white">R$ \${sale.amount.toFixed(2)}</td>
                            <td class="px-4 py-3 text-sm text-green-400 font-bold">R$ \${sale.commission.toFixed(2)}</td>
                            <td class="px-4 py-3">\${statusBadge}</td>
                        \`;
                        tbody.appendChild(row);
                    });
                }
            } catch (error) {
                console.error('Erro ao carregar vendas:', error);
            }
        }

        async function refreshSales() {
            await loadStats();
            await loadSales();
        }

        function copyLink() {
            const input = document.getElementById('affiliateLink');
            input.select();
            document.execCommand('copy');
            alert('Link copiado!');
        }

        // Auto-login se tiver credenciais salvas
        window.onload = () => {
            const savedCode = localStorage.getItem('affiliateCode');
            const savedPassword = localStorage.getItem('affiliatePassword');
            if (savedCode && savedPassword) {
                document.getElementById('loginCode').value = savedCode;
                document.getElementById('loginPassword').value = savedPassword;
                login();
            }
        };

        setInterval(() => {
            if (currentAffiliate) {
                refreshSales();
            }
        }, 60000);
    </script>

</body>
</html>`;
