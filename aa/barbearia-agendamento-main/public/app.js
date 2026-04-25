/* ============================================================
   APP.JS — Lógica do Sistema de Agendamento
   ⚠️ Para personalizar a barbearia, edite o objeto CONFIG abaixo!
   ============================================================ */

// A configuração agora fica no arquivo config.js!

let CONFIG = {};
let agendamentos = [];
let selecao = { servicos: [], barbeiro: null, data: null, horario: null };

// ── Inicialização ──────────────────────────────────────────
async function init() {
  await carregarConfig();
  carregarAgendamentos();
  aplicarConfig();
  renderizarServicos();
  renderizarStep1();
  renderizarStep2();
  configurarDataPicker();
  document.getElementById('footer-ano').textContent = new Date().getFullYear();
}

// ── Carregar config ────────────────────────────────────────
async function carregarConfig() {
  // Usa a configuração definida no topo deste arquivo
  CONFIG = CONFIG_BARBEARIA;
}

// ── Aplicar configurações na UI ───────────────────────────
function aplicarConfig() {
  const b = CONFIG.barbearia;

  // Cores dinâmicas
  document.documentElement.style.setProperty('--gold', b.corPrincipal || '#C9A84C');
  document.documentElement.style.setProperty('--gold-dark', b.corSecundaria || '#a07830');
  document.documentElement.style.setProperty('--gold-glow', hexToRgba(b.corPrincipal || '#C9A84C', 0.25));

  // Título da página
  document.title = `Agendamento Online — ${b.nome}`;

  // Hero
  setText('hero-nome', b.nome);
  setText('hero-slogan', b.slogan);
  setText('hero-endereco', `📍 ${b.endereco}`);
  setText('hero-telefone', `📞 ${b.telefone}`);
  setText('hero-instagram', b.instagram ? `📷 ${b.instagram}` : '');

  // Footer
  setText('footer-nome', b.nome);
  setText('footer-nome2', b.nome);
  setText('footer-endereco', b.endereco);
  setText('footer-telefone', b.telefone);

  const wppLink = document.getElementById('footer-wpp');
  if (wppLink) wppLink.href = `https://wa.me/${b.whatsapp}`;
}

// ── Seção de Serviços (vitrine) ───────────────────────────
function renderizarServicos() {
  const grid = document.getElementById('servicos-grid');
  if (!grid) return;
  grid.innerHTML = CONFIG.servicos.map(s => `
    <div class="servico-card">
      <div class="icone">${s.icone}</div>
      <div class="nome">${s.nome}</div>
      <div class="preco">R$ ${s.preco}</div>
      <div class="duracao">⏱ ${s.duracaoMin} min</div>
    </div>
  `).join('');
}

// ── Step 1: Escolher Serviço (múltipla seleção) ──────────
function renderizarStep1() {
  const grid = document.getElementById('step1-servicos');
  if (!grid) return;
  grid.innerHTML = CONFIG.servicos.map(s => `
    <div class="opcao-card" id="srv-${s.id}" onclick="toggleServico(${s.id})">
      <div class="icone">${s.icone}</div>
      <div class="nome">${s.nome}</div>
      <div class="preco">R$ ${s.preco}</div>
      <div class="sub">⏱ ${s.duracaoMin} min</div>
    </div>
  `).join('');
  atualizarRodapeServicos();
}

function toggleServico(id) {
  const servico = CONFIG.servicos.find(s => s.id === id);
  const idx = selecao.servicos.findIndex(s => s.id === id);

  if (idx === -1) {
    // Adiciona
    selecao.servicos.push(servico);
    document.getElementById(`srv-${id}`).classList.add('selected');
  } else {
    // Remove
    selecao.servicos.splice(idx, 1);
    document.getElementById(`srv-${id}`).classList.remove('selected');
  }

  atualizarRodapeServicos();
  document.getElementById('btn-next-1').disabled = selecao.servicos.length === 0;
}

function atualizarRodapeServicos() {
  const totalPreco = selecao.servicos.reduce((acc, s) => acc + s.preco, 0);
  const totalMin   = selecao.servicos.reduce((acc, s) => acc + s.duracaoMin, 0);
  const el = document.getElementById('step1-total');
  if (!el) return;
  if (selecao.servicos.length === 0) {
    el.style.display = 'none';
  } else {
    el.style.display = 'flex';
    el.innerHTML = `
      <span>🛒 ${selecao.servicos.length} serviço${selecao.servicos.length > 1 ? 's' : ''} selecionado${selecao.servicos.length > 1 ? 's' : ''}</span>
      <span style="color:var(--gold);font-weight:700;">R$ ${totalPreco} &nbsp;·&nbsp; ⏱ ${totalMin} min</span>
    `;
  }
}

// ── Step 2: Escolher Barbeiro ─────────────────────────────
function renderizarStep2() {
  const grid = document.getElementById('step2-barbeiros');
  if (!grid) return;
  grid.innerHTML = CONFIG.barbeiros.map(b => `
    <div class="opcao-card" id="bar-${b.id}" onclick="selecionarBarbeiro(${b.id})">
      <div class="icone">💈</div>
      <div class="nome">${b.nome}</div>
      <div class="sub">${b.especialidade}</div>
    </div>
  `).join('');
}

function selecionarBarbeiro(id) {
  selecao.barbeiro = CONFIG.barbeiros.find(b => b.id === id);
  document.querySelectorAll('#step2-barbeiros .opcao-card').forEach(el => el.classList.remove('selected'));
  document.getElementById(`bar-${id}`).classList.add('selected');
  document.getElementById('btn-next-2').disabled = false;
}

// ── Step 3: Escolher Data e Horário ──────────────────────
function configurarDataPicker() {
  const input = document.getElementById('input-data');
  if (!input) return;

  // Mínimo: hoje
  const hoje = new Date();
  input.min = hoje.toISOString().split('T')[0];

  input.addEventListener('change', () => {
    selecao.data = input.value;
    selecao.horario = null;
    document.getElementById('btn-next-3').disabled = true;
    renderizarHorarios(input.value);
  });
}

function renderizarHorarios(dataStr) {
  const grid = document.getElementById('horarios-grid');
  if (!grid) return;

  const data = new Date(dataStr + 'T00:00:00');
  const diaSemana = data.getDay(); // 0=dom, 1=seg...

  if (!CONFIG.funcionamento.diasSemana.includes(diaSemana)) {
    grid.innerHTML = '<p class="hint">⚠️ A barbearia não funciona neste dia.</p>';
    return;
  }

  const slots = gerarSlots(dataStr);
  const ocupados = agendamentos
    .filter(a => a.data === dataStr && a.status !== 'cancelado')
    .map(a => `${a.horario}|${a.barbeiroId}`);

  grid.innerHTML = slots.map(h => {
    const chave = `${h}|${selecao.barbeiro?.id}`;
    const ocupado = ocupados.includes(chave);
    return `
      <button
        class="horario-btn ${ocupado ? 'ocupado' : ''}"
        id="hr-${h.replace(':', '')}"
        onclick="${ocupado ? '' : `selecionarHorario('${h}')`}"
        ${ocupado ? 'disabled' : ''}
      >${h}</button>
    `;
  }).join('');
}

function gerarSlots(dataStr) {
  const slots = [];
  const [hAbr, mAbr] = CONFIG.funcionamento.horaAbertura.split(':').map(Number);
  const [hFec, mFec] = CONFIG.funcionamento.horaFechamento.split(':').map(Number);
  const intervalo = CONFIG.funcionamento.intervaloMinutos;

  let cur = hAbr * 60 + mAbr;
  const fim = hFec * 60 + mFec;

  while (cur < fim) {
    const h = String(Math.floor(cur / 60)).padStart(2, '0');
    const m = String(cur % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
    cur += intervalo;
  }
  return slots;
}

function selecionarHorario(horario) {
  selecao.horario = horario;
  document.querySelectorAll('.horario-btn').forEach(btn => btn.classList.remove('selected'));
  const id = `hr-${horario.replace(':', '')}`;
  document.getElementById(id)?.classList.add('selected');
  document.getElementById('btn-next-3').disabled = false;
}

// ── Step 4: Resumo + Confirmar ────────────────────────────
function mostrarResumo() {
  const div = document.getElementById('resumo-conteudo');
  if (!div) return;

  const dataFormatada = selecao.data
    ? new Date(selecao.data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    : '—';

  const totalPreco = selecao.servicos.reduce((acc, s) => acc + s.preco, 0);
  const totalMin   = selecao.servicos.reduce((acc, s) => acc + s.duracaoMin, 0);
  const listaSvcs  = selecao.servicos.map(s => `${s.icone} ${s.nome} (R$ ${s.preco})`).join('<br>');

  div.innerHTML = `
    <div class="resumo-linha" style="flex-direction:column;align-items:flex-start;gap:0.3rem;">
      <span>Serviços</span>
      <span style="color:var(--text);font-weight:600;line-height:1.6;">${listaSvcs || '—'}</span>
    </div>
    <div class="resumo-linha"><span>Barbeiro</span><span>${selecao.barbeiro?.nome || '—'}</span></div>
    <div class="resumo-linha"><span>Data</span><span>${dataFormatada}</span></div>
    <div class="resumo-linha"><span>Horário</span><span>${selecao.horario || '—'}</span></div>
    <div class="resumo-linha"><span>Duração total</span><span>⏱ ${totalMin} min</span></div>
    <div class="resumo-linha" style="margin-top:0.3rem;"><span style="font-weight:700;color:var(--text);">Total</span><span style="color:var(--gold);font-size:1.1rem;font-weight:800;">R$ ${totalPreco}</span></div>
  `;
}

function confirmarAgendamento() {
  const nome = document.getElementById('input-nome').value.trim();
  const tel = document.getElementById('input-telefone').value.trim();

  if (!nome || !tel) {
    mostrarToast('⚠️ Preencha seu nome e WhatsApp!', '#e74c3c');
    return;
  }

  // Salvar localmente
  const totalPreco = selecao.servicos.reduce((acc, s) => acc + s.preco, 0);
  const totalMin   = selecao.servicos.reduce((acc, s) => acc + s.duracaoMin, 0);
  const nomesServicos = selecao.servicos.map(s => s.nome).join(', ');

  const agendamento = {
    id: Date.now(),
    nome,
    telefone: tel,
    servico: nomesServicos,
    preco: totalPreco,
    duracaoTotal: totalMin,
    barbeiroId: selecao.barbeiro?.id,
    barbeiro: selecao.barbeiro?.nome,
    data: selecao.data,
    horario: selecao.horario,
    status: 'confirmado',
    criadoEm: new Date().toISOString()
  };

  agendamentos.push(agendamento);
  salvarAgendamentos();

  // Montar mensagem WhatsApp
  const dataFormatada = new Date(selecao.data + 'T00:00:00')
    .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const listaMsg = selecao.servicos.map(s => `  • ${s.nome} — R$ ${s.preco}`).join('\n');

  const msg = encodeURIComponent(
    `Olá! Gostaria de confirmar meu agendamento na ${CONFIG.barbearia.nome}:\n\n` +
    `👤 Nome: ${nome}\n` +
    `✂️ Serviços:\n${listaMsg}\n` +
    `💈 Barbeiro: ${selecao.barbeiro?.nome}\n` +
    `📅 Data: ${dataFormatada}\n` +
    `🕐 Horário: ${selecao.horario}\n` +
    `⏱ Duração: ${totalMin} min\n` +
    `💰 Total: R$ ${totalPreco}\n\n` +
    `Confirmo o agendamento! ✅`
  );

  const wppNumero = CONFIG.barbearia.whatsapp;
  const wppUrl = `https://wa.me/${wppNumero}?text=${msg}`;

  mostrarToast('✅ Agendamento salvo! Abrindo WhatsApp...');

  setTimeout(() => {
    window.open(wppUrl, '_blank');
  }, 800);
}

// ── Navegação entre Steps ─────────────────────────────────
function goToStep(n) {
  document.querySelectorAll('.step-panel').forEach(el => el.classList.remove('active'));
  document.getElementById(`step-${n}`).classList.add('active');

  document.querySelectorAll('.progress-step').forEach((el, i) => {
    el.classList.remove('active', 'done');
    if (i + 1 < n) el.classList.add('done');
    if (i + 1 === n) el.classList.add('active');
  });

  if (n === 4) mostrarResumo();

  window.scrollTo({ top: document.getElementById('agendar').offsetTop - 40, behavior: 'smooth' });
}

// ── Persistência (localStorage) ───────────────────────────
function carregarAgendamentos() {
  try {
    agendamentos = JSON.parse(localStorage.getItem('barbearia_agendamentos') || '[]');
  } catch { agendamentos = []; }
}

function salvarAgendamentos() {
  localStorage.setItem('barbearia_agendamentos', JSON.stringify(agendamentos));
}

// ── Utilitários ───────────────────────────────────────────
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

let toastTimer;
function mostrarToast(msg, cor = '#2ecc71') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.background = cor;
  toast.style.color = cor === '#2ecc71' ? '#000' : '#fff';
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Start (apenas na página de agendamento) ───────────────
if (!document.getElementById('login-overlay')) {
  init();
}
