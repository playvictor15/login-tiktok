require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'segredo-foguinho',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }
}));

// Servir os arquivos estáticos a partir da pasta atual (raiz do projeto)
app.use(express.static(path.join(__dirname)));

// Proteção simples para páginas específicas
const guard = (req, res, next) => {
  if (req.session && req.session.user) return next();
  return res.redirect('/index.html');
};

// Login mock (GET e POST)
app.post('/login-mock', (req, res) => {
  const { username } = req.body || {};
  req.session.user = {
    id: 'mock-user-1',
    name: username || 'Usuário Foquinho',
    avatar: '/roxo.jpeg'
  };
  return res.redirect('/dashboard.html');
});

app.get('/login-mock', (req, res) => {
  req.session.user = { id: 'mock-user-1', name: 'Usuário Foquinho', avatar: '/roxo.jpeg' };
  return res.redirect('/dashboard.html');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/index.html'));
});

// Sessão atual
app.get('/api/session', (req, res) => {
  if (req.session && req.session.user) return res.json({ ok: true, user: req.session.user });
  return res.json({ ok: false });
});

// Lista mock de Foquinhos
app.get('/api/foquinhos', guard, (req, res) => {
  const list = [
    { id: 1, nome: 'Foguinho Amarelo', skin: 'amarelo', model: '/foguinho-amarelo.glb', som: '/amarelo.mp3' },
    { id: 2, nome: 'Foguinho Vermelho', skin: 'vermelho', model: '/foguinho-vermelho.glb', som: '/vermelho.mp3' },
    { id: 3, nome: 'Foguinho Roxo', skin: 'roxo', model: '/foguinho-roxo.glb', som: '/roxo.mp3' }
  ];
  res.json({ ok: true, foquinhos: list });
});

// Proteger páginas comuns (se existirem)
app.get(['/dashboard.html','/mundo.html'], guard, (req, res, next) => next());

// Fallback
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => console.log(`Foquinho server on http://localhost:${PORT}`));
