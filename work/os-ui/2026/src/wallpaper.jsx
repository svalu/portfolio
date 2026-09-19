/* global React, THREE */
// 바탕화면 — 셰이더 한 장으로 그린다.
//
// 왜 다시 썼나: 반투명 구 세 개를 띄웠더니 경계가 그대로 보여서 "원 세 개"로 읽혔다.
//   겹치는 데는 색이 덧칠된 자국이 남았다. 배경이 앞의 창·아이콘보다 먼저 눈에 들어오면 안 된다.
// 어떻게: 모든 걸 프래그먼트 셰이더 안에서 만든다.
//   · 도메인 워프를 두 번 먹인 fbm → 경계 없는 실크 결. 아주 느리게 흐른다(한 바퀴에 수십 초)
//   · 오브는 메시가 아니라 exp(-d²) 감쇠 → 테두리가 없다
//   · 비네트로 가장자리를 눌러 창이 떠 보이게
//   · 미세한 그레인(1.8%) — 넓은 그라데이션에서 생기는 8비트 밴딩을 덮는다
// 성능: 픽셀당 fbm 5회(4옥타브). pixelRatio 1.25, 탭이 가려지면 멈춘다.
//   포폴에서는 이 화면이 다른 실물 iframe·3D 오브젠트와 함께 돌아가므로 아낀다.

const { useEffect, useRef } = React;

const PALETTES = {
  // deep(위) → glow(아래) 그라데이션 + 오브 3색. 창이 밝은 유리라 배경은 깊게 간다
  bloom:    { deep: '#050a1e', glow: '#0d1a40', o1: '#2f6bff', o2: '#8b3dff', o3: '#0fb4c8', dust: 0xa8ccff },
  midnight: { deep: '#02040c', glow: '#080f22', o1: '#2456e0', o2: '#6d28d9', o3: '#0891b2', dust: 0x7aaeff },
  graphite: { deep: '#100e1c', glow: '#221e36', o1: '#8b5cf6', o2: '#e0348b', o3: '#4f46e5', dust: 0xcbbcff },
  dawn:     { deep: '#1e0a2a', glow: '#6d1f4e', o1: '#ff7a4d', o2: '#ff4f9a', o3: '#fbbf24', dust: 0xffdcc0 },
  ocean:    { deep: '#021620', glow: '#07404f', o1: '#0ea5b7', o2: '#1d6fd8', o3: '#19d3b0', dust: 0xa8eef5 },
};

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform vec3  cDeep, cGlow, cO1, cO2, cO3;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

/* 테두리가 없는 빛 덩어리 */
float orb(vec2 p, vec2 c, float r){
  float d = length(p - c) / r;
  return exp(-d * d * 1.55);
}

void main(){
  float asp = uRes.x / max(uRes.y, 1.0);
  vec2 p = vec2((vUv.x - 0.5) * asp, vUv.y - 0.5);

  float t = uTime * 0.035;

  /* 도메인 워프 두 번 — 결이 접히며 흐른다 */
  vec2 q  = vec2(fbm(p * 1.6 + vec2(0.0, t)),        fbm(p * 1.6 + vec2(3.7, -t)));
  vec2 q2 = vec2(fbm(p * 2.2 + q * 1.4 + vec2(1.3, t * 1.3)),
                 fbm(p * 2.2 + q * 1.4 + vec2(-2.1, -t * 1.1)));
  float f = fbm(p * 1.8 + q2 * 1.2);

  /* 아래가 열리고 위가 깊어지는 바탕. 결이 경계를 흐트러 놓는다 */
  vec3 col = mix(cGlow, cDeep, smoothstep(-0.55, 0.52, p.y + (f - 0.5) * 0.38));

  /* 오브 셋 — 색을 분명히 갈라 놓는다. 축소해서 보면 이 색층만 남는다.
     더하기로 쌓으면 흰색으로 날아가므로 스크린 합성으로 겹친다 */
  vec2 m = uMouse * 0.07;
  vec3 light = vec3(0.0);
  light += cO1 * orb(p, vec2(-0.36 + sin(t * 1.7) * 0.09,  0.15 + cos(t * 1.3) * 0.06) + m,       0.52) * 0.95;
  light += cO2 * orb(p, vec2( 0.14 + cos(t * 1.1) * 0.11, -0.22 + sin(t * 1.6) * 0.07) + m * 0.6, 0.46) * 0.82;
  light += cO3 * orb(p, vec2( 0.54 + sin(t * 0.9 + 2.0) * 0.08, 0.26 + cos(t * 1.9) * 0.06) + m * 0.3, 0.40) * 0.66;
  col = 1.0 - (1.0 - col) * (1.0 - clamp(light, 0.0, 1.0));

  /* 결: 큰 흐름은 명암으로, 가는 올은 아주 옅게 얹는다 */
  col *= 0.90 + f * 0.20;

  /* 등고선 한 겹 — fbm 의 같은 높이를 잇는 아주 가는 띠. 실크가 접힌 자리처럼 보인다 */
  float ridge = abs(fract(f * 5.0 + t * 0.5) - 0.5) * 2.0;
  col += vec3(0.72, 0.82, 1.0) * pow(ridge, 22.0) * 0.038;

  /* 유리에 스친 듯한 대각 스윕 하나 */
  col += vec3(0.66, 0.76, 1.0) * exp(-pow((p.x * 0.66 + p.y * 1.12 - 0.10), 2.0) * 4.2) * 0.085;

  col += cO1 * exp(-pow((p.y - 0.46) * 3.2, 2.0)) * 0.05;            /* 위쪽 은은한 빛 한 줄 */
  col += cO2 * exp(-pow((p.y + 0.47) * 2.8, 2.0)) * 0.07;            /* 작업줄 쪽에서 올라오는 빛 */

  float vig = smoothstep(1.25, 0.28, length(p * vec2(0.92, 1.14)));  /* 가장자리를 누른다 */
  col *= mix(0.66, 1.0, vig);

  col += (hash(vUv * uRes + fract(uTime) * 137.0) - 0.5) * 0.018;    /* 그레인 — 밴딩 제거 */

  gl_FragColor = vec4(col, 1.0);
}`;

function Wallpaper({ theme = 'bloom', accent = '#0078D4' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || typeof THREE === 'undefined') return;
    const mount = mountRef.current;
    const pal = PALETTES[theme] || PALETTES.bloom;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1, 100);
    camera.position.z = 6;

    const uniforms = {
      uRes:   { value: new THREE.Vector2(mount.clientWidth, mount.clientHeight) },
      uTime:  { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      cDeep:  { value: new THREE.Color(pal.deep) },
      cGlow:  { value: new THREE.Color(pal.glow) },
      cO1:    { value: new THREE.Color(pal.o1) },
      cO2:    { value: new THREE.Color(pal.o2) },
      cO3:    { value: new THREE.Color(pal.o3) },
    };

    const bgMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }',
      fragmentShader: FRAG,
      depthTest: false, depthWrite: false,
    });
    const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
    bgMesh.frustumCulled = false;
    scene.add(bgMesh);

    /* 먼지 — 셰이더 위에 아주 옅게. 마우스에 따라 시차가 생겨 깊이가 보인다 */
    const COUNT = 90;
    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({
      color: pal.dust, size: 0.03, transparent: true, opacity: 0.6,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    let mx = 0, my = 0;
    const onMove = (e) => {
      const r = mount.getBoundingClientRect();
      if (!r.width || !r.height) return;
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
    };
    window.addEventListener('mousemove', onMove);

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      uniforms.uRes.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);
    onResize();

    const start = performance.now();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;                       /* 가려져 있으면 그리지 않는다 */
      const t = (performance.now() - start) / 1000;
      uniforms.uTime.value = t;
      uniforms.uMouse.value.set(mx, -my);
      points.rotation.y = t * 0.015 + mx * 0.12;
      points.rotation.x = -my * 0.08;
      camera.position.set(mx * 0.25, -my * 0.16, 6);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      bgMesh.geometry.dispose(); bgMat.dispose(); pGeo.dispose(); pMat.dispose();
    };
  }, [theme]);

  return <div className="wallpaper-canvas" ref={mountRef} />;
}

Object.assign(window, { Wallpaper });
