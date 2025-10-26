// ===========================================
// TIKTOK SHOP UK - SISTEMA ULTIMATE 2.0
// VERSÃO COMPLETA COM TODAS AS FUNCIONALIDADES
// ===========================================
//
// ✨ FUNCIONALIDADES INCLUÍDAS:
// 📧 Notificações Email (Resend API)
// 🔔 Sistema de notificações no painel
// 📈 Gráficos de vendas (Chart.js)
// 💬 Chat suporte integrado (Tawk.to)
// 🎨 Temas personalizáveis (dark/light)
// 📱 Progressive Web App (PWA)
// 🔐 2FA (Two-Factor Auth) para admin
// 📊 Relatórios avançados (diário/semanal/mensal)
// 🎯 Sistema de metas para afiliados
// 🏆 Ranking de afiliados com gamificação
//
// ===========================================

// ⚠️ CONFIGURAÇÕES - ALTERE AQUI
const ADMIN_PASSWORD = 'aDMIN173@'; // Senha do admin
const PRODUCT_PRICE = 47.00; // Preço do produto
const PRODUCT_NAME = 'TikTok Shop UK Masterclass';
const AFFILIATE_COMMISSION = 30; // 30% de comissão

// 🎯 CONFIGURAÇÕES DE METAS
const AFFILIATE_GOALS = {
  bronze: { sales: 5, badge: '🥉', name: 'Bronze' },
  silver: { sales: 15, badge: '🥈', name: 'Prata' },
  gold: { sales: 30, badge: '🥇', name: 'Ouro' },
  platinum: { sales: 50, badge: '💎', name: 'Platina' },
  diamond: { sales: 100, badge: '💠', name: 'Diamante' }
};

// 📌 VOCÊ PRECISA CONFIGURAR NO CLOUDFLARE:
// Environment Variables:
//   - ASAAS_API_KEY (sua chave da API Asaas)
//   - RESEND_API_KEY (para envio de emails)
//   - ADMIN_EMAIL (email para receber notificações)
//   - TAWK_TO_ID (ID do chat Tawk.to - opcional)
//   - TOTP_SECRET (gerado automaticamente no primeiro acesso)
// KV Namespace: TIKTOK_ORDERS

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Verificar KV
    if (!env.TIKTOK_ORDERS && url.pathname.startsWith('/api/')) {
      return jsonResponse({ error: 'Configure o KV Namespace TIKTOK_ORDERS' }, 500, corsHeaders);
    }

    // ========== PWA ROUTES ==========

    // Manifest.json para PWA
    if (url.pathname === '/manifest.json') {
      return new Response(JSON.stringify({
        name: PRODUCT_NAME + ' - Sistema de Vendas',
        short_name: 'TikTok Shop',
        description: 'Sistema completo de vendas com afiliados',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#6366f1',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3046/3046120.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3046/3046120.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Service Worker para PWA
    if (url.pathname === '/sw.js') {
      return new Response(SERVICE_WORKER_JS, {
        headers: { 'Content-Type': 'application/javascript' }
      });
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

    // Registrar clique em link de afiliado
    if (url.pathname === '/api/affiliate/click' && request.method === 'POST') {
      return handleAffiliateClick(request, env, corsHeaders);
    }

    // Ranking de afiliados
    if (url.pathname === '/api/affiliate/ranking' && request.method === 'GET') {
      return handleAffiliateRanking(request, env, corsHeaders);
    }

    // Atualizar meta do afiliado
    if (url.pathname === '/api/affiliate/update-goal' && request.method === 'POST') {
      return handleAffiliateUpdateGoal(request, env, corsHeaders);
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

    // Relatórios avançados
    if (url.pathname === '/api/admin/reports' && request.method === 'POST') {
      return handleAdminReports(request, env, corsHeaders);
    }

    // Dashboard stats com gráficos
    if (url.pathname === '/api/admin/dashboard-stats' && request.method === 'POST') {
      return handleAdminDashboardStats(request, env, corsHeaders);
    }

    // ========== API: 2FA ==========

    // Gerar QR Code para 2FA
    if (url.pathname === '/api/admin/2fa/setup' && request.method === 'POST') {
      return handleAdmin2FASetup(request, env, corsHeaders);
    }

    // Verificar código 2FA
    if (url.pathname === '/api/admin/2fa/verify' && request.method === 'POST') {
      return handleAdmin2FAVerify(request, env, corsHeaders);
    }

    // Desabilitar 2FA
    if (url.pathname === '/api/admin/2fa/disable' && request.method === 'POST') {
      return handleAdmin2FADisable(request, env, corsHeaders);
    }

    // ========== API: NOTIFICAÇÕES ==========

    // Listar notificações
    if (url.pathname === '/api/notifications' && request.method === 'POST') {
      return handleGetNotifications(request, env, corsHeaders);
    }

    // Marcar notificação como lida
    if (url.pathname === '/api/notifications/read' && request.method === 'POST') {
      return handleMarkNotificationRead(request, env, corsHeaders);
    }

    // Limpar todas notificações
    if (url.pathname === '/api/notifications/clear' && request.method === 'POST') {
      return handleClearNotifications(request, env, corsHeaders);
    }

    // ========== API: TEMA ==========

    // Salvar preferência de tema
    if (url.pathname === '/api/theme/save' && request.method === 'POST') {
      return handleSaveTheme(request, env, corsHeaders);
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
      commissionPaid: false,
      utmSource: data.utmSource || null,
      utmMedium: data.utmMedium || null,
      utmCampaign: data.utmCampaign || null
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

    // 🔔 Criar notificação para admin
    await createNotification(env, {
      type: 'new_order',
      title: 'Novo Pedido',
      message: `Pedido ${txid} de ${data.name} - R$ ${PRODUCT_PRICE.toFixed(2)}`,
      data: { orderId, txid },
      recipient: 'admin'
    });

    // 📧 Enviar email de confirmação (opcional - requer RESEND_API_KEY)
    if (env.RESEND_API_KEY) {
      try {
        await sendEmail(env, {
          to: data.email,
          subject: `Pedido ${txid} - ${PRODUCT_NAME}`,
          html: getOrderEmailTemplate(order)
        });
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        // Não falhar a criação do pedido por erro de email
      }
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

                // 🎯 Verificar se alcançou nova meta
                const oldLevel = getAffiliateLevel(affiliate.totalSales - 1);
                const newLevel = getAffiliateLevel(affiliate.totalSales);

                if (oldLevel !== newLevel) {
                  affiliate.level = newLevel;
                  affiliate.badge = AFFILIATE_GOALS[newLevel].badge;

                  // 🔔 Notificar afiliado sobre novo nível
                  await createNotification(env, {
                    type: 'level_up',
                    title: '🎉 Novo Nível Alcançado!',
                    message: `Parabéns! Você alcançou o nível ${AFFILIATE_GOALS[newLevel].name} ${AFFILIATE_GOALS[newLevel].badge}`,
                    data: { level: newLevel },
                    recipient: affiliate.id
                  });
                }

                await env.TIKTOK_ORDERS.put('AFFILIATE:' + order.affiliateCode, JSON.stringify(affiliate));

                // 🔔 Notificar afiliado sobre venda confirmada
                await createNotification(env, {
                  type: 'sale_confirmed',
                  title: '💰 Venda Confirmada!',
                  message: `Sua venda de R$ ${PRODUCT_PRICE.toFixed(2)} foi confirmada! Comissão: R$ ${order.commission.toFixed(2)}`,
                  data: { orderId: order.id, commission: order.commission },
                  recipient: affiliate.id
                });
              }
            }

            // 🔔 Notificar admin sobre pagamento confirmado
            await createNotification(env, {
              type: 'payment_confirmed',
              title: '✅ Pagamento Confirmado',
              message: `Pedido ${order.txid} de ${order.name} foi confirmado!`,
              data: { orderId: order.id, txid: order.txid },
              recipient: 'admin'
            });

            // 📧 Enviar email de confirmação de pagamento
            if (env.RESEND_API_KEY) {
              try {
                await sendEmail(env, {
                  to: order.email,
                  subject: `✅ Pagamento Confirmado - ${order.txid}`,
                  html: getPaymentConfirmedEmailTemplate(order)
                });

                // Notificar admin também
                if (env.ADMIN_EMAIL) {
                  await sendEmail(env, {
                    to: env.ADMIN_EMAIL,
                    subject: `💰 Novo Pagamento - ${order.txid}`,
                    html: getAdminPaymentNotificationTemplate(order)
                  });
                }
              } catch (emailError) {
                console.error('Erro ao enviar email:', emailError);
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
      level: 'bronze',
      badge: '🥉',
      goal: 5,
      createdAt: new Date().toISOString(),
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

    // 🔔 Notificar admin sobre novo cadastro
    await createNotification(env, {
      type: 'new_affiliate',
      title: '👤 Novo Afiliado Cadastrado',
      message: `${data.name} se cadastrou como afiliado. Aguardando aprovação.`,
      data: { affiliateCode: code, affiliateId },
      recipient: 'admin'
    });

    // 📧 Enviar email de boas-vindas
    if (env.RESEND_API_KEY) {
      try {
        await sendEmail(env, {
          to: data.email,
          subject: `Bem-vindo ao Programa de Afiliados - ${PRODUCT_NAME}`,
          html: getAffiliateWelcomeEmailTemplate(affiliate)
        });
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
      }
    }

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

async function handleAffiliateClick(request, env, corsHeaders) {
  try {
    const { code } = await request.json();

    if (!code) {
      return jsonResponse({ success: true }, 200, corsHeaders);
    }

    const affiliateData = await env.TIKTOK_ORDERS.get('AFFILIATE:' + code.toUpperCase());
    if (!affiliateData) {
      return jsonResponse({ success: true }, 200, corsHeaders);
    }

    const affiliate = JSON.parse(affiliateData);
    affiliate.clicks = (affiliate.clicks || 0) + 1;
    await env.TIKTOK_ORDERS.put('AFFILIATE:' + code.toUpperCase(), JSON.stringify(affiliate));

    return jsonResponse({ success: true }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

// 🏆 Ranking de afiliados
async function handleAffiliateRanking(request, env, corsHeaders) {
  try {
    let affiliatesList = await env.TIKTOK_ORDERS.get('AFFILIATE_LIST');
    affiliatesList = affiliatesList ? JSON.parse(affiliatesList) : [];

    const affiliates = [];
    for (const code of affiliatesList) {
      const affiliateData = await env.TIKTOK_ORDERS.get('AFFILIATE:' + code);
      if (affiliateData) {
        const aff = JSON.parse(affiliateData);
        if (aff.status === 'active') {
          affiliates.push({
            code: aff.code,
            name: aff.name,
            totalSales: aff.totalSales || 0,
            totalRevenue: aff.totalRevenue || 0,
            level: aff.level || 'bronze',
            badge: aff.badge || '🥉'
          });
        }
      }
    }

    // Ordenar por vendas (maior para menor)
    affiliates.sort((a, b) => b.totalSales - a.totalSales);

    return jsonResponse({
      success: true,
      ranking: affiliates
    }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

// 🎯 Atualizar meta do afiliado
async function handleAffiliateUpdateGoal(request, env, corsHeaders) {
  try {
    const { email, password, goal } = await request.json();

    let affiliatesList = await env.TIKTOK_ORDERS.get('AFFILIATE_LIST');
    affiliatesList = affiliatesList ? JSON.parse(affiliatesList) : [];

    for (const code of affiliatesList) {
      const affiliateData = await env.TIKTOK_ORDERS.get('AFFILIATE:' + code);
      if (affiliateData) {
        const affiliate = JSON.parse(affiliateData);

        if (affiliate.email === email && btoa(password) === affiliate.password) {
          affiliate.goal = goal;
          await env.TIKTOK_ORDERS.put('AFFILIATE:' + code, JSON.stringify(affiliate));

          return jsonResponse({
            success: true,
            message: 'Meta atualizada com sucesso!'
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
    const data = await request.json();

    // Verificar senha admin
    if (data.password !== ADMIN_PASSWORD) {
      return jsonResponse({ error: 'Senha incorreta' }, 401, corsHeaders);
    }

    // 🔐 Verificar 2FA se estiver habilitado
    if (env.TOTP_SECRET && data.tfaCode) {
      const isValid = await verify2FACode(env, data.tfaCode);
      if (!isValid) {
        return jsonResponse({ error: 'Código 2FA inválido' }, 401, corsHeaders);
      }
    }

    // Buscar pedidos
    let ordersList = await env.TIKTOK_ORDERS.get('ORDER_LIST');
    ordersList = ordersList ? JSON.parse(ordersList) : [];

    const orders = [];
    for (const orderId of ordersList) {
      const orderData = await env.TIKTOK_ORDERS.get(orderId);
      if (orderData) {
        orders.push(JSON.parse(orderData));
      }
    }

    // Buscar stats
    let stats = await env.TIKTOK_ORDERS.get('STATS');
    stats = stats ? JSON.parse(stats) : { total: 0, paid: 0, revenue: 0, commission: 0 };

    return jsonResponse({ success: true, orders, stats }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAdminAffiliates(request, env, corsHeaders) {
  try {
    const data = await request.json();

    if (data.password !== ADMIN_PASSWORD) {
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

    return jsonResponse({ success: true, affiliates }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAdminToggleAffiliate(request, env, corsHeaders) {
  try {
    const data = await request.json();

    if (data.password !== ADMIN_PASSWORD) {
      return jsonResponse({ error: 'Senha incorreta' }, 401, corsHeaders);
    }

    const affiliateData = await env.TIKTOK_ORDERS.get('AFFILIATE:' + data.code);
    if (!affiliateData) {
      return jsonResponse({ error: 'Afiliado não encontrado' }, 404, corsHeaders);
    }

    const affiliate = JSON.parse(affiliateData);
    const oldStatus = affiliate.status;

    // Toggle status
    if (affiliate.status === 'pending') {
      affiliate.status = 'active';
    } else if (affiliate.status === 'active') {
      affiliate.status = 'blocked';
    } else {
      affiliate.status = 'active';
    }

    await env.TIKTOK_ORDERS.put('AFFILIATE:' + data.code, JSON.stringify(affiliate));

    // 🔔 Notificar afiliado sobre mudança de status
    await createNotification(env, {
      type: 'status_change',
      title: 'Status Atualizado',
      message: `Seu status foi alterado de ${oldStatus} para ${affiliate.status}`,
      data: { oldStatus, newStatus: affiliate.status },
      recipient: affiliate.id
    });

    // 📧 Enviar email sobre mudança de status
    if (env.RESEND_API_KEY) {
      try {
        await sendEmail(env, {
          to: affiliate.email,
          subject: `Status Atualizado - ${PRODUCT_NAME}`,
          html: getStatusChangeEmailTemplate(affiliate, affiliate.status)
        });
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
      }
    }

    return jsonResponse({ success: true, newStatus: affiliate.status }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAdminPayCommission(request, env, corsHeaders) {
  try {
    const data = await request.json();

    if (data.password !== ADMIN_PASSWORD) {
      return jsonResponse({ error: 'Senha incorreta' }, 401, corsHeaders);
    }

    const affiliateData = await env.TIKTOK_ORDERS.get('AFFILIATE:' + data.code);
    if (!affiliateData) {
      return jsonResponse({ error: 'Afiliado não encontrado' }, 404, corsHeaders);
    }

    const affiliate = JSON.parse(affiliateData);
    const amount = affiliate.pendingCommission || 0;

    if (amount <= 0) {
      return jsonResponse({ error: 'Sem comissão pendente' }, 400, corsHeaders);
    }

    // Transferir de pendente para pago
    affiliate.pendingCommission = 0;
    affiliate.paidCommission = (affiliate.paidCommission || 0) + amount;

    await env.TIKTOK_ORDERS.put('AFFILIATE:' + data.code, JSON.stringify(affiliate));

    // Marcar pedidos como comissão paga
    let salesIds = await env.TIKTOK_ORDERS.get('AFFILIATE_SALES:' + affiliate.id);
    salesIds = salesIds ? JSON.parse(salesIds) : [];

    for (const orderId of salesIds) {
      const orderData = await env.TIKTOK_ORDERS.get(orderId);
      if (orderData) {
        const order = JSON.parse(orderData);
        if (!order.commissionPaid && order.status === 'paid') {
          order.commissionPaid = true;
          await env.TIKTOK_ORDERS.put(orderId, JSON.stringify(order));
        }
      }
    }

    // 🔔 Notificar afiliado sobre pagamento
    await createNotification(env, {
      type: 'commission_paid',
      title: '💰 Comissão Paga!',
      message: `Sua comissão de R$ ${amount.toFixed(2)} foi paga!`,
      data: { amount },
      recipient: affiliate.id
    });

    // 📧 Enviar email sobre pagamento
    if (env.RESEND_API_KEY) {
      try {
        await sendEmail(env, {
          to: affiliate.email,
          subject: `💰 Comissão Paga - ${PRODUCT_NAME}`,
          html: getCommissionPaidEmailTemplate(affiliate, amount)
        });
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
      }
    }

    return jsonResponse({ success: true, message: 'Comissão paga com sucesso!' }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAdminMarkPaid(request, env, corsHeaders) {
  try {
    const data = await request.json();

    if (data.password !== ADMIN_PASSWORD) {
      return jsonResponse({ error: 'Senha incorreta' }, 401, corsHeaders);
    }

    const orderData = await env.TIKTOK_ORDERS.get(data.orderId);
    if (!orderData) {
      return jsonResponse({ error: 'Pedido não encontrado' }, 404, corsHeaders);
    }

    const order = JSON.parse(orderData);
    order.status = 'paid';
    order.paidAt = new Date().toISOString();
    await env.TIKTOK_ORDERS.put(data.orderId, JSON.stringify(order));

    // Atualizar stats
    let stats = await env.TIKTOK_ORDERS.get('STATS');
    stats = stats ? JSON.parse(stats) : { total: 0, paid: 0, revenue: 0, commission: 0 };
    stats.paid += 1;
    stats.revenue += order.amount;
    stats.commission += order.commission || 0;
    await env.TIKTOK_ORDERS.put('STATS', JSON.stringify(stats));

    return jsonResponse({ success: true }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAdminDeleteOrder(request, env, corsHeaders) {
  try {
    const data = await request.json();

    if (data.password !== ADMIN_PASSWORD) {
      return jsonResponse({ error: 'Senha incorreta' }, 401, corsHeaders);
    }

    await env.TIKTOK_ORDERS.delete(data.orderId);

    return jsonResponse({ success: true }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAdminExport(request, env, corsHeaders) {
  try {
    const data = await request.json();

    if (data.password !== ADMIN_PASSWORD) {
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

    // Gerar CSV
    let csv = 'ID,TXID,Nome,Email,WhatsApp,Valor,Status,Afiliado,Comissao,Data,Pago Em\n';

    orders.forEach(order => {
      csv += `"${order.id}","${order.txid}","${order.name}","${order.email}","${order.whatsapp}",${order.amount},"${order.status}","${order.affiliateCode || ''}",${order.commission || 0},"${order.createdAt}","${order.paidAt || ''}"\n`;
    });

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="pedidos.csv"'
      }
    });

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAdminReports(request, env, corsHeaders) {
  try {
    const data = await request.json();

    if (data.password !== ADMIN_PASSWORD) {
      return jsonResponse({ error: 'Senha incorreta' }, 401, corsHeaders);
    }

    const period = data.period || 'daily'; // daily, weekly, monthly

    let ordersList = await env.TIKTOK_ORDERS.get('ORDER_LIST');
    ordersList = ordersList ? JSON.parse(ordersList) : [];

    const orders = [];
    for (const orderId of ordersList) {
      const orderData = await env.TIKTOK_ORDERS.get(orderId);
      if (orderData) {
        orders.push(JSON.parse(orderData));
      }
    }

    // Filtrar por período
    const now = new Date();
    const filtered = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);

      if (period === 'daily') return diffDays <= 1;
      if (period === 'weekly') return diffDays <= 7;
      if (period === 'monthly') return diffDays <= 30;
      return true;
    });

    // Calcular métricas
    const total = filtered.length;
    const paid = filtered.filter(o => o.status === 'paid').length;
    const pending = filtered.filter(o => o.status === 'pending').length;
    const revenue = filtered.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0);
    const commission = filtered.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.commission || 0), 0);
    const conversionRate = total > 0 ? ((paid / total) * 100).toFixed(2) : 0;

    return jsonResponse({
      success: true,
      report: {
        period,
        total,
        paid,
        pending,
        revenue,
        commission,
        conversionRate,
        orders: filtered
      }
    }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAdminDashboardStats(request, env, corsHeaders) {
  try {
    const data = await request.json();

    if (data.password !== ADMIN_PASSWORD) {
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

    // Agrupar por data (últimos 7 dias)
    const last7Days = [];
    const dailyStats = {};

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push(dateStr);
      dailyStats[dateStr] = { sales: 0, revenue: 0 };
    }

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      if (dailyStats[orderDate] && order.status === 'paid') {
        dailyStats[orderDate].sales += 1;
        dailyStats[orderDate].revenue += order.amount;
      }
    });

    return jsonResponse({
      success: true,
      chartData: {
        labels: last7Days,
        sales: last7Days.map(date => dailyStats[date].sales),
        revenue: last7Days.map(date => dailyStats[date].revenue)
      }
    }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

// ===========================================
// HANDLERS: 2FA
// ===========================================

async function handleAdmin2FASetup(request, env, corsHeaders) {
  try {
    const data = await request.json();

    if (data.password !== ADMIN_PASSWORD) {
      return jsonResponse({ error: 'Senha incorreta' }, 401, corsHeaders);
    }

    const secret = generateTOTPSecret();
    await env.TIKTOK_ORDERS.put('TOTP_SECRET', secret);

    const issuer = 'TikTok Shop';
    const accountName = 'admin';
    const otpauthUrl = 'otpauth://totp/' + encodeURIComponent(issuer) + ':' + encodeURIComponent(accountName) + '?secret=' + secret + '&issuer=' + encodeURIComponent(issuer);

    return jsonResponse({
      success: true,
      secret: secret,
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(otpauthUrl)
    }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAdmin2FAVerify(request, env, corsHeaders) {
  try {
    const data = await request.json();

    if (data.password !== ADMIN_PASSWORD) {
      return jsonResponse({ error: 'Senha incorreta' }, 401, corsHeaders);
    }

    const isValid = await verify2FACode(env, data.code);

    if (isValid) {
      return jsonResponse({ success: true, message: '2FA ativado com sucesso!' }, 200, corsHeaders);
    } else {
      return jsonResponse({ error: 'Código inválido' }, 400, corsHeaders);
    }

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleAdmin2FADisable(request, env, corsHeaders) {
  try {
    const data = await request.json();

    if (data.password !== ADMIN_PASSWORD) {
      return jsonResponse({ error: 'Senha incorreta' }, 401, corsHeaders);
    }

    await env.TIKTOK_ORDERS.delete('TOTP_SECRET');

    return jsonResponse({ success: true, message: '2FA desativado' }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

// ===========================================
// HANDLERS: NOTIFICAÇÕES
// ===========================================

async function handleGetNotifications(request, env, corsHeaders) {
  try {
    const data = await request.json();
    const recipient = data.recipient || 'admin';

    let notificationsList = await env.TIKTOK_ORDERS.get('NOTIFICATIONS:' + recipient);
    notificationsList = notificationsList ? JSON.parse(notificationsList) : [];

    const notifications = [];
    for (const notifId of notificationsList.slice(0, 50)) {
      const notifData = await env.TIKTOK_ORDERS.get(notifId);
      if (notifData) {
        notifications.push(JSON.parse(notifData));
      }
    }

    return jsonResponse({ success: true, notifications }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleMarkNotificationRead(request, env, corsHeaders) {
  try {
    const data = await request.json();

    const notifData = await env.TIKTOK_ORDERS.get(data.notificationId);
    if (notifData) {
      const notification = JSON.parse(notifData);
      notification.read = true;
      await env.TIKTOK_ORDERS.put(data.notificationId, JSON.stringify(notification));
    }

    return jsonResponse({ success: true }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

async function handleClearNotifications(request, env, corsHeaders) {
  try {
    const data = await request.json();
    const recipient = data.recipient || 'admin';

    await env.TIKTOK_ORDERS.put('NOTIFICATIONS:' + recipient, JSON.stringify([]));

    return jsonResponse({ success: true }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

// ===========================================
// HANDLER: TEMA
// ===========================================

async function handleSaveTheme(request, env, corsHeaders) {
  try {
    const data = await request.json();
    const userId = data.userId || 'admin';
    const theme = data.theme || 'dark';

    await env.TIKTOK_ORDERS.put('THEME:' + userId, theme);

    return jsonResponse({ success: true, theme }, 200, corsHeaders);

  } catch (error) {
    return jsonResponse({ error: error.message }, 500, corsHeaders);
  }
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

async function createNotification(env, notificationData) {
  try {
    const notifId = 'NOTIF_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const notification = {
      id: notifId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data || {},
      recipient: notificationData.recipient,
      read: false,
      createdAt: new Date().toISOString()
    };

    await env.TIKTOK_ORDERS.put(notifId, JSON.stringify(notification));

    let notificationsList = await env.TIKTOK_ORDERS.get('NOTIFICATIONS:' + notificationData.recipient);
    notificationsList = notificationsList ? JSON.parse(notificationsList) : [];
    notificationsList.unshift(notifId);

    if (notificationsList.length > 100) {
      notificationsList = notificationsList.slice(0, 100);
    }

    await env.TIKTOK_ORDERS.put('NOTIFICATIONS:' + notificationData.recipient, JSON.stringify(notificationsList));

    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

async function sendEmail(env, emailData) {
  if (!env.RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
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

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }

    const result = await response.json();
    return { success: true, data: result };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getAffiliateLevel(salesCount) {
  if (salesCount >= AFFILIATE_GOALS.diamond.sales) return 'diamond';
  if (salesCount >= AFFILIATE_GOALS.platinum.sales) return 'platinum';
  if (salesCount >= AFFILIATE_GOALS.gold.sales) return 'gold';
  if (salesCount >= AFFILIATE_GOALS.silver.sales) return 'silver';
  return 'bronze';
}

async function verify2FACode(env, code) {
  try {
    const secret = await env.TIKTOK_ORDERS.get('TOTP_SECRET');
    if (!secret) return false;

    const token = generateTOTP(secret);
    return code === token;

  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return false;
  }
}

async function createAsaasCharge(env, data) {
  if (!env.ASAAS_API_KEY) {
    return { success: false, error: 'ASAAS_API_KEY not configured' };
  }

  try {
    const response = await fetch('https://sandbox.asaas.com/api/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': env.ASAAS_API_KEY
      },
      body: JSON.stringify({
        customer: data.customer.name,
        billingType: data.billingType,
        value: data.value,
        dueDate: data.dueDate,
        description: data.description,
        externalReference: data.externalReference
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }

    const result = await response.json();
    return { success: true, data: result };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

function generateAffiliateCode(name) {
  return name.replace(/\s+/g, '').substring(0, 10).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

function getDateInDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function jsonResponse(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

function generateTOTPSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

function generateTOTP(secret) {
  const time = Math.floor(Date.now() / 1000 / 30);
  const key = base32Decode(secret);
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(4, time, false);

  return hmacDigest(key, new Uint8Array(buffer))
    .then(hash => {
      const offset = hash[hash.length - 1] & 0xf;
      const binary = ((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff);
      const otp = binary % 1000000;
      return otp.toString().padStart(6, '0');
    });
}

function base32Decode(secret) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (let i = 0; i < secret.length; i++) {
    const val = alphabet.indexOf(secret.charAt(i).toUpperCase());
    bits += val.toString(2).padStart(5, '0');
  }

  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
  }

  return bytes;
}

async function hmacDigest(key, data) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
  return new Uint8Array(signature);
}

// ===========================================
// EMAIL TEMPLATES
// ===========================================

function getOrderEmailTemplate(order) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #6366f1; }
    .content { padding: 20px 0; }
    .footer { text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #6366f1; margin: 0;">Pedido Recebido!</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${order.name}</strong>,</p>
      <p>Seu pedido foi recebido com sucesso!</p>
      <p><strong>ID do Pedido:</strong> ${order.txid}</p>
      <p><strong>Produto:</strong> ${PRODUCT_NAME}</p>
      <p><strong>Valor:</strong> R$ ${order.amount.toFixed(2)}</p>
      <p><strong>Status:</strong> Aguardando pagamento</p>
      <p>Realize o pagamento via PIX para confirmar seu pedido.</p>
    </div>
    <div class="footer">
      <p>Este é um email automático. Não responda.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getPaymentConfirmedEmailTemplate(order) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #10b981; }
    .content { padding: 20px 0; }
    .footer { text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #10b981; margin: 0;">✅ Pagamento Confirmado!</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${order.name}</strong>,</p>
      <p>Seu pagamento foi confirmado com sucesso!</p>
      <p><strong>ID do Pedido:</strong> ${order.txid}</p>
      <p><strong>Produto:</strong> ${PRODUCT_NAME}</p>
      <p><strong>Valor:</strong> R$ ${order.amount.toFixed(2)}</p>
      <p><strong>Pago em:</strong> ${new Date(order.paidAt).toLocaleString('pt-BR')}</p>
      <p>Obrigado pela sua compra!</p>
    </div>
    <div class="footer">
      <p>Este é um email automático. Não responda.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getAdminPaymentNotificationTemplate(order) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>💰 Novo Pagamento Confirmado</h2>
    <p><strong>Cliente:</strong> ${order.name}</p>
    <p><strong>Email:</strong> ${order.email}</p>
    <p><strong>WhatsApp:</strong> ${order.whatsapp}</p>
    <p><strong>Pedido:</strong> ${order.txid}</p>
    <p><strong>Valor:</strong> R$ ${order.amount.toFixed(2)}</p>
    <p><strong>Afiliado:</strong> ${order.affiliateCode || 'Nenhum'}</p>
    <p><strong>Comissão:</strong> R$ ${(order.commission || 0).toFixed(2)}</p>
  </div>
</body>
</html>
  `;
}

function getAffiliateWelcomeEmailTemplate(affiliate) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>👋 Bem-vindo ao Programa de Afiliados!</h2>
    <p>Olá <strong>${affiliate.name}</strong>,</p>
    <p>Seu cadastro foi recebido com sucesso!</p>
    <p><strong>Seu código de afiliado:</strong> ${affiliate.code}</p>
    <p><strong>Status:</strong> Aguardando aprovação do administrador</p>
    <p>Assim que seu cadastro for aprovado, você poderá começar a divulgar e ganhar comissões!</p>
    <p><strong>Comissão por venda:</strong> ${AFFILIATE_COMMISSION}%</p>
  </div>
</body>
</html>
  `;
}

function getStatusChangeEmailTemplate(affiliate, status) {
  const statusMessages = {
    active: '✅ Seu cadastro foi APROVADO! Você já pode divulgar seu link de afiliado.',
    blocked: '⛔ Seu cadastro foi BLOQUEADO. Entre em contato com o administrador.',
    pending: '⏳ Seu cadastro está em análise.'
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Status Atualizado</h2>
    <p>Olá <strong>${affiliate.name}</strong>,</p>
    <p>${statusMessages[status] || 'Seu status foi atualizado.'}</p>
    <p><strong>Status atual:</strong> ${status}</p>
  </div>
</body>
</html>
  `;
}

function getCommissionPaidEmailTemplate(affiliate, amount) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>💰 Comissão Paga!</h2>
    <p>Olá <strong>${affiliate.name}</strong>,</p>
    <p>Sua comissão foi paga com sucesso!</p>
    <p><strong>Valor pago:</strong> R$ ${amount.toFixed(2)}</p>
    <p>Obrigado por fazer parte do nosso programa de afiliados!</p>
  </div>
</body>
</html>
  `;
}

// ===========================================
// SERVICE WORKER (PWA)
// ===========================================

const SERVICE_WORKER_JS = `
const CACHE_NAME = 'tiktok-shop-v1';
const urlsToCache = [
  '/',
  '/checkout',
  '/admin',
  '/afiliado'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

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
`;


// ===========================================
// HTML PAGES
// ===========================================

function getCheckoutHTML(affiliateCode) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${PRODUCT_NAME} - Checkout</title>
  <link rel="manifest" href="/manifest.json">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
      transition: background 0.3s;
    }

    body.light-theme {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    }

    .theme-toggle {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255,255,255,0.2);
      border: none;
      padding: 10px 15px;
      border-radius: 50px;
      cursor: pointer;
      font-size: 20px;
      backdrop-filter: blur(10px);
      z-index: 1000;
    }

    .container {
      max-width: 500px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      border: 1px solid rgba(255,255,255,0.2);
    }

    body.light-theme .container {
      background: rgba(255, 255, 255, 0.8);
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }

    h1 {
      color: white;
      text-align: center;
      margin-bottom: 10px;
      font-size: 28px;
    }

    body.light-theme h1 {
      color: #333;
    }

    .price {
      text-align: center;
      font-size: 48px;
      color: #4ade80;
      font-weight: bold;
      margin: 20px 0;
    }

    .countdown {
      background: rgba(220, 38, 38, 0.9);
      color: white;
      padding: 15px;
      text-align: center;
      border-radius: 10px;
      margin-bottom: 25px;
      font-size: 18px;
      font-weight: bold;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: white;
      margin-bottom: 8px;
      font-weight: 500;
    }

    body.light-theme label {
      color: #333;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 10px;
      font-size: 16px;
      background: rgba(255,255,255,0.9);
      transition: all 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #4ade80;
      box-shadow: 0 0 0 3px rgba(74,222,128,0.2);
    }

    .btn {
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(74,222,128,0.3);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .affiliate-badge {
      background: rgba(251, 191, 36, 0.2);
      border: 2px solid #fbbf24;
      color: #fbbf24;
      padding: 10px;
      border-radius: 10px;
      text-align: center;
      margin-bottom: 20px;
      font-weight: bold;
    }

    .pix-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      z-index: 9999;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .pix-modal.show {
      display: flex;
    }

    .pix-content {
      background: white;
      border-radius: 20px;
      padding: 30px;
      max-width: 400px;
      width: 100%;
      text-align: center;
    }

    .pix-qrcode {
      margin: 20px 0;
    }

    .pix-qrcode img {
      max-width: 100%;
      border-radius: 10px;
    }

    .pix-code {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 10px;
      word-break: break-all;
      font-family: monospace;
      font-size: 12px;
      margin: 15px 0;
      max-height: 100px;
      overflow-y: auto;
    }

    .copy-btn {
      background: #6366f1;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      margin-top: 10px;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: white;
    }

    .spinner {
      border: 4px solid rgba(255,255,255,0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <button class="theme-toggle" onclick="toggleTheme()">🌙</button>

  <div class="container">
    <h1>${PRODUCT_NAME}</h1>
    <div class="price">R$ ${PRODUCT_PRICE.toFixed(2)}</div>

    <div class="countdown" id="countdown">
      ⏰ Oferta expira em: <span id="timer">15:00</span>
    </div>

    ${affiliateCode ? `<div class="affiliate-badge">🎁 Compra via afiliado: ${affiliateCode}</div>` : ""}

    <form id="checkoutForm">
      <div class="form-group">
        <label>Nome Completo</label>
        <input type="text" id="name" required placeholder="Seu nome completo">
      </div>

      <div class="form-group">
        <label>Email</label>
        <input type="email" id="email" required placeholder="seu@email.com">
      </div>

      <div class="form-group">
        <label>WhatsApp</label>
        <input type="tel" id="whatsapp" required placeholder="(00) 00000-0000">
      </div>

      <button type="submit" class="btn" id="submitBtn">
        🔒 FINALIZAR COMPRA SEGURA
      </button>
    </form>
  </div>

  <div class="pix-modal" id="pixModal">
    <div class="pix-content">
      <h2>PIX Gerado!</h2>
      <p>Escaneie o QR Code ou copie o código:</p>
      <div class="pix-qrcode" id="qrcode"></div>
      <div class="pix-code" id="pixCode"></div>
      <button class="copy-btn" onclick="copyPixCode()">📋 Copiar Código PIX</button>
      <p style="margin-top:20px;color:#666;font-size:14px;">
        Após o pagamento, sua compra será confirmada automaticamente!
      </p>
    </div>
  </div>

  <script>
    // Countdown Timer
    let timeLeft = 15 * 60;
    const timerEl = document.getElementById('timer');

    setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerEl.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
      }
    }, 1000);

    // Theme Toggle
    function toggleTheme() {
      document.body.classList.toggle('light-theme');
      const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
      localStorage.setItem('theme', theme);
      document.querySelector('.theme-toggle').textContent = theme === 'dark' ? '🌙' : '☀️';
    }

    // Load saved theme
    if (localStorage.getItem('theme') === 'light') {
      document.body.classList.add('light-theme');
      document.querySelector('.theme-toggle').textContent = '☀️';
    }

    // Get UTM parameters
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || null;
    const utmMedium = urlParams.get('utm_medium') || null;
    const utmCampaign = urlParams.get('utm_campaign') || null;
    const refCode = urlParams.get('ref') || null;

    // Register affiliate click
    if (refCode) {
      fetch('/api/affiliate/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: refCode })
      });
    }

    // Form submit
    document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner"></div>';

      try {
        const response = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            whatsapp: document.getElementById('whatsapp').value,
            affiliateCode: refCode,
            utmSource,
            utmMedium,
            utmCampaign
          })
        });

        const data = await response.json();

        if (data.success) {
          document.getElementById('qrcode').innerHTML = '<img src="data:image/png;base64,' + data.pixQrCode + '" alt="QR Code PIX">';
          document.getElementById('pixCode').textContent = data.pixCode;
          document.getElementById('pixModal').classList.add('show');
        } else {
          alert('Erro: ' + data.error);
          submitBtn.disabled = false;
          submitBtn.innerHTML = '🔒 FINALIZAR COMPRA SEGURA';
        }
      } catch (error) {
        alert('Erro ao processar pagamento: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '🔒 FINALIZAR COMPRA SEGURA';
      }
    });

    function copyPixCode() {
      const pixCode = document.getElementById('pixCode').textContent;
      navigator.clipboard.writeText(pixCode).then(() => {
        alert('Código PIX copiado!');
      });
    }

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  </script>

  <!--Start of Tawk.to Script-->
  <script type="text/javascript">
  if (window.TAWK_TO_ID) {
    var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
    (function(){
    var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
    s1.async=true;
    s1.src='https://embed.tawk.to/' + window.TAWK_TO_ID + '/default';
    s1.charset='UTF-8';
    s1.setAttribute('crossorigin','*');
    s0.parentNode.insertBefore(s1,s0);
    })();
  }
  </script>
  <!--End of Tawk.to Script-->
</body>
</html>`;
}

const ADMIN_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Panel - ${PRODUCT_NAME}</title>
  <link rel="manifest" href="/manifest.json">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      transition: background 0.3s, color 0.3s;
    }

    body.light-theme {
      background: #f8fafc;
      color: #1e293b;
    }

    .header {
      background: #1e293b;
      padding: 15px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    body.light-theme .header {
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .header h1 {
      font-size: 24px;
      color: #6366f1;
    }

    .header-actions {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .notif-bell {
      position: relative;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #e2e8f0;
    }

    body.light-theme .notif-bell {
      color: #1e293b;
    }

    .notif-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ef4444;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notif-dropdown {
      display: none;
      position: absolute;
      top: 60px;
      right: 30px;
      background: #1e293b;
      border-radius: 10px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.3);
      width: 350px;
      max-height: 400px;
      overflow-y: auto;
      z-index: 1000;
    }

    body.light-theme .notif-dropdown {
      background: white;
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    }

    .notif-dropdown.show {
      display: block;
    }

    .notif-item {
      padding: 15px;
      border-bottom: 1px solid #334155;
    }

    body.light-theme .notif-item {
      border-bottom: 1px solid #e2e8f0;
    }

    .notif-item:last-child {
      border-bottom: none;
    }

    .notif-item.unread {
      background: rgba(99, 102, 241, 0.1);
    }

    .theme-toggle, .logout-btn {
      background: #6366f1;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
    }

    .theme-toggle:hover, .logout-btn:hover {
      background: #4f46e5;
    }

    .container {
      max-width: 1400px;
      margin: 30px auto;
      padding: 0 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: #1e293b;
      padding: 25px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    body.light-theme .stat-card {
      background: white;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .stat-card h3 {
      color: #94a3b8;
      font-size: 14px;
      margin-bottom: 10px;
    }

    .stat-card .value {
      font-size: 32px;
      font-weight: bold;
      color: #6366f1;
    }

    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 25px;
      border-bottom: 2px solid #334155;
    }

    body.light-theme .tabs {
      border-bottom: 2px solid #e2e8f0;
    }

    .tab {
      padding: 12px 25px;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 16px;
      border-bottom: 3px solid transparent;
      transition: all 0.3s;
    }

    .tab.active {
      color: #6366f1;
      border-bottom-color: #6366f1;
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    .chart-container {
      background: #1e293b;
      padding: 25px;
      border-radius: 15px;
      margin-bottom: 25px;
    }

    body.light-theme .chart-container {
      background: white;
    }

    .table-container {
      background: #1e293b;
      border-radius: 15px;
      overflow: hidden;
    }

    body.light-theme .table-container {
      background: white;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 15px;
      text-align: left;
      border-bottom: 1px solid #334155;
    }

    body.light-theme th,
    body.light-theme td {
      border-bottom: 1px solid #e2e8f0;
    }

    th {
      background: #334155;
      font-weight: 600;
      color: #e2e8f0;
    }

    body.light-theme th {
      background: #f1f5f9;
      color: #1e293b;
    }

    .badge {
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge-pending {
      background: #fbbf24;
      color: #78350f;
    }

    .badge-paid {
      background: #10b981;
      color: #064e3b;
    }

    .badge-active {
      background: #10b981;
      color: #064e3b;
    }

    .badge-blocked {
      background: #ef4444;
      color: #7f1d1d;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      margin: 0 5px;
    }

    .btn-primary {
      background: #6366f1;
      color: white;
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      z-index: 9999;
      justify-content: center;
      align-items: center;
    }

    .modal.show {
      display: flex;
    }

    .modal-content {
      background: #1e293b;
      padding: 30px;
      border-radius: 15px;
      max-width: 500px;
      width: 90%;
    }

    body.light-theme .modal-content {
      background: white;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 10px;
      border: 2px solid #334155;
      border-radius: 8px;
      background: #0f172a;
      color: #e2e8f0;
      font-size: 16px;
    }

    body.light-theme .form-group input,
    body.light-theme .form-group select {
      background: #f8fafc;
      border-color: #e2e8f0;
      color: #1e293b;
    }

    .qr-code-container {
      text-align: center;
      padding: 20px;
    }

    .qr-code-container img {
      max-width: 200px;
      margin: 20px 0;
    }

    .loading {
      text-align: center;
      padding: 40px;
    }

    .spinner {
      border: 4px solid rgba(99, 102, 241, 0.3);
      border-top: 4px solid #6366f1;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Admin Panel</h1>
    <div class="header-actions">
      <button class="notif-bell" onclick="toggleNotifications()">
        🔔
        <span class="notif-badge" id="notifBadge" style="display:none;">0</span>
      </button>
      <button class="theme-toggle" onclick="toggleTheme()">🌙</button>
      <button class="logout-btn" onclick="logout()">Sair</button>
    </div>
  </div>

  <div class="notif-dropdown" id="notifDropdown">
    <div id="notificationsList"></div>
  </div>

  <div class="container" id="loginContainer">
    <div style="max-width:400px;margin:100px auto;background:#1e293b;padding:40px;border-radius:15px;">
      <h2 style="text-align:center;margin-bottom:30px;">🔐 Login Admin</h2>
      <div class="form-group">
        <label>Senha</label>
        <input type="password" id="adminPassword" placeholder="Digite a senha">
      </div>
      <div class="form-group" id="tfaGroup" style="display:none;">
        <label>Código 2FA</label>
        <input type="text" id="tfa Code" placeholder="000000" maxlength="6">
      </div>
      <button class="btn btn-primary" style="width:100%;padding:15px;font-size:18px;" onclick="login()">Entrar</button>
    </div>
  </div>

  <div class="container" id="adminContainer" style="display:none;">
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total de Pedidos</h3>
        <div class="value" id="statTotal">0</div>
      </div>
      <div class="stat-card">
        <h3>Pedidos Pagos</h3>
        <div class="value" id="statPaid">0</div>
      </div>
      <div class="stat-card">
        <h3>Receita Total</h3>
        <div class="value" id="statRevenue">R$ 0</div>
      </div>
      <div class="stat-card">
        <h3>Comissões Pagas</h3>
        <div class="value" id="statCommission">R$ 0</div>
      </div>
    </div>

    <div class="chart-container">
      <h3 style="margin-bottom:20px;">📈 Vendas dos Últimos 7 Dias</h3>
      <canvas id="salesChart"></canvas>
    </div>

    <div class="tabs">
      <button class="tab active" onclick="switchTab('orders')">Pedidos</button>
      <button class="tab" onclick="switchTab('affiliates')">Afiliados</button>
      <button class="tab" onclick="switchTab('reports')">Relatórios</button>
      <button class="tab" onclick="switchTab('settings')">Configurações</button>
    </div>

    <div id="ordersTab" class="tab-content active">
      <div style="margin-bottom:20px;">
        <button class="btn btn-primary" onclick="loadOrders()">🔄 Atualizar</button>
        <button class="btn btn-success" onclick="exportCSV()">📥 Exportar CSV</button>
      </div>
      <div class="table-container">
        <table id="ordersTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Afiliado</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="ordersBody">
            <tr><td colspan="8" style="text-align:center;">Carregando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div id="affiliatesTab" class="tab-content">
      <div style="margin-bottom:20px;">
        <button class="btn btn-primary" onclick="loadAffiliates()">🔄 Atualizar</button>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Status</th>
              <th>Vendas</th>
              <th>Receita</th>
              <th>Comissão Pendente</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="affiliatesBody">
            <tr><td colspan="8" style="text-align:center;">Carregando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div id="reportsTab" class="tab-content">
      <h2 style="margin-bottom:20px;">📊 Relatórios Avançados</h2>
      <div class="form-group" style="max-width:300px;">
        <label>Período</label>
        <select id="reportPeriod">
          <option value="daily">Diário (24h)</option>
          <option value="weekly">Semanal (7 dias)</option>
          <option value="monthly">Mensal (30 dias)</option>
        </select>
      </div>
      <button class="btn btn-primary" onclick="generateReport()">Gerar Relatório</button>
      <div id="reportResults" style="margin-top:30px;"></div>
    </div>

    <div id="settingsTab" class="tab-content">
      <h2 style="margin-bottom:30px;">⚙️ Configurações</h2>
      
      <div class="stat-card" style="margin-bottom:20px;">
        <h3 style="margin-bottom:15px;">🔐 Autenticação de Dois Fatores (2FA)</h3>
        <p style="color:#94a3b8;margin-bottom:20px;">
          Adicione uma camada extra de segurança com 2FA usando Google Authenticator
        </p>
        <button class="btn btn-success" onclick="setup2FA()">Ativar 2FA</button>
        <button class="btn btn-danger" onclick="disable2FA()" style="margin-left:10px;">Desativar 2FA</button>
      </div>
    </div>
  </div>

  <div class="modal" id="tfaModal">
    <div class="modal-content">
      <h2 style="text-align:center;margin-bottom:20px;">📱 Configurar 2FA</h2>
      <div class="qr-code-container" id="qrCodeContainer"></div>
      <div class="form-group">
        <label>Digite o código do app para verificar</label>
        <input type="text" id="verifyCode" placeholder="000000" maxlength="6">
      </div>
      <button class="btn btn-success" style="width:100%;" onclick="verify2FA()">Verificar e Ativar</button>
      <button class="btn" style="width:100%;margin-top:10px;background:#475569;color:white;" onclick="closeTFAModal()">Cancelar</button>
    </div>
  </div>

  <script>
    let adminPassword = '';
    let currentTFASecret = '';

    // Theme
    function toggleTheme() {
      document.body.classList.toggle('light-theme');
      const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
      localStorage.setItem('adminTheme', theme);
      document.querySelector('.theme-toggle').textContent = theme === 'dark' ? '🌙' : '☀️';
    }

    if (localStorage.getItem('adminTheme') === 'light') {
      document.body.classList.add('light-theme');
      document.querySelector('.theme-toggle').textContent = '☀️';
    }

    // Login
    async function login() {
      const password = document.getElementById('adminPassword').value;
      const tfaCode = document.getElementById('tfaCode').value;

      try {
        const response = await fetch('/api/admin/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password, tfaCode })
        });

        const data = await response.json();

        if (data.success) {
          adminPassword = password;
          document.getElementById('loginContainer').style.display = 'none';
          document.getElementById('adminContainer').style.display = 'block';
          loadDashboard();
        } else {
          alert('Erro: ' + data.error);
          if (data.error.includes('2FA')) {
            document.getElementById('tfaGroup').style.display = 'block';
          }
        }
      } catch (error) {
        alert('Erro ao fazer login: ' + error.message);
      }
    }

    function logout() {
      adminPassword = '';
      document.getElementById('loginContainer').style.display = 'block';
      document.getElementById('adminContainer').style.display = 'none';
      document.getElementById('adminPassword').value = '';
      document.getElementById('tfaCode').value = '';
    }

    // Dashboard
    async function loadDashboard() {
      await loadOrders();
      await loadChartData();
      await loadNotifications();
    }

    async function loadOrders() {
      try {
        const response = await fetch('/api/admin/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPassword })
        });

        const data = await response.json();

        if (data.success) {
          document.getElementById('statTotal').textContent = data.stats.total;
          document.getElementById('statPaid').textContent = data.stats.paid;
          document.getElementById('statRevenue').textContent = 'R$ ' + data.stats.revenue.toFixed(2);
          document.getElementById('statCommission').textContent = 'R$ ' + data.stats.commission.toFixed(2);

          const tbody = document.getElementById('ordersBody');
          tbody.innerHTML = '';

          data.orders.forEach(order => {
            const row = tbody.insertRow();
            row.innerHTML = '<td>' + order.txid + '</td>' +
              '<td>' + order.name + '</td>' +
              '<td>' + order.email + '</td>' +
              '<td>R$ ' + order.amount.toFixed(2) + '</td>' +
              '<td><span class="badge badge-' + order.status + '">' + order.status + '</span></td>' +
              '<td>' + (order.affiliateCode || '-') + '</td>' +
              '<td>' + new Date(order.createdAt).toLocaleDateString('pt-BR') + '</td>' +
              '<td>' +
                (order.status === 'pending' ? '<button class="btn btn-success" onclick="markPaid(\'' + order.id + '\')">Marcar Pago</button>' : '') +
                '<button class="btn btn-danger" onclick="deleteOrder(\'' + order.id + '\')">Deletar</button>' +
              '</td>';
          });
        }
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    }

    async function loadAffiliates() {
      try {
        const response = await fetch('/api/admin/affiliates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPassword })
        });

        const data = await response.json();

        if (data.success) {
          const tbody = document.getElementById('affiliatesBody');
          tbody.innerHTML = '';

          data.affiliates.forEach(aff => {
            const row = tbody.insertRow();
            const statusBadgeClass = aff.status === 'active' ? 'badge-active' : 
                                      aff.status === 'blocked' ? 'badge-blocked' : 'badge-pending';
            
            row.innerHTML = '<td>' + aff.code + ' ' + (aff.badge || '') + '</td>' +
              '<td>' + aff.name + '</td>' +
              '<td>' + aff.email + '</td>' +
              '<td><span class="badge ' + statusBadgeClass + '">' + aff.status + '</span></td>' +
              '<td>' + (aff.totalSales || 0) + '</td>' +
              '<td>R$ ' + (aff.totalRevenue || 0).toFixed(2) + '</td>' +
              '<td>R$ ' + (aff.pendingCommission || 0).toFixed(2) + '</td>' +
              '<td>' +
                '<button class="btn btn-primary" onclick="toggleAffiliate(\'' + aff.code + '\')">Toggle Status</button>' +
                (aff.pendingCommission > 0 ? '<button class="btn btn-success" onclick="payCommission(\'' + aff.code + '\')">Pagar</button>' : '') +
              '</td>';
          });
        }
      } catch (error) {
        console.error('Error loading affiliates:', error);
      }
    }

    async function loadChartData() {
      try {
        const response = await fetch('/api/admin/dashboard-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPassword })
        });

        const data = await response.json();

        if (data.success) {
          const ctx = document.getElementById('salesChart').getContext('2d');
          
          if (window.salesChart) {
            window.salesChart.destroy();
          }

          window.salesChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: data.chartData.labels,
              datasets: [
                {
                  label: 'Vendas',
                  data: data.chartData.sales,
                  borderColor: '#6366f1',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  tension: 0.4
                },
                {
                  label: 'Receita (R$)',
                  data: data.chartData.revenue,
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  tension: 0.4
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  labels: {
                    color: document.body.classList.contains('light-theme') ? '#1e293b' : '#e2e8f0'
                  }
                }
              },
              scales: {
                y: {
                  ticks: { color: document.body.classList.contains('light-theme') ? '#1e293b' : '#e2e8f0' },
                  grid: { color: 'rgba(99, 102, 241, 0.1)' }
                },
                x: {
                  ticks: { color: document.body.classList.contains('light-theme') ? '#1e293b' : '#e2e8f0' },
                  grid: { color: 'rgba(99, 102, 241, 0.1)' }
                }
              }
            }
          });
        }
      } catch (error) {
        console.error('Error loading chart:', error);
      }
    }

    async function loadNotifications() {
      try {
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipient: 'admin' })
        });

        const data = await response.json();

        if (data.success) {
          const unreadCount = data.notifications.filter(n => !n.read).length;
          
          if (unreadCount > 0) {
            document.getElementById('notifBadge').textContent = unreadCount;
            document.getElementById('notifBadge').style.display = 'flex';
          } else {
            document.getElementById('notifBadge').style.display = 'none';
          }

          const listEl = document.getElementById('notificationsList');
          listEl.innerHTML = '';

          if (data.notifications.length === 0) {
            listEl.innerHTML = '<div style="padding:20px;text-align:center;">Sem notificações</div>';
          } else {
            data.notifications.forEach(notif => {
              const div = document.createElement('div');
              div.className = 'notif-item' + (!notif.read ? ' unread' : '');
              div.innerHTML = '<strong>' + notif.title + '</strong><br>' +
                '<small>' + notif.message + '</small>';
              div.onclick = () => markNotifRead(notif.id);
              listEl.appendChild(div);
            });
          }
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }

    function toggleNotifications() {
      document.getElementById('notifDropdown').classList.toggle('show');
    }

    async function markNotifRead(notifId) {
      try {
        await fetch('/api/notifications/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: notifId })
        });
        loadNotifications();
      } catch (error) {
        console.error('Error marking notification:', error);
      }
    }

    // Actions
    async function markPaid(orderId) {
      if (!confirm('Marcar este pedido como pago?')) return;

      try {
        const response = await fetch('/api/admin/mark-paid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPassword, orderId })
        });

        const data = await response.json();
        if (data.success) {
          alert('Pedido marcado como pago!');
          loadOrders();
        }
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    }

    async function deleteOrder(orderId) {
      if (!confirm('Deletar este pedido?')) return;

      try {
        const response = await fetch('/api/admin/delete-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPassword, orderId })
        });

        const data = await response.json();
        if (data.success) {
          alert('Pedido deletado!');
          loadOrders();
        }
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    }

    async function toggleAffiliate(code) {
      try {
        const response = await fetch('/api/admin/toggle-affiliate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPassword, code })
        });

        const data = await response.json();
        if (data.success) {
          alert('Status atualizado para: ' + data.newStatus);
          loadAffiliates();
        }
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    }

    async function payCommission(code) {
      if (!confirm('Marcar comissão deste afiliado como paga?')) return;

      try {
        const response = await fetch('/api/admin/pay-commission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPassword, code })
        });

        const data = await response.json();
        if (data.success) {
          alert(data.message);
          loadAffiliates();
        }
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    }

    async function exportCSV() {
      try {
        const response = await fetch('/api/admin/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPassword })
        });

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pedidos.csv';
        a.click();
      } catch (error) {
        alert('Erro ao exportar: ' + error.message);
      }
    }

    async function generateReport() {
      const period = document.getElementById('reportPeriod').value;

      try {
        const response = await fetch('/api/admin/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPassword, period })
        });

        const data = await response.json();

        if (data.success) {
          const report = data.report;
          document.getElementById('reportResults').innerHTML = `
            <div class='stats-grid'>
              <div class='stat-card'>
                <h3>Total de Pedidos</h3>
                <div class='value'>${report.total}</div>
              </div>
              <div class='stat-card'>
                <h3>Pagos</h3>
                <div class='value'>${report.paid}</div>
              </div>
              <div class='stat-card'>
                <h3>Pendentes</h3>
                <div class='value'>${report.pending}</div>
              </div>
              <div class='stat-card'>
                <h3>Taxa de Conversão</h3>
                <div class='value'>${report.conversionRate}%</div>
              </div>
              <div class='stat-card'>
                <h3>Receita</h3>
                <div class='value'>R$ ${report.revenue.toFixed(2)}</div>
              </div>
              <div class='stat-card'>
                <h3>Comissões</h3>
                <div class='value'>R$ ${report.commission.toFixed(2)}</div>
              </div>
            </div>
          `;
        }
      } catch (error) {
        alert('Erro ao gerar relatório: ' + error.message);
      }
    }

    // 2FA
    async function setup2FA() {
      try {
        const response = await fetch('/api/admin/2fa/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPassword })
        });

        const data = await response.json();

        if (data.success) {
          currentTFASecret = data.secret;
          document.getElementById('qrCodeContainer').innerHTML = `
            <img src='${data.qrCodeUrl}' alt='QR Code 2FA'>
            <p style='margin-top:15px;'>Escaneie com Google Authenticator</p>
            <p style='font-size:12px;color:#94a3b8;margin-top:10px;'>Secret: ${data.secret}</p>
          `;
          document.getElementById('tfaModal').classList.add('show');
        }
      } catch (error) {
        alert('Erro ao configurar 2FA: ' + error.message);
      }
    }

    async function verify2FA() {
      const code = document.getElementById('verifyCode').value;

      try {
        const response = await fetch('/api/admin/2fa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPassword, code })
        });

        const data = await response.json();

        if (data.success) {
          alert('2FA ativado com sucesso!');
          closeTFAModal();
        } else {
          alert('Código inválido. Tente novamente.');
        }
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    }

    async function disable2FA() {
      if (!confirm('Desativar 2FA?')) return;

      try {
        const response = await fetch('/api/admin/2fa/disable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPassword })
        });

        const data = await response.json();
        if (data.success) {
          alert('2FA desativado!');
        }
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    }

    function closeTFAModal() {
      document.getElementById('tfaModal').classList.remove('show');
      document.getElementById('verifyCode').value = '';
    }

    // Tabs
    function switchTab(tabName) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      event.target.classList.add('active');
      document.getElementById(tabName + 'Tab').classList.add('active');

      if (tabName === 'affiliates') loadAffiliates();
    }

    // Auto-refresh
    setInterval(() => {
      if (adminPassword && document.getElementById('adminContainer').style.display !== 'none') {
        loadNotifications();
      }
    }, 30000); // Every 30s

    // Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  </script>
</body>
</html>`;


const AFFILIATE_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portal do Afiliado - ${PRODUCT_NAME}</title>
  <link rel="manifest" href="/manifest.json">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
      transition: all 0.3s;
    }

    body.light-theme {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    }

    .theme-toggle {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255,255,255,0.2);
      border: none;
      padding: 10px 15px;
      border-radius: 50px;
      cursor: pointer;
      font-size: 20px;
      backdrop-filter: blur(10px);
      z-index: 1000;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .login-container {
      max-width: 450px;
      margin: 100px auto;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }

    body.light-theme .login-container {
      background: rgba(255, 255, 255, 0.9);
    }

    h1, h2 {
      color: white;
      text-align: center;
      margin-bottom: 30px;
    }

    body.light-theme h1,
    body.light-theme h2 {
      color: #333;
    }

    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
    }

    .tab {
      flex: 1;
      padding: 12px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
    }

    .tab.active {
      background: rgba(99, 102, 241, 0.8);
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: white;
      margin-bottom: 8px;
      font-weight: 500;
    }

    body.light-theme label {
      color: #333;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 10px;
      font-size: 16px;
      background: rgba(255,255,255,0.9);
      transition: all 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
    }

    .btn {
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(99,102,241,0.3);
    }

    .dashboard {
      display: none;
    }

    .header {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      padding: 20px;
      border-radius: 15px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    body.light-theme .header {
      background: rgba(255,255,255,0.9);
    }

    .badge-display {
      display: flex;
      align-items: center;
      gap: 10px;
      color: white;
      font-size: 24px;
      font-weight: bold;
    }

    body.light-theme .badge-display {
      color: #333;
    }

    .logout-btn {
      background: #ef4444;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      padding: 25px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    body.light-theme .stat-card {
      background: rgba(255,255,255,0.9);
    }

    .stat-card h3 {
      color: rgba(255,255,255,0.7);
      font-size: 14px;
      margin-bottom: 10px;
    }

    body.light-theme .stat-card h3 {
      color: rgba(0,0,0,0.6);
    }

    .stat-card .value {
      font-size: 32px;
      font-weight: bold;
      color: white;
    }

    body.light-theme .stat-card .value {
      color: #6366f1;
    }

    .progress-section {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      padding: 25px;
      border-radius: 15px;
      margin-bottom: 30px;
    }

    body.light-theme .progress-section {
      background: rgba(255,255,255,0.9);
    }

    .progress-section h3 {
      color: white;
      margin-bottom: 15px;
    }

    body.light-theme .progress-section h3 {
      color: #333;
    }

    .progress-bar {
      background: rgba(255,255,255,0.2);
      border-radius: 10px;
      height: 30px;
      overflow: hidden;
      position: relative;
    }

    .progress-fill {
      background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
      height: 100%;
      border-radius: 10px;
      transition: width 0.5s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }

    .levels {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      flex-wrap: wrap;
    }

    .level-item {
      text-align: center;
      padding: 10px;
      border-radius: 10px;
      background: rgba(255,255,255,0.1);
      margin: 5px;
    }

    .level-item.achieved {
      background: rgba(16, 185, 129, 0.3);
      border: 2px solid #10b981;
    }

    .level-item .emoji {
      font-size: 32px;
    }

    .level-item .name {
      color: white;
      font-size: 12px;
      margin-top: 5px;
    }

    body.light-theme .level-item .name {
      color: #333;
    }

    .link-box {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      padding: 20px;
      border-radius: 15px;
      margin-bottom: 30px;
    }

    body.light-theme .link-box {
      background: rgba(255,255,255,0.9);
    }

    .link-box h3 {
      color: white;
      margin-bottom: 15px;
    }

    body.light-theme .link-box h3 {
      color: #333;
    }

    .link-display {
      display: flex;
      gap: 10px;
    }

    .link-input {
      flex: 1;
      padding: 12px;
      background: rgba(255,255,255,0.9);
      border: none;
      border-radius: 10px;
      font-family: monospace;
    }

    .copy-btn {
      padding: 12px 24px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: bold;
    }

    .copy-btn:hover {
      background: #4f46e5;
    }

    .ranking-section {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      padding: 25px;
      border-radius: 15px;
      margin-bottom: 30px;
    }

    body.light-theme .ranking-section {
      background: rgba(255,255,255,0.9);
    }

    .ranking-section h3 {
      color: white;
      margin-bottom: 20px;
    }

    body.light-theme .ranking-section h3 {
      color: #333;
    }

    .ranking-list {
      list-style: none;
    }

    .ranking-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: rgba(255,255,255,0.1);
      border-radius: 10px;
      margin-bottom: 10px;
      color: white;
    }

    body.light-theme .ranking-item {
      background: rgba(0,0,0,0.05);
      color: #333;
    }

    .ranking-item.top3 {
      background: linear-gradient(135deg, rgba(251,191,36,0.3) 0%, rgba(245,158,11,0.3) 100%);
      border: 2px solid #fbbf24;
    }

    .table-container {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      overflow: hidden;
      margin-top: 30px;
    }

    body.light-theme .table-container {
      background: rgba(255,255,255,0.9);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 15px;
      text-align: left;
      color: white;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    body.light-theme th,
    body.light-theme td {
      color: #333;
    }

    th {
      background: rgba(99,102,241,0.3);
      font-weight: 600;
    }

    .badge {
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge-paid {
      background: #10b981;
      color: white;
    }

    .badge-pending {
      background: #fbbf24;
      color: #78350f;
    }

    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
    }

    .status-pending {
      background: rgba(251,191,36,0.3);
      border: 2px solid #fbbf24;
      color: #fbbf24;
    }

    .status-active {
      background: rgba(16,185,129,0.3);
      border: 2px solid #10b981;
      color: #10b981;
    }

    .status-blocked {
      background: rgba(239,68,68,0.3);
      border: 2px solid #ef4444;
      color: #ef4444;
    }

    .payment-info-section {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      padding: 25px;
      border-radius: 15px;
      margin-top: 30px;
    }

    body.light-theme .payment-info-section {
      background: rgba(255,255,255,0.9);
    }

    .payment-info-section h3 {
      color: white;
      margin-bottom: 15px;
    }

    body.light-theme .payment-info-section h3 {
      color: #333;
    }

    textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 10px;
      font-size: 14px;
      background: rgba(255,255,255,0.9);
      resize: vertical;
      min-height: 100px;
    }
  </style>
</head>
<body>
  <button class="theme-toggle" onclick="toggleTheme()">🌙</button>

  <div class="container" id="loginContainer">
    <div class="login-container">
      <h1>👤 Portal do Afiliado</h1>
      
      <div class="tabs">
        <button class="tab active" onclick="switchLoginTab('login')">Login</button>
        <button class="tab" onclick="switchLoginTab('register')">Cadastrar</button>
      </div>

      <div id="loginForm">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="loginEmail" placeholder="seu@email.com">
        </div>
        <div class="form-group">
          <label>Senha</label>
          <input type="password" id="loginPassword" placeholder="Sua senha">
        </div>
        <button class="btn" onclick="login()">Entrar</button>
      </div>

      <div id="registerForm" style="display:none;">
        <div class="form-group">
          <label>Nome Completo</label>
          <input type="text" id="regName" placeholder="Seu nome">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="regEmail" placeholder="seu@email.com">
        </div>
        <div class="form-group">
          <label>WhatsApp</label>
          <input type="tel" id="regWhatsapp" placeholder="(00) 00000-0000">
        </div>
        <div class="form-group">
          <label>Senha</label>
          <input type="password" id="regPassword" placeholder="Crie uma senha">
        </div>
        <button class="btn" onclick="register()">Cadastrar</button>
      </div>
    </div>
  </div>

  <div class="container dashboard" id="dashboardContainer">
    <div class="header">
      <div class="badge-display">
        <span id="affiliateBadge">🥉</span>
        <span id="affiliateName">Afiliado</span>
      </div>
      <button class="logout-btn" onclick="logout()">Sair</button>
    </div>

    <div id="statusWarning" style="display:none;padding:20px;background:rgba(251,191,36,0.3);border:2px solid #fbbf24;border-radius:15px;margin-bottom:30px;color:white;text-align:center;">
      ⚠️ <strong>Seu cadastro está pendente de aprovação.</strong> Aguarde o administrador aprovar para começar a vender.
    </div>

    <div id="blockedWarning" style="display:none;padding:20px;background:rgba(239,68,68,0.3);border:2px solid #ef4444;border-radius:15px;margin-bottom:30px;color:white;text-align:center;">
      ⛔ <strong>Seu cadastro foi bloqueado.</strong> Entre em contato com o administrador.
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total de Cliques</h3>
        <div class="value" id="statClicks">0</div>
      </div>
      <div class="stat-card">
        <h3>Total de Vendas</h3>
        <div class="value" id="statSales">0</div>
      </div>
      <div class="stat-card">
        <h3>Receita Total</h3>
        <div class="value" id="statRevenue">R$ 0</div>
      </div>
      <div class="stat-card">
        <h3>Comissão Pendente</h3>
        <div class="value" id="statPending">R$ 0</div>
      </div>
      <div class="stat-card">
        <h3>Comissão Paga</h3>
        <div class="value" id="statPaid">R$ 0</div>
      </div>
    </div>

    <div class="progress-section">
      <h3>🎯 Progresso para Próximo Nível</h3>
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill" style="width:0%;">0%</div>
      </div>
      <div class="levels">
        <div class="level-item" id="level-bronze">
          <div class="emoji">🥉</div>
          <div class="name">Bronze<br>5 vendas</div>
        </div>
        <div class="level-item" id="level-silver">
          <div class="emoji">🥈</div>
          <div class="name">Prata<br>15 vendas</div>
        </div>
        <div class="level-item" id="level-gold">
          <div class="emoji">🥇</div>
          <div class="name">Ouro<br>30 vendas</div>
        </div>
        <div class="level-item" id="level-platinum">
          <div class="emoji">💎</div>
          <div class="name">Platina<br>50 vendas</div>
        </div>
        <div class="level-item" id="level-diamond">
          <div class="emoji">💠</div>
          <div class="name">Diamante<br>100 vendas</div>
        </div>
      </div>
    </div>

    <div class="link-box">
      <h3>🔗 Seu Link de Afiliado</h3>
      <div class="link-display">
        <input type="text" class="link-input" id="affiliateLink" readonly>
        <button class="copy-btn" onclick="copyLink()">📋 Copiar</button>
      </div>
    </div>

    <div class="ranking-section">
      <h3>🏆 Ranking de Afiliados</h3>
      <ul class="ranking-list" id="rankingList">
        <li style="text-align:center;color:white;">Carregando...</li>
      </ul>
    </div>

    <div class="payment-info-section">
      <h3>💰 Informações de Pagamento</h3>
      <div class="form-group">
        <label>Dados para receber comissões (PIX, conta bancária, etc.)</label>
        <textarea id="paymentInfo" placeholder="Ex: PIX - CPF 123.456.789-00 ou Banco: 001 Agência: 1234 Conta: 12345-6"></textarea>
      </div>
      <button class="btn" onclick="updatePaymentInfo()">Salvar Informações</button>
    </div>

    <div class="table-container">
      <h3 style="padding:20px;color:white;">📋 Suas Vendas</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Valor</th>
            <th>Comissão</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody id="salesTable">
          <tr><td colspan="6" style="text-align:center;">Carregando...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <script>
    let affiliateData = null;

    // Theme
    function toggleTheme() {
      document.body.classList.toggle('light-theme');
      const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
      localStorage.setItem('affTheme', theme);
      document.querySelector('.theme-toggle').textContent = theme === 'dark' ? '🌙' : '☀️';
    }

    if (localStorage.getItem('affTheme') === 'light') {
      document.body.classList.add('light-theme');
      document.querySelector('.theme-toggle').textContent = '☀️';
    }

    // Login Tabs
    function switchLoginTab(tab) {
      if (tab === 'login') {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
        document.querySelectorAll('.tab')[0].classList.add('active');
        document.querySelectorAll('.tab')[1].classList.remove('active');
      } else {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
        document.querySelectorAll('.tab')[0].classList.remove('active');
        document.querySelectorAll('.tab')[1].classList.add('active');
      }
    }

    // Register
    async function register() {
      const name = document.getElementById('regName').value;
      const email = document.getElementById('regEmail').value;
      const whatsapp = document.getElementById('regWhatsapp').value;
      const password = document.getElementById('regPassword').value;

      if (!name || !email || !whatsapp || !password) {
        alert('Preencha todos os campos!');
        return;
      }

      try {
        const response = await fetch('/api/affiliate/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, whatsapp, password })
        });

        const data = await response.json();

        if (data.success) {
          alert(data.message + '\nSeu código: ' + data.code);
          switchLoginTab('login');
        } else {
          alert('Erro: ' + data.error);
        }
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    }

    // Login
    async function login() {
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      if (!email || !password) {
        alert('Preencha email e senha!');
        return;
      }

      try {
        const response = await fetch('/api/affiliate/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
          affiliateData = data.affiliate;
          showDashboard();
        } else {
          alert('Erro: ' + data.error);
        }
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    }

    function logout() {
      affiliateData = null;
      document.getElementById('loginContainer').style.display = 'block';
      document.getElementById('dashboardContainer').style.display = 'none';
      document.getElementById('loginEmail').value = '';
      document.getElementById('loginPassword').value = '';
    }

    async function showDashboard() {
      document.getElementById('loginContainer').style.display = 'none';
      document.getElementById('dashboardContainer').style.display = 'block';

      // Load complete data
      await loadAffiliateData();
    }

    async function loadAffiliateData() {
      try {
        const response = await fetch('/api/affiliate/details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: affiliateData.email,
            password: document.getElementById('loginPassword').value
          })
        });

        const data = await response.json();

        if (data.success) {
          const aff = data.affiliate;

          // Update header
          document.getElementById('affiliateBadge').textContent = aff.badge || '🥉';
          document.getElementById('affiliateName').textContent = aff.name;

          // Show status warnings
          if (aff.status === 'pending') {
            document.getElementById('statusWarning').style.display = 'block';
            document.getElementById('blockedWarning').style.display = 'none';
          } else if (aff.status === 'blocked') {
            document.getElementById('statusWarning').style.display = 'none';
            document.getElementById('blockedWarning').style.display = 'block';
          } else {
            document.getElementById('statusWarning').style.display = 'none';
            document.getElementById('blockedWarning').style.display = 'none';
          }

          // Update stats
          document.getElementById('statClicks').textContent = aff.clicks || 0;
          document.getElementById('statSales').textContent = aff.totalSales || 0;
          document.getElementById('statRevenue').textContent = 'R$ ' + (aff.totalRevenue || 0).toFixed(2);
          document.getElementById('statPending').textContent = 'R$ ' + (aff.pendingCommission || 0).toFixed(2);
          document.getElementById('statPaid').textContent = 'R$ ' + (aff.paidCommission || 0).toFixed(2);

          // Update link
          document.getElementById('affiliateLink').value = aff.affiliateLink;

          // Update progress
          updateProgress(aff.totalSales || 0, aff.level || 'bronze');

          // Update payment info
          document.getElementById('paymentInfo').value = aff.paymentInfo || '';

          // Update sales table
          const tbody = document.getElementById('salesTable');
          tbody.innerHTML = '';

          if (!aff.orders || aff.orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhuma venda ainda</td></tr>';
          } else {
            aff.orders.forEach(order => {
              const row = tbody.insertRow();
              row.innerHTML = '<td>' + order.txid + '</td>' +
                '<td>' + order.customerName + '</td>' +
                '<td>R$ ' + order.amount.toFixed(2) + '</td>' +
                '<td>R$ ' + (order.commission || 0).toFixed(2) + '</td>' +
                '<td><span class="badge badge-' + order.status + '">' + order.status + '</span></td>' +
                '<td>' + new Date(order.createdAt).toLocaleDateString('pt-BR') + '</td>';
            });
          }

          // Load ranking
          await loadRanking();
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }

    function updateProgress(sales, level) {
      const levels = {
        bronze: { next: 'silver', target: 15 },
        silver: { next: 'gold', target: 30 },
        gold: { next: 'platinum', target: 50 },
        platinum: { next: 'diamond', target: 100 },
        diamond: { next: 'max', target: 100 }
      };

      // Mark achieved levels
      ['bronze', 'silver', 'gold', 'platinum', 'diamond'].forEach(lvl => {
        const el = document.getElementById('level-' + lvl);
        if (level === lvl || (level === 'diamond' && lvl !== 'diamond')) {
          el.classList.add('achieved');
        } else if (sales >= getLevelSales(lvl)) {
          el.classList.add('achieved');
        }
      });

      // Calculate progress
      if (level === 'diamond') {
        document.getElementById('progressFill').style.width = '100%';
        document.getElementById('progressFill').textContent = '🎉 Nível Máximo!';
      } else {
        const target = levels[level].target;
        const progress = (sales / target) * 100;
        document.getElementById('progressFill').style.width = Math.min(progress, 100) + '%';
        document.getElementById('progressFill').textContent = sales + '/' + target;
      }
    }

    function getLevelSales(level) {
      const map = { bronze: 5, silver: 15, gold: 30, platinum: 50, diamond: 100 };
      return map[level] || 0;
    }

    async function loadRanking() {
      try {
        const response = await fetch('/api/affiliate/ranking');
        const data = await response.json();

        if (data.success) {
          const list = document.getElementById('rankingList');
          list.innerHTML = '';

          if (data.ranking.length === 0) {
            list.innerHTML = '<li style="text-align:center;color:white;">Nenhum afiliado ativo ainda</li>';
          } else {
            data.ranking.slice(0, 10).forEach((aff, index) => {
              const li = document.createElement('li');
              li.className = 'ranking-item' + (index < 3 ? ' top3' : '');
              li.innerHTML = '<div><strong>#' + (index + 1) + ' ' + aff.badge + ' ' + aff.name + '</strong></div>' +
                '<div>' + aff.totalSales + ' vendas - R$ ' + (aff.totalRevenue || 0).toFixed(2) + '</div>';
              list.appendChild(li);
            });
          }
        }
      } catch (error) {
        console.error('Error loading ranking:', error);
      }
    }

    async function updatePaymentInfo() {
      const paymentInfo = document.getElementById('paymentInfo').value;

      try {
        const response = await fetch('/api/affiliate/update-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: affiliateData.email,
            password: document.getElementById('loginPassword').value,
            paymentInfo
          })
        });

        const data = await response.json();

        if (data.success) {
          alert('Informações salvas com sucesso!');
        } else {
          alert('Erro: ' + data.error);
        }
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    }

    function copyLink() {
      const link = document.getElementById('affiliateLink').value;
      navigator.clipboard.writeText(link).then(() => {
        alert('Link copiado!');
      });
    }

    // Auto-refresh
    setInterval(() => {
      if (affiliateData && document.getElementById('dashboardContainer').style.display !== 'none') {
        loadAffiliateData();
      }
    }, 60000); // Every 60s

    // Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  </script>
</body>
</html>`;
