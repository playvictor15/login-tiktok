import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';
import { GLTFLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaeeeee);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Sons por skin (sem assets/)
const soundPaths = {
  "1": 'amarelo.mp3',
  "2": 'vermelho.mp3',
  "3": 'roxo.mp3'
};

// Modelos por skin (sem assets/)
const modelPaths = {
  "1": 'foguinho-amarelo.glb',
  "2": 'foguinho-vermelho.glb',
  "3": 'foguinho-roxo.glb'
};

// Verifica se a lista de foguinhos está disponível no window
const foguinhos = window.foguinhos || [];

async function carregarFoguinhos() {
  const loader = new GLTFLoader();
  const audioLoader = new THREE.AudioLoader();
  const listener = new THREE.AudioListener();
  camera.add(listener);

  let posX = -5;

  for (const f of foguinhos) {
    const skin = f.skin || "1";
    const modelPath = modelPaths[skin];
    const soundPath = soundPaths[skin];

    loader.load(modelPath, function (gltf) {
      const model = gltf.scene;
      model.position.set(posX, 0, 0);
      model.scale.set(1.5, 1.5, 1.5);
      scene.add(model);

      criarTexto3D(f.nome, posX, 2.2, 0);
      criarTexto3D(`${f.dias} dias`, posX, 2.8, 0);

      const sound = new THREE.Audio(listener);
      audioLoader.load(soundPath, function (buffer) {
        sound.setBuffer(buffer);
        sound.setVolume(1.0);
      });

      window.addEventListener('click', (event) => {
        const mouse = new THREE.Vector2(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(model, true);

        if (intersects.length > 0) {
          sound.play();
        }
      });
    });

    posX += 4;
  }
}

function criarTexto3D(texto, x, y, z) {
  const div = document.createElement('div');
  div.className = 'label';
  div.textContent = texto;
  div.style.position = 'absolute';
  div.style.color = '#000';
  div.style.fontSize = '18px';
  div.style.fontWeight = 'bold';
  div.style.pointerEvents = 'none';
  div.style.transform = `translate(-50%, -50%)`;

  document.body.appendChild(div);

  const update = () => {
    const vector = new THREE.Vector3(x, y, z).project(camera);
    const sx = (vector.x + 1) / 2 * window.innerWidth;
    const sy = (-vector.y + 1) / 2 * window.innerHeight;
    div.style.left = `${sx}px`;
    div.style.top = `${sy}px`;
  };

  const animate = () => {
    update();
    requestAnimationFrame(animate);
  };

  animate();
}

carregarFoguinhos();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
