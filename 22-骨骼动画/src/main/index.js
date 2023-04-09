import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import * as Dat from "dat.gui";

const gui = new Dat.GUI();
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
const textureLoader = new THREE.TextureLoader();

// 添加hdr环境纹理
const loader = new RGBELoader();
loader.load("./textures/038.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

// 加载 立方体纹理
const envMapTexture = new THREE.CubeTextureLoader()
  .setPath("./textures/environmentMaps/0/")
  .load(["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]);
scene.background = envMapTexture;
scene.environment = envMapTexture;

// 创建渲染函数
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.physicallyCorrectLights = true;
renderer.setClearColor(0xcccccc, 1);
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

// 模型加载
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./draco/");
gltfLoader.setDRACOLoader(dracoLoader);
let mixer;
gltfLoader.load("./model/jianshen-min.glb", (gltf) => {
  gltf.scene.traverse(function (child) {
    if (child.name == "Body") {
      console.log(child);
    }
    if (child.name == "Floor") {
      child.material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
      });
      console.log(child);
    }
    if (child.isMesh) {
      child.material.depthWrite = true;
      child.material.normalScale = new THREE.Vector2(1, 1);
      child.material.side = THREE.FrontSide;
      child.material.transparent = false;
      child.material.vertexColors = false;
    }
  });
  scene.add(gltf.scene);
  mixer = new THREE.AnimationMixer(gltf.scene);
  const action = mixer.clipAction(gltf.animations[0]);
  action.play();
  action.timeScale = 3;
  // 添加平行光;
  const light = new THREE.DirectionalLight(0xffffff, 10);
  light.position.set(0, 100, 100);
  scene.add(light);
  // 添加点光源
  const pointLight = new THREE.PointLight(0xffffff, 20);
  pointLight.position.set(-100, 100, 100);
  scene.add(pointLight);
});

// 设置时钟
const clock = new THREE.Clock();
function render() {
  let time = clock.getDelta();
  mixer?.update(time);

  renderer.render(scene, camera);
  window.requestAnimationFrame(render);
}

render();
