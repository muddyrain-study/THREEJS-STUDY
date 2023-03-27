precision lowp float;
varying float vElevation;
void main() {
    float a = (vElevation + 1.0) / 2.0;
    gl_FragColor = vec4(1.0 * a, 1.0 * a, 0.0, a);
}