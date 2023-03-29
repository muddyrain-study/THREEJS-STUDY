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
// 模型纹理
const modelTexture = textureLoader.load("./models/LeePerrySmith/color.jpg");
// 法相纹理
const normalTexture = textureLoader.load("./models/LeePerrySmith/normal.jpg");
const material = new THREE.MeshStandardMaterial({
  map: modelTexture,
  normalTexture: normalTexture,
});
const customUniform = {
  uTime: {
    value: 0,
  },
};
material.onBeforeCompile = (shader) => {
  console.log(shader.vertexShader);
  console.log(shader.fragmentShader);
  shader.uniforms.uTime = customUniform.uTime;
  shader.vertexShader = shader.vertexShader.replace(
    `#include <common>`,
    `
  #include <common>
  uniform float uTime;
  mat2 rotate2d(float _angle){
      return mat2(
        cos(_angle),-sin(_angle),
        sin(_angle),cos(_angle)
      );
  }
  `
  );
  shader.vertexShader = shader.vertexShader.replace(
    `#include <beginnormal_vertex>`,
    `
  #include <beginnormal_vertex>
  float angle = sin(position.y + (uTime*2.0)) * 0.5;
  mat2 rotateMatrix = rotate2d(angle);
  objectNormal.xz = rotateMatrix * objectNormal.xz;
  `
  );
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    `
    #include <begin_vertex>

    transformed.xz = rotateMatrix * transformed.xz;
    `
  );
};
const depthMaterial = new THREE.MeshDepthMaterial({
  depthPacking: THREE.RGBADepthPacking,
});
depthMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = customUniform.uTime;
  shader.vertexShader = shader.vertexShader.replace(
    `#include <common>`,
    `
  #include <common>
  uniform float uTime;
  mat2 rotate2d(float _angle){
      return mat2(
        cos(_angle),-sin(_angle),
        sin(_angle),cos(_angle)
      );
  }
  `
  );
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    `
    #include <begin_vertex>
    float angle = sin(transformed.y + (uTime*2.0)) * 0.5;
    mat2 rotateMatrix = rotate2d(angle);
    transformed.xz = rotateMatrix * transformed.xz;
    `
  );
};
// 模型加载
const gltfLoader = new GLTFLoader();
gltfLoader.load("./models/LeePerrySmith/LeePerrySmith.glb", (gltf) => {
  console.log(gltf);
  const mesh = gltf.scene.children[0];
  mesh.material = material;
  mesh.customDepthMaterial = depthMaterial;
  mesh.castShadow = true;
  scene.add(mesh);
});

// 加载 立方体纹理
const envMapTexture = new THREE.CubeTextureLoader()
  .setPath("./textures/environmentMaps/0/")
  .load(["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]);
scene.background = envMapTexture;
scene.environment = envMapTexture;

const plane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(20, 20),
  new THREE.MeshStandardMaterial()
);
plane.position.set(0, 0, -6);
plane.receiveShadow = true;
scene.add(plane);

// 创建渲染函数
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
// renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 0.2;
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

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.castShadow = true;
directionalLight.position.set(0, 0, 200);
scene.add(directionalLight);

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
  customUniform.uTime.value = time;
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(render);
}

render();
