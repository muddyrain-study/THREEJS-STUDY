import * as THREE from "three";
import startPointVertex from "../shader/startPoint/vertex.glsl";
import startPointFragment from "../shader/startPoint/fragment.glsl";
import fireworkVertex from "../shader/firework/vertex.glsl";
import fireworkFragment from "../shader/firework/fragment.glsl";
export default class Fireworks {
  constructor(color, to, from = { x: 0, y: 0, z: 0 }) {
    this.color = new THREE.Color(color);
    // 创建烟花发射效果
    this.startGeometry = new THREE.BufferGeometry();
    const startPositionArray = new Float32Array(3);
    startPositionArray[0] = from.x;
    startPositionArray[1] = from.y;
    startPositionArray[2] = from.z;
    this.startGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(startPositionArray, 3)
    );

    const astepArray = new Float32Array(3);
    astepArray[0] = to.x - from.x;
    astepArray[1] = to.y - from.y;
    astepArray[2] = to.z - from.x;
    this.startGeometry.setAttribute(
      "aStep",
      new THREE.BufferAttribute(astepArray, 3)
    );

    // 设置着色器材质
    this.startMaterial = new THREE.ShaderMaterial({
      vertexShader: startPointVertex,
      fragmentShader: startPointFragment,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: {
          value: 0,
        },
        uSize: {
          value: 20,
        },
        uColor: {
          value: this.color,
        },
      },
    });

    // 创建烟花·点
    this.startPoint = new THREE.Points(this.startGeometry, this.startMaterial);

    // 开始计时
    this.clock = new THREE.Clock();

    // 创建爆炸的烟花
    this.fireworkGeometry = new THREE.BufferGeometry();
    this.fireworksCount = 180 + Math.floor(Math.random() * 180);
    const positionFireworksArray = new Float32Array(this.fireworksCount * 3);
    const scaleFireArray = new Float32Array(this.fireworksCount);
    const directionArray = new Float32Array(this.fireworksCount * 3);
    for (let i = 0; i < this.fireworksCount; i++) {
      positionFireworksArray[i * 3 + 0] = to.x;
      positionFireworksArray[i * 3 + 1] = to.y;
      positionFireworksArray[i * 3 + 2] = to.z;
      // 设置烟花所有例子初始大小
      scaleFireArray[i] = Math.random();
      // 设置四周发射的角度

      let theta = Math.random() * 2 * Math.PI;
      let beta = Math.random() * 2 * Math.PI;
      let r = Math.random();

      directionArray[i * 3 + 0] = r * Math.sin(theta) + r * Math.sin(beta);
      directionArray[i * 3 + 1] = r * Math.cos(theta) + r * Math.cos(beta);
      directionArray[i * 3 + 2] = r * Math.sin(theta) + r * Math.cos(beta);
    }
    this.fireworkGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positionFireworksArray, 3)
    );
    this.fireworkGeometry.setAttribute(
      "aScale",
      new THREE.BufferAttribute(scaleFireArray, 1)
    );
    this.fireworkGeometry.setAttribute(
      "aRandom",
      new THREE.BufferAttribute(directionArray, 3)
    );
    this.fireworksMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: {
          value: 0,
        },
        uSize: {
          value: 0,
        },
        uColor: {
          value: this.color,
        },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: fireworkVertex,
      fragmentShader: fireworkFragment,
    });

    this.fireworks = new THREE.Points(
      this.fireworkGeometry,
      this.fireworksMaterial
    );
  }
  // 添加到场景
  addScene(scene, camera) {
    scene.add(this.startPoint);
    scene.add(this.fireworks);
    this.scene = scene;
  }
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    if (elapsedTime > 0.2 && elapsedTime < 1) {
      this.startMaterial.uniforms.uTime.value = elapsedTime;
      this.startMaterial.uniforms.uSize.value = 20;
    } else if (elapsedTime > 0.2) {
      const time = elapsedTime - 1;
      //   让点元素消失
      this.startMaterial.uniforms.uSize.value = 0;
      this.startPoint.clear();
      this.startGeometry.dispose();
      this.startMaterial.dispose();

      // 设置定点显示
      this.fireworksMaterial.uniforms.uSize.value = 20;
      this.fireworksMaterial.uniforms.uTime.value = time;
      if (time > 5) {
        this.fireworks.clear();
        this.fireworkGeometry.dispose();
        this.fireworksMaterial.dispose();
      }
    }
  }
}
