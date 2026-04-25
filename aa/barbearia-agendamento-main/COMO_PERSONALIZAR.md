# 🔧 Como Personalizar para um Novo Cliente

Este sistema foi desenvolvido para ser facilmente revendido para qualquer barbearia.
Para personalizar, **edite apenas o arquivo `config.json`** na raiz do projeto.

---

## ✏️ Campos que você deve trocar

Abra o arquivo `config.json` e altere:

```json
{
  "barbearia": {
    "nome": "NOME DA BARBEARIA",
    "slogan": "Slogan da barbearia",
    "endereco": "Rua, número — Bairro, Cidade/UF",
    "telefone": "(XX) XXXXX-XXXX",
    "whatsapp": "55XXXXXXXXXXX",   ← DDI + DDD + número, sem espaços ou traços
    "email": "email@barbearia.com.br",
    "instagram": "@perfil",
    "corPrincipal": "#C9A84C",    ← Cor principal (dourado padrão)
    "corSecundaria": "#a07830",   ← Cor escura para gradientes
    "senhaAdmin": "suasenha123"   ← Senha do painel de admin
  },
  ...
}
```

---

## 📋 Serviços

Adicione ou remova serviços na lista `servicos`:

```json
"servicos": [
  { "id": 1, "nome": "Corte Simples", "preco": 35, "duracaoMin": 30, "icone": "✂️" },
  { "id": 2, "nome": "Corte + Barba", "preco": 55, "duracaoMin": 60, "icone": "💈" }
]
```

- **icone**: qualquer emoji
- **duracaoMin**: duração em minutos (afeta os horários bloqueados, em breve)

---

## 💈 Barbeiros

```json
"barbeiros": [
  { "id": 1, "nome": "Carlos", "especialidade": "Cortes Modernos" },
  { "id": 2, "nome": "João", "especialidade": "Barba & Navalha" }
]
```

---

## ⏰ Funcionamento

```json
"funcionamento": {
  "diasSemana": [1, 2, 3, 4, 5, 6],  ← 0=Dom, 1=Seg, ..., 6=Sáb
  "horaAbertura": "09:00",
  "horaFechamento": "19:00",
  "intervaloMinutos": 30              ← Intervalo entre horários
}
```

---

## 🎨 Cores

Use qualquer cor hexadecimal em `corPrincipal`.  
Exemplos:
- Dourado: `#C9A84C`
- Azul: `#3498db`
- Verde: `#27ae60`
- Vermelho: `#e74c3c`
- Roxo: `#9b59b6`

---

## 🔐 Acessar o Painel Admin

- URL: `seu-site.com/admin.html`
- Senha padrão: `barbearia123`
- **Importante:** Altere o campo `senhaAdmin` no `config.json` antes de entregar ao cliente!

---

## 📁 Estrutura dos Arquivos

```
/
├── config.json          ← ✏️ EDITAR AQUI
├── public/
│   ├── index.html       ← Página de agendamento
│   ├── admin.html       ← Painel administrativo
│   ├── style.css        ← Estilos (não precisa mexer)
│   ├── app.js           ← Lógica (não precisa mexer)
│   └── admin.js         ← Lógica admin (não precisa mexer)
└── COMO_PERSONALIZAR.md ← Este arquivo
```

---

## ▶️ Como Abrir o Sistema

### Opção A — Abrir localmente (sem servidor)
> ⚠️ O `config.json` só carrega via servidor. Para abrir localmente, use a extensão **Live Server** no VS Code, ou siga a opção B.

### Opção B — Servidor local simples (Python)
Se tiver Python instalado, rode na pasta do projeto:
```bash
python -m http.server 8080
```
Depois acesse: http://localhost:8080/public/

### Opção C — Deploy grátis na internet
- **Netlify**: arraste a pasta `public/` para [netlify.com/drop](https://netlify.com/drop)  
  (lembre de mover o `config.json` para dentro de `public/` antes)
- **Vercel**: sobe o projeto inteiro e configura `public/` como diretório raiz

---

## 💡 Dica de Venda

Ao vender para um novo cliente:
1. Edite o `config.json` (5 minutos)
2. Troque o `logo.png` se necessário
3. Faça o deploy — pronto! ✅
