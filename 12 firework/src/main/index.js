import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertexShader from "../shader/flylight/vertex.glsl";
import fragmentShader from "../shader/flylight/fragment.glsl";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Fireworks from "./firework";
import gsap from "gsap";
import { Water } from "three/examples/jsm/objects/Water2";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// 设置相机位置
camera.position.set(0, 0, 20);
// 更新摄像头
camera.aspect = window.innerWidth / window.innerHeight;
//   更新摄像机的投影矩阵
camera.updateProjectionMatrix();
scene.add(camera);

// 创建环境纹理
const rgbeLoader = new RGBELoader();
rgbeLoader.loadAsync("./assets/2k.hdr").then((texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});
const gltfLoader = new GLTFLoader();

let lightBox = null;
gltfLoader.load("./assets/model/newyears_min.glb", (gltf) => {
  console.log(gltf);
  scene.add(gltf.scene);

  // 创建水面
  const waterGeometry = new THREE.PlaneGeometry(100, 100);
  const water = new Water(waterGeometry, {
    scale: 4,
    textureHeight: 1024,
    textureWidth: 1024,
  });
  water.position.y = 1;
  water.rotation.x = -Math.PI / 2;
  scene.add(water);
});
gltfLoader.load("./assets/model/flyLight.glb", (gltf) => {
  lightBox = gltf.scene.children[0];
  lightBox.material = shaderMaterial;

  for (let i = 0; i < 100; i++) {
    let flyLight = gltf.scene.clone(true);
    let x = (Math.random() - 0.5) * 300;
    let z = (Math.random() - 0.5) * 300;
    let y = Math.random() * 40 + 15;
    flyLight.position.set(x, y, z);
    gsap.to(flyLight.rotation, {
      y: 2 * Math.PI,
      duration: 10 + Math.random() * 30,
      repeat: -1,
    });
    gsap.to(flyLight.position, {
      x: "+=" + Math.random() * 5,
      y: "+=" + Math.random() * 20,
      yoyo: true,
      duration: 5 + Math.random() * 10,
      repeat: -1,
    });
    scene.add(flyLight);
  }
});
const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  side: THREE.DoubleSide,
  // transparent: true,
});

// 创建渲染函数
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.2;
document.body.appendChild(renderer.domElement);

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置控制器的阻尼，让控制器更真实
controls.enableDamping = true;
// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 监听画面变化，更新渲染画面
window.addEventListener("resize", () => {
  // 更新相机的 比例
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新摄像机投影矩阵
  camera.updateProjectionMatrix();
  // 更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 设置渲染器的像素比
  renderer.setPixelRatio(window.devicePixelRatio);
});

// window.addEventListener("dblclick", () => {
//   const fullScreenElement = document.fullscreenElement;
//   if (!fullScreenElement) {
//     // 双击控制屏幕进入全屏，退出全屏
//     renderer.domElement.requestFullscreen();
//   } else {
//     document.exitFullscreen();
//   }
// });
// 管理烟花
let fireworks = [];
// 设置创建烟花函数
let createFileworks = () => {
  let color = `hsl(${Math.floor(Math.random() * 360)},100%,80%)`;
  let position = {
    x: (Math.random() - 0.5) * 40,
    z: -(Math.random() - 0.5) * 40,
    y: 3 + Math.random() * 15,
  };
  //  随机生成
  let firework = new Fireworks(color, position);
  firework.addScene(scene, camera);
  fireworks.push(firework);
};

window.addEventListener("click", createFileworks);

// 设置时钟
const clock = new THREE.Clock();
function render() {
  let time = clock.getElapsedTime();
  controls.update();
  fireworks.forEach((firework, i) => {
    const type = firework.update();
    if (type === "remove") {
      fireworks.splice(i, 1);
    }
  });
  renderer.render(scene, camera);
  window.requestAnimationFrame(render);
}

render();
