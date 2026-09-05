import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

/**
 * A cosmic particle field that reacts to mouse movement and scroll.
 * Used as an interactive background for the Skills section.
 * 
 * - Particles form constellation-like patterns
 * - Gentle drift animation with mouse parallax
 * - Pauses when out of view via IntersectionObserver
 * - Respects prefers-reduced-motion
 */
export default function CosmicParticles({
  className = "",
  density = "medium",
}: {
  className?: string;
  density?: "low" | "medium" | "high";
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ---- Create soft glow texture ----
    const makeGlowTexture = () => {
      const size = 64;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.4, "rgba(200,255,61,0.8)");
      grad.addColorStop(1, "rgba(200,255,61,0)");
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    };

    const glowTexture = makeGlowTexture();

    // ---- Particle system ----
    const DENSITY_MAP = { low: 400, medium: 800, high: 1400 };
    const PARTICLE_COUNT = DENSITY_MAP[density];
    
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);

    const palette = [
      new THREE.Color("#c8ff3d"), // accent lime
      new THREE.Color("#8b6cff"), // violet
      new THREE.Color("#f4f1ea"), // bone
      new THREE.Color("#9fd9ff"), // cool blue
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Distribute in a flattened sphere (wider than tall)
      const r = 40 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.4;
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      positions[i * 3 + 2] = r * Math.cos(phi);

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = Math.random() * 2 + 0.5;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    particleGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const particleMat = new THREE.PointsMaterial({
      size: 1.8,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ---- Connection lines (constellation effect) ----
    const lineCount = 150;
    const linePositions = new Float32Array(lineCount * 6);
    const lineColors = new Float32Array(lineCount * 6);

    const updateLines = () => {
      const posAttr = particleGeo.getAttribute("position");
      let idx = 0;
      for (let i = 0; i < lineCount; i++) {
        const a = Math.floor(Math.random() * PARTICLE_COUNT);
        let b = Math.floor(Math.random() * PARTICLE_COUNT);
        while (b === a) b = Math.floor(Math.random() * PARTICLE_COUNT);

        const ax = posAttr.getX(a);
        const ay = posAttr.getY(a);
        const az = posAttr.getZ(a);
        const bx = posAttr.getX(b);
        const by = posAttr.getY(b);
        const bz = posAttr.getZ(b);

        linePositions[idx++] = ax;
        linePositions[idx++] = ay;
        linePositions[idx++] = az;
        linePositions[idx++] = bx;
        linePositions[idx++] = by;
        linePositions[idx++] = bz;

        const t = Math.random();
        const col = new THREE.Color().lerpColors(palette[0], palette[1], t);
        lineColors[idx - 6] = col.r * 0.4;
        lineColors[idx - 5] = col.g * 0.4;
        lineColors[idx - 4] = col.b * 0.4;
        lineColors[idx - 3] = col.r * 0.4;
        lineColors[idx - 2] = col.g * 0.4;
        lineColors[idx - 1] = col.b * 0.4;
      }

      lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
      lineGeo.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));
    };

    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // ---- Animation ----
    const reduced = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
    };

    let raf = 0;
    let inView = true;
    let t = 0;

    const renderOnce = () => {
      renderer.render(scene, camera);
    };

    const frame = () => {
      const dt = 1 / 60;
      t += 0.002;
      
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      // Rotate entire system slowly
      particles.rotation.y = t * 0.15;
      particles.rotation.x = t * 0.08;
      lines.rotation.y = t * 0.15;
      lines.rotation.x = t * 0.08;

      // Mouse parallax
      camera.position.x = pointer.x * 4;
      camera.position.y = -pointer.y * 3;
      camera.lookAt(0, 0, 0);

      // Gentle particle drift
      const posAttr = particleGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const phase = phases[i];
        const drift = Math.sin(t * 0.5 + phase) * 0.02;
        const currentY = posAttr.getY(i);
        posAttr.setY(i, currentY + drift);
      }
      posAttr.needsUpdate = true;

      // Update connections periodically
      if (Math.floor(t * 100) % 30 === 0) {
        updateLines();
      }

      renderOnce();
      if (inView && !reduced) raf = requestAnimationFrame(frame);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const was = inView;
        inView = entry.isIntersecting;
        if (inView && !was && !reduced) raf = requestAnimationFrame(frame);
      },
      { threshold: 0 }
    );
    observer.observe(mount);

    resize();
    updateLines();
    renderOnce();
    if (!reduced) raf = requestAnimationFrame(frame);

    window.addEventListener("resize", resize);
    if (!reduced) window.addEventListener("pointermove", onPointerMove);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);

      particleGeo.dispose();
      particleMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      glowTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [density]);

  return <div ref={mountRef} className={`absolute inset-0 ${className}`} />;
}
