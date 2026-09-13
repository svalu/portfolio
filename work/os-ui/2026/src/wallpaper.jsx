/* global React, THREE */
// Three.js animated wallpaper with theme-aware palette

const { useEffect, useRef } = React;

function Wallpaper({ theme = 'bloom', accent = '#0078D4' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || typeof THREE === 'undefined') return;
    const mount = mountRef.current;

    const palettes = {
      bloom:    { top: '#1E3A8A', mid: '#3B82F6', bot: '#60A5FA', particle: 0xA8D2FF, blobA: 0x3B82F6, blobB: 0x8B5CF6, blobC: 0x22B8CF },
      midnight: { top: '#050816', mid: '#0F172A', bot: '#1E293B', particle: 0x60A5FA, blobA: 0x1E40AF, blobB: 0x7C3AED, blobC: 0x0EA5E9 },
      graphite: { top: '#1F1A2E', mid: '#2D2A42', bot: '#3F3A56', particle: 0xB5A8FF, blobA: 0x7C3AED, blobB: 0xEC4899, blobC: 0x8B5CF6 },
      dawn:     { top: '#FFB27A', mid: '#FF6E86', bot: '#A350B7', particle: 0xFFE0B2, blobA: 0xFF7A5C, blobB: 0xF9A8D4, blobC: 0xFCD34D },
      ocean:    { top: '#042F4A', mid: '#0E7490', bot: '#22D3EE', particle: 0x93E6F2, blobA: 0x0E7490, blobB: 0x0369A1, blobC: 0x14B8A6 },
    };
    const p = palettes[theme] || palettes.bloom;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Gradient background plane
    const bgGeom = new THREE.PlaneGeometry(2, 2);
    const bgMat = new THREE.ShaderMaterial({
      uniforms: {
        colorTop: { value: new THREE.Color(p.top) },
        colorMid: { value: new THREE.Color(p.mid) },
        colorBot: { value: new THREE.Color(p.bot) },
      },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec3 colorTop, colorMid, colorBot;
        void main() {
          vec3 c = mix(colorBot, colorMid, smoothstep(0.0, 0.55, vUv.y));
          c = mix(c, colorTop, smoothstep(0.55, 1.0, vUv.y));
          gl_FragColor = vec4(c, 1.0);
        }`,
      depthTest: false, depthWrite: false,
    });
    const bgMesh = new THREE.Mesh(bgGeom, bgMat);
    bgMesh.frustumCulled = false;
    scene.add(bgMesh);

    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.z = 6;

    // Floating blobs (emissive spheres, blurred via bloom-like additive)
    const blobs = [];
    const blobColors = [p.blobA, p.blobB, p.blobC];
    for (let i = 0; i < 3; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: blobColors[i], transparent: true, opacity: 0.55 });
      const geo = new THREE.SphereGeometry(1.5 + i * 0.3, 48, 48);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((i - 1) * 2.4, (i % 2 === 0 ? 0.5 : -0.4), -2 - i * 0.5);
      blobs.push({ mesh, seed: i * 3.13, base: mesh.position.clone() });
      scene.add(mesh);
    }

    // Particle field
    const pGeo = new THREE.BufferGeometry();
    const count = 240;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      seeds[i] = Math.random();
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: p.particle,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    let mouseX = 0, mouseY = 0;
    const onMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5);
      mouseY = (e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMove);

    const onResize = () => {
      if (!mount) return;
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      blobs.forEach((b) => {
        b.mesh.position.x = b.base.x + Math.sin(t * 0.3 + b.seed) * 1.2;
        b.mesh.position.y = b.base.y + Math.cos(t * 0.25 + b.seed * 1.6) * 0.8;
        b.mesh.position.z = b.base.z + Math.sin(t * 0.2 + b.seed * 2.2) * 0.6;
      });
      points.rotation.y = t * 0.02 + mouseX * 0.15;
      points.rotation.x = -mouseY * 0.1;
      camera.position.x = mouseX * 0.3;
      camera.position.y = -mouseY * 0.2;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      pGeo.dispose(); pMat.dispose(); bgGeom.dispose(); bgMat.dispose();
      blobs.forEach((b) => { b.mesh.geometry.dispose(); b.mesh.material.dispose(); });
    };
  }, [theme]);

  return <div className="wallpaper-canvas" ref={mountRef} />;
}

Object.assign(window, { Wallpaper });
