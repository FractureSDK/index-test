"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * An abstract, slowly-breathing wireframe form with a small halo of
 * orbiting fragments — the lusion.co-style "3D model behind the headline"
 * treatment, built with a plain displacement shader rather than a real
 * asset (no model to load, no texture fetch, nothing to attribute).
 *
 * - Distortion amplitude ties into hero scroll progress via `scrollProgress`
 *   (0–1), passed down from the section so GSAP/ScrollTrigger stays the
 *   single source of truth for scroll state.
 * - Pauses off-screen (IntersectionObserver) and renders one static frame
 *   for prefers-reduced-motion.
 * - Orbiting fragment count drops on narrow/mobile viewports.
 */
export default function HeroScene({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      const h = window.innerHeight;
      scrollRef.current = Math.min(Math.max(window.scrollY / h, 0), 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(0, 0, 34);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    // ---------------------------- main form ----------------------------
    const geo = new THREE.IcosahedronGeometry(11, isMobile ? 3 : 5);
    const mat = new THREE.ShaderMaterial({
      wireframe: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0.6 },
        uColorA: { value: new THREE.Color("#c8ff3d") },
        uColorB: { value: new THREE.Color("#6d4bff") },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uIntensity;
        varying vec3 vNormal;
        void main() {
          vNormal = normal;
          vec3 pos = position;
          float n = sin(pos.x * 0.35 + uTime * 0.6)
                  + sin(pos.y * 0.42 - uTime * 0.5)
                  + sin(pos.z * 0.3 + uTime * 0.4);
          pos += normal * n * uIntensity;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vNormal;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        void main() {
          float m = clamp(vNormal.y * 0.5 + 0.5, 0.0, 1.0);
          vec3 color = mix(uColorA, uColorB, m);
          gl_FragColor = vec4(color, 0.5);
        }
      `,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // -------------------------- orbiting fragments --------------------------
    const FRAG_COUNT = isMobile ? 0 : 36;
    let frags: THREE.InstancedMesh | null = null;
    const fragData: { radius: number; speed: number; offset: number; tilt: number }[] = [];
    if (FRAG_COUNT > 0) {
      const fragGeo = new THREE.TetrahedronGeometry(0.55);
      const fragMat = new THREE.MeshBasicMaterial({
        color: 0xf4f1ea,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      frags = new THREE.InstancedMesh(fragGeo, fragMat, FRAG_COUNT);
      for (let i = 0; i < FRAG_COUNT; i++) {
        fragData.push({
          radius: 16 + Math.random() * 10,
          speed: 0.08 + Math.random() * 0.12,
          offset: Math.random() * Math.PI * 2,
          tilt: (Math.random() - 0.5) * 0.8,
        });
      }
      scene.add(frags);
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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
      renderer.setSize(w, h, false);
    };

    let raf = 0;
    let inView = true;
    let t = 0;
    const dummy = new THREE.Object3D();

    const renderOnce = () => renderer.render(scene, camera);

    const frame = () => {
      t += 0.012;
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      mat.uniforms.uTime.value = t;
      mat.uniforms.uIntensity.value = 0.5 + scrollRef.current * 1.6;

      mesh.rotation.y = t * 0.15 + pointer.x * 0.3;
      mesh.rotation.x = pointer.y * 0.2;

      if (frags) {
        fragData.forEach((f, i) => {
          const a = f.offset + t * f.speed;
          dummy.position.set(
            Math.cos(a) * f.radius,
            Math.sin(a * 0.7) * f.radius * 0.4,
            Math.sin(a) * f.radius
          );
          dummy.rotation.set(a, a * f.tilt, 0);
          dummy.updateMatrix();
          frags!.setMatrixAt(i, dummy.matrix);
        });
        frags.instanceMatrix.needsUpdate = true;
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
      geo.dispose();
      mat.dispose();
      if (frags) {
        frags.geometry.dispose();
        (frags.material as THREE.Material).dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mountRef} className={`block h-full w-full ${className}`} />;
}
