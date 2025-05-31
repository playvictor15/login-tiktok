import * as THREE from './três.módulo.js';
import { OrbitControls } from './OrbitControls.js';
import { GLTFLoader } from './GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Luz
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);

// Chão simples
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Controles de câmera
const controls = new OrbitControls(camera, renderer.domElement);

// Mixers de animação
const mixers = [];

// Sons por skin
const audioLoader = new THREE.AudioLoader();
const listener = new THREE.AudioListener();
camera.add(listener);

function carregarSom(path, onLoad) {
  const som = new THREE.Audio(listener);
  audioLoader.load(path, function (buffer) {
    som.setBuffer(buffer);
    som.setLoop(true);
    som.setVolume(0.5);
    onLoad(som);
  });
}

// Carregar um Foguinho
function carregarFoguinho(skin, posX = 0) {
  const loader = new GLTFLoader();
  const mapa = {
    '1': { model: 'foguinho-amarelo.glb', sound: 'amarelo.mp3' },
    '2': { model: 'foguinho-vermelho.glb', sound: 'vermelho.mp3' },
    '3': { model: 'foguinho-roxo.glb', sound: 'roxo.mp3' },
  };

  const dados = mapa[skin];
  if (!dados) return;

  loader.load(dados.model, function (gltf) {
    const model = gltf.scene;
    model.position.set(posX, 0, 0);
    scene.add(model);

    const mixer = new THREE.AnimationMixer(model);
    if (gltf.animations.length > 0) {
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
    }
    mixers.push(mixer);

    carregarSom(dados.sound, (som) => {
      model.add(som);
      som.play();
    });
  });
}

// Buscar Foguinhos do servidor
fetch('/api/foguinhos')
  .then(res => res.json())
  .then(data => {
    let offset = -2;
    data.forEach(f => {
      carregarFoguinho(f.skin, offset);
      offset += 2.5;
    });
  })
  .catch(err => console.error('Erro ao carregar Foguinhos:', err));

// Resize responsivo
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  mixers.forEach(m => m.update(delta));
  controls.update();
  renderer.render(scene, camera);
}
animate();
