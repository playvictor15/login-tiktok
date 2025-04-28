import * as THREE from 'https://cdn.skypack.dev/three@0.152.2';
import { iniciarLoginTikTok, usuarioLogado, obterFoquinhosDoUsuario } from './login.js';
import { criarMundo3D } from './world.js';

let foquinhosData = [];
let principal = null;
let destino = null;

async function init() {
  if (!usuarioLogado()) {
    document.getElementById('login-btn').onclick = iniciarLoginTikTok;
    return;
  }

  foquinhosData = await obterFoquinhosDoUsuario();
  const { scene, rendererInstance, cameraInstance } = criarMundo3D();

  const todosFoquinhos = [];
  let posX = 0;

  foquinhosData.forEach((f) => {
    const { foquinho } = criarFoquinhoComControle(f);
    foquinho.position.set(posX, 0.5, 0);
    if (f.tipo === 'ativo' && !principal) {
      principal = foquinho;
    }
    todosFoquinhos.push(foquinho);
    scene.add(foquinho);
    posX += 1.5;
  });

  // Controle de clique/toque
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const canvas = rendererInstance.domElement;

  function onMove(event) {
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX || event.touches?.[0].clientX) - bounds.left;
    const y = (event.clientY || event.touches?.[0].clientY) - bounds.top;

    mouse.x = (x / canvas.clientWidth) * 2 - 1;
    mouse.y = -(y / canvas.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, cameraInstance);
    const chao = scene.children.find(obj => obj.name === 'chao');
    const intersects = raycaster.intersectObject(chao);

    if (intersects.length > 0) {
      destino = intersects[0].point.clone();
    }
  }

  canvas.addEventListener('click', onMove);
  canvas.addEventListener('touchstart', onMove);

  function animarTudo() {
    requestAnimationFrame(animarTudo);

    if (principal && destino) {
      const dir = destino.clone().sub(principal.position);
      if (dir.length() > 0.1) {
        dir.normalize();
        principal.position.add(dir.multiplyScalar(0.05));
      }
    }

    rendererInstance.render(scene, cameraInstance);
  }

  animarTudo();
}

function criarFoquinhoComControle(data) {
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  let cor;
  switch (data.tipo) {
    case 'congelado': cor = 0x88ccff; break;
    case 'apagado': cor = 0x444444; break;
    default: cor = 0xffffff; break;
  }
  const material = new THREE.MeshStandardMaterial({ color: cor });
  const foquinho = new THREE.Mesh(geometry, material);
  return { foquinho, foquinhoData: data };
}

window.onload = init;
