require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const session = require('express-session');

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: 'foguinho_secret_key',
    resave: false,
    saveUninitialized: true
  })
);

// Banco de dados
const db = new sqlite3.Database('foguinho.db');

// Cria tabela se não existir
db.run(`
  CREATE TABLE IF NOT EXISTS foguinho (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    photo TEXT,
    foguinho_nome TEXT,
    foguinho_dias INTEGER,
    skin TEXT,
    dono_secundario TEXT
  )
`);

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota dashboard
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Salvar dados do usuário após login
app.post('/save-user', (req, res) => {
  const { username, photo } = req.body;
  req.session.user = { username, photo };
  res.json({ success: true });
});

// Adicionar Foguinho
app.post('/adicionar-foguinho', (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false });

  const { foguinho_nome, foguinho_dias, skin, dono_secundario } = req.body;
  const { username, photo } = req.session.user;

  db.get(
    'SELECT * FROM foguinho WHERE username = ? AND foguinho_nome = ?',
    [username, foguinho_nome],
    (err, row) => {
      if (err) return res.status(500).json({ success: false });

      if (row) {
        return res.json({ success: false, message: 'Foguinho já existe!' });
      }

      db.run(
        'INSERT INTO foguinho (username, photo, foguinho_nome, foguinho_dias, skin, dono_secundario) VALUES (?, ?, ?, ?, ?, ?)',
        [username, photo, foguinho_nome, foguinho_dias, skin, dono_secundario],
        err => {
          if (err) return res.status(500).json({ success: false });

          res.json({ success: true });
        }
      );
    }
  );
});

// Verificar se o usuário tem Foguinho
app.get('/tem-foguinho', (req, res) => {
  if (!req.session.user) return res.json({ temFoguinho: false });

  const { username } = req.session.user;
  db.get('SELECT * FROM foguinho WHERE username = ?', [username], (err, row) => {
    if (err || !row) {
      return res.json({ temFoguinho: false });
    }

    res.json({ temFoguinho: true });
  });
});

// Rota mundo 3D
app.get('/mundo.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const { username } = req.session.user;

  db.get('SELECT * FROM foguinho WHERE username = ?', [username], (err, row) => {
    if (err || !row) {
      return res.redirect('/dashboard');
    }

    res.sendFile(path.join(__dirname, 'mundo.html'));
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
