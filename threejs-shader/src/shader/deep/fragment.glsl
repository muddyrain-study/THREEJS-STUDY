precision lowp float;
varying vec2 vUv;
uniform float uTime;
void main(){
    // 通过顶点对应 uv 决定每个像素在uv图像的位置 通过 这个 x y 决定颜色
    // gl_FragColor = vec4(vUv, 0.0 ,1.0);

    // 2 对第一种变形
    // gl_FragColor = vec4(vUv,1.0,1.0);
    // 3 利用 uv实现渐变 - 从左到右
    // float strength = vUv.x;
    // gl_FragColor = vec4(strength, strength, strength, 1.0);
    // 从下到上 1.0 - y
    //   float strength =  vUv.y;
    // float strength = vUv.y * 10.0;
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // 通过 取膜 到达 反复效果
    // float strength = mod(vUv.y * 10.0, 1.0);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // step(edge, x) 如果x < edge，返回0.0，否则返回1.0
    // float strength = mod(vUv.y * 10.0, 1.0);
    // strength = step(0.5 ,strength);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // 条纹相交
    // float strength =  step(0.8 ,mod((vUv.x )  * 10.0, 1.0));
    // strength += step(0.8 ,mod((vUv.y)  * 10.0, 1.0));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // 条纹相 乘以
    // float barx =  step(0.4  ,mod((vUv.x + (uTime  * 0.1) )  * 10.0, 1.0)) *  step(0.8 ,mod((vUv.y)  * 10.0, 1.0));
    // float bary =  step(0.4  ,mod((vUv.y + (uTime  * 0.1) )  * 10.0, 1.0)) *  step(0.8 ,mod((vUv.x)  * 10.0, 1.0));
    // float strength  = barx + bary;
    // gl_FragColor = vec4(vUv, 1.0, strength);

    // t 字形
    // float barx =  step(0.4  ,mod((vUv.x  )  * 10.0 - 0.2, 1.0)) *  step(0.8 ,mod((vUv.y)  * 10.0, 1.0));
    // float bary =  step(0.4  ,mod((vUv.y  )  * 10.0, 1.0)) *  step(0.8 ,mod((vUv.x)  * 10.0, 1.0));
    // float strength  = barx + bary;
    // gl_FragColor = vec4(vUv, 1.0, strength);

    // float strength = mod(sin(vUv.x - vUv.y) * 10.0, 1.0);
    // strength = step(0.5 ,strength);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);


    //  16 利用绝对值
    float strength = abs(vUv.x - 0.5);
    gl_FragColor =vec4(strength,strength,strength,1);

}