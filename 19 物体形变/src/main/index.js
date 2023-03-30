import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// 设置相机位置
camera.position.set(0, 0, 10);
// 更新摄像头
camera.aspect = window.innerWidth / window.innerHeight;
//   更新摄像机的投影矩阵
camera.updateProjectionMatrix();
scene.add(camera);
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

gltfLoader.load("./model/sphere1.glb", (gltf1) => {
  scene.add(gltf1.scene);
  let sphere1 = gltf1.scene.children[0];
  gltfLoader.load("./model/sphere2.glb", (gltf2) => {
    sphere1.geometry.morphAttributes.position = [];
    sphere1.geometry.morphAttributes.position.push(
      gltf2.scene.children[0].geometry.attributes.position
    );
    sphere1.updateMorphTargets();
    sphere1.morpthTargetInfluences[0] = 1;
  });
});

new RGBELoader().load("./textures/038.hdr", function (texture, textureData) {
  texture.mapping = THREE.EquirectangularReflectionMapping;

  scene.environment = texture;
  scene.background = texture;
});

// 创建渲染函数
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置控制器的阻尼，让控制器更真实
controls.enableDamping = true;
// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
// 打上环境光
// const light = new THREE.AmbientLight("#ffffff"); // soft white light scene.add( light );
// scene.add(light);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight.castShadow = true;
// directionalLight.position.set(0, 0, 200);
// scene.add(directionalLight);

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

// 设置时钟
const clock = new THREE.Clock();
function render() {
  let time = clock.getElapsedTime();
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(render);
}

render();
