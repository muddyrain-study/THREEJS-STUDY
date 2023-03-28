void main() {
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength *= 2.0;
    strength = 1.0 - strength;
    strength = pow(strength, 1.5);
    gl_FragColor = vec4(1.0, 1.0, 0.0, strength);
}