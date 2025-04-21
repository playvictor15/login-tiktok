const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = 3000;

// Mock de "login"
app.get("/auth/tiktok", (req, res) => {
  // Redireciona para a "callback" já simulando o login
  res.redirect("/auth/tiktok/callback?code=MOCK_CODE");
});

// Mock da "callback"
app.get("/auth/tiktok/callback", (req, res) => {
  // Simula obtenção de token e dados do usuário
  res.redirect("/foquinhos.html");
});

// API mockada de dados dos Foquinhos
app.get("/api/foquinhos", (req, res) => {
  res.json({
    usuario: "victor_tiktok",
    foquinhos: [
      {
        nome: "Foquinho Roxo",
        dias: 23,
        skin: "Roxo com óculos escuros",
        status: "ativo",
      },
      {
        nome: "Foquinho Azul",
        dias: 5,
        skin: "Azul Neon",
        status: "apagado",
      },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
