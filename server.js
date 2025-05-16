require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('./foguinho.db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.use(session({
  secret: 'segredo-foguinho',
  resave: false,
  saveUninitialized: true,
}));

// Criação de tabelas se não existirem
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    avatar TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS foguinhos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    dias INTEGER,
    skin INTEGER,
    dono_id TEXT,
    dono_secundario TEXT
  )`);
});

// Rota inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Simulação de login (mantém TikTok funcionando, mas finge login local)
app.get('/login', (req, res) => {
  req.session.user = {
    id: 'usuario-demo',
    username: 'Visitante',
    avatar: 'https://i.imgur.com/3ZQ3ZL6.png'
  };
  res.redirect('/dashboard.html');
});

// Verifica se está logado
function checkAuth(req, res, next) {
  if (!req.session.user) {
    if (req.path.includes('/adicionar-foguinho')) {
      return res.status(401).send(`
        <html>
          <head><title>Erro</title></head>
          <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h2>Erro 401 - Acesso negado</h2>
            <p>Você precisa estar logado para acessar essa página.</p>
            <a href="/login"><button>Ir para Login</button></a>
          </body>
        </html>
      `);
    }
    return res.redirect('/');
  }
  next();
}

// Página para adicionar Foguinho
app.get('/adicionar-foguinho', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'painel.html'));
});

// POST alternativo usado por painel.html
app.post('/criar-foguinho', checkAuth, (req, res) => {
  const { nome, dias, skin, donoSecundario } = req.body;
  const dono_id = req.session.user.id;

  db.get(`SELECT * FROM foguinhos WHERE nome = ?`, [nome], (err, row) => {
    if (err) return res.status(500).send('Erro ao verificar nome');
    if (row) {
      return res.send(`
        <html>
          <head><title>Erro</title></head>
          <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h2>Nome já está em uso</h2>
            <a href="/adicionar-foguinho"><button>Voltar</button></a>
          </body>
        </html>
      `);
    }

    db.run(`INSERT INTO foguinhos (nome, dias, skin, dono_id, dono_secundario)
      VALUES (?, ?, ?, ?, ?)`,
      [nome, dias, skin, dono_id, donoSecundario], (err) => {
        if (err) return res.status(500).send('Erro ao salvar Foguinho');
        res.redirect('/dashboard.html');
      });
  });
});

// Adiciona um Foguinho (API JSON)
app.post('/adicionar-foguinho', checkAuth, (req, res) => {
  const { nome, dias, skin, dono_secundario } = req.body;
  const dono_id = req.session.user.id;

  db.get(`SELECT * FROM foguinhos WHERE nome = ?`, [nome], (err, row) => {
    if (row) {
      return res.status(400).json({ error: 'Nome já usado' });
    }

    db.run(`INSERT INTO foguinhos (nome, dias, skin, dono_id, dono_secundario)
      VALUES (?, ?, ?, ?, ?)`,
      [nome, dias, skin, dono_id, dono_secundario], (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao salvar' });
        res.json({ ok: true });
      });
  });
});

// API para obter Foguinhos do usuário
app.get('/meus-foguinhos', checkAuth, (req, res) => {
  db.all(`SELECT * FROM foguinhos WHERE dono_id = ? OR dono_secundario = ?`, 
    [req.session.user.id, req.session.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar' });
    res.json(rows);
  });
});

// Rota para o mundo 3D
app.get('/mundo', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Start do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
