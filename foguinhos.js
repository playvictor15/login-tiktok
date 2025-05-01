iimport * as THREE from 'https://cdn.skypack.dev/three@0.152.2';

export function criarFoguinho(tipo = 'ativo') {
  const geometria = new THREE.SphereGeometry(0.5, 32, 32);
  let cor;

  switch (tipo) {
    case 'congelado':
      cor = 0x88ccff;
      break;
    case 'apagado':
      cor = 0x444444;
      break;
    default:
      cor = 0xffffff;
      break;
  }

  const material = new THREE.MeshStandardMaterial({ color: cor });
  return new THREE.Mesh(geometria, material);
}

