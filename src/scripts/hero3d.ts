/**
 * Ration Saathi - 3D Hero Scene (Three.js)
 * Procedural low-poly ration card with orbiting wheat, rice, and sugar cubes.
 * Features:
 * - Lazy-loaded via dynamic import + IntersectionObserver
 * - Transparent canvas with live re-theming
 * - DevicePixelRatio capped at 1.75
 * - Visibility & offscreen pause logic
 * - Full geometry & material disposal on teardown
 * - Safe fallback to CSS-3D / SVG on low-end devices or reduced motion
 */

import * as THREE from 'three';
import { getCurrentTheme } from './theme';

export function shouldFallbackToStatic(): boolean {
  if (typeof window === 'undefined') return true;

  // 1. Reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }

  // 2. Data saver mode
  const nav = navigator as any;
  if (nav.connection && nav.connection.saveData === true) {
    return true;
  }

  // 3. Low device memory (<= 2 GB)
  if (nav.deviceMemory && nav.deviceMemory <= 2) {
    return true;
  }

  // 4. Low CPU concurrency (<= 2 cores)
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) {
    return true;
  }

  // 5. WebGL availability test
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return true;
  } catch {
    return true;
  }

  return false;
}

export interface Hero3DInstance {
  cleanup: () => void;
}

export function initHero3D(container: HTMLElement): Hero3DInstance | null {
  if (shouldFallbackToStatic()) {
    container.classList.add('fallback-mode');
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'hero-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.outline = 'none';
  container.innerHTML = '';
  container.appendChild(canvas);

  let width = container.clientWidth || 400;
  let height = container.clientHeight || 360;

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
  camera.position.set(0, 0, 5.6);

  // Renderer
  let renderer: THREE.WebGLRenderer | null = null;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    });
  } catch (e) {
    console.warn('WebGL init failed, falling back to static:', e);
    container.classList.add('fallback-mode');
    return null;
  }

  renderer.setSize(width, height);
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(dpr);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight.position.set(4, 5, 6);
  scene.add(dirLight);

  const fillLight = new THREE.PointLight(0x5b9cff, 2.5, 10);
  fillLight.position.set(-3, -2, 2);
  scene.add(fillLight);

  // Procedural Texture for Ration Card
  const cardCanvas = document.createElement('canvas');
  cardCanvas.width = 1024;
  cardCanvas.height = 640;
  const ctx = cardCanvas.getContext('2d');
  if (ctx) {
    // Card Background
    const grad = ctx.createLinearGradient(0, 0, 1024, 640);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(1, '#EDF2F7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 640);

    // Subtle border
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, 1012, 628);

    // Tricolor top banner
    ctx.fillStyle = '#FF9933';
    ctx.fillRect(12, 12, 1000, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(12, 32, 1000, 20);
    ctx.fillStyle = '#138808';
    ctx.fillRect(12, 52, 1000, 20);

    // Card Header Text
    ctx.fillStyle = '#0B3D91';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText('GOVERNMENT OF MAHARASHTRA', 180, 125);
    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('PUBLIC DISTRIBUTION SYSTEM • रेशन कार्ड', 180, 165);

    // Golden Smart Chip
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.roundRect(80, 210, 140, 100, 12);
    ctx.fill();
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Chip circuit lines
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 260); ctx.lineTo(220, 260);
    ctx.moveTo(150, 210); ctx.lineTo(150, 310);
    ctx.stroke();

    // Card ID & Citizen Placeholder
    ctx.fillStyle = '#0B1B33';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('RC-MH-400102-2026', 80, 380);

    ctx.font = '26px sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('BENEFICIARY SMART CARD • NFSA SEC. 3', 80, 430);

    // Hologram / Watermark Circle
    ctx.strokeStyle = '#93C5FD';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(880, 460, 65, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#3B82F6';
    ctx.fillText('PDS 1967', 840, 465);

    // Barcode stripes
    ctx.fillStyle = '#1E293B';
    for (let i = 0; i < 40; i++) {
      const barW = (i % 3 === 0) ? 6 : 3;
      ctx.fillRect(80 + (i * 14), 500, barW, 60);
    }
  }

  const cardTexture = new THREE.CanvasTexture(cardCanvas);
  cardTexture.colorSpace = THREE.SRGBColorSpace;

  // Card Geometry
  const cardGeo = new THREE.BoxGeometry(3.3, 2.06, 0.08);
  const cardMatFront = new THREE.MeshStandardMaterial({
    map: cardTexture,
    roughness: 0.35,
    metalness: 0.1
  });
  const cardMatEdge = new THREE.MeshStandardMaterial({
    color: 0x0b3d91,
    roughness: 0.5,
    metalness: 0.2
  });

  const cardMaterials = [
    cardMatEdge, cardMatEdge, // left, right
    cardMatEdge, cardMatEdge, // top, bottom
    cardMatFront, cardMatEdge // front, back
  ];

  const cardMesh = new THREE.Mesh(cardGeo, cardMaterials);
  scene.add(cardMesh);

  // Group of floating commodity elements
  const floatingGroup = new THREE.Group();
  scene.add(floatingGroup);

  // 1. Wheat grains (low-poly golden grains)
  const wheatGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.32, 6);
  const wheatMat = new THREE.MeshStandardMaterial({
    color: 0xF59E0B,
    roughness: 0.4,
    metalness: 0.1
  });
  const wheatCount = 7;
  const wheatMeshes: THREE.Mesh[] = [];

  for (let i = 0; i < wheatCount; i++) {
    const mesh = new THREE.Mesh(wheatGeo, wheatMat);
    const angle = (i / wheatCount) * Math.PI * 2;
    const radius = 2.4 + (i % 3) * 0.3;
    mesh.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * 1.2 + (Math.random() - 0.5) * 0.4,
      Math.sin(angle) * 0.9 + (Math.random() - 0.5) * 0.6
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    floatingGroup.add(mesh);
    wheatMeshes.push(mesh);
  }

  // 2. Rice grains (smooth elongated pearl-white grains)
  const riceGeo = new THREE.CapsuleGeometry(0.05, 0.22, 6, 8);
  const riceMat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    roughness: 0.2,
    metalness: 0.05
  });
  const riceCount = 9;
  const riceMeshes: THREE.Mesh[] = [];

  for (let i = 0; i < riceCount; i++) {
    const mesh = new THREE.Mesh(riceGeo, riceMat);
    const angle = (i / riceCount) * Math.PI * 2 + 1.2;
    const radius = 2.1 + (i % 2) * 0.5;
    mesh.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * 1.4,
      Math.cos(angle) * 1.1
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    floatingGroup.add(mesh);
    riceMeshes.push(mesh);
  }

  // 3. Sugar cubes (crystalline translucent cubes)
  const sugarGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
  const sugarMat = new THREE.MeshStandardMaterial({
    color: 0xE0F2FE,
    roughness: 0.15,
    metalness: 0.1
  });
  const sugarCount = 6;
  const sugarMeshes: THREE.Mesh[] = [];

  for (let i = 0; i < sugarCount; i++) {
    const mesh = new THREE.Mesh(sugarGeo, sugarMat);
    const angle = (i / sugarCount) * Math.PI * 2 + 2.5;
    const radius = 2.6;
    mesh.position.set(
      Math.cos(angle) * radius,
      (i % 2 === 0 ? 1 : -1) * 1.1,
      Math.sin(angle) * 0.8
    );
    mesh.rotation.set(Math.random(), Math.random(), Math.random());
    floatingGroup.add(mesh);
    sugarMeshes.push(mesh);
  }

  // Pointer Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetRotX = 0;
  let targetRotY = 0;

  const onPointerMove = (e: MouseEvent | TouchEvent) => {
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((clientY - rect.top) / rect.height) * 2 - 1);
    }
  };

  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });

  // Live Theme Adaptations
  const updateThemeVisuals = (theme: 'light' | 'dark') => {
    if (theme === 'dark') {
      ambientLight.intensity = 1.0;
      ambientLight.color.setHex(0xA5B4FC);
      dirLight.intensity = 1.8;
      fillLight.color.setHex(0x38BDF8);
      fillLight.intensity = 3.0;
      cardMatEdge.color.setHex(0x5B9CFF);
    } else {
      ambientLight.intensity = 1.4;
      ambientLight.color.setHex(0xFFFFFF);
      dirLight.intensity = 2.2;
      fillLight.color.setHex(0x0B3D91);
      fillLight.intensity = 2.0;
      cardMatEdge.color.setHex(0x0B3D91);
    }
  };

  updateThemeVisuals(getCurrentTheme());

  const onThemeChange = (e: Event) => {
    const custom = e as CustomEvent<{ theme: 'light' | 'dark' }>;
    if (custom.detail && custom.detail.theme) {
      updateThemeVisuals(custom.detail.theme);
    }
  };
  window.addEventListener('rs:themechange', onThemeChange);

  // Resize handler
  const onResize = () => {
    if (!renderer) return;
    width = container.clientWidth || 400;
    height = container.clientHeight || 360;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener('resize', onResize);

  // Visibility & Intersection Observer (Pause rendering when tab hidden or canvas off-screen)
  let isRunning = true;
  let isIntersecting = true;
  let isTabVisible = !document.hidden;

  const observer = new IntersectionObserver(entries => {
    isIntersecting = entries[0].isIntersecting;
  }, { threshold: 0.05 });
  observer.observe(canvas);

  const onVisibilityChange = () => {
    isTabVisible = !document.hidden;
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  // Animation Loop
  let reqId: number | null = null;
  const startTime = performance.now();

  const animate = () => {
    if (!isRunning) return;
    reqId = requestAnimationFrame(animate);

    if (!isIntersecting || !isTabVisible) {
      return; // Skip rendering when paused to save battery
    }

    const elapsed = (performance.now() - startTime) / 1000;

    // Idle rotation + Parallax lerping
    targetRotY = mouseX * 0.45;
    targetRotX = -mouseY * 0.35;

    cardMesh.rotation.y += (targetRotY + Math.sin(elapsed * 0.8) * 0.18 - cardMesh.rotation.y) * 0.05;
    cardMesh.rotation.x += (targetRotX + Math.cos(elapsed * 0.6) * 0.1 - cardMesh.rotation.x) * 0.05;
    cardMesh.position.y = Math.sin(elapsed * 1.4) * 0.08;

    // Orbiting commodities
    floatingGroup.rotation.y = elapsed * 0.25;
    wheatMeshes.forEach((mesh, idx) => {
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.015;
      mesh.position.y += Math.sin(elapsed * 2 + idx) * 0.002;
    });

    riceMeshes.forEach((mesh, idx) => {
      mesh.rotation.y += 0.02;
      mesh.position.y += Math.cos(elapsed * 1.8 + idx) * 0.002;
    });

    sugarMeshes.forEach((mesh, idx) => {
      mesh.rotation.x += 0.012;
      mesh.rotation.z += 0.01;
      mesh.position.y += Math.sin(elapsed * 1.5 + idx) * 0.002;
    });

    if (renderer) {
      renderer.render(scene, camera);
    }
  };

  animate();

  // Cleanup & Teardown
  const cleanup = () => {
    isRunning = false;
    if (reqId !== null) {
      cancelAnimationFrame(reqId);
    }
    observer.disconnect();
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('touchmove', onPointerMove);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('rs:themechange', onThemeChange);
    document.removeEventListener('visibilitychange', onVisibilityChange);

    // Dispose Geometries & Materials
    cardGeo.dispose();
    cardMaterials.forEach(m => m.dispose());
    cardTexture.dispose();
    wheatGeo.dispose();
    wheatMat.dispose();
    riceGeo.dispose();
    riceMat.dispose();
    sugarGeo.dispose();
    sugarMat.dispose();

    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
    }
    container.innerHTML = '';
  };

  return { cleanup };
}
