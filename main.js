import * as THREE from './three.module.js';
import { GLTFLoader } from './GLTFLoader.js';

let scene, camera, renderer;
const mixers = [];
const foguinhos = [];
const clock = new THREE.Clock();

init();
animate();

async function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0d8f0);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 3);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  light.position.set(0, 200, 0);
  scene.add(light);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0x66bb66 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Carregar todos os foguinhos do backend (simulação mockada)
  const foguinhosData = await fetch('/api/foguinhos').then(res => res.json());
  for (const f of foguinhosData) {
    await addFoguinho(f);
  }

  window.addEventListener('resize', onWindowResize, false);
}

async function addFoguinho(data) {
  const loader = new GLTFLoader();
  const modelPath = data.skin === '1' ? 'amarelo.glb' :
                    data.skin === '2' ? 'vermelho.glb' :
                    'roxo.glb';

  const gltf = await loader.loadAsync(modelPath);
  const model = gltf.scene;
  model.position.set(Math.random() * 5 - 2.5, 0, Math.random() * 5 - 2.5);
  model.scale.set(1.5, 1.5, 1.5);
  scene.add(model);

  const mixer = new THREE.AnimationMixer(model);
  if (gltf.animations.length > 0) {
    mixer.clipAction(gltf.animations[0]).play(); // idle ou dance
  }
  mixers.push(mixer);

  // Som
  const listener = new THREE.AudioListener();
  camera.add(listener);

  const sound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();
  const soundPath = data.skin === '1' ? 'som1.mp3' :
                    data.skin === '2' ? 'som2.mp3' :
                    'som3.mp3';

  audioLoader.load(soundPath, buffer => {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.5);
  });

  foguinhos.push({ model, mixer, sound });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  mixers.forEach(m => m.update(delta));
  renderer.render(scene, camera);
}

// Controle simples do teclado para o primeiro Foguinho
document.addEventListener('keydown', (event) => {
  if (foguinhos.length === 0) return;
  const foguinho = foguinhos[0].model;
  const sound = foguinhos[0].sound;

  switch (event.key.toLowerCase()) {
    case 'w': foguinho.position.z -= 0.1; break;
    case 's': foguinho.position.z += 0.1; break;
    case 'a': foguinho.position.x -= 0.1; break;
    case 'd': foguinho.position.x += 0.1; break;
    case ' ':  // espaço = som
      if (sound && !sound.isPlaying) sound.play();
      break;
  }
});
