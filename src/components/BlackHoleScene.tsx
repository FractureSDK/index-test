"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * A stylized black hole: a solid dark event horizon, a bright thin photon
 * ring right at its edge, and a tilted accretion disk of particles that
 * runs faster the closer they orbit (roughly Keplerian) with a
 * temperature-like color gradient (white-hot near the horizon, cooling to
 * violet further out). Not a physically-accurate lensing simulation — a
 * legible, GPU-cheap impression of one, built for a hero background.
 *
 * Desktop-only by convention (see HeroBackground.tsx, which picks this vs.
 * the lighter wireframe model based on viewport width).
 */
export default function BlackHoleScene({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
    camera.position.set(0, 14, 46);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.rotation.x = -0.55; // tilt so the disk reads in perspective
    scene.add(group);

    // ---------------------------- event horizon ----------------------------
    const horizonGeo = new THREE.SphereGeometry(6.2, 48, 48);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const horizon = new THREE.Mesh(horizonGeo, horizonMat);
    group.add(horizon);

    // photon ring — a thin, very bright rim right at the horizon's edge
    const ringGeo = new THREE.RingGeometry(6.2, 6.6, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf4f1ea,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const photonRing = new THREE.Mesh(ringGeo, ringMat);
    photonRing.rotation.x = Math.PI / 2;
    group.add(photonRing);

    // ---------------------------- accretion disk ----------------------------
    const DISK_COUNT = 9000;
    const positions = new Float32Array(DISK_COUNT * 3);
    const colors = new Float32Array(DISK_COUNT * 3);
    const speeds = new Float32Array(DISK_COUNT);
    const radii = new Float32Array(DISK_COUNT);
    const angles = new Float32Array(DISK_COUNT);

    const hot = new THREE.Color("#f4f1ea");
    const mid = new THREE.Color("#c8ff3d");
    const cool = new THREE.Color("#6d4bff");

    for (let i = 0; i < DISK_COUNT; i++) {
      const r = 7 + Math.pow(Math.random(), 1.6) * 26;
      const a = Math.random() * Math.PI * 2;
      radii[i] = r;
      angles[i] = a;
      // inner particles orbit faster — rough Keplerian falloff
      speeds[i] = 1.4 / Math.sqrt(r);

      const y = (Math.random() - 0.5) * (1.2 / (r * 0.15 + 1));
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(a) * r;

      const tt = Math.min((r - 7) / 26, 1);
      const col = tt < 0.5 ? hot.clone().lerp(mid, tt / 0.5) : mid.clone().lerp(cool, (tt - 0.5) / 0.5);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const diskGeo = new THREE.BufferGeometry();
    diskGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    diskGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const diskTexture = (() => {
      const size = 64;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    })();

    const diskMat = new THREE.PointsMaterial({
      size: 0.5,
      map: diskTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const disk = new THREE.Points(diskGeo, diskMat);
    group.add(disk);

    // faint outer glow behind everything
    const glowGeo = new THREE.SphereGeometry(9, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x6d4bff,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);

    // ---------------------------- interaction ----------------------------
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
    const posAttr = diskGeo.getAttribute("position") as THREE.BufferAttribute;

    const renderOnce = () => renderer.render(scene, camera);

    const frame = () => {
      t += 0.01;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;

      for (let i = 0; i < DISK_COUNT; i++) {
        const a = angles[i] + t * speeds[i];
        const r = radii[i];
        posAttr.setX(i, Math.cos(a) * r);
        posAttr.setZ(i, Math.sin(a) * r);
      }
      posAttr.needsUpdate = true;

      ringMat.opacity = 0.75 + Math.sin(t * 2) * 0.1;
      group.rotation.z = pointer.x * 0.08;
      group.rotation.x = -0.55 + pointer.y * 0.06 - scrollRef.current * 0.25;
      camera.position.y = 14 - scrollRef.current * 10;
      camera.lookAt(0, 0, 0);

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
    renderOnce();
    if (!reduced) raf = requestAnimationFrame(frame);

    window.addEventListener("resize", resize);
    if (!reduced) window.addEventListener("pointermove", onPointerMove);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      horizonGeo.dispose();
      horizonMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      diskGeo.dispose();
      diskMat.dispose();
      diskTexture.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mountRef} className={`block h-full w-full ${className}`} />;
}
