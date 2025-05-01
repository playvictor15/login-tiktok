// mundo.js
import * as THREE from 'https://cdn.skypack.dev/three@0.152.2';

export function criarMundo3D() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa8def0);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);

  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas') });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Luz
  const luz = new THREE.DirectionalLight(0xffffff, 1);
  luz.position.set(5, 10, 7.5);
  scene.add(luz);

  // Solo
  const planoGeo = new THREE.PlaneGeometry(100, 100);
  const planoMat = new THREE.MeshStandardMaterial({ color: 0x66bb66 });
  const solo = new THREE.Mesh(planoGeo, planoMat);
  solo.rotation.x = -Math.PI / 2;
  solo.name = 'chao';
  scene.add(solo);

  // Áreas: sala fria e cemitério
  const salaFria = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.1, 10),
    new THREE.MeshStandardMaterial({ color: 0xadd8e6 })
  );
  salaFria.position.set(-15, 0.05, 0);
  scene.add(salaFria);

  const cemiterio = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.1, 10),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  cemiterio.position.set(15, 0.05, 0);
  scene.add(cemiterio);

  return { scene, rendererInstance: renderer, cameraInstance: camera };
}
