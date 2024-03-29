attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

varying float vElevation;

// 获取时间
uniform float uTime;

varying vec2 vUv;
void main(){
    vUv = uv;
    vec4 modelPosition = modelMatrix * vec4(position,1.0);
    // modelPosition.x += 1.0;
    // modelPosition.z += 1.0;
    // modelPosition.z += modelPosition.x;
    modelPosition.z = sin((modelPosition.x + uTime) * 10.0) * 0.01;
    modelPosition.z += sin((modelPosition.y + uTime )* 10.0) * 0.1;
    vElevation = modelPosition.z;
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
}