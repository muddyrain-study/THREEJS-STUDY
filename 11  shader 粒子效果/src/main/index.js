import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import vertexShader from "../shader/basic/vertexShader.glsl";
import fragmentShader from "../shader/basic/fragmentShader.glsl";

const gui = new dat.GUI();
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  300
);
// 设置相机位置
camera.position.set(5, 5, 5);
scene.add(camera);

const textureLoader = new THREE.TextureLoader();
const texture1 = textureLoader.load(`./textures/particles/10.png`);
const texture2 = textureLoader.load(`./textures/particles/9.png`);
const texture3 = textureLoader.load(`./textures/particles/11.png`);

// 设置星系的参数
const params = {
  count: 1000,
  size: 0.1,
  radius: 5,
  branches: 4,
  spin: 0.5,
  color: "#ff6030",
  outColor: "#1b3984",
};

// GalaxyColor
let galaxyColor = new THREE.Color(params.color);
let outGalaxyColor = new THREE.Color(params.outColor);
let material;
let geometry = null;
let points = null;
const generateGalaxy = () => {
  // 如果已经存在这些顶点，那么先释放内存，在删除顶点数据
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }
  // 生成顶点几何
  geometry = new THREE.BufferGeometry();
  //   随机生成位置
  const positions = new Float32Array(params.count * 3);
  const colors = new Float32Array(params.count * 3);

  const scales = new Float32Array(params.count);

  //图案属性
  const imgIndex = new Float32Array(params.count);
  for (let i = 0; i < params.count; i++) {
    const current = i * 3;

    // 计算分支的角度 = (计算当前的点在第几个分支)*(2*Math.PI/多少个分支)
    const branchAngel =
      (i % params.branches) * ((2 * Math.PI) / params.branches);

    const radius = Math.random() * params.radius;
    // 距离圆心越远，旋转的度数就越大
    // const spinAngle = radius * params.spin;

    // 随机设置x/y/z偏移值
    const randomX =
      Math.pow(Math.random() * 2 - 1, 3) * 0.5 * (params.radius - radius) * 0.3;
    const randomY =
      Math.pow(Math.random() * 2 - 1, 3) * 0.5 * (params.radius - radius) * 0.3;
    const randomZ =
      Math.pow(Math.random() * 2 - 1, 3) * 0.5 * (params.radius - radius) * 0.3;

    // 设置当前点x值坐标
    positions[current] = Math.cos(branchAngel) * radius + randomX;
    // 设置当前点y值坐标
    positions[current + 1] = randomY;
    // 设置当前点z值坐标
    positions[current + 2] = Math.sin(branchAngel) * radius + randomZ;

    const mixColor = galaxyColor.clone();
    mixColor.lerp(outGalaxyColor, radius / params.radius);

    //   设置颜色
    colors[current] = mixColor.r;
    colors[current + 1] = mixColor.g;
    colors[current + 2] = mixColor.b;

    // 顶点的大小
    scales[current] = Math.random();

    // 根据索引值设置不同的图案；
    imgIndex[current] = i % 3;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("imgIndex", new THREE.BufferAttribute(imgIndex, 1));
  geometry.setAttribute("scales", new THREE.BufferAttribute(scales, 1));

  //   设置点材质
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uTexture1: {
        value: texture1,
      },
      uTexture2: {
        value: texture2,
      },
      uTexture3: {
        value: texture3,
      },
      uTime: {
        value: 0,
      },
      uColor: {
        value: galaxyColor,
      },
    },
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);
};
generateGalaxy();

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
  material.uniforms.uTime.value = time;
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
