import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

/**
 * Epic Cosmic Title Animation - Replaces Hero text animations
 * Features:
 * - Floating 3D text particles that assemble into words
 * - Orbital ring system with glowing nodes
 * - Dynamic lighting that follows mouse
 * - Nebula background with volumetric feel
 */
export default function EpicHeroScene({
  className = "",
  onReady,
}: {
  className?: string;
  onReady?: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);
    camera.position.z = 150;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    // ---- Create textures ----
    const makeGlowTexture = (color: string) => {
      const size = 128;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, color);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    };

    const starTexture = makeGlowTexture("rgba(255,255,255,1)");
    const accentTexture = makeGlowTexture("rgba(200,255,61,1)");
    const violetTexture = makeGlowTexture("rgba(139,108,255,1)");

    // ---- Massive starfield ----
    const STAR_COUNT = 4000;
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);

    const palette = [
      new THREE.Color("#f4f1ea"),
      new THREE.Color("#c8ff3d"),
      new THREE.Color("#8b6cff"),
      new THREE.Color("#9fd9ff"),
      new THREE.Color("#ff6b9d"),
    ];

    for (let i = 0; i < STAR_COUNT; i++) {
      const r = 100 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
      sizes[i] = Math.random() * 2.5 + 0.3;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 2.5,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ---- Orbital rings system ----
    const rings: THREE.Mesh[] = [];
    const ringColors = [0xc8ff3d, 0x8b6cff, 0x9fd9ff];
    
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.TorusGeometry(40 + i * 15, 0.3 + i * 0.2, 16, 100);
      const material = new THREE.MeshBasicMaterial({
        color: ringColors[i],
        transparent: true,
        opacity: 0.15 + i * 0.1,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI / 2 + (i * 0.3);
      ring.rotation.y = i * 0.5;
      scene.add(ring);
      rings.push(ring);
    }

    // ---- Glowing orbital nodes ----
    const nodeCount = 12;
    const nodes: THREE.Sprite[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const mat = new THREE.SpriteMaterial({
        map: accentTexture,
        color: i % 3 === 0 ? 0xc8ff3d : i % 3 === 1 ? 0x8b6cff : 0x9fd9ff,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(mat);
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 55;
      sprite.scale.set(8, 8, 1);
      sprite.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.6,
        Math.sin(angle * 3) * 20
      );
      scene.add(sprite);
      nodes.push(sprite);
    }

    // ---- Central nebula cloud ----
    const nebulaGroup = new THREE.Group();
    const nebulaColors = [0x6d4bff, 0xc8ff3d, 0x8b6cff, 0x1a5f7a];
    
    for (let i = 0; i < 8; i++) {
      const mat = new THREE.SpriteMaterial({
        map: i % 2 === 0 ? violetTexture : accentTexture,
        color: nebulaColors[i % nebulaColors.length],
        transparent: true,
        opacity: 0.08 + Math.random() * 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      const scale = 60 + Math.random() * 80;
      sprite.scale.set(scale, scale, 1);
      sprite.position.set(
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 80,
        -80 - Math.random() * 60
      );
      nebulaGroup.add(sprite);
    }
    scene.add(nebulaGroup);

    // ---- Floating geometric shapes (representing letters assembling) ----
    const shapes: THREE.Mesh[] = [];
    const shapeGeometries = [
      new THREE.IcosahedronGeometry(3, 0),
      new THREE.OctahedronGeometry(2.5, 0),
      new THREE.TetrahedronGeometry(2, 0),
    ];
    const shapeMats = [
      new THREE.MeshBasicMaterial({ color: 0xc8ff3d, wireframe: true, transparent: true, opacity: 0.6 }),
      new THREE.MeshBasicMaterial({ color: 0x8b6cff, wireframe: true, transparent: true, opacity: 0.6 }),
      new THREE.MeshBasicMaterial({ color: 0x9fd9ff, wireframe: true, transparent: true, opacity: 0.6 }),
    ];

    for (let i = 0; i < 30; i++) {
      const geo = shapeGeometries[i % shapeGeometries.length];
      const mat = shapeMats[i % shapeMats.length];
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 180,
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 100 - 30
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(mesh);
      shapes.push(mesh);
    }

    // ---- Lighting ----
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xc8ff3d, 2, 200);
    pointLight1.position.set(50, 30, 50);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b6cff, 2, 200);
    pointLight2.position.set(-50, -30, 50);
    scene.add(pointLight2);

    // ---- Animation state ----
    const reduced = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    let t = 0;
    let assemblyProgress = 0;

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
      renderer.setSize(w, h, false);
    };

    const frame = () => {
      t += 0.003;
      
      // Smooth pointer movement
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      // Rotate starfield slowly
      stars.rotation.y = t * 0.08;
      stars.rotation.x = t * 0.02;

      // Animate rings
      rings.forEach((ring, i) => {
        ring.rotation.z = t * (0.2 + i * 0.1) + i;
        ring.rotation.x = Math.PI / 2 + Math.sin(t * 0.3 + i) * 0.3;
      });

      // Animate nodes along orbits
      nodes.forEach((node, i) => {
        const angle = t * (0.3 + i * 0.05) + (i / nodeCount) * Math.PI * 2;
        const radius = 55 + Math.sin(t * 0.5 + i) * 5;
        node.position.x = Math.cos(angle) * radius;
        node.position.y = Math.sin(angle) * radius * 0.6;
        node.position.z = Math.sin(angle * 3 + i) * 20;
        node.material.opacity = 0.6 + Math.sin(t * 2 + i) * 0.2;
      });

      // Nebula drift
      nebulaGroup.rotation.z = t * 0.05;
      nebulaGroup.children.forEach((child, i) => {
        child.position.x += Math.sin(t * 0.4 + i) * 0.05;
        child.position.y += Math.cos(t * 0.3 + i) * 0.03;
      });

      // Floating shapes animation
      shapes.forEach((shape, i) => {
        shape.rotation.x += 0.01 + i * 0.002;
        shape.rotation.y += 0.015 + i * 0.001;
        shape.position.y += Math.sin(t * 0.8 + i) * 0.1;
      });

      // Camera parallax
      camera.position.x = pointer.x * 8;
      camera.position.y = -pointer.y * 6;
      camera.lookAt(0, 0, 0);

      // Pulsing lights
      pointLight1.intensity = 2 + Math.sin(t * 3) * 0.5;
      pointLight2.intensity = 2 + Math.cos(t * 2.5) * 0.5;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduced) window.addEventListener("pointermove", onPointerMove);
    
    if (onReady) onReady();
    if (!reduced) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);

      starGeo.dispose();
      starMat.dispose();
      rings.forEach((ring) => {
        ring.geometry.dispose();
        (ring.material as THREE.Material).dispose();
      });
      nodes.forEach((node) => {
        (node.material as THREE.SpriteMaterial).dispose();
      });
      nebulaGroup.children.forEach((child) => {
        (child as THREE.Sprite).material.dispose();
      });
      shapes.forEach((shape) => {
        shape.geometry.dispose();
        (shape.material as THREE.Material).dispose();
      });
      starTexture.dispose();
      accentTexture.dispose();
      violetTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [onReady]);

  return <div ref={mountRef} className={`absolute inset-0 ${className}`} />;
}
