"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * A "Gargantua"-style lensed black hole, built around three ideas from
 * https://www.cnblogs.com/jakezhang/p/20978598 (a writeup of a four-round
 * Three.js black hole project):
 *
 *  1. Particles over flat geometry for the accretion disk — an "organic,
 *     non-geometric" plasma reads as more physical than a textured panel.
 *  2. Real per-particle Doppler shift (dot of orbital velocity direction
 *     with the view direction) plus layered-sine turbulence standing in
 *     for fBm, instead of a single baked "brighter on one side" texture.
 *  3. HDR-ish highlight colors + UnrealBloomPass + ACES Filmic tone
 *     mapping, so the hottest particles genuinely glow instead of just
 *     being a brighter flat color.
 *
 * Scoped down from the article's target (500k particles, GPU vertex-shader
 * motion, a volumetric-light pass, full geodesic ray-marched lensing):
 * this is a decorative hero background, not a dedicated visualization, so
 * it runs on ~13k particles with CPU-computed motion/color and skips the
 * volumetric pass and true ray-traced lensing — the two perpendicular
 * rings (disk lying flat, halo left facing the camera) are the same
 * "fake the lensing" trick as before, now populated with particles
 * instead of a textured mesh.
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
    // ACES Filmic: keeps the bloom-fed highlights (photon ring, hot
    // particles) from clipping to flat white while still letting the
    // dim outer disk keep some gradient — the article's round-4 pick
    // over Reinhard (crushes highlights) for the same reason.
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.5, 0.55, 0.62);
    composer.addPass(bloomPass);

    const group = new THREE.Group();
    group.rotation.x = -0.42;
    scene.add(group);

    // ---------------------------- event horizon ----------------------------
    const horizonGeo = new THREE.SphereGeometry(5.1, 48, 48);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const horizon = new THREE.Mesh(horizonGeo, horizonMat);
    group.add(horizon);

    // ---------------------------- photon ring (soft glow, not a hard edge) ----------------------------
    // A radial gaussian falloff around the photon radius (~1.5x the
    // horizon radius, per the article), painted into a texture rather
    // than a flat-alpha ring — this is the "round 1 → round 2" fix for
    // hard edges applied specifically to the ring boundary.
    function makeGlowRingTexture() {
      const W = 4;
      const H = 128;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;
      const img = ctx.createImageData(W, H);
      const photonV = 0.22; // where in the ring's inner→outer span the photon radius sits
      const sharpness = 18; // ringSharpness from the article
      for (let y = 0; y < H; y++) {
        const v = y / (H - 1);
        const glow = Math.exp(-Math.pow((v - photonV) * sharpness, 2)) + Math.exp(-Math.pow(v * 6, 2)) * 0.4;
        const b = Math.min(1, glow);
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          // slightly HDR near the peak so bloom picks it out distinctly
          img.data[i] = Math.min(255, 255 * (0.98 + b * 0.4));
          img.data[i + 1] = Math.min(255, 255 * (0.94 + b * 0.3));
          img.data[i + 2] = Math.min(255, 255 * (0.85 + b * 0.15));
          img.data[i + 3] = Math.round(b * 255);
        }
      }
      ctx.putImageData(img, 0, 0);
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }
    const ringTexture = makeGlowRingTexture();
    const ringMat = new THREE.MeshBasicMaterial({
      map: ringTexture,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ringGeo = new THREE.RingGeometry(4.9, 8.5, 128, 1);
    const photonRingFlat = new THREE.Mesh(ringGeo, ringMat);
    photonRingFlat.rotation.x = Math.PI / 2;
    group.add(photonRingFlat);
    const photonRingVertical = new THREE.Mesh(ringGeo, ringMat);
    group.add(photonRingVertical);

    // faint ambient glow behind everything
    const glowGeo = new THREE.SphereGeometry(7, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffb066,
      transparent: true,
      opacity: 0.07,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    group.add(new THREE.Mesh(glowGeo, glowMat));

    // ---------------------------- accretion disk: particles, not a panel ----------------------------
    const isMobile = window.matchMedia("(max-width: 1279px)").matches;
    const COUNT = isMobile ? 6000 : 13000;
    const INNER_R = 6.2;
    const OUTER_R = 19;

    const radii = new Float32Array(COUNT);
    const baseAngle = new Float32Array(COUNT);
    const vertical = new Uint8Array(COUNT); // orientation: flat disk vs. camera-facing halo
    const seedA = new Float32Array(COUNT);
    const seedB = new Float32Array(COUNT);
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      radii[i] = INNER_R + Math.pow(Math.random(), 1.7) * (OUTER_R - INNER_R);
      baseAngle[i] = Math.random() * Math.PI * 2;
      // ~65% form the flat disk, ~35% populate the vertical halo loop —
      // matches the reference's proportion of a wide flared disk plus a
      // tighter bright halo
      vertical[i] = Math.random() < 0.35 ? 1 : 0;
      seedA[i] = Math.random();
      seedB[i] = Math.random();
    }

    const diskGeo = new THREE.BufferGeometry();
    diskGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    diskGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const sparkTexture = (() => {
      const size = 32;
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
      map: sparkTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const diskPoints = new THREE.Points(diskGeo, diskMat);
    group.add(diskPoints);

    // temperature ramp by radius (hot near the horizon, cooling outward)
    const hot = new THREE.Color("#fff8eb");
    const gold = new THREE.Color("#ffcd82");
    const amber = new THREE.Color("#e67837");
    const dim = new THREE.Color("#5a2819");
    const approachTint = new THREE.Color("#eaf3ff"); // slight blue-white for the Doppler-brightened side
    const recedeTint = new THREE.Color("#7a2010"); // deep red for the dimmed, receding side
    const tmpColor = new THREE.Color();

    function tempColor(t: number, out: THREE.Color) {
      if (t < 0.4) out.copy(dim).lerp(amber, t / 0.4);
      else if (t < 0.75) out.copy(amber).lerp(gold, (t - 0.4) / 0.35);
      else out.copy(gold).lerp(hot, (t - 0.75) / 0.25);
      return out;
    }

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
      const pr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloomPass.setSize(w, h);
    };

    let raf = 0;
    let inView = true;
    let t = 0;
    const posAttr = diskGeo.getAttribute("position") as THREE.BufferAttribute;
    const colAttr = diskGeo.getAttribute("color") as THREE.BufferAttribute;

    const renderOnce = () => composer.render();

    const frame = () => {
      t += 0.006;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;

      group.rotation.z = pointer.x * 0.06;
      group.rotation.x = -0.42 + pointer.y * 0.05 - scrollRef.current * 0.3;
      camera.position.y = 14 - scrollRef.current * 11;
      camera.lookAt(0, 0, 0);
      group.updateMatrixWorld();

      // camera position in the group's local space, for a per-frame (not
      // per-particle) Doppler view-direction reference
      const inv = group.matrixWorld.clone().invert();
      const localCam = camera.position.clone().applyMatrix4(inv);

      for (let i = 0; i < COUNT; i++) {
        const r = radii[i];
        const angularVelocity = 1.5 / Math.pow(r, 1.5); // Keplerian falloff
        const angle = baseAngle[i] + t * angularVelocity;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        let px: number, py: number, pz: number, vx: number, vy: number, vz: number;
        if (vertical[i]) {
          px = cosA * r;
          py = sinA * r;
          pz = 0;
          vx = -sinA;
          vy = cosA;
          vz = 0;
        } else {
          px = cosA * r;
          py = 0;
          pz = sinA * r;
          vx = -sinA;
          vy = 0;
          vz = cosA;
        }
        posAttr.setXYZ(i, px, py, pz);

        // view direction from particle to camera (both in local space)
        let dx = localCam.x - px;
        let dy = localCam.y - py;
        let dz = localCam.z - pz;
        const dl = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        dx /= dl;
        dy /= dl;
        dz /= dl;
        const approach = vx * dx + vy * dy + vz * dz; // [-1, 1]

        // layered-sine turbulence standing in for fBm — a few
        // different-frequency waves over angle/radius/time
        const flicker =
          0.62 +
          0.2 * Math.sin(angle * 4 + t * 4 + seedA[i] * 6.28) +
          0.14 * Math.sin(angle * 9 - t * 2.3 + seedB[i] * 6.28) +
          0.1 * Math.sin(r * 0.7 + t * 1.6);

        const radialT = 1 - Math.min(Math.max((r - INNER_R) / (OUTER_R - INNER_R), 0), 1);
        tempColor(radialT, tmpColor);

        const shiftStrength = 0.85;
        const shift = approach * shiftStrength;
        if (shift > 0) tmpColor.lerp(approachTint, Math.min(shift, 1) * 0.55);
        else tmpColor.lerp(recedeTint, Math.min(-shift, 1) * 0.5);

        const brightness =
          Math.max(0, flicker) * (1 + Math.max(shift, 0) * 1.3) * (1 + Math.min(shift, 0) * 0.5);
        // hottest, most Doppler-brightened particles push past 1.0 — with
        // ACES tone mapping + bloom this reads as genuine HDR glow rather
        // than clipping to flat white
        const boost = radialT > 0.85 && shift > 0.3 ? 1.6 : 1;

        colAttr.setXYZ(
          i,
          tmpColor.r * brightness * boost,
          tmpColor.g * brightness * boost,
          tmpColor.b * brightness * boost
        );
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      const pulse = 0.9 + Math.sin(t * 2.2) * 0.08;
      ringMat.opacity = pulse;

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
      ringTexture.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      diskGeo.dispose();
      diskMat.dispose();
      sparkTexture.dispose();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mountRef} className={`block h-full w-full ${className}`} />;
}
