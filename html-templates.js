// ===========================================
// HTML TEMPLATES
// ===========================================

export const AFFILIATE_REGISTER_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro de Afiliado - TikTok Shop UK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Inter', sans-serif; }
        body { background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); min-height: 100vh; }
        .glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); }
        .input-field { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white; }
        .input-field:focus { border-color: rgba(255,255,255,0.5); outline: none; }
        .btn-primary { background: linear-gradient(135deg, #fff 0%, #e0e0e0 100%); color: #000; font-weight: 700; }
        .btn-primary:hover { transform: translateY(-2px); }
        .btn-primary:disabled { opacity: 0.5; }
    </style>
</head>
<body class="flex items-center justify-center p-4">

    <div class="max-w-2xl w-full my-8">
        <div class="glass rounded-2xl p-8">

            <div class="text-center mb-8">
                <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                </div>
                <h1 class="text-3xl font-black text-white mb-2">Torne-se um Afiliado</h1>
                <p class="text-gray-400">Ganhe comissões vendendo o TikTok Shop UK Masterclass</p>
            </div>

            <div class="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-8">
                <h3 class="text-green-400 font-bold mb-3">Benefícios de ser Afiliado:</h3>
                <ul class="space-y-2 text-sm text-gray-300">
                    <li class="flex items-start gap-2">
                        <span class="text-green-400">✓</span>
                        <span>Comissão de até 30% por venda (R$ 14,10 por venda)</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span class="text-green-400">✓</span>
                        <span>Link personalizado para rastreamento automático</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span class="text-green-400">✓</span>
                        <span>Painel completo para acompanhar suas vendas</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span class="text-green-400">✓</span>
                        <span>Pagamentos semanais via PIX</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span class="text-green-400">✓</span>
                        <span>Material de divulgação pronto</span>
                    </li>
                </ul>
            </div>

            <form id="registerForm" class="space-y-5">
                <div>
                    <label class="block text-white text-sm font-semibold mb-2">Nome Completo</label>
                    <input type="text" id="name" required class="input-field w-full px-4 py-3 rounded-lg" placeholder="Seu nome completo">
                </div>

                <div>
                    <label class="block text-white text-sm font-semibold mb-2">Email</label>
                    <input type="email" id="email" required class="input-field w-full px-4 py-3 rounded-lg" placeholder="seu@email.com">
                </div>

                <div>
                    <label class="block text-white text-sm font-semibold mb-2">WhatsApp (com DDD)</label>
                    <input type="tel" id="whatsapp" required class="input-field w-full px-4 py-3 rounded-lg" placeholder="(11) 98765-4321">
                </div>

                <div>
                    <label class="block text-white text-sm font-semibold mb-2">Senha de Acesso</label>
                    <input type="password" id="password" required class="input-field w-full px-4 py-3 rounded-lg" placeholder="Mínimo 6 caracteres">
                </div>

                <div>
                    <label class="block text-white text-sm font-semibold mb-2">Chave PIX (para receber comissões)</label>
                    <input type="text" id="pixKey" class="input-field w-full px-4 py-3 rounded-lg" placeholder="CPF, email ou telefone">
                    <p class="text-gray-500 text-xs mt-1">Usaremos para enviar suas comissões</p>
                </div>

                <button type="submit" class="btn-primary w-full py-4 rounded-lg text-lg font-bold transition">
                    SOLICITAR CADASTRO
                </button>
            </form>

            <div class="mt-6 text-center">
                <p class="text-gray-500 text-sm">Já é afiliado?
                    <a href="/affiliate" class="text-blue-400 hover:underline">Fazer login</a>
                </p>
            </div>

        </div>
    </div>

    <div id="successModal" class="hidden fixed inset-0 bg-black/80 flex items-center justify-center p-4">
        <div class="glass rounded-2xl p-8 max-w-md">
            <div class="text-center">
                <div class="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-white mb-2">Cadastro Enviado!</h2>
                <p class="text-gray-400 mb-4">Seu código de afiliado:</p>
                <p class="text-3xl font-black text-green-400 mb-6" id="generatedCode"></p>
                <p class="text-gray-400 text-sm mb-6">
                    Aguarde a aprovação do administrador.<br>
                    Você receberá um email quando for aprovado.
                </p>
                <button onclick="window.location.href='/affiliate'" class="btn-primary w-full py-3 rounded-lg font-bold">
                    IR PARA LOGIN
                </button>
            </div>
        </div>
    </div>

    <script>
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

        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = e.target.querySelector('button');
            btn.disabled = true;
            btn.textContent = 'ENVIANDO...';

            const data = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                whatsapp: document.getElementById('whatsapp').value,
                password: document.getElementById('password').value,
                pixKey: document.getElementById('pixKey').value
            };

            try {
                const response = await fetch('/api/affiliate/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    document.getElementById('generatedCode').textContent = result.code;
                    document.getElementById('successModal').classList.remove('hidden');
                } else {
                    alert('Erro: ' + result.error);
                    btn.disabled = false;
                    btn.textContent = 'SOLICITAR CADASTRO';
                }
            } catch (error) {
                alert('Erro ao enviar cadastro');
                btn.disabled = false;
                btn.textContent = 'SOLICITAR CADASTRO';
            }
        });
    </script>

</body>
</html>`;

export const AFFILIATE_PANEL_HTML = `<!DOCTYPE html>
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

// ADMIN_HTML será muito longo, vou criar separado
export const ADMIN_HTML = `<!DOCTYPE html>
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
