require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('./foguinho.db');

// ✅ Middleware com CSP corrigido para liberar CDN do Three.js
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", 
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;"
  );
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.use(session({
  secret: 'segredo-foguinho',
  resave: false,
  saveUninitialized: true,
}));

// Criação de tabelas
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

// Rota de login falsa simulada
app.get('/auth/tiktok', (req, res) => {
  // Simula login com TikTok
  req.session.user = {
    id: 'usuario-demo',
    username: 'Visitante',
    avatar: 'https://i.imgur.com/3ZQ3ZL6.png'
  };
  res.redirect('/dashboard.html');
});

// Middleware de autenticação
function checkAuth(req, res, next) {
  if (!req.session.user) {
    if (req.path.includes('/adicionar-foguinho')) {
      return res.status(401).send(`
        <html>
          <head><title>Erro</title></head>
          <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h2>Erro 401 - Acesso negado</h2>
            <p>Você precisa estar logado para acessar essa página.</p>
            <a href="/auth/tiktok"><button>Ir para Login</button></a>
          </body>
        </html>
      `);
    }
    return res.redirect('/');
  }
  next();
}

// Página de adicionar Foguinho
app.get('/adicionar-foguinho', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'painel.html'));
});

// Cria um novo Foguinho
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
      [nome, dias, skin, dono_id, donoSecundario],
      (err) => {
        if (err) return res.status(500).send('Erro ao salvar Foguinho');
        res.redirect('/mundo.html'); // ✅ Redireciona direto para o mundo após criar
      }
    );
  });
});

// Rota para buscar todos os Foguinhos do usuário autenticado
app.get('/foguinhos', checkAuth, (req, res) => {
  const dono_id = req.session.user.id;
  db.all(`SELECT * FROM foguinhos WHERE dono_id = ?`, [dono_id], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar Foguinhos:', err);
      return res.status(500).json({ erro: 'Erro ao buscar Foguinhos' });
    }
    res.json(rows);
  });
});

// Inicializa servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
