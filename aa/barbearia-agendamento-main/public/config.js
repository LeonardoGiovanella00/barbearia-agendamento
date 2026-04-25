// ╔══════════════════════════════════════════════════════════╗
// ║   CONFIGURAÇÃO DA BARBEARIA — EDITE AQUI                ║
// ╚══════════════════════════════════════════════════════════╝
const CONFIG_BARBEARIA = {
  barbearia: {
    nome: 'Barbearia X',
    slogan: 'Estilo e precisão em cada corte',
    endereco: 'Rua das Flores, 123 — Centro, São Paulo/SP',
    telefone: '(11) 99999-9999',
    whatsapp: '5511999999999',   // DDI + DDD + número, sem espaços
    email: 'contato@barbeariax.com.br',
    instagram: '@barbeariax',
    corPrincipal: '#C9A84C',     // Cor principal
    corSecundaria: '#a07830',
    senhaAdmin: 'barbearia123'   // Senha do painel admin
  },
  funcionamento: {
    diasSemana: [1, 2, 3, 4, 5, 6],  // 0=Dom, 1=Seg, ..., 6=Sáb
    horaAbertura: '09:00',
    horaFechamento: '19:00',
    intervaloMinutos: 30
  },
  servicos: [
    { id: 1, nome: 'Corte Simples',  preco: 35, duracaoMin: 30, icone: '✂️' },
    { id: 2, nome: 'Corte + Barba',  preco: 55, duracaoMin: 60, icone: '💈' },
    { id: 3, nome: 'Barba',          preco: 30, duracaoMin: 30, icone: '🪒' },
    { id: 4, nome: 'Hidratação',     preco: 25, duracaoMin: 20, icone: '💧' },
    { id: 5, nome: 'Sobrancelha',    preco: 15, duracaoMin: 15, icone: '✨' }
  ],
  barbeiros: [
    { id: 1, nome: 'Carlos',  especialidade: 'Cortes Modernos' },
    { id: 2, nome: 'João',    especialidade: 'Barba & Navalha' },
    { id: 3, nome: 'Rafael',  especialidade: 'Degradê & Navalhado' }
  ]
};
// ══════════════════════════════════════════════════════════
