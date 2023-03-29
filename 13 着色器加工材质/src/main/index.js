import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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

let basicMaterial = new THREE.MeshBasicMaterial({
  color: "#00ff00",
  side: THREE.DoubleSide,
});
const basicUniform = {
  uTime: {
    value: 0,
  },
};
basicMaterial.onBeforeCompile = (shader, renderer) => {
  console.log(shader.vertexShader);
  console.log(shader.fragmentShader);
  shader.uniforms.uTime = basicUniform.uTime;
  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    `
    #include <common>
    uniform float uTime;
    `
  );
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    `
    #include <begin_vertex>
    transformed.x += sin(uTime) * 2.0;
    transformed.z += cos(uTime) * 2.0;
    `
  );
};

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1, 64, 64),
  basicMaterial
);

scene.add(floor);

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

// 设置时钟
const clock = new THREE.Clock();
function render() {
  let time = clock.getElapsedTime();
  basicUniform.uTime.value = time;
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(render);
}

render();
