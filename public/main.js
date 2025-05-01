import * as THREE from 'https://cdn.skypack.dev/three@0.152.2';
import { obterFoguinhosDoUsuario } from './login.js';
import { criarMundo3D } from './mundo.js';
import { criarFoguinho } from './foguinhos.js';

let principal = null;
let destino = null;

async function init() {
  const usuario = await fetch('/api/user').then(res => res.json()).catch(() => null);
  if (!usuario?.nome) {
    window.location.href = '/login.html';
    return;
  }

  const foguinhosData = [
    { nome: 'Foguinho Azul', tipo: 'ativo' },
    { nome: 'Foguinho Gelo', tipo: 'congelado' },
    { nome: 'Foguinho Fantasma', tipo: 'apagado' }
  ];

  const { scene, rendererInstance, cameraInstance } = criarMundo3D();

  const todosFoguinhos = [];
  let posX = 0;

  foguinhosData.forEach((f) => {
    const foguinho = criarFoguinho(f.tipo);
    foguinho.position.set(posX, 0.5, 0);
    if (f.tipo === 'ativo' && !principal) {
      principal = foguinho;
    }
    todosFoguinhos.push(foguinho);
    scene.add(foguinho);
    posX += 1.5;
  });

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

window.onload = init;
