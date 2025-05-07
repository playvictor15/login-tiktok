require('dotenv').config();
const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('./foguinho.db');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'segredo',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(__dirname));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    avatar TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS foguinho (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    nome TEXT NOT NULL,
    dias INTEGER NOT NULL,
    skin TEXT NOT NULL,
    donoSecundario TEXT
  )`);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/login', (req, res) => {
  const { username, avatar } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) return res.status(500).send('Erro ao verificar usuário.');

    if (!row) {
      db.run('INSERT INTO users (username, avatar) VALUES (?, ?)', [username, avatar], function (err) {
        if (err) return res.status(500).send('Erro ao inserir usuário.');
      });
    }

    req.session.user = { username, avatar };

    db.get('SELECT * FROM foguinho WHERE username = ?', [username], (err, foguinho) => {
      if (err) return res.status(500).send('Erro ao verificar foguinho.');

      if (foguinho) {
        res.redirect('/dashboard');
      } else {
        res.redirect('/painel.html');
      }
    });
  });
});

app.get('/painel.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');

  const { username } = req.session.user;

  db.get('SELECT * FROM foguinho WHERE username = ?', [username], (err, row) => {
    if (err) return res.redirect('/dashboard');
    if (row) return res.redirect('/dashboard');
    
    res.sendFile(path.join(__dirname, 'painel.html'));
  });
});

// ✅ ROTA CORRIGIDA AQUI
app.post('/adicionar-foguinho', (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });

  const { username } = req.session.user;
  const { nome, dias, skin, donoSecundario } = req.body;

  db.get('SELECT * FROM foguinho WHERE username = ?', [username], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Erro ao verificar banco de dados.' });
    if (row) return res.json({ success: false, message: 'Foguinho já existe!' });

    db.run('INSERT INTO foguinho (username, nome, dias, skin, donoSecundario) VALUES (?, ?, ?, ?, ?)',
      [username, nome, dias, skin, donoSecundario],
      function (err) {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao salvar foguinho.' });
        res.json({ success: true });
      }
    );
  });
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');

  const { username } = req.session.user;

  db.get('SELECT * FROM foguinho WHERE username = ?', [username], (err, foguinho) => {
    if (err || !foguinho) return res.redirect('/painel.html');

    res.sendFile(path.join(__dirname, 'mundo.html'));
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
