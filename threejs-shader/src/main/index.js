import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// 顶点着色器
import vertexShader from "../shader/deep/vertex.glsl";
// 片元着色器
import fragmentShader from "../shader/deep/fragment.glsl";

// 场景
const scene = new THREE.Scene();
// 相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// 设置相机位置
camera.position.set(0, 0, 2);
scene.add(camera);

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("./textures/ca.jpeg");

// const material = new THREE.MeshBasicMaterial({ color: "#00ff00" });
// 创建原始着色器材质
const rawShaderMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  // wireframe: true,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: {
      value: 0,
    },
    uTexture: {
      value: texture,
    },
  },
});
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1, 64, 64),
  rawShaderMaterial
);
console.log(floor);
scene.add(floor);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
window.document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

// 渲染场景
function animate() {
  const elapsedTime = clock.getElapsedTime();
  rawShaderMaterial.uniforms.uTime.value = elapsedTime;
  renderer.render(scene, camera);
  controls.update();
  requestAnimationFrame(animate);
}

// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const controls = new OrbitControls(camera, renderer.domElement);
// 设置控制器的阻尼，让控制器更真实
controls.enableDamping = true;

animate();
