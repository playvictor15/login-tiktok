require('dotenv').config();
const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
  secret: process.env.JWT_SECRET || 'segredo-do-foguinho',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Página inicial: redireciona para login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Inicia o login com TikTok
app.get('/auth/login', (req, res) => {
  const redirect_uri = encodeURIComponent(process.env.REDIRECT_URI);
  res.redirect(`https://www.tiktok.com/v2/auth/authorize/?client_key=${process.env.TIKTOK_CLIENT_KEY}&response_type=code&scope=user.info.basic&redirect_uri=${redirect_uri}&state=login`);
});

// Callback do TikTok
app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  const redirect_uri = process.env.REDIRECT_URI;

  try {
    const tokenRes = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri
    });

    const access_token = tokenRes.data.access_token;

    const userData = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    req.session.user = {
      nome: userData.data.data.user.username,
      avatar: userData.data.data.user.avatar_url
    };

    res.redirect('/index.html'); // Vai para o mundo dos Foquinhos
  } catch (err) {
    console.error('Erro no login:', err.response?.data || err.message);
    res.send('Erro ao autenticar com o TikTok.');
  }
});

// API para pegar usuário logado
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: 'Não logado' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
