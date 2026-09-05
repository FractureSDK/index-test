import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

/**
 * A lightweight WebGL "deep space" backdrop: a drifting starfield, a couple
 * of soft nebula glows, and (optionally) a small rotating planet. Replaces
 * the old Canvas2D flow-field with something that reads as genuinely
 * cosmic and runs on the GPU instead of the main thread.
 *
 * - Pauses its render loop via IntersectionObserver when scrolled out of view.
 * - Renders a single static frame (no rAF loop, no parallax) for
 *   prefers-reduced-motion.
 * - Fully disposes its GPU resources on unmount.
 */
export default function CosmicCanvas({
  className = "",
  planet = false,
}: {
  className?: string;
  planet?: boolean;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2000);
    camera.position.z = 60;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ---- soft circular sprite texture (shared by stars + nebula glows) ----
    const makeGlowTexture = (inner: string, outer: string) => {
      const size = 128;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, inner);
      grad.addColorStop(1, outer);
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    };

    const starTexture = makeGlowTexture("rgba(255,255,255,1)", "rgba(255,255,255,0)");
    const nebulaTexture = makeGlowTexture("rgba(255,255,255,0.9)", "rgba(255,255,255,0)");

    // ---------------------------- starfield ----------------------------
    const STAR_COUNT = 2600;
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);

    const palette = [
      new THREE.Color("#f4f1ea"), // bone
      new THREE.Color("#c8ff3d"), // accent
      new THREE.Color("#8b6cff"), // violet
      new THREE.Color("#9fd9ff"), // cool blue-white
    ];

    for (let i = 0; i < STAR_COUNT; i++) {
      // distribute on a thick spherical shell so it reads as a starfield in
      // every direction, not a flat disc
      const r = 120 + Math.random() * 520;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const col = palette[Math.random() > 0.88 ? Math.floor(Math.random() * palette.length) : 0];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = Math.random() * 1.8 + 0.4;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    starGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const starMat = new THREE.PointsMaterial({
      size: 2.2,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // a closer, sparser, faster-parallax layer for depth
    const NEAR_COUNT = 220;
    const nearPositions = new Float32Array(NEAR_COUNT * 3);
    for (let i = 0; i < NEAR_COUNT; i++) {
      nearPositions[i * 3] = (Math.random() - 0.5) * 260;
      nearPositions[i * 3 + 1] = (Math.random() - 0.5) * 260;
      nearPositions[i * 3 + 2] = (Math.random() - 0.5) * 120 - 20;
    }
    const nearGeo = new THREE.BufferGeometry();
    nearGeo.setAttribute("position", new THREE.BufferAttribute(nearPositions, 3));
    const nearMat = new THREE.PointsMaterial({
      size: 1.4,
      map: starTexture,
      color: 0xf4f1ea,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const nearStars = new THREE.Points(nearGeo, nearMat);
    scene.add(nearStars);

    // ---------------------------- nebula glows ----------------------------
    const nebulaColors = [0x6d4bff, 0xc8ff3d, 0x8b6cff];
    const nebulae: THREE.Sprite[] = [];
    for (let i = 0; i < 3; i++) {
      const mat = new THREE.SpriteMaterial({
        map: nebulaTexture,
        color: nebulaColors[i % nebulaColors.length],
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      const scale = 140 + Math.random() * 100;
      sprite.scale.set(scale, scale, 1);
      sprite.position.set((Math.random() - 0.5) * 180, (Math.random() - 0.5) * 140, -150 - Math.random() * 100);
      scene.add(sprite);
      nebulae.push(sprite);
    }

    // ---------------------------- optional planet ----------------------------
    let planetMesh: THREE.Mesh | null = null;
    let ring: THREE.Mesh | null = null;
    if (planet) {
      const planetTex = (() => {
        const size = 256;
        const c = document.createElement("canvas");
        c.width = size;
        c.height = size;
        const g = c.getContext("2d")!;
        const grad = g.createLinearGradient(0, 0, 0, size);
        grad.addColorStop(0, "#2a1a6b");
        grad.addColorStop(0.5, "#6d4bff");
        grad.addColorStop(1, "#150a33");
        g.fillStyle = grad;
        g.fillRect(0, 0, size, size);
        // faint bands
        g.globalAlpha = 0.18;
        for (let i = 0; i < 10; i++) {
          g.fillStyle = i % 2 === 0 ? "#f4f1ea" : "#050507";
          g.fillRect(0, (i / 10) * size, size, size / 30);
        }
        return new THREE.CanvasTexture(c);
      })();

      planetMesh = new THREE.Mesh(
        new THREE.SphereGeometry(9, 48, 48),
        new THREE.MeshBasicMaterial({ map: planetTex })
      );
      planetMesh.position.set(-26, -8, -40);
      scene.add(planetMesh);

      ring = new THREE.Mesh(
        new THREE.RingGeometry(13, 17, 64),
        new THREE.MeshBasicMaterial({
          color: 0xc8ff3d,
          transparent: true,
          opacity: 0.25,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        })
      );
      ring.rotation.x = Math.PI / 2.4;
      ring.position.copy(planetMesh.position);
      scene.add(ring);
    }

    // ---------------------------- shooting stars ----------------------------
    type Streak = { mesh: THREE.Mesh; vx: number; vy: number; life: number; max: number };
    const streaks: Streak[] = [];
    const streakGeo = new THREE.PlaneGeometry(14, 0.35);
    const streakTexture = (() => {
      const w = 128;
      const h = 8;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const g = c.getContext("2d")!;
      const grad = g.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "rgba(244,241,234,0)");
      grad.addColorStop(1, "rgba(244,241,234,1)");
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
      return new THREE.CanvasTexture(c);
    })();

    const spawnStreak = () => {
      const mat = new THREE.MeshBasicMaterial({
        map: streakTexture,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(streakGeo, mat);
      const angle = -0.5 - Math.random() * 0.4;
      mesh.rotation.z = angle;
      mesh.position.set(-60 - Math.random() * 40, 40 + Math.random() * 30, -60 + Math.random() * 40);
      scene.add(mesh);
      streaks.push({
        mesh,
        vx: Math.cos(angle) * 220,
        vy: Math.sin(angle) * 220,
        life: 0,
        max: 0.9 + Math.random() * 0.4,
      });
    };

    let nextStreakAt = 3 + Math.random() * 5;
    let clock = 0;

    // ---------------------------- interaction / animation ----------------------------
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
      t += 0.0025;
      clock += dt;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;

      stars.rotation.y = t * 0.35;
      stars.rotation.x = t * 0.08;
      nearStars.rotation.y = t * 0.6;

      camera.position.x = pointer.x * 6;
      camera.position.y = -pointer.y * 4;
      camera.lookAt(0, 0, 0);

      nebulae.forEach((sprite, i) => {
        sprite.position.x += Math.sin(t * 0.6 + i) * 0.02;
        sprite.position.y += Math.cos(t * 0.5 + i) * 0.015;
      });

      if (planetMesh && ring) {
        planetMesh.rotation.y = t * 0.5;
        ring.rotation.z = t * 0.15;
      }

      if (clock >= nextStreakAt) {
        spawnStreak();
        nextStreakAt = clock + 4 + Math.random() * 6;
      }
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        s.life += dt;
        s.mesh.position.x += s.vx * dt;
        s.mesh.position.y += s.vy * dt;
        const p = s.life / s.max;
        const mat = s.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
        if (s.life >= s.max) {
          scene.remove(s.mesh);
          mat.dispose();
          streaks.splice(i, 1);
        }
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
    renderOnce();
    if (!reduced) raf = requestAnimationFrame(frame);

    window.addEventListener("resize", resize);
    if (!reduced) window.addEventListener("pointermove", onPointerMove);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);

      starGeo.dispose();
      starMat.dispose();
      nearGeo.dispose();
      nearMat.dispose();
      starTexture.dispose();
      nebulaTexture.dispose();
      nebulae.forEach((s) => {
        (s.material as THREE.SpriteMaterial).dispose();
      });
      if (planetMesh) {
        planetMesh.geometry.dispose();
        (planetMesh.material as THREE.MeshBasicMaterial).map?.dispose();
        (planetMesh.material as THREE.MeshBasicMaterial).dispose();
      }
      if (ring) {
        ring.geometry.dispose();
        (ring.material as THREE.MeshBasicMaterial).dispose();
      }
      streaks.forEach((s) => {
        scene.remove(s.mesh);
        (s.mesh.material as THREE.MeshBasicMaterial).dispose();
      });
      streakGeo.dispose();
      streakTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planet]);

  return <div ref={mountRef} className={`block h-full w-full ${className}`} />;
}
