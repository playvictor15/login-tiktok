// foguinho.js

const foguinhos = [
  {
    nome: "FoguinhoAmarelo",
    dias: 12,
    skin: 1,
    donoSecundario: "Luna"
  },
  {
    nome: "FoguinhoVermelho",
    dias: 7,
    skin: 2,
    donoSecundario: "Mateus"
  },
  {
    nome: "FoguinhoRoxo",
    dias: 20,
    skin: 3,
    donoSecundario: "Sofia"
  }
];

// Função para carregar os foguinhos no mundo (exemplo para o main.js usar)
function carregarFoguinhosNaCena(scene, modeloAmarelo, modeloVermelho, modeloRoxo) {
  foguinhos.forEach((foguinho, index) => {
    let modelo;
    if (foguinho.skin === 1) modelo = modeloAmarelo.clone();
    else if (foguinho.skin === 2) modelo = modeloVermelho.clone();
    else if (foguinho.skin === 3) modelo = modeloRoxo.clone();

    if (modelo) {
      modelo.position.set(index * 3, 0, 0); // posiciona os foguinhos lado a lado
      scene.add(modelo);

      // Criar nome e dias acima do foguinho (com Sprite ou outro método visual)
      const div = document.createElement('div');
      div.className = 'label';
      div.innerHTML = `${foguinho.dias} dias<br>${foguinho.nome}`;
      const label = new CSS2DObject(div);
      label.position.set(0, 2, 0);
      modelo.add(label);
    }
  });
}
