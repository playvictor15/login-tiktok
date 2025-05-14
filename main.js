let foguinhos = [];

function criarFoguinhoVisual(foguinho, container) {
  const div = document.createElement("div");
  div.className = "foguinho";

  const img = document.createElement("img");
  img.src = `assets/skins/foguinho${foguinho.skin}.png`;
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
  const audio = new Audio(`assets/sounds/${skin === "1" ? "amarelo" : skin === "2" ? "vermelho" : "roxo"}.mp3`);
  audio.play();
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("foguinhoContainer");
  if (container && Array.isArray(foguinhos)) {
    container.innerHTML = "";
    foguinhos.forEach(f => criarFoguinhoVisual(f, container));
  }

  const skinSelect = document.querySelector("select[name='skin']");
  if (skinSelect) {
    skinSelect.addEventListener("change", () => {
      tocarSomDaSkin(skinSelect.value);
    });
  }
});
