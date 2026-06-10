import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. シーン・カメラ・レンダラーの設定
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(5, 8, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// 2. 視点回転（OrbitControls）の設定
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 3. 照明（ライト）
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// 4. 盤面の生成
let boardGroup = new THREE.Group();
let piecesGroup = new THREE.Group();
scene.add(boardGroup);
scene.add(piecesGroup);

function clearGroup(group) {
  while(group.children.length > 0) {
    const obj = group.children[0];
    obj.geometry.dispose();
    obj.material.dispose();
    group.remove(obj);
  }
}

function createBoard(sizeM, sizeN) {
  clearGroup(boardGroup);
  clearGroup(piecesGroup);

  const geometry = new THREE.BoxGeometry(0.9, 0.2, 0.9);
  const material = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });

  for (let x = 0; x < sizeM; x++) {
    for (let z = 0; z < sizeN; z++) {
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(x - (sizeM - 1) / 2, 0, z - (sizeN - 1) / 2);
      boardGroup.add(cube);
    }
  }

  controls.target.set(0, 0, 0);
}

createBoard(5, 5); // 初期盤面サイズは5x5

const sizeMSlect = document.getElementById('board-m-select');
const sizeNSlect = document.getElementById('board-n-select');

function handleSizeChange() {
  const m = parseInt(sizeMSlect.value, 10);
  const n = parseInt(sizeNSlect.value, 10);
  createBoard(m, n);
}

sizeMSlect.addEventListener('change', handleSizeChange);
sizeNSlect.addEventListener('change', handleSizeChange);


const cuiInput = document.getElementById('cui-input');
const applyBtn = document.getElementById('apply-btn');

applyBtn.addEventListener('click', () => {
  clearGroup(piecesGroup);

  const sizeM = parseInt(sizeMSlect.value, 10);
  const sizeN = parseInt(sizeNSlect.value, 10);

  const lines = cuiInput.value.split(/[\n\s]+/);

  const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);

  lines.forEach(line => {
    if(!line.trim()) return;

    const parts = line.split(',');
    if(parts.length !== 4) return;

    const k = parseInt(parts[0], 10);
    const x = parseInt(parts[1], 10);
    const z = parseInt(parts[2], 10);
    const c = parts[3].trim().toUpperCase();

    if(x >= sizeM || z >= sizeN || x < 0 || z < 0 ||  k > Math.min(sizeM, sizeN)) {
      console.warn(`Invalid input: ${line}`);
      return;
    }

    let colorHex = 0xffffff;
    if(c === 'R') colorHex = 0xff3333;
    else if(c === 'B') colorHex = 0x3333ff;

    const pieceMaterial = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.2, metalness: 0.1 });

    const posX = x - (sizeM - 1) / 2 + 0.5*(k-1);
    const posZ = -z + (sizeN - 1) / 2 - 0.5*(k-1);

    const posY = 0.5 + (k-1)*0.7071

    const pieceMesh = new THREE.Mesh(sphereGeometry, pieceMaterial);
    pieceMesh.position.set(posX, posY, posZ);
    piecesGroup.add(pieceMesh);
  })
});



// アニメーションループ
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// 画面サイズ変更のレスポンシブ対応
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});