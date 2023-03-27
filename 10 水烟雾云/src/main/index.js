import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertexShader from "../shader/water/vertexShader.glsl";
import fragmentShader from "../shader/water/fragmentShader.glsl";
import * as dat from "dat.gui";

const gui = new dat.GUI();
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  300
);
// 设置相机位置
camera.position.set(0, 5, 10);
scene.add(camera);

const params = {
  uWaresFrequency: 20,
  uScale: 0.1,
  uXzScale: 1,
  uNoiseFrequency: 10.0,
  uNoiseScale: 0.1,
};

const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  side: THREE.DoubleSide,
  transparent: true,
  uniforms: {
    uWaresFrequency: {
      value: params.uWaresFrequency,
    },
    uScale: {
      value: params.uScale,
    },
    uNoiseFrequency: {
      value: params.uNoiseFrequency,
    },
    uNoiseScale: {
      value: params.uNoiseScale,
    },
    uXzScale: {
      value: params.uXzScale,
    },
  },
});
gui
  .add(params, "uWaresFrequency")
  .min(1)
  .max(100)
  .step(0.1)
  .onChange((value) => {
    shaderMaterial.uniforms.uWaresFrequency.value = value;
  });

gui
  .add(params, "uScale")
  .min(0)
  .max(0.2)
  .step(0.001)
  .onChange((value) => {
    shaderMaterial.uniforms.uScale.value = value;
  });

gui
  .add(params, "uNoiseFrequency")
  .min(1)
  .max(100)
  .step(0.1)
  .onChange((value) => {
    shaderMaterial.uniforms.uNoiseFrequency.value = value;
  });
gui
  .add(params, "uNoiseScale")
  .min(0)
  .max(1)
  .step(0.01)
  .onChange((value) => {
    shaderMaterial.uniforms.uNoiseScale.value = value;
  });
gui
  .add(params, "uXzScale")
  .min(0)
  .max(5)
  .step(0.1)
  .onChange((value) => {
    shaderMaterial.uniforms.uXzScale.value = value;
  });
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1, 512, 512),
  shaderMaterial
);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// 创建渲染函数
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置控制器的阻尼，让控制器更真实
controls.enableDamping = true;

// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
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
