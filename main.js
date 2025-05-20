function criarFoguinhoVisual(foguinho, container) {
  const div = document.createElement("div");
  div.className = "foguinho";

  const img = document.createElement("img");
  img.src = `foguinho${foguinho.skin}.png`;
  img.alt = "Foguinho";
  img.className = "foguinho-img";

  const nome = document.createElement("div");
  nome.className = "foguinho-nome";
  nome.innerText = foguinho.nome;

  const dias = document.createElement("div");
  dias.className = "foguinho-dias";
  dias.innerText = `${foguinho.dias} dias`;

  div.appendChild(img);
  div.appendChild(dias);
  div.appendChild(nome);

  container.appendChild(div);
}

function tocarSomDaSkin(skin) {
  const audio = new Audio(
    skin === "1"
      ? "amarelo.mp3"
      : skin === "2"
      ? "vermelho.mp3"
      : "roxo.mp3"
  );
  audio.play().catch(() => {
    console.warn("Áudio não pôde ser reproduzido automaticamente.");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("foguinhoContainer");

  // Busca os Foguinhos salvos no servidor
  fetch("/foguinhos")
    .then(response => {
      if (!response.ok) throw new Error("Não autorizado ou erro ao buscar");
      return response.json();
    })
    .then(data => {
      foguinhos = data;
      if (container && Array.isArray(foguinhos)) {
        container.innerHTML = "";
        foguinhos.forEach(f => criarFoguinhoVisual(f, container));
      }
    })
    .catch(err => {
      console.error("Erro ao carregar Foguinhos:", err);
      if (container) {
        container.innerHTML = "<p>Não foi possível carregar os Foguinhos.</p>";
      }
    });

  // Reproduz som ao trocar skin na criação
  const skinSelect = document.querySelector("select[name='skin']");
  if (skinSelect) {
    skinSelect.addEventListener("change", () => {
      tocarSomDaSkin(skinSelect.value);
    });
  }
});
