require('dotenv').config();
const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('./foguinho.db');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessão mockada
app.use(session({
  secret: 'segredo-foguinho',
  resave: false,
  saveUninitialized: true
}));

// Middleware de CSP relaxado (para evitar bloqueios de CSS/JS externos)
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");
  next();
});

// Mock de login do TikTok
app.get('/auth/tiktok', (req, res) => {
  req.session.user = { username: 'MockUserTikTok' };
  res.redirect('/dashboard.html');
});

// Mock de logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// Servir arquivos estáticos da raiz
app.use(express.static(path.join(__dirname)));

// Criar tabela se não existir
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS foguinhos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    skin INTEGER,
    dias INTEGER,
    dono TEXT,
    donoSecundario TEXT
  )`);
});

// Criar foguinho
app.post('/criar-foguinho', (req, res) => {
  if (!req.session.user) return res.status(401).send('Não autenticado');

  const { nome, skin, dias, donoSecundario } = req.body;

  const stmt = db.prepare("INSERT INTO foguinhos (nome, skin, dias, dono, donoSecundario) VALUES (?, ?, ?, ?, ?)");
  stmt.run(nome, skin, dias || 0, req.session.user.username, donoSecundario || null, function(err) {
    if (err) {
      console.error("Erro ao salvar Foguinho:", err);
      return res.status(500).send("Erro ao salvar Foguinho");
    }
    res.redirect('/dashboard.html');
  });
  stmt.finalize();
});

// Listar foguinhos do usuário logado
app.get('/meus-foguinhos', (req, res) => {
  if (!req.session.user) return res.status(401).json([]);
  db.all("SELECT * FROM foguinhos WHERE dono = ?", [req.session.user.username], (err, rows) => {
    if (err) return res.status(500).json([]);
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));
