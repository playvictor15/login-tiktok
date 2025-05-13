import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, loader;
const foguinhoModels = {};
const foguinhoSounds = {};

init();

async function init() {
  // Cena
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xaeeeee);

  // Câmera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 5);

  // Renderizador
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Luzes
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(5, 10, 7);
  scene.add(sun);

  // Loader
  loader = new GLTFLoader();

  // Carregar modelos
  await loadModels();

  // Buscar Foguinhos
  fetch('/meus-foguinhos')
    .then(res => res.json())
    .then(data => {
      let x = 0;
      data.forEach(f => {
        addFoguinho(f, x);
        x += 2;
      });
    });

  animate();
}

async function loadModels() {
  const modelFiles = {
    1: 'assets/foguinho-amarelo.glb',
    2: 'assets/foguinho-vermelho.glb',
    3: 'assets/foguinho-roxo.glb'
  };

  const soundFiles = {
    1: 'assets/som-amarelo.mp3',
    2: 'assets/som-vermelho.mp3',
    3: 'assets/som-roxo.mp3'
  };

  for (let skin in modelFiles) {
    foguinhoModels[skin] = await new Promise((resolve) => {
      loader.load(modelFiles[skin], gltf => {
        resolve(gltf.scene);
      });
    });

    foguinhoSounds[skin] = new Audio(soundFiles[skin]);
  }
}

function addFoguinho(f, x) {
  const model = foguinhoModels[f.skin].clone();
  model.position.set(x, 0, 0);
  scene.add(model);

  // Nome e dias
  const nameDiv = document.createElement('div');
  nameDiv.className = 'label';
  nameDiv.textContent = `${f.nome} (${f.dias} dias)`;
  nameDiv.style.position = 'absolute';
  nameDiv.style.top = '10px';
  nameDiv.style.left = `${x * 60 + 300}px`;
  nameDiv.style.fontWeight = 'bold';
  document.body.appendChild(nameDiv);

  // Som ao clicar
  model.userData.skin = f.skin;
  model.userData.sound = foguinhoSounds[f.skin];
  model.userData.name = f.nome;

  model.traverse(child => {
    if (child.isMesh) {
      child.userData = model.userData;
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
