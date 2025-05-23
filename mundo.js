import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js';

let camera, scene, renderer, clock, mixers = [];
let foguinhoObjs = [], teclas = {};
const loader = new GLTFLoader();

init();
animate();

function init() {
  // Cena e câmera
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 5, 10);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Luz
  const light = new THREE.AmbientLight(0xffffff, 1);
  scene.add(light);

  // Controles
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.update();

  // Rua/plano
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Relógio
  clock = new THREE.Clock();

  // Teclado
  window.addEventListener('keydown', e => teclas[e.key.toLowerCase()] = true);
  window.addEventListener('keyup', e => teclas[e.key.toLowerCase()] = false);

  // Carrega os Foguinhos
  fetch('/foguinhos')
    .then(res => res.json())
    .then(foguinhos => {
      foguinhos.forEach((foguinho, index) => {
        const posX = index * 3;
        carregarFoguinho(foguinho, posX, 0);
      });
    })
    .catch(err => {
      alert("Erro ao carregar seus Foguinhos. Faça login e crie um Foguinho primeiro.");
      console.error(err);
    });

  // Responsivo
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function carregarFoguinho(foguinho, x, z) {
  const skin = foguinho.skin;
  const modelo = skin == 1 ? 'foguinho_amarelo.glb' : skin == 2 ? 'foguinho_vermelho.glb' : 'foguinho_roxo.glb';
  const som = new Audio(skin == 1 ? 'amarelo.mp3' : skin == 2 ? 'vermelho.mp3' : 'roxo.mp3');
  loader.load(modelo, gltf => {
    const obj = gltf.scene;
    obj.position.set(x, 0, z);
    obj.scale.set(2, 2, 2);
    scene.add(obj);

    // Animação
    const mixer = new THREE.AnimationMixer(obj);
    gltf.animations.forEach(clip => mixer.clipAction(clip).play());
    mixers.push(mixer);

    foguinhoObjs.push({ obj, som, nome: foguinho.nome });
  });
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // Atualiza mixers
  mixers.forEach(mixer => mixer.update(delta));

  // Movimento do primeiro Foguinho
  const f = foguinhoObjs[0];
  if (f) {
    if (teclas['w']) f.obj.position.z -= 0.1;
    if (teclas['s']) f.obj.position.z += 0.1;
    if (teclas['a']) f.obj.position.x -= 0.1;
    if (teclas['d']) f.obj.position.x += 0.1;
  }

  renderer.render(scene, camera);
}
