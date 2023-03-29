import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// 导入后期效果合成器
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
// three框架本身自带效果
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { SSAARenderPass } from "three/examples/jsm/postprocessing/SSAARenderPass";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
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
camera.position.set(0, 0, 10);
// 更新摄像头
camera.aspect = window.innerWidth / window.innerHeight;
//   更新摄像机的投影矩阵
camera.updateProjectionMatrix();
scene.add(camera);
const textureLoader = new THREE.TextureLoader();

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

// 模型加载
const gltfLoader = new GLTFLoader();
gltfLoader.load("./models/DamagedHelmet/glTF/DamagedHelmet.gltf", (gltf) => {
  console.log(gltf);
  // scene.add(gltf.scene)
  const mesh = gltf.scene.children[0];

  scene.add(mesh);
});

// 设置时钟
const clock = new THREE.Clock();
function render() {
  let time = clock.getElapsedTime();
  techPass.material.uniforms.uTime.value = time;
  controls.update();
  // renderer.render(scene, camera);
  effectComposer.render();
  window.requestAnimationFrame(render);
}

// 合成效果
const effectComposer = new EffectComposer(renderer);
effectComposer.setSize(window.innerWidth, window.innerHeight);

// 添加渲染通道
const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

// 点效果
const dotScreenPass = new DotScreenPass();
dotScreenPass.enabled = false;
effectComposer.addPass(dotScreenPass);
// 抗锯齿
const sMAAPass = new SMAAPass();
effectComposer.addPass(sMAAPass);
// 发光效果
const unrealBloomPass = new UnrealBloomPass();
effectComposer.addPass(unrealBloomPass);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
unrealBloomPass.strength = 1;
unrealBloomPass.radius = 0;
unrealBloomPass.threshold = 1;

// 屏幕闪动效果
// const glitchPass = new GlitchPass();
// effectComposer.addPass(glitchPass);

gui.add(unrealBloomPass, "threshold", 0, 1, 0.1);
gui.add(renderer, "toneMappingExposure", 0, 1, 0.1);
gui.add(unrealBloomPass, "radius", 0, 1, 0.1);
gui.add(unrealBloomPass, "strength", 0, 1, 0.1);

const colorParams = {
  r: 0,
  g: 0,
  b: 0,
};
gui.add(colorParams, "r", -1, 1, 0.1).onChange((value) => {
  shaderPass.uniforms.uColor.value.r = value;
});
gui.add(colorParams, "g", -1, 1, 0.1).onChange((value) => {
  shaderPass.uniforms.uColor.value.g = value;
});
gui.add(colorParams, "b", -1, 1, 0.1).onChange((value) => {
  shaderPass.uniforms.uColor.value.b = value;
});

const normalTexture = textureLoader.load("./textures/interfaceNormalMap.png");
const techPass = new ShaderPass({
  uniforms: {
    tDiffuse: {
      value: null,
    },
    uNormalMap: {
      value: null,
    },
    uTime: {
      value: 0,
    },
  },
  vertexShader: `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  fragmentShader: `
  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform sampler2D uNormalMap;
  uniform float uTime;
  void main(){
    vec2 newUv = vUv;
    newUv += sin(newUv.x * 10.0 + uTime) * 0.015;
    vec4 color = texture2D(tDiffuse,newUv);
    vec4 normalColor = texture2D(uNormalMap,vUv);
    // 设置光线角度
    vec3 lightDirection = normalize(vec3(-5.0,5.0,2));
    float lightness = clamp(dot(normalColor.xyz,lightDirection),0.0,1.0);
    color.xyz += lightness;
    gl_FragColor =  vec4(color);
  }
  `,
});
techPass.material.uniforms.uNormalMap.value = normalTexture;
effectComposer.addPass(techPass);
// 着色器渲染通道
const shaderPass = new ShaderPass({
  uniforms: {
    tDiffuse: {
      value: null,
    },
    uColor: {
      value: new THREE.Color(colorParams.r, colorParams.g, colorParams.b),
    },
  },
  vertexShader: `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  fragmentShader: `
  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform vec3 uColor;
  void main(){
    vec4 color = texture2D(tDiffuse,vUv);
    color.xyz += uColor;
    gl_FragColor =  vec4(color);
  }
  `,
});

effectComposer.addPass(shaderPass);
render();
