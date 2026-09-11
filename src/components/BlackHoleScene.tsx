"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * A "Gargantua"-style lensed black hole. The iconic look isn't a particle
 * cloud — it's a flat accretion disk PLUS a second ring left facing the
 * camera (unrotated) so it reads as a halo wrapping the poles, which is
 * the classic cheat for faking gravitational lensing without a real
 * ray-marched shader: two rings, same radius, perpendicular to each other,
 * sharing one tilt.
 *
 * Both rings use a procedurally painted canvas texture (radial brightness
 * falloff + angular turbulence + a one-sided brightness bias standing in
 * for relativistic Doppler beaming) rather than solid color, so they read
 * as wispy/fibrous rather than a flat gradient ring.
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
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 2000);
    camera.position.set(0, 14, 50);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.rotation.x = -0.42; // moderate tilt, close to the reference angle
    scene.add(group);

    // ---------------------------- procedural disk texture ----------------------------
    // RingGeometry UVs: v (0→1) runs inner→outer radius, u (0→1) runs around
    // the angle — so vertical position in this canvas is radial distance,
    // horizontal position is angle.
    function makeDiskTexture(beamBiasDeg: number) {
      const W = 512;
      const H = 64;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;
      const img = ctx.createImageData(W, H);
      const bias = (beamBiasDeg * Math.PI) / 180;

      const hot = [255, 248, 235]; // near-white
      const gold = [255, 205, 130];
      const amber = [230, 120, 55];
      const dim = [90, 40, 25];

      const lerp3 = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);

      for (let y = 0; y < H; y++) {
        const v = y / (H - 1); // 0 = inner edge, 1 = outer edge
        // radial brightness: hottest near the inner edge, falling off outward
        const radialFalloff = Math.pow(1 - v, 1.6);
        for (let x = 0; x < W; x++) {
          const u = x / (W - 1);
          const angle = u * Math.PI * 2;

          // turbulence: a handful of overlapping sine waves at different
          // angular frequencies so brightness varies unevenly around the
          // ring, reads as wisps/streaks rather than a uniform band
          const noise =
            0.5 +
            0.22 * Math.sin(angle * 5 + v * 9) +
            0.16 * Math.sin(angle * 11 - v * 5 + 2.1) +
            0.12 * Math.sin(angle * 23 + v * 3 + 4.4);

          // relativistic-beaming stand-in: brighter on one side
          const beam = 0.55 + 0.45 * Math.cos(angle - bias);

          let brightness = radialFalloff * Math.max(noise, 0) * beam;
          brightness = Math.max(0, Math.min(1, brightness));

          // gap streaks: occasionally darken a thin angular band so
          // individual filaments separate instead of a solid wash
          const gap = Math.sin(angle * 37 + v * 13);
          if (gap > 0.94) brightness *= 0.25;

          let color: number[];
          if (brightness > 0.75) color = lerp3(gold, hot, (brightness - 0.75) / 0.25);
          else if (brightness > 0.4) color = lerp3(amber, gold, (brightness - 0.4) / 0.35);
          else color = lerp3(dim, amber, brightness / 0.4);

          const i = (y * W + x) * 4;
          img.data[i] = color[0];
          img.data[i + 1] = color[1];
          img.data[i + 2] = color[2];
          img.data[i + 3] = Math.round(brightness * 255);
        }
      }
      ctx.putImageData(img, 0, 0);
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.needsUpdate = true;
      return tex;
    }

    const diskTexture = makeDiskTexture(35);
    const haloTexture = makeDiskTexture(35);

    const diskMat = new THREE.MeshBasicMaterial({
      map: diskTexture,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const haloMat = new THREE.MeshBasicMaterial({
      map: haloTexture,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.85,
    });

    // main disk — laid flat (in the group's local XZ plane)
    const diskGeo = new THREE.RingGeometry(5.4, 17, 128, 1);
    const disk = new THREE.Mesh(diskGeo, diskMat);
    disk.rotation.x = Math.PI / 2;
    group.add(disk);

    // halo — same ring, left facing the camera (no extra rotation), same
    // radius range but tighter, so it wraps the sphere's poles
    const haloGeo = new THREE.RingGeometry(5.2, 9.5, 128, 1);
    const halo = new THREE.Mesh(haloGeo, haloMat);
    group.add(halo);

    // ---------------------------- event horizon ----------------------------
    const horizonGeo = new THREE.SphereGeometry(5.1, 48, 48);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const horizon = new THREE.Mesh(horizonGeo, horizonMat);
    group.add(horizon);

    // thin bright cusp right at the horizon's edge — one aligned to the
    // disk's plane, one aligned to the halo's plane
    const cuspGeo = new THREE.RingGeometry(5.1, 5.35, 96);
    const cuspMat = new THREE.MeshBasicMaterial({
      color: 0xfff4e0,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cusp = new THREE.Mesh(cuspGeo, cuspMat);
    cusp.rotation.x = Math.PI / 2; // matches the disk's flat orientation
    group.add(cusp);
    const cuspVertical = new THREE.Mesh(cuspGeo, cuspMat); // matches the halo's orientation (unrotated)
    group.add(cuspVertical);

    // faint ambient glow behind everything
    const glowGeo = new THREE.SphereGeometry(7, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffb066,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);

    // ---------------------------- sparkle overlay ----------------------------
    const SPARK_COUNT = 500;
    const sparkPositions = new Float32Array(SPARK_COUNT * 3);
    const sparkRadii = new Float32Array(SPARK_COUNT);
    const sparkAngles = new Float32Array(SPARK_COUNT);
    const sparkSpeeds = new Float32Array(SPARK_COUNT);
    const sparkVertical = new Uint8Array(SPARK_COUNT);
    for (let i = 0; i < SPARK_COUNT; i++) {
      const r = 5.5 + Math.random() * 10;
      sparkRadii[i] = r;
      sparkAngles[i] = Math.random() * Math.PI * 2;
      sparkSpeeds[i] = 0.9 / Math.sqrt(r);
      sparkVertical[i] = Math.random() > 0.5 ? 1 : 0;
    }
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
    const sparkTexture = (() => {
      const size = 32;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, "rgba(255,248,230,1)");
      grad.addColorStop(1, "rgba(255,248,230,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    })();
    const sparkMat = new THREE.PointsMaterial({
      size: 0.35,
      map: sparkTexture,
      color: 0xfff2d8,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    group.add(sparks);

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
    const sparkPosAttr = sparkGeo.getAttribute("position") as THREE.BufferAttribute;

    const renderOnce = () => renderer.render(scene, camera);

    const frame = () => {
      t += 0.008;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;

      // slow counter-rotation of the two rings sells the "independent
      // orbiting material" read rather than a single rigid solid
      disk.rotation.z = t * 0.06;
      halo.rotation.z = -t * 0.05;

      for (let i = 0; i < SPARK_COUNT; i++) {
        const a = sparkAngles[i] + t * sparkSpeeds[i];
        const r = sparkRadii[i];
        if (sparkVertical[i]) {
          sparkPosAttr.setXYZ(i, Math.cos(a) * r, Math.sin(a) * r, 0);
        } else {
          sparkPosAttr.setXYZ(i, Math.cos(a) * r, 0, Math.sin(a) * r);
        }
      }
      sparkPosAttr.needsUpdate = true;

      const pulse = 0.85 + Math.sin(t * 2.4) * 0.1;
      cuspMat.opacity = pulse;

      group.rotation.z = pointer.x * 0.06;
      group.rotation.x = -0.42 + pointer.y * 0.05 - scrollRef.current * 0.3;
      camera.position.y = 14 - scrollRef.current * 11;
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
      diskGeo.dispose();
      diskMat.dispose();
      diskTexture.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      haloTexture.dispose();
      horizonGeo.dispose();
      horizonMat.dispose();
      cuspGeo.dispose();
      cuspMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      sparkTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mountRef} className={`block h-full w-full ${className}`} />;
}
