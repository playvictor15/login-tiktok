const express = require('express');
const axios = require('axios');
const session = require('express-session');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

dotenv.config();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'foquinhoSecret',
  resave: false,
  saveUninitialized: true,
}));

const db = new sqlite3.Database('./foquinhos.db');

// Cria tabela se não existir
db.run(`
  CREATE TABLE IF NOT EXISTS foquinhos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    nome TEXT,
    dias INTEGER,
    skin TEXT,
    dono_secundario TEXT UNIQUE
  )
`);

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/auth/callback';

app.get('/login', (req, res) => {
  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${CLIENT_KEY}&response_type=code&scope=user.info.basic&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const tokenRes = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    });

    const access_token = tokenRes.data.data.access_token;

    const userRes = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const user = userRes.data.data.user;
    req.session.user = {
      id: user.user_id,
      name: user.display_name,
      avatar: user.avatar_url,
    };

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err.response?.data || err);
    res.send('Erro no login com TikTok');
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { name, avatar } = req.session.user;
  res.send(`
    <h2>Bem-vindo, ${name}</h2>
    <img src="${avatar}" width="100" />
    <form action="/add-foquinho" method="post">
      <p>Nome do Foquinho: <input name="nome" required /></p>
      <p>Dias juntos: <input name="dias" type="number" required /></p>
      <p>Skin atual: <input name="skin" required /></p>
      <p>ID do outro dono (TikTok): <input name="dono_secundario" required /></p>
      <button type="submit">Adicionar Foquinho</button>
    </form>
  `);
});

app.post('/add-foquinho', (req, res) => {
  const { nome, dias, skin, dono_secundario } = req.body;
  const user_id = req.session.user?.id;
  if (!user_id) return res.redirect('/login');

  // Evita duplicação com base no dono secundário
  db.get(`SELECT * FROM foquinhos WHERE dono_secundario = ?`, [dono_secundario], (err, row) => {
    if (row) {
      return res.send(`<p>Este Foquinho já foi registrado com esse segundo dono.</p><a href="/dashboard">Voltar</a>`);
    }

    db.run(`INSERT INTO foquinhos (user_id, nome, dias, skin, dono_secundario) VALUES (?, ?, ?, ?, ?)`,
      [user_id, nome, dias, skin, dono_secundario], function (err) {
        if (err) {
          console.error(err);
          return res.send("Erro ao salvar Foquinho.");
        }
        res.redirect('/meus-foquinhos');
      });
  });
});

app.get('/meus-foquinhos', (req, res) => {
  const user_id = req.session.user?.id;
  if (!user_id) return res.redirect('/login');

  db.all(`SELECT * FROM foquinhos WHERE user_id = ?`, [user_id], (err, rows) => {
    if (err) return res.send('Erro ao carregar Foquinhos.');
    let html = '<h2>Seus Foquinhos:</h2><ul>';
    rows.forEach(row => {
      html += `<li><strong>${row.nome}</strong> - ${row.dias} dias - Skin: ${row.skin}</li>`;
    });
    html += '</ul><a href="/dashboard">Voltar</a>';
    res.send(html);
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
