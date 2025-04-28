/require('dotenv').config();
const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
  secret: process.env.JWT_SECRET || 'secreto',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.get('/auth/login', (req, res) => {
  const redirect_uri = encodeURIComponent(process.env.REDIRECT_URI);
  res.redirect(`https://www.tiktok.com/v2/auth/authorize/?client_key=${process.env.TIKTOK_CLIENT_KEY}&response_type=code&scope=user.info.basic&redirect_uri=${redirect_uri}&state=login`);
});

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

    res.redirect('/index.html');
  } catch (err) {
    console.error('Erro no login:', err.message);
    res.send('Erro ao autenticar no TikTok.');
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
/ Servidor atualizado para login TikTok + redirecionar para Mundo
