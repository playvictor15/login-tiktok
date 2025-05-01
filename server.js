require('dotenv').config();
const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Sessão
app.use(session({
  secret: process.env.JWT_SECRET || 'FoguinhosSecretos2025',
  resave: false,
  saveUninitialized: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve arquivos da raiz

// Banco de dados
const db = new sqlite3.Database('./foquinhos.db');
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS foguinhos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      dias INTEGER,
      skin TEXT,
      dono_principal TEXT,
      dono_secundario TEXT
    )
  `);
});

// Rota principal: envia para o mundo ou dashboard
app.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/dashboard.html');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota explícita para dashboard
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Login TikTok
app.get('/auth/login', (req, res) => {
  const redirect_uri = encodeURIComponent(process.env.REDIRECT_URI);
  res.redirect(`https://www.tiktok.com/v2/auth/authorize/?client_key=${process.env.TIKTOK_CLIENT_KEY}&response_type=code&scope=user.info.basic&redirect_uri=${redirect_uri}&state=login`);
});

// Callback do TikTok
app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  const redirect_uri = process.env.REDIRECT_URI;

  try {
    const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri
    });

    const access_token = response.data.access_token;

    const userData = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    req.session.user = {
      name: userData.data.data.user.username,
      avatar: userData.data.data.user.avatar_url
    };

    res.redirect('/dashboard.html');
  } catch (err) {
    console.error('Erro no login:', err.message);
    res.send('Erro ao autenticar com o TikTok');
  }
});

// API: obter usuário logado
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: 'Não logado' });
  }
});

// API: logout
app.delete('/api/user', (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ message: 'Logout feito' });
  });
});

// API: adicionar Foguinho
app.post('/api/foguinhos', (req, res) => {
  const { nome, dias, skin, dono_secundario } = req.body;
  const dono_principal = req.session.user?.name || 'desconhecido';

  db.get(`SELECT * FROM foguinhos WHERE nome = ? AND dono_principal = ?`, [nome, dono_principal], (err, row) => {
    if (row) {
      return res.status(400).json({ message: 'Foguinho já registrado por este usuário.' });
    }

    db.run(`
      INSERT INTO foguinhos (nome, dias, skin, dono_principal, dono_secundario)
      VALUES (?, ?, ?, ?, ?)
    `, [nome, dias, skin, dono_principal, dono_secundario], function (err) {
      if (err) return res.status(500).json({ message: 'Erro ao adicionar Foguinho.' });
      res.json({ id: this.lastID, nome, dias, skin });
    });
  });
});

// API: listar todos
app.get('/api/foguinhos', (req, res) => {
  db.all('SELECT * FROM foguinhos', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar foguinhos.' });
    res.json(rows);
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
