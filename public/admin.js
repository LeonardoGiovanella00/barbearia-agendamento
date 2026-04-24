/* ============================================================
   ADMIN.JS — Painel Administrativo
   ⚠️ Configuração sincronizada com app.js
   ============================================================ */

const SENHA_ADMIN = 'barbearia123'; // ← mesma do app.js
let CONFIG = {};
let agendamentos = [];

async function initAdmin() {
  await carregarConfig();
  verificarLogin();
}

// ── Config ─────────────────────────────────────────────────
async function carregarConfig() {
  // Usa o mesmo CONFIG_BARBEARIA definido em app.js
  // (ambos os scripts são carregados na mesma página no admin)
  if (typeof CONFIG_BARBEARIA !== 'undefined') {
    CONFIG = CONFIG_BARBEARIA;
  } else {
    CONFIG = { barbearia: { nome: 'Barbearia X', whatsapp: '5511999999999', senhaAdmin: SENHA_ADMIN, corPrincipal: '#C9A84C', corSecundaria: '#a07830' }, barbeiros: [] };
  }
}

// ── Login ──────────────────────────────────────────────────
function verificarLogin() {
  const logado = sessionStorage.getItem('admin_logado');
  if (logado === 'sim') {
    mostrarAdmin();
  }
  // Senão, mostra o overlay de login (já visível por padrão)
}

function fazerLogin() {
  const senha = document.getElementById('input-senha').value;
  const senhaCorreta = CONFIG.barbearia?.senhaAdmin || SENHA_ADMIN;

  if (senha === senhaCorreta) {
    sessionStorage.setItem('admin_logado', 'sim');
    document.getElementById('erro-login').style.display = 'none';
    mostrarAdmin();
  } else {
    document.getElementById('erro-login').style.display = 'block';
    document.getElementById('input-senha').value = '';
  }
}

function sair() {
  sessionStorage.removeItem('admin_logado');
  location.reload();
}

// ── Admin UI ───────────────────────────────────────────────
function mostrarAdmin() {
  document.getElementById('login-overlay').style.display = 'none';
  document.getElementById('admin-page').style.display = 'block';

  // Aplicar nome da barbearia
  const nome = CONFIG.barbearia?.nome || 'Barbearia';
  document.title = `Admin — ${nome}`;
  setText('admin-titulo', nome);
  document.documentElement.style.setProperty('--gold', CONFIG.barbearia?.corPrincipal || '#C9A84C');
  document.documentElement.style.setProperty('--gold-dark', CONFIG.barbearia?.corSecundaria || '#a07830');

  carregarAgendamentos();
  preencherFiltros();
  atualizarTudo();

  // Configurar data padrão para hoje
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('filtro-data').value = hoje;

  // Listeners de filtro
  document.getElementById('filtro-data').addEventListener('change', atualizarTudo);
  document.getElementById('filtro-barbeiro').addEventListener('change', atualizarTudo);
}

function preencherFiltros() {
  const sel = document.getElementById('filtro-barbeiro');
  (CONFIG.barbeiros || []).forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.id;
    opt.textContent = b.nome;
    sel.appendChild(opt);
  });
}

// ── Dados ──────────────────────────────────────────────────
function carregarAgendamentos() {
  try {
    agendamentos = JSON.parse(localStorage.getItem('barbearia_agendamentos') || '[]');
  } catch { agendamentos = []; }
}

function salvarAgendamentos() {
  localStorage.setItem('barbearia_agendamentos', JSON.stringify(agendamentos));
}

// ── Stats ──────────────────────────────────────────────────
function atualizarStats() {
  const hoje = new Date().toISOString().split('T')[0];
  const deHoje = agendamentos.filter(a => a.data === hoje && a.status !== 'cancelado');
  const fatHoje = deHoje.reduce((acc, a) => acc + (a.preco || 0), 0);

  // Próximo agendamento de hoje
  const agora = new Date();
  const agoraMin = agora.getHours() * 60 + agora.getMinutes();
  const proximos = deHoje
    .filter(a => {
      const [h, m] = a.horario.split(':').map(Number);
      return h * 60 + m >= agoraMin;
    })
    .sort((a, b) => a.horario.localeCompare(b.horario));

  setText('stat-hoje', deHoje.length);
  setText('stat-total', agendamentos.filter(a => a.status !== 'cancelado').length);
  setText('stat-fat', `R$ ${fatHoje}`);
  setText('stat-prox', proximos.length ? proximos[0].horario : '—');
}

// ── Tabela ─────────────────────────────────────────────────
function atualizarTudo() {
  atualizarStats();
  renderizarTabela();
}

function renderizarTabela() {
  const dataFiltro = document.getElementById('filtro-data').value;
  const barbeiroFiltro = document.getElementById('filtro-barbeiro').value;

  let lista = [...agendamentos];

  if (dataFiltro) lista = lista.filter(a => a.data === dataFiltro);
  if (barbeiroFiltro) lista = lista.filter(a => String(a.barbeiroId) === barbeiroFiltro);

  lista.sort((a, b) => a.horario?.localeCompare(b.horario));

  const tbody = document.getElementById('tbody');
  const empty = document.getElementById('empty-state');

  if (lista.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = lista.map(a => {
    const dataFmt = a.data
      ? new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR')
      : '—';
    const wppLink = a.telefone
      ? `https://wa.me/55${a.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${a.nome}! Sua consulta na ${CONFIG.barbearia?.nome} está confirmada para ${dataFmt} às ${a.horario}. Aguardamos você! 💈`)}`
      : '#';

    return `
      <tr>
        <td><strong>${a.nome || '—'}</strong></td>
        <td>
          <a href="${wppLink}" target="_blank" style="color:var(--gold);text-decoration:none;font-size:0.85rem;">
            💬 ${a.telefone || '—'}
          </a>
        </td>
        <td>${a.servico || '—'}</td>
        <td>${a.barbeiro || '—'}</td>
        <td>${dataFmt}</td>
        <td><strong>${a.horario || '—'}</strong></td>
        <td style="color:var(--gold);">R$ ${a.preco || 0}</td>
        <td>
          <span class="badge-status ${a.status === 'cancelado' ? 'badge-cancelado' : 'badge-confirmado'}">
            ${a.status === 'cancelado' ? '❌ Cancelado' : '✅ Confirmado'}
          </span>
        </td>
        <td>
          ${a.status !== 'cancelado'
            ? `<button class="btn-cancelar" onclick="cancelar(${a.id})">Cancelar</button>`
            : `<button class="btn-cancelar" onclick="remover(${a.id})" style="opacity:0.6;">Remover</button>`
          }
        </td>
      </tr>
    `;
  }).join('');
}

function cancelar(id) {
  const ag = agendamentos.find(a => a.id === id);
  if (ag) { ag.status = 'cancelado'; salvarAgendamentos(); atualizarTudo(); }
}

function remover(id) {
  agendamentos = agendamentos.filter(a => a.id !== id);
  salvarAgendamentos();
  atualizarTudo();
}

function limparTodos() {
  if (confirm('Tem certeza? Isso apagará TODOS os agendamentos salvos.')) {
    agendamentos = [];
    salvarAgendamentos();
    atualizarTudo();
  }
}

// ── Exportar CSV ───────────────────────────────────────────
function exportarCSV() {
  const header = ['Nome', 'WhatsApp', 'Serviço', 'Barbeiro', 'Data', 'Horário', 'Valor', 'Status'];
  const rows = agendamentos.map(a => [
    a.nome, a.telefone, a.servico, a.barbeiro,
    a.data, a.horario, `R$ ${a.preco}`, a.status
  ]);

  const csv = [header, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `agendamentos_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Utilitários ────────────────────────────────────────────
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ── Start ──────────────────────────────────────────────────
initAdmin();
