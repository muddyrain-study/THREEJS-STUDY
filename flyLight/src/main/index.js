import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertexShader from "../shader/flylight/vertex.glsl";
import fragmentShader from "../shader/flylight/fragment.glsl";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  300
);
// 设置相机位置
camera.position.set(0, -5, 10);
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
gltfLoader.load("./assets/model/flyLight.glb", (gltf) => {
  console.log(gltf);
  scene.add(gltf.scene);
  lightBox = gltf.scene.children[0];
  lightBox.material = shaderMaterial;

  for (let i = 0; i < 150; i++) {
    let flyLight = gltf.scene.clone(true);
    let x = (Math.random() - 0.5) * 300;
    let z = (Math.random() - 0.5) * 300;
    let y = Math.random() * 60 + 25;
    flyLight.position.set(x, y, z);
    gsap.to(flyLight.rotation, {
      y: 2 * Math.PI,
      duration: 10 + Math.random() * 30,
      yoyo: true,
      repeat: -1,
    });
    gsap.to(flyLight.position, {
      x: "+=" + Math.random() * 5,
      y: "+=" + Math.random() * 20,
      duration: 5 + Math.random() * 15,
      yoyo: true,
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
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.maxPolarAngle = Math.PI;
controls.minPolarAngle = Math.PI / 4;
// 添加坐标轴辅助器
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);
// 设置时钟
const clock = new THREE.Clock();
function render() {
  let time = clock.getElapsedTime();
  renderer.render(scene, camera);
  controls.update();
  window.requestAnimationFrame(render);
}

render();

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

window.addEventListener("dblclick", () => {
  const fullScreenElement = document.fullscreenElement;
  if (!fullScreenElement) {
    // 双击控制屏幕进入全屏，退出全屏
    renderer.domElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});
