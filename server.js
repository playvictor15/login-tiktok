const express = require('express');
const axios = require('axios');
const session = require('express-session');
const app = express();
require('dotenv').config();

app.use(session({
  secret: 'foquinhoSecret',
  resave: false,
  saveUninitialized: true,
}));

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

    const { access_token } = tokenRes.data.data;

    const userRes = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    req.session.user = {
      id: userRes.data.data.user.user_id,
      name: userRes.data.data.user.display_name,
      avatar: userRes.data.data.user.avatar_url,
    };

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err.response?.data || err);
    res.send('Erro no login');
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.send(`
    <h1>Bem-vindo, ${req.session.user.name}</h1>
    <img src="${req.session.user.avatar}" width="100" />
    <p><a href="/add-foquinho">Adicionar Foquinho</a></p>
  `);
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
